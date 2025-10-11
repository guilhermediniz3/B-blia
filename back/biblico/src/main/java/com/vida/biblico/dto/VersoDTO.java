package com.vida.biblico.dto;

import com.vida.biblico.entity.Verso;

public class VersoDTO {
    private Long id;
    private String livro;
    private Integer capitulo;
    private Integer versiculo;
    private String texto;
    private Boolean favorito;



    public VersoDTO() {
    }

    // Construtor que recebe a entidade Verso e faz a conversão
    public VersoDTO(Verso verso) {
        this.id = verso.getId();
        this.livro = verso.getLivro().getNome();
        this.capitulo = verso.getCapitulo();
        this.versiculo = verso.getVersiculo();
        this.texto = verso.getTexto();
        this.favorito = verso.getFavorito();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLivro() {
        return livro;
    }

    public void setLivro(String livro) {
        this.livro = livro;
    }

    public Integer getCapitulo() {
        return capitulo;
    }

    public void setCapitulo(Integer capitulo) {
        this.capitulo = capitulo;
    }

    public Integer getVersiculo() {
        return versiculo;
    }

    public void setVersiculo(Integer versiculo) {
        this.versiculo = versiculo;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Boolean getFavorito() {
        return favorito;
    }

    public void setFavorito(Boolean favorito) {
        this.favorito = favorito;
    }
}
