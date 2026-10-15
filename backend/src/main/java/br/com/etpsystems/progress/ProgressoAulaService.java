package br.com.etpsystems.progress;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import br.com.etpsystems.assessment.AulaRepository;
import br.com.etpsystems.certificate.CertificadoRepository;
import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProgressoAulaService {
    public record Resumo(List<UUID> completedLessonIds, int totalLessons, double progress) {}

    private final JdbcTemplate jdbc;
    private final AulaRepository aulas;
    private final InscricaoRepository inscricoes;
    private final UsuarioRepository usuarios;
    private final ProgressoRepository progressos;
    private final CertificadoRepository certificados;

    public ProgressoAulaService(JdbcTemplate jdbc, AulaRepository aulas, InscricaoRepository inscricoes,
            UsuarioRepository usuarios, ProgressoRepository progressos, CertificadoRepository certificados) {
        this.jdbc = jdbc;
        this.aulas = aulas;
        this.inscricoes = inscricoes;
        this.usuarios = usuarios;
        this.progressos = progressos;
        this.certificados = certificados;
    }

    @Transactional(readOnly = true)
    public Resumo consultar(UUID usuarioId, UUID cursoId) {
        if (inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscrição não encontrada");
        }
        return resumo(usuarioId, cursoId);
    }

    @Transactional
    public Resumo concluir(UUID usuarioId, UUID cursoId, UUID aulaId) {
        // Serializa cliques concorrentes e a emissão de certificados para o mesmo usuário.
        var usuario = usuarios.findByIdForUpdate(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        if (usuario.getPerfil() != Perfil.COLABORADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso permitido apenas a colaboradores");
        }
        var inscricao = inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscrição não encontrada"));
        if (aulas.findByCurso_IdOrderByOrdem(cursoId).stream().noneMatch(aula -> aula.getId().equals(aulaId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula não encontrada neste curso");
        }
        var anterior = resumo(usuarioId, cursoId);
        if (anterior.completedLessonIds().contains(aulaId)) return anterior;
        jdbc.update("INSERT INTO aulas_concluidas (usuario_id, aula_id) VALUES (?, ?)",
                usuarioId.toString(), aulaId.toString());
        var atual = resumo(usuarioId, cursoId);
        if (!certificados.existsByUsuario_IdAndCurso_Id(usuarioId, cursoId)) {
            var progresso = progressos.findByUsuario_IdAndCurso_Id(usuarioId, cursoId)
                    .orElseGet(() -> new ProgressoCurso(usuario, inscricao.getCurso()));
            progresso.atualizar(BigDecimal.valueOf(atual.progress()));
            progressos.saveAndFlush(progresso);
        }
        return atual;
    }

    private Resumo resumo(UUID usuarioId, UUID cursoId) {
        int total = aulas.findByCurso_IdOrderByOrdem(cursoId).size();
        List<UUID> concluidas = jdbc.query("""
                SELECT ac.aula_id FROM aulas_concluidas ac JOIN aulas a ON a.id = ac.aula_id
                WHERE ac.usuario_id = ? AND a.curso_id = ? ORDER BY a.ordem
                """, (rs, row) -> UUID.fromString(rs.getString(1)), usuarioId.toString(), cursoId.toString());
        double percentual = total == 0 ? 0 : BigDecimal.valueOf(concluidas.size() * 100L)
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.DOWN).doubleValue();
        return new Resumo(concluidas, total, percentual);
    }
}
