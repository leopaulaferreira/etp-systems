package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface TentativaRepository extends JpaRepository<Tentativa, UUID> {
    List<Tentativa> findByUsuario_IdAndAvaliacao_IdOrderByConcluidoEmAsc(UUID usuarioId, UUID avaliacaoId);

    @EntityGraph(attributePaths = {"avaliacao", "avaliacao.curso"})
    List<Tentativa> findByUsuario_IdOrderByConcluidoEmDesc(UUID usuarioId);
}
