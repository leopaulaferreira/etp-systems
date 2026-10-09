package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;

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
@Table(name = "questoes")
public class Questao {
    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avaliacao_id", nullable = false)
    private Avaliacao avaliacao;

    @Column(name = "enunciado", nullable = false, columnDefinition = "text")
    private String enunciado;

    @Column(name = "explicacao", nullable = false, columnDefinition = "text")
    private String explicacao;

    @Column(name = "ordem", nullable = false)
    private int ordem;

    @OneToMany(mappedBy = "questao")
    @OrderBy("ordem ASC")
    private List<Alternativa> alternativas;

    protected Questao() {}

    public UUID getId() { return id; }
    public String getEnunciado() { return enunciado; }
    public String getExplicacao() { return explicacao; }
    public List<Alternativa> getAlternativas() { return alternativas; }
}
