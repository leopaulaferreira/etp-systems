package br.com.etpsystems.enrollment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscricaoRepository extends JpaRepository<Inscricao, UUID> {

    Optional<Inscricao> findByUsuario_IdAndCurso_Id(UUID usuarioId, UUID cursoId);

    @EntityGraph(attributePaths = "curso")
    List<Inscricao> findByUsuario_IdAndCursoIsNotNullOrderByInscritoEmDesc(UUID usuarioId);
}
