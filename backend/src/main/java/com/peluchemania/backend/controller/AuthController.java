package com.peluchemania.backend.controller;

import com.peluchemania.backend.entity.Usuario;
import com.peluchemania.backend.repository.UsuarioRepository;
import com.peluchemania.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoint para REGISTRAR (Crea usuarios)
    @PostMapping("/register")
    public Usuario register(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    // Endpoint para LOGIN (Te da el Token)
    @PostMapping("/login")
    public String login(@RequestBody Usuario usuario) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(usuario.getEmail(), usuario.getPassword())
        );
        // Buscar usuario para meter su rol en el token
        final Usuario userEncontrado = usuarioRepository.findByEmail(usuario.getEmail()).get();
        
        // Crear objeto UserDetails para el generador de tokens
        org.springframework.security.core.userdetails.User userDetails = 
            new org.springframework.security.core.userdetails.User(
                userEncontrado.getEmail(), 
                userEncontrado.getPassword(), 
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + userEncontrado.getRol()))
            );
            
        return jwtUtil.generateToken(userDetails);
    }
}