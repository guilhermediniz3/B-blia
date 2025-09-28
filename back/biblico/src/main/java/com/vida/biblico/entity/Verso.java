package com.vida.biblico.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "versos")
public class  Verso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @ManyToOne
    @JoinColumn(name = "id_livro", nullable = false)
    private Livro livro;

    @NotNull
    @Column(name = "capitulo", nullable = false)
    private Integer capitulo;

    @NotNull
    @Column(name = "versiculo", nullable = false)
    private Integer versiculo;

    @NotBlank
    @Column(name = "texto", nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(name = "testamento") // este campo pode ser redundante pois já está no livro->testamento
    private String testamento;

    // Getters e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Livro getLivro() {
        return livro;
    }

    public void setLivro(Livro livro) {
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

    public String getTestamento() {
        return testamento;
    }

    public void setTestamento(String testamento) {
        this.testamento = testamento;
    }
}