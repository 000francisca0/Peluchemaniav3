package com.peluchemania.backend.repository;

import com.peluchemania.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    List<Producto> findByCategoriaId(Long categoriaId);

    // ESTA ES LA LÍNEA QUE TE FALTA O ESTÁ MAL ESCRITA:
    List<Producto> findByStockLessThan(Integer stock); 
}