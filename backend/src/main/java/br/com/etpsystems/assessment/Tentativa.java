package br.com.etpsystems.assessment;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.etpsystems.user.Usuario;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "tentativas_avaliacao")
public class Tentativa {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avaliacao_id", nullable = false)
    private Avaliacao avaliacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "nota", nullable = false)
    private int nota;

    @Column(name = "aprovado", nullable = false)
    private boolean aprovado;

    @Column(name = "concluido_em", nullable = false)
    private Instant concluidoEm;

    @OneToMany(mappedBy = "tentativa", cascade = CascadeType.ALL)
    private List<Resposta> respostas = new ArrayList<>();

    protected Tentativa() {}

    public Tentativa(Avaliacao avaliacao, Usuario usuario, int nota) {
        this.avaliacao = avaliacao;
        this.usuario = usuario;
        this.nota = nota;
        this.aprovado = nota >= avaliacao.getNotaMinima();
        this.concluidoEm = Instant.now();
    }

    public void responder(Questao questao, Alternativa alternativa) {
        respostas.add(new Resposta(this, questao, alternativa));
    }

    public int getNota() { return nota; }
    public Avaliacao getAvaliacao() { return avaliacao; }
    public Usuario getUsuario() { return usuario; }
    public boolean isAprovado() { return aprovado; }
    public Instant getConcluidoEm() { return concluidoEm; }
    public List<Resposta> getRespostas() { return respostas; }
}
