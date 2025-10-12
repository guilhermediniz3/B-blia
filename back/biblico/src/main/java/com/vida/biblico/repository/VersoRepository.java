package com.vida.biblico.repository;

import com.vida.biblico.entity.Verso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VersoRepository extends JpaRepository<Verso, Long> {

    // Método para obter o maior ID existente na tabela Verso
    @Query("SELECT MAX(v.id) FROM Verso v")
    Long findMaxId();


    @Query(value = "SELECT * FROM versos ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Verso> findRandomVerso();
}
