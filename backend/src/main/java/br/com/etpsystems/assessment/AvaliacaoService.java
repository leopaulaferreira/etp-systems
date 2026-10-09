package br.com.etpsystems.assessment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.certificate.CertificadoService;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AvaliacaoService {
    private final AulaRepository aulas;
    private final AvaliacaoRepository avaliacoes;
    private final TentativaRepository tentativas;
    private final InscricaoRepository inscricoes;
    private final UsuarioRepository usuarios;
    private final CertificadoService certificados;

    public AvaliacaoService(AulaRepository aulas, AvaliacaoRepository avaliacoes,
            TentativaRepository tentativas, InscricaoRepository inscricoes, UsuarioRepository usuarios,
            CertificadoService certificados) {
        this.aulas = aulas;
        this.avaliacoes = avaliacoes;
        this.tentativas = tentativas;
        this.inscricoes = inscricoes;
        this.usuarios = usuarios;
        this.certificados = certificados;
    }

    @Transactional(readOnly = true)
    public List<AulaResponse> aulas(UUID usuarioId, UUID cursoId) {
        verificarInscricao(usuarioId, cursoId);
        return aulas.findByCurso_IdOrderByOrdem(cursoId).stream().map(AulaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listar(UUID usuarioId) {
        List<UUID> cursoIds = inscricoes.findByUsuario_IdAndCursoIsNotNullOrderByInscritoEmDesc(usuarioId)
                .stream().map(inscricao -> inscricao.getCurso().getId()).toList();
        if (cursoIds.isEmpty()) return List.of();
        return avaliacoes.findByCurso_IdIn(cursoIds).stream()
                .map(avaliacao -> AvaliacaoResponse.from(avaliacao, historico(usuarioId, avaliacao.getId())))
                .toList();
    }

    @Transactional
    public AvaliacaoResponse enviar(UUID usuarioId, UUID avaliacaoId, EnviarTentativaRequest request) {
        Avaliacao avaliacao = avaliacoes.findByIdForUpdate(avaliacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada"));
        verificarInscricao(usuarioId, avaliacao.getCurso().getId());
        List<Tentativa> anteriores = historico(usuarioId, avaliacaoId);
        if (anteriores.size() >= avaliacao.getLimiteTentativas() || anteriores.stream().anyMatch(Tentativa::isAprovado)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não há tentativas disponíveis");
        }
        Map<UUID, UUID> respostas = new HashMap<>();
        for (EnviarTentativaRequest.RespostaRequest resposta : request.respostas()) {
            if (respostas.putIfAbsent(resposta.questaoId(), resposta.alternativaId()) != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Questão duplicada");
            }
        }
        if (respostas.size() != avaliacao.getQuestoes().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Responda todas as questões");
        }
        Map<Questao, Alternativa> escolhas = new HashMap<>();
        for (Questao questao : avaliacao.getQuestoes()) {
            UUID alternativaId = respostas.get(questao.getId());
            Alternativa alternativa = questao.getAlternativas().stream()
                    .filter(opcao -> opcao.getId().equals(alternativaId)).findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resposta inválida"));
            escolhas.put(questao, alternativa);
        }
        long acertos = escolhas.values().stream().filter(Alternativa::isCorreta).count();
        int nota = (int) Math.round(acertos * 100.0 / escolhas.size());
        Usuario usuario = usuarios.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        Tentativa tentativa = new Tentativa(avaliacao, usuario, nota);
        escolhas.forEach(tentativa::responder);
        tentativas.save(tentativa);
        if (tentativa.isAprovado()) {
            certificados.emitirSeHabilitado(usuario, avaliacao.getCurso(), tentativa.getConcluidoEm());
        }
        anteriores.add(tentativa);
        return AvaliacaoResponse.from(avaliacao, anteriores);
    }

    private List<Tentativa> historico(UUID usuarioId, UUID avaliacaoId) {
        return new java.util.ArrayList<>(tentativas.findByUsuario_IdAndAvaliacao_IdOrderByConcluidoEmAsc(usuarioId, avaliacaoId));
    }

    private void verificarInscricao(UUID usuarioId, UUID cursoId) {
        if (inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, cursoId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não inscrito");
        }
    }
}
