package br.com.etpsystems.assessment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;
import br.com.etpsystems.course.Curso;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AvaliacaoResponseTest {
    @Test
    void hidesAnswersBeforeApprovalIncludingExhaustedAndExtraAttempts() {
        Avaliacao avaliacao = assessment();
        var failed = List.of(new Tentativa(avaliacao, null, 0), new Tentativa(avaliacao, null, 50));
        for (var response : List.of(
                AvaliacaoResponse.from(avaliacao, List.of(), 2),
                AvaliacaoResponse.from(avaliacao, failed.subList(0, 1), 2),
                AvaliacaoResponse.from(avaliacao, failed, 2),
                AvaliacaoResponse.from(avaliacao, failed, 3))) {
            assertThat(response.questions()).allSatisfy(question -> {
                assertThat(question.correctOption()).isNull();
                assertThat(question.explanation()).isNull();
                assertThat(question.options()).containsExactly("Correta", "Incorreta");
            });
        }
        var exhausted = AvaliacaoResponse.from(avaliacao, failed, 2);
        assertThat(exhausted.attempts()).extracting(AvaliacaoResponse.TentativaResponse::score)
                .containsExactly(0, 50);
    }

    @Test
    void revealsCorrectionAfterApprovalOnAnExtraAttempt() {
        Avaliacao avaliacao = assessment();
        var response = AvaliacaoResponse.from(avaliacao, List.of(
                new Tentativa(avaliacao, null, 0), new Tentativa(avaliacao, null, 50),
                new Tentativa(avaliacao, null, 100)), 3);
        assertThat(response.questions().getFirst().correctOption()).isZero();
        assertThat(response.questions().getFirst().explanation()).isEqualTo("Explicação da resposta");
        assertThat(response.attempts().getLast().passed()).isTrue();
    }

    private Avaliacao assessment() {
        Curso curso = mock(Curso.class);
        when(curso.getIcone()).thenReturn("security");
        Avaliacao avaliacao = new Avaliacao();
        ReflectionTestUtils.setField(avaliacao, "curso", curso);
        ReflectionTestUtils.setField(avaliacao, "notaMinima", 80);
        Questao questao = new Questao();
        ReflectionTestUtils.setField(questao, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(questao, "explicacao", "Explicação da resposta");
        Alternativa correta = new Alternativa(), incorreta = new Alternativa();
        ReflectionTestUtils.setField(correta, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(incorreta, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(correta, "texto", "Correta");
        ReflectionTestUtils.setField(incorreta, "texto", "Incorreta");
        ReflectionTestUtils.setField(correta, "correta", true);
        ReflectionTestUtils.setField(questao, "alternativas", List.of(correta, incorreta));
        ReflectionTestUtils.setField(avaliacao, "questoes", List.of(questao));
        return avaliacao;
    }
}
