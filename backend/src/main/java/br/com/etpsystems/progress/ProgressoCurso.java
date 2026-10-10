package br.com.etpsystems.progress;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "progresso_cursos")
public class ProgressoCurso {

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

    @Column(name = "percentual_progresso", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualProgresso = BigDecimal.ZERO;

    @Column(name = "concluido", nullable = false)
    private boolean concluido;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Column(name = "concluido_em")
    private Instant concluidoEm;

    protected ProgressoCurso() {
    }

    public ProgressoCurso(Usuario usuario, Curso curso) {
        this.usuario = usuario;
        this.curso = curso;
    }

    public void atualizar(BigDecimal percentual) {
        boolean estavaConcluido = concluido;
        percentualProgresso = percentual;
        concluido = percentual.compareTo(BigDecimal.valueOf(100)) == 0;
        if (concluido && !estavaConcluido) concluidoEm = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        if (!concluido) concluidoEm = null;
    }

    public Curso getCurso() {
        return curso;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public BigDecimal getPercentualProgresso() {
        return percentualProgresso;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public Instant getConcluidoEm() {
        return concluidoEm;
    }
}
