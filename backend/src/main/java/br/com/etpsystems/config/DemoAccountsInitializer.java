package br.com.etpsystems.config;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.company.EmpresaRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@ConditionalOnProperty(name = "etp.demo.enabled", havingValue = "true")
@Order(10)
public class DemoAccountsInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarios;
    private final EmpresaRepository empresas;
    private final PasswordEncoder encoder;
    private final String password;
    private final String colaboradorEmail;
    private final String empresaEmail;
    private final String companyName;

    public DemoAccountsInitializer(UsuarioRepository usuarios, EmpresaRepository empresas, PasswordEncoder encoder,
            @Value("${etp.demo.password}") String password,
            @Value("${etp.demo.colaborador-email}") String colaboradorEmail,
            @Value("${etp.demo.empresa-email}") String empresaEmail,
            @Value("${etp.demo.company-name}") String companyName) {
        if (password.isBlank() || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("Defina ETP_DEMO_PASSWORD com 1 a 72 bytes para criar as contas locais.");
        }
        this.usuarios = usuarios;
        this.empresas = empresas;
        this.encoder = encoder;
        this.password = password;
        this.colaboradorEmail = colaboradorEmail.trim().toLowerCase(Locale.ROOT);
        this.empresaEmail = empresaEmail.trim().toLowerCase(Locale.ROOT);
        this.companyName = companyName;
        if (this.colaboradorEmail.equals(this.empresaEmail)) {
            throw new IllegalArgumentException("As contas locais precisam de e-mails distintos.");
        }
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Empresa empresa = empresas.findFirstByNome(companyName)
                .orElseGet(() -> empresas.save(new Empresa(companyName, "Empresa do ambiente local do ETP Systems")));
        createIfMissing("Colaborador ETP", colaboradorEmail, Perfil.COLABORADOR, empresa);
        createIfMissing("RH ETP", empresaEmail, Perfil.EMPRESA, empresa);
    }

    private void createIfMissing(String nome, String email, Perfil perfil, Empresa empresa) {
        Usuario existing = usuarios.findByEmailIgnoreCase(email).orElse(null);
        if (existing != null) {
            if (existing.getPerfil() != perfil || existing.getEmpresa() == null
                    || !existing.getEmpresa().getId().equals(empresa.getId())) {
                throw new IllegalStateException("Uma conta local existente não corresponde ao perfil/empresa configurado.");
            }
            return; // Reiniciar não redefine senha nem altera uma conta existente.
        }
        usuarios.save(new Usuario(nome, email, encoder.encode(password), perfil, empresa));
    }
}
