package com.vida.biblico.repository;

import com.vida.biblico.entity.Explicacao;
import com.vida.biblico.entity.Verso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExplicacaoRepository  extends JpaRepository<Explicacao, Long> {
    List<Explicacao> findByVersoOrderByCriadoEmDesc(Verso verso);
}
