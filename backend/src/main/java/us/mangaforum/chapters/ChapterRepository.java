package us.mangaforum.chapters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.Instant;
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    Page<Chapter> findByMangaIdAndReleasedAtLessThanEqualOrderByNumberDesc(Long mangaId, Instant now, Pageable pageable);
    Page<Chapter> findByReleasedAtLessThanEqualOrderByReleasedAtDescIdDesc(Instant now, Pageable pageable);
}
