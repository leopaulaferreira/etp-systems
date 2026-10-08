package br.com.etpsystems.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI etpOpenApi() {
        return new OpenAPI().info(new Info()
                .title("ETP Systems API")
                .version("v1")
                .description("API da plataforma de aprendizagem corporativa ETP Systems"));
    }
}
