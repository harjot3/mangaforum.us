package us.mangaforum.manga;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "manga_follows")
public class MangaFollow {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false) private Long mangaId;
    @Column(nullable = false) private Instant createdAt = Instant.now();
    protected MangaFollow() {}
}
