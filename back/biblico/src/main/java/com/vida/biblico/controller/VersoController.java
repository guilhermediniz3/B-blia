package com.vida.biblico.controller;

import com.vida.biblico.dto.VersoDTO;
import com.vida.biblico.service.VersoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/versos")
public class VersoController {

    private VersoService versoService;

    public VersoController(VersoService versoService) {
        this.versoService = versoService;
    }

    @GetMapping
    public ResponseEntity<List<VersoDTO>> buscarVersos() {
        List<VersoDTO> versos = versoService.buscarVersos();
        return ResponseEntity.ok(versos);
    }
}
