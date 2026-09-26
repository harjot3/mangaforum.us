package us.mangaforum.chapters;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name = "chapters")
public class Chapter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false) public Long mangaId;
    @Column(nullable = false, precision = 8, scale = 2) public BigDecimal number;
    @Column(length = 200) public String title;
    @Column(nullable = false) public Instant releasedAt;
    @Column(length = 500) public String officialUrl;
    protected Chapter() {}
}
