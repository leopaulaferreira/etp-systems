package br.com.etpsystems.user;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    @EntityGraph(attributePaths = "empresa")
    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findByEmpresa_IdAndPerfilOrderByNomeAsc(UUID empresaId, Perfil perfil);
}
