package us.mangaforum;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc

@Testcontainers
class CatalogIntegrationTest {
    @Container static PostgreSQLContainer<?> database = new PostgreSQLContainer<>("postgres:17-alpine");
    @DynamicPropertySource static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", database::getJdbcUrl);
        registry.add("spring.datasource.username", database::getUsername);
        registry.add("spring.datasource.password", database::getPassword);
    }
    @Autowired MockMvc mvc;
    @Test void filtersCatalog() throws Exception {
        mvc.perform(get("/api/manga").param("status", "COMPLETED").param("genre", "Fantasy"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(1))
            .andExpect(jsonPath("$.items[0].slug").value("fullmetal-alchemist"));
    }
    @Test void returnsRealMangaWithoutSyntheticChapters() throws Exception {
        mvc.perform(get("/api/manga/chainsaw-man")).andExpect(status().isOk())
            .andExpect(jsonPath("$.author").value("Tatsuki Fujimoto"));
        mvc.perform(get("/api/manga/chainsaw-man/chapters")).andExpect(status().isOk())
            .andExpect(jsonPath("$.totalItems").value(0));
    }
    @Test void seedsPublishedCatalogWithoutFakeReleases() throws Exception {
        mvc.perform(get("/api/manga")).andExpect(status().isOk())
            .andExpect(jsonPath("$.totalItems").value(greaterThan(100)))
            .andExpect(jsonPath("$.items.length()").value(24));
        mvc.perform(get("/api/chapters/recent")).andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }
    @Test void ranksOngoingMangaAndSupportsDeepPagination() throws Exception {
        mvc.perform(get("/api/manga").param("status", "ONGOING").param("sort", "popular"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(24))
            .andExpect(jsonPath("$.items[*].status").value(everyItem(is("ONGOING"))))
            .andExpect(jsonPath("$.items[0].popularity").value(greaterThan(0)));
        mvc.perform(get("/api/manga").param("status", "ONGOING").param("page", "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(24));
        mvc.perform(get("/api/manga").param("q", "Kagurabachi"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].title").value("Kagurabachi"));
    }
    @Test void rejectsInvalidPagesAndMissingTitles() throws Exception {
        mvc.perform(get("/api/manga").param("sort", "invalid")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/manga").param("page", "-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/manga/missing")).andExpect(status().isNotFound());
    }
}
