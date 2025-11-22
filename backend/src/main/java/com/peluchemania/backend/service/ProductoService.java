package com.peluchemania.backend.service;

import com.peluchemania.backend.entity.Producto;
import com.peluchemania.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todos los productos
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // Guardar un producto
    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    // Buscar por ID
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    // Eliminar
    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }
}