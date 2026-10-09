package br.com.etpsystems.certificate;

import java.time.Instant;
import java.util.UUID;

import br.com.etpsystems.course.Curso;
import br.com.etpsystems.user.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "certificados", uniqueConstraints = {
        @UniqueConstraint(name = "uk_certificados_usuario_curso", columnNames = {"usuario_id", "curso_id"}),
        @UniqueConstraint(name = "uk_certificados_codigo", columnNames = "codigo")
})
public class Certificado {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "codigo", nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(name = "emitido_em", nullable = false)
    private Instant emitidoEm;

    protected Certificado() {}

    public Certificado(Usuario usuario, Curso curso, Instant emitidoEm) {
        this.usuario = usuario;
        this.curso = curso;
        this.emitidoEm = emitidoEm;
        this.codigo = "ETP-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }

    public UUID getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Curso getCurso() { return curso; }
    public String getCodigo() { return codigo; }
    public Instant getEmitidoEm() { return emitidoEm; }
}
