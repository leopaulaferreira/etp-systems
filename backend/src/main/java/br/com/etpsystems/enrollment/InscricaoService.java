package br.com.etpsystems.enrollment;

import java.util.List;
import java.util.UUID;

import br.com.etpsystems.course.Curso;
import br.com.etpsystems.course.CursoRepository;
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

    public InscricaoService(InscricaoRepository inscricoes, UsuarioRepository usuarios, CursoRepository cursos) {
        this.inscricoes = inscricoes;
        this.usuarios = usuarios;
        this.cursos = cursos;
    }

    @Transactional(readOnly = true)
    public List<MeuCursoResponse> meusCursos(UUID usuarioId) {
        colaborador(usuarioId);
        return inscricoes.findByUsuario_IdAndCursoIsNotNullOrderByInscritoEmDesc(usuarioId)
                .stream().map(MeuCursoResponse::from).toList();
    }

    @Transactional
    public MeuCursoResponse inscrever(UUID usuarioId, UUID cursoId) {
        Usuario usuario = colaborador(usuarioId);
        return inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                .map(MeuCursoResponse::from)
                .orElseGet(() -> {
                    Curso curso = cursos.findById(cursoId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
                    return MeuCursoResponse.from(inscricoes.save(new Inscricao(usuario, curso)));
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
