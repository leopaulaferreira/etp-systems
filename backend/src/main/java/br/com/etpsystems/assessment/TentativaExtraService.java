package br.com.etpsystems.assessment;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TentativaExtraService {
    public record Liberacao(UUID id, String authorizedBy, String reason, int afterAttempt, Instant createdAt) {}
    public record Resumo(int usedAttempts, int maxAttempts, int remainingAttempts, boolean passed,
            boolean canGrant, List<Liberacao> grants) {}
    private final JdbcTemplate jdbc;
    private final UsuarioRepository usuarios;
    private final AvaliacaoRepository avaliacoes;
    private final TentativaRepository tentativas;
    private final InscricaoRepository inscricoes;

    public TentativaExtraService(JdbcTemplate jdbc, UsuarioRepository usuarios, AvaliacaoRepository avaliacoes,
            TentativaRepository tentativas, InscricaoRepository inscricoes) {
        this.jdbc = jdbc;
        this.usuarios = usuarios;
        this.avaliacoes = avaliacoes;
        this.tentativas = tentativas;
        this.inscricoes = inscricoes;
    }

    public int limite(UUID usuarioId, Avaliacao avaliacao) {
        Integer extras = jdbc.queryForObject("SELECT COUNT(*) FROM liberacoes_tentativas WHERE usuario_id = ? AND avaliacao_id = ?",
                Integer.class, usuarioId.toString(), avaliacao.getId().toString());
        return avaliacao.getLimiteTentativas() + extras;
    }

    @Transactional(readOnly = true)
    public Resumo consultar(UUID rhId, UUID usuarioId, UUID cursoId) {
        verificar(rhId, usuarioId, cursoId);
        return resumo(usuarioId, avaliacao(cursoId));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Resumo liberar(UUID rhId, UUID usuarioId, UUID cursoId, String motivo) {
        Usuario rh = verificar(rhId, usuarioId, cursoId);
        if (motivo == null || motivo.isBlank() || motivo.trim().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um motivo de até 500 caracteres");
        }
        Avaliacao avaliacao = avaliacoes.findByIdForUpdate(avaliacao(cursoId).getId()).orElseThrow();
        Resumo antes = resumo(usuarioId, avaliacao);
        if (!antes.canGrant()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A liberação exige tentativas esgotadas e ausência de aprovação");
        }
        jdbc.update("""
                INSERT INTO liberacoes_tentativas (id, usuario_id, avaliacao_id, autorizado_por, nome_responsavel, motivo, apos_tentativa)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, UUID.randomUUID().toString(), usuarioId.toString(), avaliacao.getId().toString(),
                rh.getId().toString(), rh.getNome(), motivo.trim(), antes.usedAttempts());
        return resumo(usuarioId, avaliacao);
    }

    private Usuario verificar(UUID rhId, UUID usuarioId, UUID cursoId) {
        Usuario rh = usuarios.findById(rhId).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));
        if (rh.getPerfil() != Perfil.EMPRESA || !rh.isLoginHabilitado() || rh.getEmpresa() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        Usuario aluno = usuarios.findById(usuarioId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (aluno.getPerfil() != Perfil.COLABORADOR || aluno.getEmpresa() == null ||
                !aluno.getEmpresa().getId().equals(rh.getEmpresa().getId()) ||
                inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Colaborador ou inscrição não encontrado");
        }
        return rh;
    }

    private Avaliacao avaliacao(UUID cursoId) {
        return avaliacoes.findByCurso_IdIn(List.of(cursoId)).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso sem avaliação"));
    }

    private Resumo resumo(UUID usuarioId, Avaliacao avaliacao) {
        var historico = tentativas.findByUsuario_IdAndAvaliacao_IdOrderByConcluidoEmAsc(usuarioId, avaliacao.getId());
        int limite = limite(usuarioId, avaliacao);
        boolean passou = historico.stream().anyMatch(Tentativa::isAprovado);
        List<Liberacao> liberacoes = jdbc.query("""
                SELECT id, nome_responsavel, motivo, apos_tentativa, criado_em FROM liberacoes_tentativas
                WHERE usuario_id = ? AND avaliacao_id = ? ORDER BY apos_tentativa
                """, (rs, row) -> new Liberacao(UUID.fromString(rs.getString("id")), rs.getString("nome_responsavel"),
                rs.getString("motivo"), rs.getInt("apos_tentativa"), rs.getTimestamp("criado_em").toInstant()),
                usuarioId.toString(), avaliacao.getId().toString());
        return new Resumo(historico.size(), limite, passou ? 0 : Math.max(0, limite - historico.size()),
                passou, !passou && historico.size() >= limite, liberacoes);
    }
}
