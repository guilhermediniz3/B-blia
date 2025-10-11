package com.vida.biblico.repository;

import com.vida.biblico.dto.VersiculoDoDiaDTO;
import com.vida.biblico.entity.VersiculoDoDia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface VersiculoDoDiaRepository extends JpaRepository<VersiculoDoDia, Long> {

    // Método para buscar o versículo pela data de hoje
    Optional<VersiculoDoDia> findByDataSelecao(LocalDate dataSelecao);

    // Método para verificar se já existe um versículo para a data
    boolean existsByDataSelecao(LocalDate dataSelecao);




}