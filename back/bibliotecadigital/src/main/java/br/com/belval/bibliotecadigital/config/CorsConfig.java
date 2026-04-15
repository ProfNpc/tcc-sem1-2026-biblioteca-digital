package br.com.belval.bibliotecadigital.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Libera qualquer front-end de tentar acessar os métodos de GET e POST do nosso back-end
        registry.addMapping("/**")
                .allowedOrigins("*") // No TCC deixamos aberto para tudo ("*"), na vida real colocaríamos o domínio.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
