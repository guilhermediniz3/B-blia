package com.vida.biblico.controller;

import com.vida.biblico.dto.VersoDTO;
import com.vida.biblico.service.VersoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/versos")
public class VersoController {

    private final VersoService versoService;

    public VersoController(VersoService versoService) {
        this.versoService = versoService;
    }

    @GetMapping
    public ResponseEntity<List<VersoDTO>> buscarVersos() {
        List<VersoDTO> versos = versoService.buscarVersos();
        return ResponseEntity.ok(versos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VersoDTO> getVersoById(@PathVariable Long id) {
        VersoDTO verso = versoService.getVersoById(id);
        return ResponseEntity.ok(verso);
    }

    @PatchMapping("/{id}/favorito")
    public ResponseEntity<VersoDTO> updateFavoritoStatus(
            @PathVariable Long id,
            @RequestParam(name = "status") Boolean status) {

        VersoDTO versoAtualizadoDTO = versoService.patchFavorito(id, status);
        return ResponseEntity.ok(versoAtualizadoDTO);
    }
}