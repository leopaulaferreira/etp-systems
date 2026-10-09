package br.com.etpsystems.enrollment;

import java.time.Instant;
import java.util.UUID;

import br.com.etpsystems.course.Curso;
import br.com.etpsystems.track.Trilha;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "inscricoes")
public class Inscricao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trilha_id")
    private Trilha trilha;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ativa";

    @Column(name = "inscrito_em", nullable = false)
    private Instant inscritoEm = Instant.now();

    protected Inscricao() {
    }

    public Inscricao(Usuario usuario, Curso curso) {
        this.usuario = usuario;
        this.curso = curso;
    }

    public UUID getId() {
        return id;
    }

    public Curso getCurso() {
        return curso;
    }

    public Instant getInscritoEm() {
        return inscritoEm;
    }
}
