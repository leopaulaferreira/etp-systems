package br.com.etpsystems.assessment;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AvaliacaoResponse(
        UUID id, UUID courseId, String title, String course, String courseType, String type,
        String topic, String status, int estimatedMinutes, int minimumScore, int maxAttempts,
        List<QuestaoResponse> questions, Map<String, Integer> answers, List<TentativaResponse> attempts
) {
    public record QuestaoResponse(UUID id, String kind, String prompt, List<String> options,
            List<UUID> optionIds, Integer correctOption, String explanation) {}

    public record TentativaResponse(Map<String, Integer> answers, int score, boolean passed, Instant completedAt) {}

    static AvaliacaoResponse from(Avaliacao avaliacao, List<Tentativa> tentativas, int limiteTentativas) {
        boolean passou = tentativas.stream().anyMatch(Tentativa::isAprovado);
        boolean podeRevisar = passou || tentativas.size() >= limiteTentativas;
        List<QuestaoResponse> questoes = avaliacao.getQuestoes().stream().map(questao -> {
            List<Alternativa> alternativas = questao.getAlternativas();
            int correta = -1;
            for (int i = 0; i < alternativas.size(); i++) {
                if (alternativas.get(i).isCorreta()) correta = i;
            }
            return new QuestaoResponse(questao.getId(), "multiple_choice", questao.getEnunciado(),
                    alternativas.stream().map(Alternativa::getTexto).toList(),
                    alternativas.stream().map(Alternativa::getId).toList(),
                    podeRevisar ? correta : null, podeRevisar ? questao.getExplicacao() : null);
        }).toList();
        List<TentativaResponse> historico = tentativas.stream().map(tentativa -> {
            Map<String, Integer> respostas = new LinkedHashMap<>();
            for (Resposta resposta : tentativa.getRespostas()) {
                QuestaoResponse questao = questoes.stream().filter(q -> q.id().equals(resposta.getQuestaoId()))
                        .findFirst().orElseThrow();
                respostas.put(questao.id().toString(), questao.optionIds().indexOf(resposta.getAlternativaId()));
            }
            return new TentativaResponse(respostas, tentativa.getNota(), tentativa.isAprovado(), tentativa.getConcluidoEm());
        }).toList();
        String icon = avaliacao.getCurso().getIcone();
        String topic = switch (icon) {
            case "security" -> "security";
            case "cloud" -> "cloud";
            case "ai" -> "ai";
            case "projects" -> "projects";
            default -> "privacy";
        };
        return new AvaliacaoResponse(avaliacao.getId(), avaliacao.getCurso().getId(), avaliacao.getTitulo(),
                avaliacao.getCurso().getTitulo(), "Curso", "Teste", topic,
                tentativas.isEmpty() ? "pending" : "completed", Math.max(8, questoes.size()), avaliacao.getNotaMinima(),
                limiteTentativas, questoes, Map.of(), historico);
    }
}
