package br.com.etpsystems.assessment;

import java.util.UUID;

import br.com.etpsystems.course.Curso;
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
@Table(name = "aulas")
public class Aula {
    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", columnDefinition = "char(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "titulo", nullable = false, length = 160)
    private String titulo;

    @Column(name = "conteudo", nullable = false, columnDefinition = "text")
    private String conteudo;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "ordem", nullable = false)
    private int ordem;

    protected Aula() {}

    public UUID getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getConteudo() { return conteudo; }
    public String getVideoUrl() { return videoUrl; }
    public int getOrdem() { return ordem; }
}
