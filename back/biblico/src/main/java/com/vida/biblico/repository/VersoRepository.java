package com.vida.biblico.repository;

import com.vida.biblico.entity.Verso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VersoRepository extends JpaRepository<Verso, Long> {
}
