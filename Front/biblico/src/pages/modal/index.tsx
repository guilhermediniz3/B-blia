import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faLightbulb, faHeart, faUser, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

// Interface para o DTO de Explicação (com base no seu backend)
interface ExplicacaoDTO {
  id: number;
  dataGeracao: string;
  contextoHistorico: string;
  significadoEspiritual: string;
  aplicacaoPratica: string;
  reflexaoPessoal: string;
  versiculoId: number;
}

// Interface de Propriedades para o Modal
interface ExplicacaoModalProps {
  show: boolean;
  onHide: () => void;
  versiculoId: number | null;
  referencia: string; // Ex: Gênesis 1:2
}

// Estilos baseados na paleta
const style = {
  header: {
    backgroundColor: '#3498db', // Azul primário para contraste e destaque
    color: 'white',
    borderBottom: 'none',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold' as 'bold',
  },
  section: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  // Cores personalizadas
  contexto: {
    backgroundColor: '#E5F3F7', // Azul claro
    iconColor: '#3498DB', // Azul
    iconBg: '#FFFFFF', // Fundo branco do ícone
  },
  significado: {
    backgroundColor: '#F7E5F3', // Roxo claro
    iconColor: '#DB34A9', // Roxo/Pink
    iconBg: '#FFFFFF',
  },
  aplicacao: {
    backgroundColor: '#E5F7E8', // Verde claro
    iconColor: '#34DB67', // Verde
    iconBg: '#FFFFFF',
  },
  reflexao: {
    backgroundColor: '#F7F3E5', // Amarelo claro
    iconColor: '#DBA934', // Laranja/Ouro
    iconBg: '#FFFFFF',
  },
};

/**
 * Componente de Modal para exibir e gerar explicações bíblicas.
 * Exportado como NAMED export.
 */
export const ExplicacaoModal: React.FC<ExplicacaoModalProps> = ({ show, onHide, versiculoId, referencia }) => {
  const [explicacao, setExplicacao] = useState<ExplicacaoDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gerandoNova, setGerandoNova] = useState(false);

  // Endpoint base
  const BASE_URL = 'http://localhost:8081/api/versos';

  // 🔥 Busca a explicação existente ou inicia a geração da primeira
  const fetchExplicacao = async () => {
    if (!versiculoId) return;

    setLoading(true);
    setError(null);
    setExplicacao(null);

    try {
      // 1. Tenta listar explicações existentes (GET /api/versos/{versoId}/explicacoes)
      const listResponse = await axios.get<ExplicacaoDTO[]>(
        `${BASE_URL}/${versiculoId}/explicacoes`
      );

      if (listResponse.data && listResponse.data.length > 0) {
        // Se houver, usa a mais recente
        setExplicacao(listResponse.data[0]);
      } else {
        // 2. Se não houver, gera uma nova explicação inicial
        await gerarExplicacao(false);
      }
    } catch (err) {
      console.error('Erro ao buscar ou gerar explicação:', err);
      setError('Erro ao carregar ou gerar explicação. Verifique o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Chama o endpoint de gerar e guardar explicação
  const gerarExplicacao = async (isNewGeneration: boolean = true) => {
    if (!versiculoId) return;

    if (isNewGeneration) setGerandoNova(true);
    else setLoading(true);

    setError(null);

    try {
      // Usando o endpoint /gerar (POST /api/versos/{versoId}/explicacoes/gerar)
      const response = await axios.post<ExplicacaoDTO>(
        `${BASE_URL}/${versiculoId}/explicacoes/gerar`
      );
      
      setExplicacao(response.data);
    } catch (err) {
      console.error('Erro ao gerar nova explicação:', err);
      setError('Erro ao gerar nova explicação. Tente novamente.');
    } finally {
      if (isNewGeneration) setGerandoNova(false);
      else setLoading(false);
    }
  };

  // Reseta o estado quando o modal é aberto
  useEffect(() => {
    if (show && versiculoId) {
      fetchExplicacao();
    }
  }, [show, versiculoId]);

  // Componente de Seção Reutilizável com estilos personalizados
  const ExplicaoSection: React.FC<{ 
      title: string, 
      content: string | undefined, 
      style: { backgroundColor: string, iconColor: string, iconBg: string }, 
      icon: any 
    }> = ({ title, content, style: sectionStyle, icon }) => (
    <Card style={{ ...style.section, backgroundColor: sectionStyle.backgroundColor, borderLeft: `5px solid ${sectionStyle.iconColor}` }}>
      <Card.Body className='p-3'>
        <Row className='g-2 align-items-center'>
          <Col xs="auto" className='d-flex align-items-center justify-content-center me-2'>
            <div style={{
              backgroundColor: sectionStyle.iconBg,
              color: sectionStyle.iconColor,
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              border: `1px solid ${sectionStyle.iconColor}`
            }}>
              <FontAwesomeIcon icon={icon} />
            </div>
          </Col>
          <Col>
            <Card.Title className='mb-1' style={{ color: sectionStyle.iconColor, fontWeight: 'bold' }}>
              {title}
            </Card.Title>
          </Col>
        </Row>
        <Card.Text className='mt-2 mb-0' style={{ whiteSpace: 'pre-wrap' }}>
          {content || 'Nenhum conteúdo encontrado para esta seção.'}
        </Card.Text>
      </Card.Body>
    </Card>
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static" // Fundo semifechado
      scrollable
    >
      <Modal.Header style={style.header} closeButton>
        <Modal.Title style={style.title}>
          Explicação Bíblica
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className='p-4'>
        {/* Referência e Gerar Nova */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className='mb-0 text-dark'>Versículo: <span className='text-primary'>{referencia}</span></h4>
            <Button 
                variant="outline-primary" 
                onClick={() => gerarExplicacao(true)} 
                disabled={gerandoNova || loading} // Desabilita se estiver buscando ou gerando
            >
                {gerandoNova ? (
                    <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Gerando...
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faSyncAlt} className='me-2' />
                        Gerar Nova Explicação
                    </>
                )}
            </Button>
        </div>

        {/* Status de Carregamento e Erro */}
        {loading && !gerandoNova && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" role="status" />
            <p className="mt-3 text-primary">Buscando a explicação existente ou gerando a primeira...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className='text-center'>
            {error}
          </Alert>
        )}

        {/* Conteúdo da Explicação */}
        {!loading && explicacao && (
          <>
            <ExplicaoSection
              title="Contexto Histórico"
              content={explicacao.contextoHistorico}
              style={style.contexto}
              icon={faBookOpen}
            />
            <ExplicaoSection
              title="Significado Espiritual"
              content={explicacao.significadoEspiritual}
              style={style.significado}
              icon={faLightbulb}
            />
            <ExplicaoSection
              title="Aplicação Prática"
              content={explicacao.aplicacaoPratica}
              style={style.aplicacao}
              icon={faHeart}
            />
            <ExplicaoSection
              title="Reflexão Pessoal"
              content={explicacao.reflexaoPessoal}
              style={style.reflexao}
              icon={faUser}
            />
            
            <p className='text-muted small mt-3 text-end'>
                Gerado em: {new Date(explicacao.dataGeracao).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
            </p>
          </>
        )}
        
        {!loading && !explicacao && !error && !gerandoNova && (
            <Alert variant="info" className='text-center'>
              Nenhuma explicação encontrada. Clique em "Gerar Nova Explicação" para criar uma.
            </Alert>
        )}

      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
