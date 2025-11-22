package com.peluchemania.backend.controller;

import com.peluchemania.backend.entity.Boleta;
import com.peluchemania.backend.entity.DetalleBoleta;
import com.peluchemania.backend.repository.BoletaRepository;
import com.peluchemania.backend.repository.DetalleBoletaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*; // Importa todo para asegurar @PathVariable
import java.util.List;

@RestController
@RequestMapping("/api/boletas")
public class BoletaController {

    @Autowired
    private BoletaRepository boletaRepository;
    
    @Autowired
    private DetalleBoletaRepository detalleBoletaRepository; // <--- Inyectar repositorio de detalles

    // Listar todas las boletas
    @GetMapping
    public List<Boleta> listar() {
        return boletaRepository.findAll();
    }
    
    // NUEVO: Ver detalle de una boleta específica
    @GetMapping("/{id}/detalles")
    public List<DetalleBoleta> verDetalles(@PathVariable Long id) {
        return detalleBoletaRepository.findByBoletaId(id);
    }
}