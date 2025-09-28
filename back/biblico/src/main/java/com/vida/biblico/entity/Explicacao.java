package com.vida.biblico.entity;

import jakarta.persistence.*;

import java.time.Instant;


    @Entity
    @Table(name = "explicacao")
    public class Explicacao {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "id_verso", nullable = false)
        private Verso verso;

        @Column(name = "contexto_historico", columnDefinition = "TEXT")
        private String contextoHistorico;

        @Column(name = "significado_espiritual", columnDefinition = "TEXT")
        private String significadoEspiritual;

        @Column(name = "aplicacao_pratica", columnDefinition = "TEXT")
        private String aplicacaoPratica;

        @Column(name = "reflexao_pessoal", columnDefinition = "TEXT")
        private String reflexaoPessoal;

        @Column(name = "modelo")
        private String modelo;

        @Column(name = "criado_em")
        private Instant criadoEm;
        public String getContextoHistorico() {
            return contextoHistorico;
        }

        public void setContextoHistorico(String contextoHistorico) {
            this.contextoHistorico = contextoHistorico;
        }

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

        public String getSignificadoEspiritual() {
            return significadoEspiritual;
        }

        public void setSignificadoEspiritual(String significadoEspiritual) {
            this.significadoEspiritual = significadoEspiritual;
        }

        public String getAplicacaoPratica() {
            return aplicacaoPratica;
        }

        public void setAplicacaoPratica(String aplicacaoPratica) {
            this.aplicacaoPratica = aplicacaoPratica;
        }

        public String getReflexaoPessoal() {
            return reflexaoPessoal;
        }

        public void setReflexaoPessoal(String reflexaoPessoal) {
            this.reflexaoPessoal = reflexaoPessoal;
        }

        public String getModelo() {
            return modelo;
        }

        public void setModelo(String modelo) {
            this.modelo = modelo;
        }

        public Instant getCriadoEm() {
            return criadoEm;
        }

        public void setCriadoEm(Instant criadoEm) {
            this.criadoEm = criadoEm;
        }
}
