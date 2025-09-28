package com.vida.biblico.dto;

import com.vida.biblico.entity.Explicacao;

import java.time.Instant;

public class ExplicacaoDTO {
    private Long id;
    private Long versoId;
    private String contextoHistorico;
    private String significadoEspiritual;
    private String aplicacaoPratica;
    private String reflexaoPessoal;
    private String modelo;
    private Instant criadoEm;



    public ExplicacaoDTO() {
    }

    // construtor recebendo a entidade
    public ExplicacaoDTO(Explicacao explicacao) {
        this.id = explicacao.getId();
        this.versoId = explicacao.getVerso().getId();
        this.contextoHistorico = explicacao.getContextoHistorico();
        this.significadoEspiritual = explicacao.getSignificadoEspiritual();
        this.aplicacaoPratica = explicacao.getAplicacaoPratica();
        this.reflexaoPessoal = explicacao.getReflexaoPessoal();
        this.modelo = explicacao.getModelo();
        this.criadoEm = explicacao.getCriadoEm();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersoId() {
        return versoId;
    }

    public void setVersoId(Long versoId) {
        this.versoId = versoId;
    }

    public String getContextoHistorico() {
        return contextoHistorico;
    }

    public void setContextoHistorico(String contextoHistorico) {
        this.contextoHistorico = contextoHistorico;
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
