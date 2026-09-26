package us.mangaforum.manga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
public interface MangaRepository extends JpaRepository<Manga, Long> {
    Optional<Manga> findBySlug(String slug);
    @Query("select m from Manga m where (:status = '' or m.status = :status) and (:genre = '' or lower(m.genres) like lower(concat('%', :genre, '%'))) and (lower(m.title) like lower(concat('%', :q, '%')) or lower(coalesce(m.alternateTitle, '')) like lower(concat('%', :q, '%')))")
    Page<Manga> browse(@Param("q") String q, @Param("status") String status, @Param("genre") String genre, Pageable pageable);
}
