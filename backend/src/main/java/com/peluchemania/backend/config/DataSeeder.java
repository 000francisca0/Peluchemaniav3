package com.peluchemania.backend.config;

import com.peluchemania.backend.entity.Categoria;
import com.peluchemania.backend.entity.Producto;
import com.peluchemania.backend.entity.Usuario;
import com.peluchemania.backend.repository.CategoriaRepository;
import com.peluchemania.backend.repository.ProductoRepository;
import com.peluchemania.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            ProductoRepository productoRepo, 
            CategoriaRepository categoriaRepo,
            UsuarioRepository usuarioRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            
            // ---------------------------------------------------------
            // 1. CREAR USUARIOS (Si la tabla está vacía)
            // ---------------------------------------------------------
            if (usuarioRepo.count() == 0) {
                // Admin: Con dirección completa para probar el checkout rápido
                crearUsuario(usuarioRepo, passwordEncoder, "Super Admin", "admin@duoc.cl", "admin123", "ADMIN", 
                        "Metropolitana", "Santiago Centro", "Av. Siempreviva 742", "Oficina 1");
                
                // Vendedor: Sin dirección
                crearUsuario(usuarioRepo, passwordEncoder, "Vendedor Estrella", "vendedor@duoc.cl", "vendedor123", "VENDEDOR", null, null, null, null);
                
                // Cliente: Sin dirección
                crearUsuario(usuarioRepo, passwordEncoder, "Cliente Feliz", "cliente@gmail.cl", "cliente23", "CLIENTE", null, null, null, null);
                
                System.out.println("--> ¡USUARIOS BASE CREADOS (CON DIRECCIÓN ADMIN)! <--");
            }

            // ---------------------------------------------------------
            // 2. CREAR PRODUCTOS Y CATEGORÍAS (Si la tabla está vacía)
            // ---------------------------------------------------------
            if (categoriaRepo.count() == 0) {
                
                // --- Categorías ---
                Categoria catOsos = new Categoria(); catOsos.setNombre("Osos");
                Categoria catFantasia = new Categoria(); catFantasia.setNombre("Fantasía");
                Categoria catAnimales = new Categoria(); catAnimales.setNombre("Animales");
                
                categoriaRepo.saveAll(Arrays.asList(catOsos, catFantasia, catAnimales));

                // =========================================
                // PRODUCTOS (9 Peluches)
                // =========================================

                // --- Categoría OSOS ---
                // 1. Oferta
                crearProducto(productoRepo, "Oso Cariñoso", "El clásico osito de peluche suave y tierno.", 15990.0, 10, "/osito.jpg", catOsos, true, 0.20);
                // 2. Oferta
                crearProducto(productoRepo, "Panda Dormilón", "Perfecto para abrazar a la hora de la siesta.", 12990.0, 5, "/panda.jpg", catOsos, true, 0.15);
                // 3. Normal (Foto nueva)
                crearProducto(productoRepo, "Oso Gigante", "Un gran amigo para decorar tu habitación.", 29990.0, 3, "/osobig.jpg", catOsos, false, 0.0);


                // --- Categoría FANTASÍA ---
                // 4. Oferta
                crearProducto(productoRepo, "Unicornio Mágico", "Con cuerno brillante y colores mágicos.", 22990.0, 15, "/unicornio.jpg", catFantasia, true, 0.30);
                // 5. Normal
                crearProducto(productoRepo, "Dino Rex", "El rey de los dinosaurios en versión tierna.", 14500.0, 8, "/dinosaurio.jpg", catFantasia, false, 0.0);
                // 6. Normal (Foto nueva)
                crearProducto(productoRepo, "Dragón Verde", "Pequeño guardián de tus sueños.", 16990.0, 7, "/dragon.jpg", catFantasia, false, 0.0);


                // --- Categoría ANIMALES ---
                // 7. Normal
                crearProducto(productoRepo, "Conejo Orejón", "Orejas largas y pelaje extra suave.", 9990.0, 20, "/conejo.jpg", catAnimales, false, 0.0);
                // 8. Normal
                crearProducto(productoRepo, "Perezoso Relax", "Se toma la vida con calma y suavidad.", 11990.0, 12, "/peresozo.jpg", catAnimales, false, 0.0);
                // 9. Normal (Foto nueva)
                crearProducto(productoRepo, "Pochita", "Tu mejor amigo demonio de peluche.", 18990.0, 6, "/pochita.jpg", catAnimales, false, 0.0);

                System.out.println("--> ¡CATÁLOGO FINAL DE 9 PRODUCTOS CREADO! <--");
            }
        };
    }

    // Helper para crear usuarios (Soporta dirección)
    private void crearUsuario(UsuarioRepository repo, PasswordEncoder encoder, String nombre, String email, String pass, String rol,
                              String region, String comuna, String calle, String depto) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setEmail(email);
        u.setPassword(encoder.encode(pass));
        u.setRol(rol);
        // Dirección
        u.setDireccionRegion(region);
        u.setDireccionComuna(comuna);
        u.setDireccionCalle(calle);
        u.setDireccionDepto(depto);
        repo.save(u);
    }

    // Helper para crear productos (Soporta ofertas)
    private void crearProducto(ProductoRepository repo, String nombre, String desc, Double precio, Integer stock, String img, Categoria cat, Boolean esOferta, Double descuento) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setDescripcion(desc);
        p.setPrecio(precio);
        p.setStock(stock);
        p.setUrlImagen(img);
        p.setCategoria(cat);
        p.setOnSale(esOferta);
        p.setDiscountPercentage(descuento);
        repo.save(p);
    }
}