package us.mangaforum.auth;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    private final AuthenticationManager manager;
    private final AccountService accounts;
    private final RequestLimits limits;
    public AuthController(JdbcTemplate jdbc, PasswordEncoder passwords, AuthenticationManager manager, AccountService accounts, RequestLimits limits) {
        this.jdbc = jdbc; this.passwords = passwords; this.manager = manager; this.accounts = accounts; this.limits = limits;
    }
    public record Signup(@NotBlank @Pattern(regexp="[A-Za-z0-9_]{3,30}") String username,
        @NotBlank @Email @Size(max=254) String email, @NotBlank @Size(min=12, max=72) String password) {}
    public record Login(@NotBlank @Size(max=254) String login, @NotBlank @Size(max=72) String password) {}
    @GetMapping("/csrf") public Map<String, String> csrf(CsrfToken csrf) {
        return Map.of("token", csrf.getToken(), "headerName", csrf.getHeaderName());
    }
    @GetMapping("/me") public Map<String, Object> me(Authentication auth) {
        Map<String, Object> result = new HashMap<>();
        result.put("user", auth == null ? null : accounts.account(auth.getName()));
        return result;
    }
    @PostMapping("/signup") @ResponseStatus(HttpStatus.CREATED)
    public AccountService.Account signup(@Valid @RequestBody Signup input, HttpServletRequest request, HttpServletResponse response) {
        limits.check("signup:" + request.getRemoteAddr(), 20, 3600);
        if (input.password().getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes.");
        try {
            jdbc.update("INSERT INTO users(username, email, password_hash) VALUES (?, ?, ?)",
                input.username(), input.email().toLowerCase(Locale.ROOT), passwords.encode(input.password()));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That username or email is already registered.");
        }
        return authenticate(input.username(), input.password(), request, response);
    }
    @PostMapping("/login") public AccountService.Account login(@Valid @RequestBody Login input, HttpServletRequest request, HttpServletResponse response) {
        limits.check("login:" + input.login().toLowerCase(Locale.ROOT), 10, 900);
        limits.check("login-ip:" + request.getRemoteAddr(), 200, 900);
        return authenticate(input.login(), input.password(), request, response);
    }
    private AccountService.Account authenticate(String login, String password, HttpServletRequest request, HttpServletResponse response) {
        Authentication auth;
        try { auth = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(login, password)); }
        catch (AuthenticationException e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect username/email or password."); }
        request.getSession(true);
        request.changeSessionId();
        new HttpSessionCsrfTokenRepository().saveToken(null, request, response);
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        new HttpSessionSecurityContextRepository().saveContext(context, request, response);
        return accounts.account(auth.getName());
    }
}
