package br.com.etpsystems.course;

import java.time.Instant;
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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @NotBlank
    @Size(max = 200)
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "descricao", columnDefinition = "text")
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @NotBlank
    @Size(max = 30)
    @Column(name = "nivel", nullable = false, length = 30)
    private String nivel = "Iniciante";

    @Min(0)
    @Column(name = "duracao_minutos", nullable = false)
    private int duracaoMinutos;

    @NotBlank
    @Size(max = 30)
    @Column(name = "icone", nullable = false, length = 30)
    private String icone = "code";

    @Column(name = "destaque", nullable = false)
    private boolean destaque;

    @Column(name = "ordem_exibicao", nullable = false)
    private int ordemExibicao = 1000;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private Instant criadoEm;

    protected Curso() {
    }

    public Curso(String titulo, String descricao, Categoria categoria) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.categoria = categoria;
    }

    public UUID getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public String getNivel() {
        return nivel;
    }

    public int getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public String getIcone() {
        return icone;
    }

    public boolean isDestaque() {
        return destaque;
    }

    public int getOrdemExibicao() {
        return ordemExibicao;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
