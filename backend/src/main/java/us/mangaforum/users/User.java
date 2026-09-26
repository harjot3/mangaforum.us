package us.mangaforum.users;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 30) private String username;
    @Column(nullable = false, length = 254) private String email;
    @Column(nullable = false) private String passwordHash;
    @Column(nullable = false, length = 500) private String bio = "";
    @Column(nullable = false) private Instant createdAt = Instant.now();
    protected User() {}
}
