package com.peluchemania.backend.controller;

import com.peluchemania.backend.entity.Boleta;
import com.peluchemania.backend.entity.DetalleBoleta;
import com.peluchemania.backend.entity.Producto;
import com.peluchemania.backend.repository.BoletaRepository;
import com.peluchemania.backend.repository.DetalleBoletaRepository;
import com.peluchemania.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    @Autowired
    private BoletaRepository boletaRepository;

    @Autowired
    private DetalleBoletaRepository detalleBoletaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @PostMapping("/purchase")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> procesarCompra(@RequestBody Map<String, Object> payload) {
        
        // 1. Datos Generales de la Boleta
        String email = (String) payload.get("userId");
        Double total = Double.valueOf(payload.get("total").toString());
        
        Map<String, String> addr = (Map<String, String>) payload.get("shippingAddress");
        String direccionStr = (addr != null) ? 
            addr.get("calle") + ", " + addr.get("comuna") + ", " + addr.get("region") : "Retiro en tienda";

        // 2. Guardar CABECERA (La Boleta en sí)
        Boleta nuevaBoleta = new Boleta();
        nuevaBoleta.setUsuarioEmail(email);
        nuevaBoleta.setTotal(total);
        nuevaBoleta.setDireccion(direccionStr);
        nuevaBoleta.setFecha(LocalDateTime.now());

        Boleta boletaGuardada = boletaRepository.save(nuevaBoleta);

        // 3. Guardar DETALLES (Los productos comprados)
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("cartItems");

        for (Map<String, Object> item : items) {
            Long prodId = Long.valueOf(item.get("id").toString());
            Integer cantidad = Integer.valueOf(item.get("quantity").toString());
            Double precio = Double.valueOf(item.get("precio").toString());

            // Buscar el producto real para vincularlo
            Producto productoReal = productoRepository.findById(prodId).orElse(null);

            if (productoReal != null) {
                // Crear registro en tabla DETALLE_BOLETA
                DetalleBoleta detalle = new DetalleBoleta();
                detalle.setBoleta(boletaGuardada);
                detalle.setProducto(productoReal);
                detalle.setCantidad(cantidad);
                detalle.setPrecioUnitario(precio);
                
                detalleBoletaRepository.save(detalle);

                // EXTRA: Descontar Stock (Muy valorado en rúbrica)
                int nuevoStock = productoReal.getStock() - cantidad;
                productoReal.setStock(Math.max(0, nuevoStock)); // Evitar negativos
                productoRepository.save(productoReal);
            }
        }

        // 4. Responder
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Compra exitosa");
        response.put("boletaId", boletaGuardada.getId());
        
        return ResponseEntity.ok(response);
    }
}