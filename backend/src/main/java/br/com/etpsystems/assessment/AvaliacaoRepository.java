package br.com.etpsystems.assessment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {
    List<Avaliacao> findByCurso_IdIn(List<UUID> cursoIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Avaliacao a where a.id = :id")
    Optional<Avaliacao> findByIdForUpdate(UUID id);
}
