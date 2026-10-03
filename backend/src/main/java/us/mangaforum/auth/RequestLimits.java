package us.mangaforum.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Component
public class RequestLimits {
    private final JdbcTemplate jdbc;
    public RequestLimits(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public void check(String key, int maximum, int seconds) {
        String hash;
        try { hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(key.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
        Integer attempts = jdbc.queryForObject("""
            INSERT INTO request_limits(key_hash, attempts, resets_at) VALUES (?, 1, now() + ? * interval '1 second')
            ON CONFLICT (key_hash) DO UPDATE SET
              attempts = CASE WHEN request_limits.resets_at <= now() THEN 1 ELSE request_limits.attempts + 1 END,
              resets_at = CASE WHEN request_limits.resets_at <= now() THEN EXCLUDED.resets_at ELSE request_limits.resets_at END
            RETURNING attempts
            """, Integer.class, hash, seconds);
        if (attempts > maximum) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Please try again later.");
    }
}
