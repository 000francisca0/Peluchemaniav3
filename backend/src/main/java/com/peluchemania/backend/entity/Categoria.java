package com.peluchemania.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data // Lombok crea los getters y setters automáticamente
@Entity
@Table(name = "categoria")
public class Categoria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
}