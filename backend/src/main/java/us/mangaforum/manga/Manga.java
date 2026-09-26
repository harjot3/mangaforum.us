package us.mangaforum.manga;
import jakarta.persistence.*;
@Entity
@Table(name = "manga")
public class Manga {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false, unique = true, length = 160) public String slug;
    @Column(nullable = false, length = 200) public String title;
    @Column(length = 200) public String alternateTitle;
    @Column(nullable = false, length = 200) public String author;
    @Column(nullable = false, columnDefinition = "text") public String description;
    @Column(nullable = false, length = 20) public String status;
    @Column(nullable = false, length = 300) public String genres;
    @Column(length = 500) public String officialUrl;
    protected Manga() {}
}
