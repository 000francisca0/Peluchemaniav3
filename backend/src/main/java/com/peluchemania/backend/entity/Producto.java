package com.peluchemania.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private Boolean onSale;
    private Double discountPercentage;

    // Relación: Muchos productos pertenecen a una categoría
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @jakarta.persistence.Column(columnDefinition = "LONGTEXT") // Permite guardar fotos convertidas a texto
    private String urlImagen;
}