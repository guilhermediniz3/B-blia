package com.vida.biblico.controller;

import com.vida.biblico.dto.VersoDTO;
import com.vida.biblico.service.VersoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/versos")
public class VersoController {

    private final VersoService versoService;

    public VersoController(VersoService versoService) {
        this.versoService = versoService;
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



    @GetMapping("/todos")
    public Page<VersoDTO> getAllVersos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return versoService.getAllVersos(page, size);
    }

    // 🔥 ENDPOINT 2: Buscar COM filtros
    @GetMapping("/buscar")
    public Page<VersoDTO> buscarVersos(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) String livro,
            @RequestParam(required = false) String testamento,
            @RequestParam(required = false) Integer capitulo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return versoService.buscarVersosComFiltros(texto, livro, testamento, capitulo, page, size);
    }

}