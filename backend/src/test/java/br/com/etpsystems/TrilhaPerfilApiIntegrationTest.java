package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "etp.demo.enabled=false")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class TrilhaPerfilApiIntegrationTest {
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String PASSWORD = "test-only-password";
    private final String email = "track-" + UUID.randomUUID() + "@example.test";
    @LocalServerPort private int port;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private PasswordEncoder passwords;

    @Test
    void trackEnrollmentCreatesCourseEnrollmentsAndProfileChangesPersist() throws Exception {
        usuarios.save(new Usuario("Aluno", email, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        try (HttpClient client = HttpClient.newHttpClient()) {
            assertThat(get(client, "/api/colaborador/trilhas", null).statusCode()).isEqualTo(401);
            String token = login(client);
            JsonNode trails = JSON.readTree(get(client, "/api/colaborador/trilhas", token).body());
            assertThat(trails.size()).isGreaterThanOrEqualTo(4);
            JsonNode first = trails.get(0);
            assertThat(first.path("courseCount").asInt()).isGreaterThan(0);
            String id = first.path("id").asText();
            HttpResponse<String> joined = post(client, "/api/colaborador/trilhas/" + id + "/inscricao", token);
            assertThat(joined.statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(joined.body()).path("enrolled").asBoolean()).isTrue();
            assertThat(post(client, "/api/colaborador/trilhas/" + id + "/inscricao", token).statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(get(client, "/api/colaborador/meus-cursos", token).body()).size())
                    .isEqualTo(first.path("courseCount").asInt());
            String courseId = first.path("courses").get(0).path("id").asText();
            assertThat(put(client, "/api/colaborador/meus-cursos/" + courseId + "/progresso", token,
                    "{\"percentual\":100}").statusCode()).isEqualTo(200);
            JsonNode refreshed = JSON.readTree(get(client, "/api/colaborador/trilhas", token).body());
            JsonNode current = findTrail(refreshed, id);
            assertThat(current).isNotNull();
            assertThat(current.path("progress").asInt()).isGreaterThan(0);

            String update = "{\"name\":\"Aluno Atualizado\",\"phone\":\"11999999999\","
                    + "\"location\":\"São Paulo\",\"position\":\"Analista\","
                    + "\"learningFocus\":\"Segurança\",\"experienceLevel\":\"Iniciante\","
                    + "\"notificationsEnabled\":false}";
            assertThat(put(client, "/api/colaborador/perfil", token, update).statusCode()).isEqualTo(200);
            JsonNode profile = JSON.readTree(get(client, "/api/colaborador/perfil", token).body());
            assertThat(profile.path("name").asText()).isEqualTo("Aluno Atualizado");
            assertThat(profile.path("phone").asText()).isEqualTo("11999999999");
            assertThat(profile.path("notificationsEnabled").asBoolean()).isFalse();
            assertThat(profile.has("senhaHash")).isFalse();
        }
    }

    private JsonNode findTrail(JsonNode trails, String id) {
        for (JsonNode trail : trails) if (id.equals(trail.path("id").asText())) return trail;
        return null;
    }

    @AfterEach void cleanup() { usuarios.findByEmailIgnoreCase(email).ifPresent(usuarios::delete); }

    private String login(HttpClient client) throws Exception {
        HttpResponse<String> response = client.send(HttpRequest.newBuilder(uri("/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(
                        java.util.Map.of("email", email, "senha", PASSWORD))))
                .build(), HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isEqualTo(200);
        return JSON.readTree(response.body()).path("accessToken").asText();
    }
    private HttpResponse<String> get(HttpClient client, String path, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).GET();
        if (token != null) request.header("Authorization", "Bearer " + token);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> post(HttpClient client, String path, String token) throws Exception {
        return client.send(HttpRequest.newBuilder(uri(path)).header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> put(HttpClient client, String path, String token, String json) throws Exception {
        return client.send(HttpRequest.newBuilder(uri(path)).header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json").PUT(HttpRequest.BodyPublishers.ofString(json)).build(),
                HttpResponse.BodyHandlers.ofString());
    }
    private URI uri(String path) { return URI.create("http://localhost:" + port + path); }
}
