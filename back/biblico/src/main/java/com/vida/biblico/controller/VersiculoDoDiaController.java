package com.vida.biblico.controller;

import com.vida.biblico.dto.VersiculoDoDiaDTO;
import com.vida.biblico.entity.VersiculoDoDia;
import com.vida.biblico.entity.Verso;
import com.vida.biblico.service.VersiculoDoDiaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PatchMapping("/{id}")
    public ResponseEntity<VersiculoDoDiaDTO> patchFavorito(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {

        if (payload == null || !payload.containsKey("isFavorito")) {
            return ResponseEntity.badRequest().build();
        }

        Boolean isFavorito = payload.get("isFavorito");
        VersiculoDoDia vddAtualizado = service.atualizarStatusFavorito(id, isFavorito);
        return ResponseEntity.ok(new VersiculoDoDiaDTO(vddAtualizado));
    }

    @GetMapping("/ultimo")
    public ResponseEntity<VersiculoDoDiaDTO> getUltimoVersiculo() {
        VersiculoDoDiaDTO dto = service.getUltimoVersiculo();
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<VersiculoDoDiaDTO> postVersiculoDia(@RequestBody VersiculoDoDiaDTO versiculoDTO) {
        VersiculoDoDiaDTO versiculoSalvo = service.PostVersiculoDia(versiculoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(versiculoSalvo);
    }
}