package com.peluchemania.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- IMPORTANTE
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "detalle_boleta")
public class DetalleBoleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boleta_id")
    @JsonIgnore // <--- ESTO CORTA EL BUCLE INFINITO
    private Boleta boleta;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer cantidad;
    private Double precioUnitario;
}