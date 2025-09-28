package com.vida.biblico.repository;

import com.vida.biblico.entity.Testamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestamentoRepository extends JpaRepository<Testamento,Long > {
}
