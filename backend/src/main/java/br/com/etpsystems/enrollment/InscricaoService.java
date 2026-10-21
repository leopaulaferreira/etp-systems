package br.com.etpsystems.enrollment;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.com.etpsystems.assessment.AulaRepository;
import br.com.etpsystems.course.Curso;
import br.com.etpsystems.course.CursoRepository;
import br.com.etpsystems.progress.ProgressoCurso;
import br.com.etpsystems.progress.ProgressoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InscricaoService {

    private final InscricaoRepository inscricoes;
    private final UsuarioRepository usuarios;
    private final CursoRepository cursos;
    private final ProgressoRepository progressos;
    private final AulaRepository aulas;

    public InscricaoService(InscricaoRepository inscricoes, UsuarioRepository usuarios, CursoRepository cursos,
            ProgressoRepository progressos, AulaRepository aulas) {
        this.inscricoes = inscricoes;
        this.usuarios = usuarios;
        this.cursos = cursos;
        this.progressos = progressos;
        this.aulas = aulas;
    }

    @Transactional(readOnly = true)
    public List<MeuCursoResponse> meusCursos(UUID usuarioId) {
        colaborador(usuarioId, false);
        Map<UUID, ProgressoCurso> porCurso = progressos.findByUsuario_Id(usuarioId).stream()
                .collect(Collectors.toMap(progresso -> progresso.getCurso().getId(), Function.identity()));
        List<Inscricao> minhasInscricoes = inscricoes.findByUsuario_IdAndCursoIsNotNullOrderByInscritoEmDesc(usuarioId);
        if (minhasInscricoes.isEmpty()) return List.of();
        Map<UUID, Long> aulasPorCurso = aulas.countByCourses(minhasInscricoes.stream()
                .map(inscricao -> inscricao.getCurso().getId()).toList()).stream()
                .collect(Collectors.toMap(AulaRepository.CourseLessonCount::getCourseId,
                        AulaRepository.CourseLessonCount::getLessonCount));
        return minhasInscricoes.stream().map(inscricao -> MeuCursoResponse.from(inscricao,
                porCurso.get(inscricao.getCurso().getId()),
                aulasPorCurso.getOrDefault(inscricao.getCurso().getId(), 0L))).toList();
    }

    @Transactional
    public MeuCursoResponse inscrever(UUID usuarioId, UUID cursoId) {
        Usuario usuario = colaborador(usuarioId, true);
        ProgressoCurso progresso = progressos.findByUsuario_IdAndCurso_Id(usuarioId, cursoId).orElse(null);
        return inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                .map(inscricao -> MeuCursoResponse.from(inscricao, progresso, aulas.countByCurso_Id(cursoId)))
                .orElseGet(() -> {
                    Curso curso = cursos.findById(cursoId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
                    return MeuCursoResponse.from(inscricoes.save(new Inscricao(usuario, curso)), null, aulas.countByCurso_Id(cursoId));
                });
    }

    private Usuario colaborador(UUID id, boolean bloquear) {
        var resultado = bloquear ? usuarios.findByIdForUpdate(id) : usuarios.findById(id);
        Usuario usuario = resultado
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        if (usuario.getPerfil() != Perfil.COLABORADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso permitido apenas a colaboradores");
        }
        return usuario;
    }
}
