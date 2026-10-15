package br.com.etpsystems.user;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Usuario u where u.id = :id")
    Optional<Usuario> findByIdForUpdate(UUID id);

    @EntityGraph(attributePaths = "empresa")
    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findByEmpresa_IdAndPerfilOrderByNomeAsc(UUID empresaId, Perfil perfil);
}
