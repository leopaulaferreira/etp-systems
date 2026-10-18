package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, properties = "etp.demo.enabled=false")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class InscricaoMigrationIntegrationTest {
    @Autowired private JdbcTemplate jdbc;
    @Autowired private DataSource dataSource;

    @Test
    void migrationPreservesTheFirstTrackEnrollmentAndOtherEnrollments() throws Exception {
        String table = "inscricoes_upgrade_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String user = UUID.randomUUID().toString();
        String track = UUID.randomUUID().toString();
        String first = "00000000-0000-0000-0000-000000000001";
        jdbc.execute("CREATE TABLE " + table + " LIKE inscricoes");
        try {
            jdbc.execute("ALTER TABLE " + table + " DROP INDEX uk_inscricoes_usuario_trilha");
            String insert = "INSERT INTO " + table + " (id, usuario_id, trilha_id, inscrito_em) VALUES (?, ?, ?, ?)";
            jdbc.update(insert, first, user, track, "2026-01-01 10:00:00");
            jdbc.update(insert, "00000000-0000-0000-0000-000000000002", user, track, "2026-01-01 10:00:00");
            jdbc.update(insert, UUID.randomUUID().toString(), user, track, "2026-01-02 10:00:00");
            jdbc.update(insert, UUID.randomUUID().toString(), user, track, null);
            jdbc.update(insert, UUID.randomUUID().toString(), UUID.randomUUID().toString(), track, "2026-01-01 10:00:00");
            jdbc.update(insert, UUID.randomUUID().toString(), user, UUID.randomUUID().toString(), "2026-01-01 10:00:00");
            jdbc.update("INSERT INTO " + table + " (id, usuario_id, curso_id) VALUES (?, ?, ?)",
                    UUID.randomUUID().toString(), user, UUID.randomUUID().toString());

            String migration = new ClassPathResource("db/migration/V29__unique_track_enrollments.sql")
                    .getContentAsString(StandardCharsets.UTF_8).replace("inscricoes", table);
            new ResourceDatabasePopulator(new ByteArrayResource(migration.getBytes(StandardCharsets.UTF_8)))
                    .execute(dataSource);

            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class)).isEqualTo(4);
            assertThat(jdbc.queryForObject("SELECT id FROM " + table + " WHERE usuario_id = ? AND trilha_id = ?",
                    String.class, user, track)).isEqualTo(first);
            assertThatThrownBy(() -> jdbc.update(insert, UUID.randomUUID().toString(), user, track, "2026-01-03 10:00:00"))
                    .isInstanceOf(DataIntegrityViolationException.class);
        } finally {
            jdbc.execute("DROP TABLE " + table);
        }
    }
}
