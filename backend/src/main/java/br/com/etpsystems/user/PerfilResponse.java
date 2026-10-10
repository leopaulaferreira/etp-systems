package br.com.etpsystems.user;

import java.time.Instant;

public record PerfilResponse(String name, String email, String phone, String location, String position,
        String company, String learningFocus, String experienceLevel, boolean notificationsEnabled,
        Instant memberSince) {
    public static PerfilResponse from(Usuario user) {
        return new PerfilResponse(user.getNome(), user.getEmail(), value(user.getTelefone()),
                value(user.getLocalizacao()), value(user.getCargo()),
                user.getEmpresa() == null ? "" : user.getEmpresa().getNome(),
                value(user.getFocoAprendizagem()), value(user.getNivelExperiencia()),
                user.isNotificacoesAtivas(), user.getCriadoEm());
    }

    private static String value(String text) { return text == null ? "" : text; }
}
