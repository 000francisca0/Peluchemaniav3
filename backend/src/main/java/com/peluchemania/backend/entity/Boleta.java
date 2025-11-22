package com.peluchemania.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "boleta")
public class Boleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuarioEmail; // Guardamos quién compró
    private LocalDateTime fecha;
    private Double total;
    private String direccion; // Para saber dónde se envió
}