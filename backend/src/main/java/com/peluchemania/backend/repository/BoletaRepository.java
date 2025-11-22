package com.peluchemania.backend.repository;

import com.peluchemania.backend.entity.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoletaRepository extends JpaRepository<Boleta, Long> {
    // Para ver historial de un usuario específico (si lo necesitas después)
    List<Boleta> findByUsuarioEmail(String usuarioEmail);
}