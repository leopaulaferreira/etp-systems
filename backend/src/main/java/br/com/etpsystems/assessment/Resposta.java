package br.com.etpsystems.assessment;

import java.util.UUID;

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
@Table(name = "respostas_avaliacao")
public class Resposta {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tentativa_id", nullable = false)
    private Tentativa tentativa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "questao_id", nullable = false)
    private Questao questao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alternativa_id", nullable = false)
    private Alternativa alternativa;

    protected Resposta() {}

    public Resposta(Tentativa tentativa, Questao questao, Alternativa alternativa) {
        this.tentativa = tentativa;
        this.questao = questao;
        this.alternativa = alternativa;
    }

    public UUID getQuestaoId() { return questao.getId(); }
    public UUID getAlternativaId() { return alternativa.getId(); }
}
