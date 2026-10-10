package br.com.etpsystems.track;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.course.Curso;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "trilhas_aprendizagem")
public class Trilha {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "descricao", columnDefinition = "text")
    private String descricao;

    @Column(name = "categoria", nullable = false, length = 50)
    private String categoria = "Geral";

    @Column(name = "nivel", nullable = false, length = 30)
    private String nivel = "Iniciante";

    @Column(name = "icone", nullable = false, length = 30)
    private String icone = "shield";

    @Column(name = "destaque", nullable = false)
    private boolean destaque;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @ManyToMany
    @JoinTable(name = "trilhas_cursos",
            joinColumns = @JoinColumn(name = "trilha_id"),
            inverseJoinColumns = @JoinColumn(name = "curso_id"))
    private Set<Curso> cursos = new LinkedHashSet<>();

    @Column(name = "criado_em", insertable = false, updatable = false)
    private Instant criadoEm;

    protected Trilha() {
    }

    public Trilha(String nome, String descricao, Empresa empresa) {
        this.nome = nome;
        this.descricao = descricao;
        this.empresa = empresa;
    }

    public void adicionarCurso(Curso curso) {
        cursos.add(curso);
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getCategoria() { return categoria; }
    public String getNivel() { return nivel; }
    public String getIcone() { return icone; }
    public boolean isDestaque() { return destaque; }

    public Empresa getEmpresa() {
        return empresa;
    }

    public Set<Curso> getCursos() {
        return Set.copyOf(cursos);
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
