package br.com.etpsystems.auth;

import java.util.UUID;

import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;

public record UsuarioResponse(UUID id, String nome, String email, Perfil perfil, UUID empresaId) {

    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(),
                usuario.getEmpresa() == null ? null : usuario.getEmpresa().getId());
    }
}
