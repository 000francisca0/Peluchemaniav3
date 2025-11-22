package com.peluchemania.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Permite acceso a toda la API
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000") // Puertos comunes de React/Vite
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Permite operaciones CRUD
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}