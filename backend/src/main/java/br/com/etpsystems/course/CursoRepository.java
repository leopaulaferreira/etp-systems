package br.com.etpsystems.course;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, UUID> {

    @EntityGraph(attributePaths = "categoria")
    List<Curso> findAllByOrderByOrdemExibicaoAscTituloAsc();
}
