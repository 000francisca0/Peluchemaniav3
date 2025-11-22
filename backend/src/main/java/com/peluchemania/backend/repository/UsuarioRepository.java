package com.peluchemania.backend.repository;

import com.peluchemania.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método mágico de Spring para buscar por email
    Optional<Usuario> findByEmail(String email);
}