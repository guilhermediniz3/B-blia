package com.vida.biblico.dto;

import com.vida.biblico.entity.VersiculoDoDia;
import com.vida.biblico.entity.Verso;

import java.time.LocalDate;

public class VersiculoDoDiaDTO {
    private Long id;
    private LocalDate dataSelecao;
    private Verso verso;
    private Boolean favorito; // Novo campo no DTO

    public VersiculoDoDiaDTO(){
    };

    public VersiculoDoDiaDTO(VersiculoDoDia versiculoDia){
        this.id = versiculoDia.getId();
        this.dataSelecao = versiculoDia.getDataSelecao();
        this.verso = versiculoDia.getVerso();
        this.favorito = versiculoDia.getFavorito(); // Inicializa o novo campo
    }

    public Verso getVerso() {
        return verso;
    }

    public void setVerso(Verso verso) {
        this.verso = verso;
    }

    public LocalDate getDataSelecao() {
        return dataSelecao;
    }

    public void setDataSelecao(LocalDate dataSelecao) {
        this.dataSelecao = dataSelecao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter e Setter para favorito
    public Boolean getFavorito() {
        return favorito;
    }

    public void setFavorito(Boolean favorito) {
        this.favorito = favorito;
    }
}
