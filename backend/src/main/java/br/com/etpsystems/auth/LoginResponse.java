package br.com.etpsystems.auth;

public record LoginResponse(String accessToken, String tokenType, long expiresIn, UsuarioResponse usuario) {
}
