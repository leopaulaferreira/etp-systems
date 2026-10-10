package br.com.etpsystems.certificate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificadoRepository extends JpaRepository<Certificado, UUID> {
    boolean existsByUsuario_IdAndCurso_Id(UUID usuarioId, UUID cursoId);

    @EntityGraph(attributePaths = {"curso", "usuario"})
    List<Certificado> findByUsuario_IdOrderByEmitidoEmDesc(UUID usuarioId);

    @EntityGraph(attributePaths = {"curso", "usuario"})
    Optional<Certificado> findByIdAndUsuario_Id(UUID id, UUID usuarioId);

    @EntityGraph(attributePaths = "curso")
    List<Certificado> findByUsuario_IdIn(List<UUID> usuarioIds);
}
