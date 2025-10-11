package com.vida.biblico.controller;

import com.vida.biblico.dto.VersiculoDoDiaDTO;
import com.vida.biblico.entity.VersiculoDoDia;
import com.vida.biblico.entity.Verso;
import com.vida.biblico.service.VersiculoDoDiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

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

        try {
            Boolean isFavorito = payload.get("isFavorito");

            // 3. USO CORRETO DO CAMPO INJETADO (Não há mais erro de 'Cannot resolve symbol')
            VersiculoDoDia vddAtualizado = service.atualizarStatusFavorito(id, isFavorito);
            return ResponseEntity.ok(new VersiculoDoDiaDTO(vddAtualizado));

        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Em caso de qualquer outro erro no serviço
            return ResponseEntity.internalServerError().build();
        }
    }
}