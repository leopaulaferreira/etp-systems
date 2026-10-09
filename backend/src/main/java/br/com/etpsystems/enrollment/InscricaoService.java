package br.com.etpsystems.enrollment;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    public InscricaoService(InscricaoRepository inscricoes, UsuarioRepository usuarios, CursoRepository cursos,
            ProgressoRepository progressos) {
        this.inscricoes = inscricoes;
        this.usuarios = usuarios;
        this.cursos = cursos;
        this.progressos = progressos;
    }

    @Transactional(readOnly = true)
    public List<MeuCursoResponse> meusCursos(UUID usuarioId) {
        colaborador(usuarioId);
        Map<UUID, ProgressoCurso> porCurso = progressos.findByUsuario_Id(usuarioId).stream()
                .collect(Collectors.toMap(progresso -> progresso.getCurso().getId(), Function.identity()));
        return inscricoes.findByUsuario_IdAndCursoIsNotNullOrderByInscritoEmDesc(usuarioId)
                .stream().map(inscricao -> MeuCursoResponse.from(inscricao,
                        porCurso.get(inscricao.getCurso().getId()))).toList();
    }

    @Transactional
    public MeuCursoResponse inscrever(UUID usuarioId, UUID cursoId) {
        Usuario usuario = colaborador(usuarioId);
        ProgressoCurso progresso = progressos.findByUsuario_IdAndCurso_Id(usuarioId, cursoId).orElse(null);
        return inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                .map(inscricao -> MeuCursoResponse.from(inscricao, progresso))
                .orElseGet(() -> {
                    Curso curso = cursos.findById(cursoId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
                    return MeuCursoResponse.from(inscricoes.save(new Inscricao(usuario, curso)), null);
                });
    }

    private Usuario colaborador(UUID id) {
        Usuario usuario = usuarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        if (usuario.getPerfil() != Perfil.COLABORADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso permitido apenas a colaboradores");
        }
        return usuario;
    }
}
