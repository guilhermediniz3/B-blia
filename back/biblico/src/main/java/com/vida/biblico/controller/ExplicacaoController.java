package com.vida.biblico.controller;

import com.vida.biblico.dto.ExplicacaoDTO;
import com.vida.biblico.service.ExplicacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versos/{versoId}/explicacoes")
public class ExplicacaoController {

    private final ExplicacaoService explicacaoService;

    public ExplicacaoController(ExplicacaoService explicacaoService) {
        this.explicacaoService = explicacaoService;
    }

    @PostMapping("/gerar")
    public ResponseEntity<ExplicacaoDTO> gerarExplicacao(@PathVariable Long versoId) {
        ExplicacaoDTO explicacao = explicacaoService.gerarEGuardarExplicacao(versoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(explicacao);
    }

    @GetMapping
    public ResponseEntity<List<ExplicacaoDTO>> listarExplicacoesDoVerso(@PathVariable Long versoId) {
        List<ExplicacaoDTO> explicacoes = explicacaoService.listarExplicacoesDoVerso(versoId);
        return ResponseEntity.ok(explicacoes);
    }

    @PostMapping
    public ResponseEntity<ExplicacaoDTO> gerarENovaExplicacao(@PathVariable Long versoId) {
        ExplicacaoDTO explicacao = explicacaoService.gerarEGuardarExplicacao(versoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(explicacao);
    }
}