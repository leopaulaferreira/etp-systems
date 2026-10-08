package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
        "DB_PASSWORD=test"
})
class ApiSmokeTest {

    @LocalServerPort
    private int port;

    @Test
    void healthAndOpenApiAreAvailable() throws Exception {
        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpResponse<String> health = get(client, "/actuator/health");
            assertThat(health.statusCode()).isEqualTo(200);
            assertThat(health.body()).contains("\"status\":\"UP\"");

            HttpResponse<String> docs = get(client, "/v3/api-docs");
            assertThat(docs.statusCode()).isEqualTo(200);
            assertThat(docs.body()).contains("ETP Systems API");

            HttpResponse<String> swagger = get(client, "/swagger-ui/index.html");
            assertThat(swagger.statusCode()).isEqualTo(200);
            assertThat(swagger.body()).contains("swagger-ui");
        }
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET().build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
