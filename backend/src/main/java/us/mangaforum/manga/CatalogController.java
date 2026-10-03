package us.mangaforum.manga;
import us.mangaforum.chapters.*;
import jakarta.validation.constraints.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
@RestController @RequestMapping("/api") @Validated
public class CatalogController {
    private final MangaRepository manga;
    private final ChapterRepository chapters;
    public CatalogController(MangaRepository manga, ChapterRepository chapters) { this.manga = manga; this.chapters = chapters; }
    public record Results<T>(List<T> items, int page, int totalPages, long totalItems) {
        static <T> Results<T> from(Page<T> page) { return new Results<>(page.getContent(), page.getNumber(), page.getTotalPages(), page.getTotalElements()); }
    }
    public record Release(Long id, BigDecimal number, Instant releasedAt, String mangaTitle, String mangaSlug, String officialUrl) {}
    @GetMapping("/health") public Map<String, String> health() { return Map.of("status", "up"); }
    @GetMapping("/manga")
    public Results<Manga> browse(@RequestParam(defaultValue = "") @Size(max = 100) String q,
        @RequestParam(defaultValue = "") @Pattern(regexp = "|ONGOING|COMPLETED|HIATUS") String status,
        @RequestParam(defaultValue = "") @Size(max = 40) String genre,
        @RequestParam(defaultValue = "0") @Min(0) @Max(10000) int page,
        @RequestParam(defaultValue = "popular") @Pattern(regexp = "popular|title") String sort) {
        Sort order = sort.equals("popular") ? Sort.by(Sort.Order.desc("popularity"), Sort.Order.asc("slug")) : Sort.by("title", "slug");
        return Results.from(manga.browse(q.strip(), status, genre.strip(), PageRequest.of(page, 24, order)));
    }
    @GetMapping("/manga/{slug}") public Manga detail(@PathVariable String slug) {
        return manga.findBySlug(slug).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manga not found"));
    }
    @GetMapping("/chapters/recent") public List<Release> recent() {
        var releases = chapters.findByReleasedAtLessThanEqualOrderByReleasedAtDescIdDesc(Instant.now(), PageRequest.of(0, 8)).getContent();
        var titles = new HashMap<Long, Manga>();
        manga.findAllById(releases.stream().map(c -> c.mangaId).distinct().toList()).forEach(m -> titles.put(m.id, m));
        return releases.stream().map(c -> new Release(c.id, c.number, c.releasedAt, titles.get(c.mangaId).title, titles.get(c.mangaId).slug, c.officialUrl)).toList();
    }
}
