package br.com.etpsystems.certificate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import br.com.etpsystems.course.Curso;
import br.com.etpsystems.progress.ProgressoCurso;
import br.com.etpsystems.progress.ProgressoRepository;
import br.com.etpsystems.user.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CertificadoService {
    private final CertificadoRepository certificados;
    private final ProgressoRepository progressos;

    public CertificadoService(CertificadoRepository certificados, ProgressoRepository progressos) {
        this.certificados = certificados;
        this.progressos = progressos;
    }

    @Transactional
    public void emitirSeHabilitado(Usuario usuario, Curso curso, Instant aprovadoEm) {
        if (!curso.isCertificacaoHabilitada()) return;
        ProgressoCurso progresso = progressos.findByUsuario_IdAndCurso_Id(usuario.getId(), curso.getId())
                .orElseGet(() -> new ProgressoCurso(usuario, curso));
        progresso.atualizar(BigDecimal.valueOf(100));
        progressos.save(progresso);
        if (certificados.existsByUsuario_IdAndCurso_Id(usuario.getId(), curso.getId())) return;
        certificados.save(new Certificado(usuario, curso, aprovadoEm));
    }

    @Transactional(readOnly = true)
    public List<CertificadoResponse> listar(UUID usuarioId) {
        return certificados.findByUsuario_IdOrderByEmitidoEmDesc(usuarioId).stream()
                .map(CertificadoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CertificadoResponse consultar(UUID usuarioId, UUID id) {
        return certificados.findByIdAndUsuario_Id(id, usuarioId).map(CertificadoResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificado não encontrado"));
    }
}
