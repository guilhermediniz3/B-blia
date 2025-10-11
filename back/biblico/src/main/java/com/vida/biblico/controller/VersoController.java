package com.vida.biblico.controller;

import com.vida.biblico.dto.VersoDTO;
import com.vida.biblico.service.VersoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

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

    @PatchMapping("/{id}/favorito")
    public ResponseEntity<?> updateFavoritoStatus(
            @PathVariable Long id,
            @RequestParam(name = "status") Boolean status) {
        try {
            VersoDTO versoAtualizadoDTO = versoService.patchFavorito(id, status);
            return ResponseEntity.ok(versoAtualizadoDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao atualizar status favorito.");
        }
    }
}
