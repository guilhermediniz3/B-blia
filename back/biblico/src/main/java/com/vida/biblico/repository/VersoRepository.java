package com.vida.biblico.repository;

import com.vida.biblico.entity.Verso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VersoRepository extends JpaRepository<Verso, Long> {

    // Método para obter o maior ID existente na tabela Verso
    @Query("SELECT MAX(v.id) FROM Verso v")
    Long findMaxId();
}
