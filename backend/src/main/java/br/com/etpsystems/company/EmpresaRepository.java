package br.com.etpsystems.company;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {

    Optional<Empresa> findFirstByNome(String nome);
}
