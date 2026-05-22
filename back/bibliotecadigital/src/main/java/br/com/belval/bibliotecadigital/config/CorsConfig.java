package br.com.belval.bibliotecadigital.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Libera o front-end (aberto como arquivo local OU via Live Server) de acessar a API
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://localhost:5500",
                    "http://127.0.0.1:5500",
                    "http://localhost:8080",
                    "null"          // necessário para abrir o HTML direto pelo explorador de arquivos
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
