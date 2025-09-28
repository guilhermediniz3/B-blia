package com.vida.biblico.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vida.biblico.dto.ExplicacaoDTO;
import com.vida.biblico.entity.Explicacao;
import com.vida.biblico.entity.Verso;
import com.vida.biblico.repository.ExplicacaoRepository;
import com.vida.biblico.repository.VersoRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExplicacaoService {

    private final VersoRepository versoRepository;
    private final ExplicacaoRepository explicacaoRepository;
    private final WebClient geminiClient;
    private final String model;
    private final ObjectMapper objectMapper;

    // system prompt para forçar resposta JSON
    private static final String SYSTEM_PROMPT =
            "Você é um especialista bíblico. Ao receber um versículo, responda APENAS com um objeto JSON válido contendo as chaves: " +
                    "\"contextoHistorico\", \"significadoEspiritual\", \"aplicacaoPratica\", \"reflexaoPessoal\". " +
                    "Cada campo deve ser um texto em português, entre 1 e 8000 caracteres. NÃO devolva explicações adicionais fora do JSON.";

    public ExplicacaoService(VersoRepository versoRepository,
                             ExplicacaoRepository explicacaoRepository,
                             WebClient geminiClient,
                             @Value("${gemini.model}") String model,
                             ObjectMapper objectMapper) {
        this.versoRepository = versoRepository;
        this.explicacaoRepository = explicacaoRepository;
        this.geminiClient = geminiClient;
        this.model = model;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ExplicacaoDTO gerarEGuardarExplicacao(Long versoId) {
        // 1. Encontra o Verso no banco de dados.
        Verso verso = versoRepository.findById(versoId)
                .orElseThrow(() -> new RuntimeException("Verso não encontrado"));

        // 2. LÓGICA DE CACHE: Verifica se já existe uma explicação para este Verso.
        List<Explicacao> explicacoesExistentes = explicacaoRepository.findByVersoOrderByCriadoEmDesc(verso);

        if (!explicacoesExistentes.isEmpty()) {
            Explicacao maisRecente = explicacoesExistentes.get(0);
            // Se existir, retorna a explicação mais recente do banco e interrompe o método.
            return new ExplicacaoDTO(maisRecente);
        }

        // --- LÓGICA DE GERAÇÃO (Executada SOMENTE se não houver explicações no banco) ---

        // 3. Prepara o prompt para o Gemini.
        String userPrompt = String.format("Versículo: %s %d:%d\nTexto: \"%s\"\nGere a explicação com os 4 blocos em JSON.",
                verso.getLivro().getNome(),
                verso.getCapitulo(),
                verso.getVersiculo(),
                verso.getTexto());

        // 4. Monta o corpo da requisição para o Gemini.
        var body = objectMapper.createObjectNode();
        body.put("model", model);
        var messages = objectMapper.createArrayNode();
        messages.add(objectMapper.createObjectNode().put("role", "system").put("content", SYSTEM_PROMPT));
        messages.add(objectMapper.createObjectNode().put("role", "user").put("content", userPrompt));
        body.set("messages", messages);

        // 5. Chama a API do Gemini.
        JsonNode response = geminiClient.post()
                .uri("chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        String contentText = extractTextFromGeminiResponse(response);

        // 6. Faz o parse da resposta JSON.
        JsonNode parsed = parseGeminiResponse(contentText);

        // 7. Salva a nova explicação no banco de dados.
        Explicacao e = new Explicacao();
        e.setVerso(verso);
        e.setContextoHistorico(parsed.path("contextoHistorico").asText(""));
        e.setSignificadoEspiritual(parsed.path("significadoEspiritual").asText(""));
        e.setAplicacaoPratica(parsed.path("aplicacaoPratica").asText(""));
        e.setReflexaoPessoal(parsed.path("reflexaoPessoal").asText(""));
        e.setModelo(model);
        e.setCriadoEm(Instant.now());

        explicacaoRepository.save(e);

        // 8. Retorna o DTO da nova explicação.
        return new ExplicacaoDTO(e);
    }

    public List<ExplicacaoDTO> listarExplicacoesDoVerso(Long versoId) {
        Verso v = versoRepository.findById(versoId)
                .orElseThrow(() -> new RuntimeException("Verso não encontrado"));

        return explicacaoRepository.findByVersoOrderByCriadoEmDesc(v)
                .stream()
                .map(explicacao -> new ExplicacaoDTO(explicacao))
                .collect(Collectors.toList());
    }

    private String extractTextFromGeminiResponse(JsonNode response) {
        if (response == null) throw new RuntimeException("Resposta vazia do Gemini");
        JsonNode choices = response.path("choices");
        if (choices.isArray() && choices.size() > 0) {
            JsonNode choice = choices.get(0);
            JsonNode message = choice.path("message");
            if (!message.isMissingNode()) {
                JsonNode content = message.path("content");
                if (content.isTextual()) return content.asText();
                if (content.isArray() && content.size() > 0) {
                    JsonNode first = content.get(0);
                    if (first.has("text")) return first.path("text").asText();
                    return first.toString();
                }
                return message.toString();
            }
            if (choice.has("text")) return choice.path("text").asText();
        }
        return response.toString();
    }

    private JsonNode parseGeminiResponse(String contentText) {
        // Primeira tentativa: parse direto
        try {
            return objectMapper.readTree(contentText);
        } catch (JsonProcessingException e) {
            // Segunda tentativa: extrair JSON de dentro do texto
            int startIndex = contentText.indexOf('{');
            int endIndex = contentText.lastIndexOf('}');

            if (startIndex >= 0 && endIndex > startIndex) {
                String jsonSubstring = contentText.substring(startIndex, endIndex + 1);
                try {
                    return objectMapper.readTree(jsonSubstring);
                } catch (JsonProcessingException ex) {
                    throw new RuntimeException(
                            "Falha ao parsear JSON da resposta do Gemini após extração. " +
                                    "Conteúdo recebido: " + truncateText(contentText, 500),
                            ex
                    );
                }
            } else {
                throw new RuntimeException(
                        "Resposta do Gemini não contém JSON válido. " +
                                "Conteúdo recebido: " + truncateText(contentText, 500),
                        e
                );
            }
        }
    }

    private String truncateText(String text, int maxLength) {
        if (text == null) return "null";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "... [truncated]";
    }
}