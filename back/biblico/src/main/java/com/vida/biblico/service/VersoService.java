package com.vida.biblico.service;

import com.vida.biblico.dto.VersoDTO;
import com.vida.biblico.entity.Verso;
import com.vida.biblico.repository.VersoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class VersoService {


    private VersoRepository versoRepository;
    public VersoService(VersoRepository versoRepository) {
        this.versoRepository = versoRepository;
    }


    public List<VersoDTO> buscarVersos() {
        return versoRepository.findAll().stream()
                // AQUI: Usando a lambda expression 'v -> new VersoDTO(v)'
                .map(v -> new VersoDTO(v))
                .collect(Collectors.toList());
    }



    public VersoDTO getVersoById(Long id) {
       Verso verso = versoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verso não encontrado"));
       return new VersoDTO(verso);
    }

    @Transactional
    public VersoDTO patchFavorito(Long id, Boolean favorito) {

        Verso verso = versoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Verso não encontrado com ID: " + id));

        //  APLICA A MUDANÇA (A linha que estava faltando)
        verso.setFavorito(favorito);
        // Note: 'favorito' é o valor 'true' que veio do  RequestParam.

        //  SALVA NO BANCO (Persiste a mudança)
        Verso versoAtualizado = versoRepository.save(verso);

        //  CONVERTE E RETORNA
        return new VersoDTO(versoAtualizado);
    }









}
