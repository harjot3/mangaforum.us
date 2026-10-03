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
    public Instant releasedAt;
    @Column(length = 500) public String officialUrl;
    @Column(columnDefinition = "text") public String description;
    @Column(nullable = false, length = 20) public String officialLinkKind = "SERIES";
    @Column(length = 40) public String source;
    @Column(nullable = false) public Instant indexedAt;
    protected Chapter() {}
}
