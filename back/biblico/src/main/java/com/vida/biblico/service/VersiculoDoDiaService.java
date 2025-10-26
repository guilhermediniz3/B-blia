package com.vida.biblico.service;

import com.vida.biblico.dto.VersiculoDoDiaDTO;
import com.vida.biblico.entity.Verso;
import com.vida.biblico.entity.VersiculoDoDia;
import com.vida.biblico.exception.BusinessException;
import com.vida.biblico.repository.VersoRepository;
import com.vida.biblico.repository.VersiculoDoDiaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class VersiculoDoDiaService {

    private final VersoRepository versoRepository;
    private final VersiculoDoDiaRepository versiculoDoDiaRepository;

    public VersiculoDoDiaService(VersoRepository versoRepository, VersiculoDoDiaRepository versiculoDoDiaRepository) {
        this.versoRepository = versoRepository;
        this.versiculoDoDiaRepository = versiculoDoDiaRepository;
    }

    /**
     * TAREFA AGENDADA: Seleciona e salva um novo Versículo do Dia à meia-noite (00:44:00).
     */
    @Scheduled(cron = "0 44 0 * * *", zone = "America/Sao_Paulo")
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
            System.err.println("ERRO: Tabela Verso está vazia! Não foi possível selecionar o Versículo do Dia.");
            return;
        }

        // 2. Tenta encontrar um Verso aleatório por ID
        Verso versoSelecionado = null;
        int tentativas = 0;

        while (versoSelecionado == null && tentativas < 10) {
            // Garante que o ID aleatório esteja dentro do intervalo [1, maxId]
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
            System.err.println("ERRO: Não conseguiu encontrar um verso válido após 10 tentativas de busca aleatória.");
        }
    }

    @Transactional
    public Verso getVersiculoDoDia() {
        LocalDate hoje = LocalDate.now();

        // 1. Tenta buscar o Versículo do Dia (VDD) já definido para hoje
        Optional<VersiculoDoDia> vddOptional = versiculoDoDiaRepository.findByDataSelecao(hoje);

        // Se já existe, retorna o Verso associado imediatamente
        if (vddOptional.isPresent()) {
            return vddOptional.get().getVerso();
        }

        // 2. Se não existe (servidor ligado após 00:44:00 ou é a primeira requisição do dia):
        selecionarNovoVersiculoDoDia();

        // 3. Tenta buscar novamente após a execução da lógica de seleção
        VersiculoDoDia vddNovo = versiculoDoDiaRepository.findByDataSelecao(hoje)
                .orElseThrow(() -> new BusinessException("Falha ao definir o Versículo do Dia. A tabela Verso deve estar vazia ou a lógica de seleção falhou."));

        return vddNovo.getVerso();
    }

    @Transactional
    public VersiculoDoDia atualizarStatusFavorito(Long id, Boolean isFavorito) {
        VersiculoDoDia versiculo = versiculoDoDiaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Registro de Versículo do Dia não encontrado para o id: " + id));

        versiculo.setFavorito(isFavorito);
        return versiculoDoDiaRepository.save(versiculo);
    }

    public VersiculoDoDiaDTO getUltimoVersiculo() {
        VersiculoDoDia ultimo = versiculoDoDiaRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new BusinessException("Nenhum versículo encontrado."));
        return new VersiculoDoDiaDTO(ultimo);
    }






    public VersiculoDoDiaDTO PostVersiculoDia(VersiculoDoDiaDTO versiculoDTO) {
        LocalDate dataAtual = LocalDate.now();
        if(versiculoDoDiaRepository.existsByDataSelecao(dataAtual)) {
            throw new BusinessException("Já existe um versículo do dia para a data atual: " + dataAtual);
        }

        VersiculoDoDia versiculoDoDia = new VersiculoDoDia();
        versiculoDoDia.setDataSelecao(dataAtual);


        Long maxId = versoRepository.findMaxId();
        long randomId = (long) (Math.random() * maxId) + 1;
        Verso versoAleatorio = versoRepository.findById(randomId)
                .orElseThrow(() -> new BusinessException("Verso aleatório não encontrado"));

        versiculoDoDia.setVerso(versoAleatorio);
        versiculoDoDia.setFavorito(versiculoDTO.getFavorito());

        VersiculoDoDia savedVersiculo = versiculoDoDiaRepository.save(versiculoDoDia);
        return new VersiculoDoDiaDTO(savedVersiculo);
    }
}