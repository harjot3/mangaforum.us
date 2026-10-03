package us.mangaforum.chapters;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import us.mangaforum.auth.*;

@RestController @RequestMapping("/api") @Validated
public class DiscussionController {
    private final JdbcTemplate jdbc;
    private final ChapterController chapters;
    private final AccountService accounts;
    private final RequestLimits limits;
    public DiscussionController(JdbcTemplate jdbc, ChapterController chapters, AccountService accounts, RequestLimits limits) {
        this.jdbc=jdbc; this.chapters=chapters; this.accounts=accounts; this.limits=limits;
    }
    public record Post(long id, Long userId, String username, Long parentId, String parentUsername, String body, Instant createdAt, boolean deleted) {}
    public record Posts(List<Post> items, int page, long totalPages, long totalItems) {}
    public record NewPost(@NotBlank @Size(max=5000) String body, @Positive Long parentId) {}
    @GetMapping("/manga/{slug}/chapters/{number}/posts")
    public Posts list(@PathVariable String slug, @PathVariable @Pattern(regexp="[0-9]{1,6}(\\.[0-9]{1,2})?") String number,
        @RequestParam(defaultValue="0") @Min(0) @Max(10000) int page) {
        long chapter = chapters.detail(slug, number).id();
        long total = jdbc.queryForObject("SELECT count(*) FROM discussion_posts WHERE chapter_id=?", Long.class, chapter);
        var items = jdbc.query("""
            SELECT p.*, u.username, pu.username AS parent_username FROM discussion_posts p
            LEFT JOIN users u ON u.id=p.user_id
            LEFT JOIN discussion_posts parent ON parent.id=p.parent_id
            LEFT JOIN users pu ON pu.id=parent.user_id
            WHERE p.chapter_id=? ORDER BY p.created_at, p.id LIMIT 30 OFFSET ?
            """, (row,n) -> new Post(row.getLong("id"), (Long)row.getObject("user_id"), row.getString("username"), (Long)row.getObject("parent_id"), row.getString("parent_username"),
            row.getTimestamp("deleted_at") == null ? row.getString("body") : null, row.getTimestamp("created_at").toInstant(), row.getTimestamp("deleted_at") != null), chapter, page * 30);
        return new Posts(items, page, (total + 29) / 30, total);
    }
    @PostMapping("/manga/{slug}/chapters/{number}/posts") @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> post(@PathVariable String slug, @PathVariable @Pattern(regexp="[0-9]{1,6}(\\.[0-9]{1,2})?") String number,
        @Valid @RequestBody NewPost input, Authentication auth) {
        long user = accounts.account(auth.getName()).id();
        long chapter = chapters.detail(slug, number).id();
        limits.check("post:" + user, 10, 60);
        String body = input.body().strip();
        if (body.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Write a message before posting.");
        if (input.parentId() != null && !Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM discussion_posts WHERE id=? AND chapter_id=? AND deleted_at IS NULL)", Boolean.class, input.parentId(), chapter)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The reply must belong to this chapter's discussion.");
        Long id = jdbc.queryForObject("INSERT INTO discussion_posts(chapter_id,user_id,parent_id,body) VALUES (?,?,?,?) RETURNING id", Long.class, chapter, user, input.parentId(), body);
        long total = jdbc.queryForObject("SELECT count(*) FROM discussion_posts WHERE chapter_id=?", Long.class, chapter);
        return Map.of("id", id, "page", (total - 1) / 30);
    }
    @DeleteMapping("/posts/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Positive long id, Authentication auth) {
        long user = accounts.account(auth.getName()).id();
        int changed = jdbc.update("UPDATE discussion_posts SET body='[deleted]', deleted_at=now() WHERE id=? AND user_id=? AND deleted_at IS NULL", id, user);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found or not owned by you.");
    }
}
