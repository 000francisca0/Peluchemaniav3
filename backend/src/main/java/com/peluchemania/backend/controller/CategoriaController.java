package com.peluchemania.backend.controller;

import com.peluchemania.backend.entity.Categoria;
import com.peluchemania.backend.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // 1. LISTAR (Público)
    @GetMapping
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    // 2. CREAR (Admin)
    @PostMapping
    public Categoria crear(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    // 3. EDITAR (Admin) - Nuevo
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizar(@PathVariable Long id, @RequestBody Categoria detalles) {
        return categoriaRepository.findById(id)
                .map(cat -> {
                    cat.setNombre(detalles.getNombre());
                    return ResponseEntity.ok(categoriaRepository.save(cat));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. ELIMINAR (Admin) - Nuevo
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminar(@PathVariable Long id) {
        return categoriaRepository.findById(id)
                .map(cat -> {
                    categoriaRepository.delete(cat);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}