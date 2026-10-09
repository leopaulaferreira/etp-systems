package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;

import br.com.etpsystems.course.Curso;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "avaliacoes")
public class Avaliacao {
    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "titulo", nullable = false, length = 160)
    private String titulo;

    @Column(name = "nota_minima", nullable = false)
    private int notaMinima;

    @Column(name = "limite_tentativas", nullable = false)
    private int limiteTentativas;

    @OneToMany(mappedBy = "avaliacao")
    @OrderBy("ordem ASC")
    private List<Questao> questoes;

    protected Avaliacao() {}

    public UUID getId() { return id; }
    public Curso getCurso() { return curso; }
    public String getTitulo() { return titulo; }
    public int getNotaMinima() { return notaMinima; }
    public int getLimiteTentativas() { return limiteTentativas; }
    public List<Questao> getQuestoes() { return questoes; }
}
