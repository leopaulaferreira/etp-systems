package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TentativaRepository extends JpaRepository<Tentativa, UUID> {
    List<Tentativa> findByUsuario_IdAndAvaliacao_IdOrderByConcluidoEmAsc(UUID usuarioId, UUID avaliacaoId);
}
