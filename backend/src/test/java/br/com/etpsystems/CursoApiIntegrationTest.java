package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "etp.demo.enabled=false")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class CursoApiIntegrationTest {

    private static final Pattern FIRST_ID = Pattern.compile("\\\"id\\\":\\\"([a-f0-9-]{36})\\\"");

    @LocalServerPort
    private int port;

    @Test
    void listsCatalogAndFindsOneCourseWithoutExposingEntities() throws Exception {
        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpResponse<String> list = get(client, "/api/cursos");
            assertThat(list.statusCode()).isEqualTo(200);
            assertThat(list.body()).contains("Fundamentos de Cibersegurança", "\"durationHours\":", "\"category\":");
            assertThat(list.body()).doesNotContain("senhaHash", "\"categoria_id\"");

            Matcher first = FIRST_ID.matcher(list.body());
            assertThat(first.find()).isTrue();
            String id = first.group(1);

            HttpResponse<String> details = get(client, "/api/cursos/" + id);
            assertThat(details.statusCode()).isEqualTo(200);
            assertThat(details.body()).contains("\"id\":\"" + id + "\"");

            assertThat(get(client, "/api/cursos/" + UUID.randomUUID()).statusCode()).isEqualTo(404);
            assertThat(get(client, "/api/cursos/id-invalido").statusCode()).isEqualTo(400);
        }
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET().build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
