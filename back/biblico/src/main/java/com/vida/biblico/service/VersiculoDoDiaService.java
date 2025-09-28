package com.vida.biblico.service;

import com.vida.biblico.entity.Verso;
import com.vida.biblico.entity.VersiculoDoDia;
import com.vida.biblico.repository.VersoRepository;
import com.vida.biblico.repository.VersiculoDoDiaRepository;

import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class VersiculoDoDiaService {

    private final VersoRepository versoRepository;
    private final VersiculoDoDiaRepository versiculoDoDiaRepository;

    public VersiculoDoDiaService(VersoRepository versoRepository, VersiculoDoDiaRepository versiculoDoDiaRepository) {
        this.versoRepository = versoRepository;
        this.versiculoDoDiaRepository = versiculoDoDiaRepository;
    }

    /**
     * TAREFA AGENDADA: Seleciona e salva um novo Versículo do Dia à meia-noite (00:00:00).
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void selecionarNovoVersiculoDoDia() {
        LocalDate hoje = LocalDate.now();

        // Evita gerar se o Versículo do dia para hoje já existir
        if (versiculoDoDiaRepository.existsByDataSelecao(hoje)) {
            return;
        }

        // 1. Busca o ID máximo para seleção aleatória
        Long maxId = versoRepository.findMaxId();

        if (maxId == null || maxId == 0) {
            // Logar erro: Nenhum verso na tabela!
            return;
        }

        // 2. Tenta encontrar um Verso aleatório por ID
        Verso versoSelecionado = null;
        int tentativas = 0;

        while (versoSelecionado == null && tentativas < 10) {
            long randomId = (long) (Math.random() * maxId) + 1;
            versoSelecionado = versoRepository.findById(randomId).orElse(null);
            tentativas++;
        }

        if (versoSelecionado != null) {
            // 3. Salva o Versículo do Dia
            VersiculoDoDia vdd = new VersiculoDoDia();
            vdd.setVerso(versoSelecionado);
            vdd.setDataSelecao(hoje);
            versiculoDoDiaRepository.save(vdd);
        } else {
            // Logar erro: Não conseguiu encontrar um verso válido após 10 tentativas
        }
    }

    /**
     * MÉTODO DE BUSCA: Retorna o Verso do Dia para o Controller.
     */
    public Verso getVersiculoDoDia() {
        // Busca o registro de hoje.
        VersiculoDoDia vdd = versiculoDoDiaRepository.findByDataSelecao(LocalDate.now())
                .orElse(null);

        // Se o agendador ainda não rodou hoje (apenas na primeira hora após meia-noite),
        // roda ele manualmente para garantir o Verso.
        if (vdd == null) {
            selecionarNovoVersiculoDoDia();
            vdd = versiculoDoDiaRepository.findByDataSelecao(LocalDate.now())
                    .orElseThrow(() -> new RuntimeException("Falha ao definir o Versículo do Dia. Tabela Verso vazia?"));
        }

        return vdd.getVerso();
    }
}