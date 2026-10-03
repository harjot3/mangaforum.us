package us.mangaforum.auth;

import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class AccountService implements UserDetailsService {
    private final JdbcTemplate jdbc;
    public AccountService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public record Account(long id, String username) {}
    @Override public UserDetails loadUserByUsername(String login) {
        return jdbc.query("SELECT username, password_hash FROM users WHERE lower(username) = ? OR lower(email) = ?",
            (row, n) -> User.withUsername(row.getString("username")).password(row.getString("password_hash")).roles("USER").build(),
            login.toLowerCase(Locale.ROOT), login.toLowerCase(Locale.ROOT)).stream().findFirst()
            .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }
    public Account account(String username) {
        return jdbc.queryForObject("SELECT id, username FROM users WHERE lower(username) = lower(?)",
            (row, n) -> new Account(row.getLong("id"), row.getString("username")), username);
    }
}
