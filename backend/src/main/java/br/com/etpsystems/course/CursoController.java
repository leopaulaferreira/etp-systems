package br.com.etpsystems.course;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoService service;

    public CursoController(CursoService service) {
        this.service = service;
    }

    @GetMapping
    public List<CursoResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CursoResponse buscar(@PathVariable UUID id) {
        return service.buscar(id);
    }
}
