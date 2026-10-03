package us.mangaforum.chapters;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import us.mangaforum.manga.*;

@RestController @RequestMapping("/api/manga/{slug}/chapters") @Validated
public class ChapterController {
    private final MangaRepository manga;
    private final JdbcTemplate jdbc;
    private final ChapterIndexer indexer;
    public ChapterController(MangaRepository manga, JdbcTemplate jdbc, ChapterIndexer indexer) { this.manga=manga; this.jdbc=jdbc; this.indexer=indexer; }
    public record Entry(long id, BigDecimal number, String title, String description, Instant releasedAt, String officialUrl, String officialLinkKind, String source, long postCount) {}
    public record Index(List<Entry> items, int page, int totalPages, long totalItems, long mainCount, long extraCount, String syncStatus) {}
    @GetMapping public Index index(@PathVariable String slug) {
        var series = series(slug);
        String sync = indexer.ensure(series);
        var entries = entries(series.id, null);
        long main = entries.stream().filter(c -> c.number().signum() > 0 && c.number().stripTrailingZeros().scale() <= 0).count();
        return new Index(entries, 0, entries.isEmpty() ? 0 : 1, entries.size(), main, entries.size()-main, sync);
    }
    @GetMapping("/{number}") public Entry detail(@PathVariable String slug,
        @PathVariable @Pattern(regexp="[0-9]{1,6}(\\.[0-9]{1,2})?") String number) {
        var series = series(slug);
        var found = entries(series.id, new BigDecimal(number));
        if (found.isEmpty()) {
            String state = indexer.ensure(series);
            found = entries(series.id, new BigDecimal(number));
            if (found.isEmpty() && state.equals("ERROR")) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Chapter source temporarily unavailable.");
        }
        return found.stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
    }
    private Manga series(String slug) { return manga.findBySlug(slug).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manga not found")); }
    private List<Entry> entries(long mangaId, BigDecimal number) {
        String sql = """
            SELECT c.*, (SELECT count(*) FROM discussion_posts p WHERE p.chapter_id=c.id AND p.deleted_at IS NULL) AS post_count
            FROM chapters c WHERE c.manga_id=? AND (c.released_at IS NULL OR c.released_at <= now())
            """ + (number == null ? "" : " AND c.number=?") + " ORDER BY c.number DESC";
        return jdbc.query(sql, (row,n) -> new Entry(row.getLong("id"), row.getBigDecimal("number"), row.getString("title"), row.getString("description"),
            row.getTimestamp("released_at") == null ? null : row.getTimestamp("released_at").toInstant(), PublisherLinks.safe(row.getString("official_url")),
            row.getString("official_link_kind"), row.getString("source"), row.getLong("post_count")), number == null ? new Object[]{mangaId} : new Object[]{mangaId, number});
    }
}
