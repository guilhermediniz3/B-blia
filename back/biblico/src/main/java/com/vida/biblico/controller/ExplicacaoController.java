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
        try {
            ExplicacaoDTO explicacao = explicacaoService.gerarEGuardarExplicacao(versoId);
            return ResponseEntity.status(HttpStatus.CREATED).body(explicacao);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<ExplicacaoDTO>> listarExplicacoesDoVerso(@PathVariable Long versoId) {
        try {
            List<ExplicacaoDTO> explicacoes = explicacaoService.listarExplicacoesDoVerso(versoId);
            return ResponseEntity.ok(explicacoes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<ExplicacaoDTO> gerarENovaExplicacao(@PathVariable Long versoId) {
        try {
            ExplicacaoDTO explicacao = explicacaoService.gerarEGuardarExplicacao(versoId);
            return ResponseEntity.status(HttpStatus.CREATED).body(explicacao);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}