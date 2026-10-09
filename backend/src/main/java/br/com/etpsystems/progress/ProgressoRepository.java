package br.com.etpsystems.progress;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressoRepository extends JpaRepository<ProgressoCurso, UUID> {

    @EntityGraph(attributePaths = "curso")
    List<ProgressoCurso> findByUsuario_Id(UUID usuarioId);

    Optional<ProgressoCurso> findByUsuario_IdAndCurso_Id(UUID usuarioId, UUID cursoId);
}
