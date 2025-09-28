package com.vida.biblico.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "versiculo_do_dia")
public class VersiculoDoDia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_verso", nullable = false)
    @NotNull
    private Verso verso;

    // Getters e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Verso getVerso() {
        return verso;
    }

    public void setVerso(Verso verso) {
        this.verso = verso;
    }
}