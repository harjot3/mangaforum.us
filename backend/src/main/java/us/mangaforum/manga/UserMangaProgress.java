package us.mangaforum.manga;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name = "user_manga_progress")
public class UserMangaProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false) private Long mangaId;
    @Column(nullable = false, precision = 8, scale = 2) private BigDecimal currentChapter = BigDecimal.ZERO;
    @Column(nullable = false, length = 20) private String readingStatus = "READING";
    @Column(nullable = false) private Instant updatedAt = Instant.now();
    protected UserMangaProgress() {}
}
