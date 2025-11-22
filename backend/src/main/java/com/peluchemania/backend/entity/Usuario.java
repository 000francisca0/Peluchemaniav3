package com.peluchemania.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuario")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String email;

    private String password;
    private String rol;

    // --- NUEVOS CAMPOS DE DIRECCIÓN ---
    private String direccionRegion;
    private String direccionComuna;
    private String direccionCalle;
    private String direccionDepto;
}