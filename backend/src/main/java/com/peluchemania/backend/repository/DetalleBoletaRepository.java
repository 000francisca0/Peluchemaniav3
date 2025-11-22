package com.peluchemania.backend.repository;

import com.peluchemania.backend.entity.DetalleBoleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DetalleBoletaRepository extends JpaRepository<DetalleBoleta, Long> {
    // Nos servirá si quieres ver el detalle de una venta específica después
    List<DetalleBoleta> findByBoletaId(Long boletaId);
}