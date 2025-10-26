package com.vida.biblico.repository;

import com.vida.biblico.entity.Verso;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VersoRepository extends JpaRepository<Verso, Long> {

    // Método para obter o maior ID existente na tabela Verso
    @Query("SELECT MAX(v.id) FROM Verso v")
    Long findMaxId();


    @Query(value = "SELECT * FROM versos ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Verso> findRandomVerso();


    @Query(value = """
        SELECT v.* 
        FROM versos v 
        JOIN livros l ON v.id_livro = l.id 
        WHERE (:texto IS NULL OR :texto = '' OR v.texto ILIKE '%' || :texto || '%')
        AND (:livro IS NULL OR :livro = '' OR l.nome = :livro)
        AND (:testamento IS NULL OR :testamento = '' OR v.testamento = :testamento)
        AND (:capitulo IS NULL OR v.capitulo = :capitulo)
        ORDER BY v.id ASC
        """, nativeQuery = true)
    Page<Verso> buscarVersos(
            @Param("texto") String texto,
            @Param("livro") String livro,
            @Param("testamento") String testamento,
            @Param("capitulo") Integer capitulo,
            Pageable pageable
    );
}
