package br.com.etpsystems.course;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CursoService {

    private final CursoRepository repository;

    public CursoService(CursoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listar() {
        return repository.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .map(CursoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CursoResponse buscar(UUID id) {
        return repository.findById(id)
                .map(CursoResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
    }
}
