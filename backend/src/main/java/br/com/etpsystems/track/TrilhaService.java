package br.com.etpsystems.track;

import br.com.etpsystems.course.Curso;
import br.com.etpsystems.enrollment.Inscricao;
import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.progress.ProgressoCurso;
import br.com.etpsystems.progress.ProgressoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TrilhaService {
    private final TrilhaRepository trilhas;
    private final InscricaoRepository inscricoes;
    private final ProgressoRepository progressos;
    private final UsuarioRepository usuarios;

    public TrilhaService(TrilhaRepository trilhas, InscricaoRepository inscricoes,
            ProgressoRepository progressos, UsuarioRepository usuarios) {
        this.trilhas = trilhas;
        this.inscricoes = inscricoes;
        this.progressos = progressos;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<TrilhaResponse> listar(UUID usuarioId) {
        colaborador(usuarioId);
        Map<UUID, ProgressoCurso> porCurso = progressos.findByUsuario_Id(usuarioId).stream()
                .collect(Collectors.toMap(p -> p.getCurso().getId(), Function.identity()));
        Set<UUID> inscritas = inscricoes.findByUsuario_IdAndTrilhaIsNotNull(usuarioId).stream()
                .map(i -> i.getTrilha().getId()).collect(Collectors.toSet());
        return trilhas.findByEmpresaIsNullOrderByNomeAsc().stream()
                .map(t -> resposta(t, inscritas.contains(t.getId()), porCurso)).toList();
    }

    @Transactional
    public TrilhaResponse inscrever(UUID usuarioId, UUID trilhaId) {
        Usuario usuario = colaborador(usuarioId);
        Trilha trilha = trilhas.findById(trilhaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trilha não encontrada"));
        if (trilha.getEmpresa() != null && (usuario.getEmpresa() == null
                || !trilha.getEmpresa().getId().equals(usuario.getEmpresa().getId()))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trilha não encontrada");
        }
        inscricoes.findByUsuario_IdAndTrilha_Id(usuarioId, trilhaId)
                .orElseGet(() -> inscricoes.save(new Inscricao(usuario, trilha)));
        for (Curso curso : trilha.getCursos()) {
            inscricoes.findByUsuario_IdAndCurso_Id(usuarioId, curso.getId())
                    .orElseGet(() -> inscricoes.save(new Inscricao(usuario, curso)));
        }
        Map<UUID, ProgressoCurso> porCurso = progressos.findByUsuario_Id(usuarioId).stream()
                .collect(Collectors.toMap(p -> p.getCurso().getId(), Function.identity()));
        return resposta(trilha, true, porCurso);
    }

    private Usuario colaborador(UUID id) {
        Usuario usuario = usuarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        if (usuario.getPerfil() != Perfil.COLABORADOR || !usuario.isLoginHabilitado()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso permitido apenas a colaboradores");
        }
        return usuario;
    }

    private TrilhaResponse resposta(Trilha trilha, boolean inscrita, Map<UUID, ProgressoCurso> porCurso) {
        List<Curso> cursos = trilha.getCursos().stream()
                .sorted(Comparator.comparing(Curso::getOrdemExibicao).thenComparing(Curso::getTitulo)).toList();
        int minutos = cursos.stream().mapToInt(Curso::getDuracaoMinutos).sum();
        int progresso = inscrita && !cursos.isEmpty() ? (int) Math.round(cursos.stream()
                .mapToDouble(c -> porCurso.containsKey(c.getId())
                        ? porCurso.get(c.getId()).getPercentualProgresso().doubleValue() : 0)
                .average().orElse(0)) : 0;
        return new TrilhaResponse(trilha.getId(), trilha.getNome(), trilha.getDescricao(),
                trilha.getCategoria(), trilha.getNivel(), trilha.getIcone(), trilha.isDestaque(),
                cursos.size(), minutos / 60.0, inscrita, progresso,
                cursos.stream().map(c -> new TrilhaResponse.Course(c.getId(), c.getTitulo())).toList());
    }
}
