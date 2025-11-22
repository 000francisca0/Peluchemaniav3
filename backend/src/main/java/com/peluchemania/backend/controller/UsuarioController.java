package com.peluchemania.backend.controller;

import com.peluchemania.backend.entity.Usuario;
import com.peluchemania.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/users") // Ojo: Tu frontend usa /api/users, no /api/usuarios
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. LISTAR TODOS (Admin)
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    // 2. VER BOLETAS DE UN USUARIO (Simulado por ahora)
    @GetMapping("/{id}/boletas")
    public ResponseEntity<List<Object>> verBoletas(@PathVariable Long id) {
        // Aquí deberías buscar en BoletaRepository.findByUsuarioId(id)
        // Por ahora devolvemos lista vacía para que el frontend no falle
        return ResponseEntity.ok(Collections.emptyList());
    }

    // 3. EDITAR USUARIO (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody Usuario detalles) {
        return usuarioRepository.findById(id)
                .map(user -> {
                    // Datos Básicos
                    user.setNombre(detalles.getNombre());
                    user.setEmail(detalles.getEmail());

                    // Password (solo si se envía una nueva)
                    if (detalles.getPassword() != null && !detalles.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(detalles.getPassword()));
                    }
                    // Rol
                    if (detalles.getRol() != null) {
                        user.setRol(detalles.getRol());
                    }

                    // --- NUEVO: ACTUALIZAR DIRECCIÓN ---
                    user.setDireccionRegion(detalles.getDireccionRegion());
                    user.setDireccionComuna(detalles.getDireccionComuna());
                    user.setDireccionCalle(detalles.getDireccionCalle());
                    user.setDireccionDepto(detalles.getDireccionDepto());
                    // -----------------------------------

                    return ResponseEntity.ok(usuarioRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. CREAR USUARIO (Nuevo Endpoint para el Admin)
    @PostMapping
    public Usuario crear(@RequestBody Usuario usuario) {
        // Encriptamos la contraseña antes de guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    // 5. ELIMINAR USUARIO (DELETE) - Solo Admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminar(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(u -> {
                    usuarioRepository.delete(u);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}