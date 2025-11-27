package com.peluchemania.backend.controller;

import com.peluchemania.backend.entity.Producto;
import com.peluchemania.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. LEER TODOS (GET) - Público
    @GetMapping
    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    // 2. LEER UNO POR ID (GET /{id}) - Público
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREAR (POST) - Solo Admin
    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    // 4. ACTUALIZAR (PUT) - Solo Admin
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody Producto detalles) {
        return productoRepository.findById(id)
                .map(prod -> {
                    // Actualizar datos básicos
                    prod.setNombre(detalles.getNombre());
                    prod.setDescripcion(detalles.getDescripcion());
                    prod.setPrecio(detalles.getPrecio());
                    prod.setStock(detalles.getStock());
                    prod.setUrlImagen(detalles.getUrlImagen());
                    
                    // Actualizar datos de OFERTA
                    prod.setOnSale(detalles.getOnSale());
                    prod.setDiscountPercentage(detalles.getDiscountPercentage());

                    // Actualizar CATEGORÍA
                    if(detalles.getCategoria() != null && detalles.getCategoria().getId() != null) {
                        prod.setCategoria(detalles.getCategoria());
                    }
                    
                    return ResponseEntity.ok(productoRepository.save(prod));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. ELIMINAR (DELETE) - MEJORADO CON MANEJO DE ERRORES
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) { // <--- CAMBIO A <?> PARA EVITAR ERROR DE COMPILACIÓN
        return productoRepository.findById(id)
                .map(prod -> {
                    try {
                        productoRepository.delete(prod);
                        return ResponseEntity.noContent().build();
                    } catch (DataIntegrityViolationException e) {
                        // Esto ocurre si intentas borrar un producto que ya está en una boleta
                        return ResponseEntity.status(409).body("No se puede eliminar: El producto tiene ventas asociadas.");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. BUSCAR POR CATEGORÍA (GET /categoria/{id})
    @GetMapping("/categoria/{id}")
    public List<Producto> listarPorCategoria(@PathVariable Long id) {
        return productoRepository.findByCategoriaId(id);
    }

    // 7. BUSCAR STOCK CRÍTICO (GET /low-stock)
    @GetMapping("/low-stock")
    public List<Producto> listarStockCritico() {
        return productoRepository.findByStockLessThan(5);
    }
}
