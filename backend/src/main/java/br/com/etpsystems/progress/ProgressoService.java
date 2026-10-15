package br.com.etpsystems.progress;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.etpsystems.assessment.AulaRepository;
import br.com.etpsystems.enrollment.Inscricao;
import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.enrollment.MeuCursoResponse;
import br.com.etpsystems.certificate.CertificadoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProgressoService {

    private final ProgressoRepository progressos;
    private final InscricaoRepository inscricoes;
    private final UsuarioRepository usuarios;
    private final CertificadoRepository certificados;
    private final AulaRepository aulas;

    public ProgressoService(ProgressoRepository progressos, InscricaoRepository inscricoes,
            UsuarioRepository usuarios, CertificadoRepository certificados, AulaRepository aulas) {
        this.progressos = progressos;
        this.inscricoes = inscricoes;
        this.usuarios = usuarios;
        this.certificados = certificados;
        this.aulas = aulas;
    }

    @Transactional
    public MeuCursoResponse atualizar(UUID usuarioId, UUID cursoId, AtualizarProgressoRequest request) {
        Usuario usuario = usuarios.findByIdForUpdate(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        if (usuario.getPerfil() != Perfil.COLABORADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso permitido apenas a colaboradores");
        }
        Inscricao inscricao = inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscrição não encontrada"));
        if (!aulas.findByCurso_IdOrderByOrdem(cursoId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Conclua as aulas para atualizar o progresso deste curso");
        }
        if (request.percentual().compareTo(BigDecimal.valueOf(100)) < 0 &&
                certificados.existsByUsuario_IdAndCurso_Id(usuarioId, cursoId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Curso certificado não pode voltar a ficar em andamento");
        }
        ProgressoCurso progresso = progressos.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                .orElseGet(() -> new ProgressoCurso(usuario, inscricao.getCurso()));
        progresso.atualizar(request.percentual());
        return MeuCursoResponse.from(inscricao, progressos.saveAndFlush(progresso));
    }
}
