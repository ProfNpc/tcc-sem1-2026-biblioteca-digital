package br.com.belval.bibliotecadigital.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Faz o Spring servir as imagens da pasta uploads/capas/ via HTTP
    // Ex: http://localhost:8080/capas/nome-do-arquivo.jpg
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads/capas");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/capas/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
