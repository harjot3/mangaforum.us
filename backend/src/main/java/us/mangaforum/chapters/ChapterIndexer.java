package us.mangaforum.chapters;

import com.fasterxml.jackson.databind.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import us.mangaforum.manga.Manga;

/** Imports metadata only. No scan URLs, page images or scan upload dates are published. */
@Service
public class ChapterIndexer {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final TransactionTemplate transactions;
    private final boolean enabled;
    private final ConcurrentHashMap<Long, Object> locks = new ConcurrentHashMap<>();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private long nextRequest;
    public ChapterIndexer(JdbcTemplate jdbc, ObjectMapper json, TransactionTemplate transactions,
        @Value("${chapters.sync.enabled:true}") boolean enabled) {
        this.jdbc = jdbc; this.json = json; this.transactions = transactions; this.enabled = enabled;
    }
    public String ensure(Manga manga) {
        synchronized (locks.computeIfAbsent(manga.id, ignored -> new Object())) {
            var state = jdbc.queryForList("SELECT status, checked_at FROM chapter_sync WHERE manga_id = ?", manga.id);
            if (!state.isEmpty()) {
                var checked = (java.sql.Timestamp) state.getFirst().get("checked_at");
                String status = (String) state.getFirst().get("status");
                long seconds = status.equals("ERROR") ? 60 : 21600;
                if (checked != null && checked.toInstant().isAfter(Instant.now().minusSeconds(seconds))) return status;
            }
            if (!enabled) return state.isEmpty() ? "UNAVAILABLE" : (String) state.getFirst().get("status");
            try {
                JsonNode match = null;
                // Exact AniList ID matching prevents attaching a similarly named series' chapters.
                var titles = new LinkedHashSet<String>();
                titles.add(manga.title);
                if (manga.alternateTitle != null) titles.add(manga.alternateTitle.split(" · ")[0]);
                for (String title : titles) {
                    var results = get("/manga?limit=100&title=" + URLEncoder.encode(title, StandardCharsets.UTF_8));
                    for (var item : results.path("data")) {
                        if (item.path("attributes").path("links").path("al").asText().equals(String.valueOf(manga.sourceId))) { match = item; break; }
                    }
                    if (match != null) break;
                }
                if (match == null) { saveState(manga.id, null, "UNAVAILABLE"); return "UNAVAILABLE"; }
                String id = UUID.fromString(match.path("id").asText()).toString();
                String official = PublisherLinks.safe(manga.officialUrl);
                if (official == null) official = PublisherLinks.safe(match.path("attributes").path("links").path("engtl").asText(null));
                if (official == null) official = PublisherLinks.safe(match.path("attributes").path("links").path("raw").asText(null));
                var aggregate = get("/manga/" + id + "/aggregate");
                if (!aggregate.path("result").asText().equals("ok") || !aggregate.has("volumes")) throw new IllegalStateException("Invalid chapter index");
                var numbers = new TreeSet<BigDecimal>();
                for (var volume : aggregate.path("volumes")) for (var chapter : volume.path("chapters")) {
                    String value = chapter.path("chapter").asText();
                    if (value.matches("[0-9]{1,6}(\\.[0-9]{1,2})?")) numbers.add(new BigDecimal(value).stripTrailingZeros());
                }
                var titlesByNumber = new HashMap<BigDecimal, String>();
                // Titles enrich the complete aggregate; translations are not treated as release dates.
                try {
                    var feed = get("/manga/" + id + "/feed?limit=500&translatedLanguage%5B%5D=en&order%5Bchapter%5D=desc&includeFutureUpdates=0");
                    for (var item : feed.path("data")) {
                        var a = item.path("attributes");
                        String value = a.path("chapter").asText();
                        String title = a.path("title").asText("").strip();
                        if (value.matches("[0-9]{1,6}(\\.[0-9]{1,2})?") && !title.isEmpty())
                            titlesByNumber.putIfAbsent(new BigDecimal(value).stripTrailingZeros(), title.substring(0, Math.min(200, title.length())));
                    }
                } catch (Exception ignored) { /* A title lookup failure must not discard the complete chapter index. */ }
                final String link = official;
                transactions.executeWithoutResult(tx -> {
                    for (var number : numbers) jdbc.update("""
                        INSERT INTO chapters(manga_id, number, title, official_url, official_link_kind, source)
                        VALUES (?, ?, ?, ?, 'SERIES', 'MangaDex metadata')
                        ON CONFLICT (manga_id, number) DO UPDATE SET
                        title = coalesce(chapters.title, EXCLUDED.title),
                        official_url = coalesce(chapters.official_url, EXCLUDED.official_url)
                        """, manga.id, number, titlesByNumber.get(number), link);
                    saveState(manga.id, id, numbers.isEmpty() ? "UNAVAILABLE" : "READY");
                });
                return numbers.isEmpty() ? "UNAVAILABLE" : "READY";
            } catch (Exception e) {
                if (e instanceof InterruptedException) Thread.currentThread().interrupt();
                saveState(manga.id, null, "ERROR");
                return "ERROR";
            }
        }
    }
    private void saveState(long id, String providerId, String status) {
        jdbc.update("INSERT INTO chapter_sync(manga_id, provider_id, checked_at, status) VALUES (?, ?::uuid, now(), ?) ON CONFLICT(manga_id) DO UPDATE SET provider_id=coalesce(EXCLUDED.provider_id,chapter_sync.provider_id), checked_at=now(),status=EXCLUDED.status", id, providerId, status);
    }
    private synchronized JsonNode get(String path) throws Exception {
        long pause = nextRequest - System.currentTimeMillis();
        if (pause > 0) Thread.sleep(pause);
        nextRequest = System.currentTimeMillis() + 300;
        var response = http.send(HttpRequest.newBuilder(URI.create("https://api.mangadex.org" + path))
            .header("User-Agent", "MangaForum/0.1 (chapter metadata only)").timeout(Duration.ofSeconds(10)).GET().build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new IllegalStateException("Chapter provider unavailable");
        return json.readTree(response.body());
    }
}
