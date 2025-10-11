package com.vida.biblico.controller;

import com.vida.biblico.entity.Verso;
import com.vida.biblico.service.VersiculoDoDiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/versiculo-do-dia")
public class VersiculoDoDiaController {

    private final VersiculoDoDiaService service;

    public VersiculoDoDiaController(VersiculoDoDiaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Verso> getVersiculoDoDia() {
        Verso verso = service.getVersiculoDoDia();
        return ResponseEntity.ok(verso);
    }

}