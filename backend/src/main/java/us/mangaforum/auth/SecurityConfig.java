package us.mangaforum.auth;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwords() { return new BCryptPasswordEncoder(12); }
    @Bean AuthenticationManager authenticationManager(AccountService accounts, PasswordEncoder passwords) {
        var provider = new DaoAuthenticationProvider(accounts);
        provider.setPasswordEncoder(passwords);
        return new ProviderManager(provider);
    }
    @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/manga", "/api/manga/**", "/api/chapters/recent", "/api/health", "/api/auth/me", "/api/auth/csrf", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/manga/*/chapters/*/posts").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/posts/*").authenticated()
                .anyRequest().denyAll())
            .formLogin(form -> form.disable()).httpBasic(basic -> basic.disable())
            .logout(logout -> logout.logoutUrl("/api/auth/logout").deleteCookies("JSESSIONID")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
            .exceptionHandling(errors -> errors.authenticationEntryPoint((req, res, ex) -> res.sendError(401)))
            .build();
    }
}
