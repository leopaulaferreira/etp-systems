package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AulaRepository extends JpaRepository<Aula, UUID> {
    List<Aula> findByCurso_IdOrderByOrdem(UUID cursoId);
}
