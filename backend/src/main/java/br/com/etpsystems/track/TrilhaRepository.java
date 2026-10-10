package br.com.etpsystems.track;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrilhaRepository extends JpaRepository<Trilha, UUID> {
    @EntityGraph(attributePaths = "cursos")
    List<Trilha> findByEmpresaIsNullOrderByNomeAsc();
}
