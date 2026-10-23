package br.com.etpsystems.course;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import br.com.etpsystems.assessment.AulaRepository;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CursoService {

    private final CursoRepository repository;
    private final AulaRepository aulas;

    public CursoService(CursoRepository repository, AulaRepository aulas) {
        this.repository = repository;
        this.aulas = aulas;
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listar() {
        List<Curso> cursos = repository.findAllByOrderByOrdemExibicaoAscTituloAsc();
        if (cursos.isEmpty()) return List.of();
        Map<UUID, Long> quantidades = aulas.countByCourses(cursos.stream().map(Curso::getId).toList()).stream()
                .collect(Collectors.toMap(AulaRepository.CourseLessonCount::getCourseId,
                        AulaRepository.CourseLessonCount::getLessonCount));
        return cursos.stream().map(curso -> CursoResponse.from(curso, quantidades.getOrDefault(curso.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public CursoResponse buscar(UUID id) {
        return repository.findById(id)
                .map(curso -> CursoResponse.from(curso, aulas.countByCurso_Id(id)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
    }
}
