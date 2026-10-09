package br.com.etpsystems.assessment;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "alternativas")
public class Alternativa {
    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "questao_id", nullable = false)
    private Questao questao;

    @Column(name = "texto", nullable = false, length = 500)
    private String texto;

    @Column(name = "correta", nullable = false)
    private boolean correta;

    @Column(name = "ordem", nullable = false)
    private int ordem;

    protected Alternativa() {}

    public UUID getId() { return id; }
    public String getTexto() { return texto; }
    public boolean isCorreta() { return correta; }
}
