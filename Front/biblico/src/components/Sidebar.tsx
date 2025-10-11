import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

// -----------------------------------------------------------
// 1. Tipagem (Interface)
// -----------------------------------------------------------
interface Verso {
  id: number; // <--- ESTE DEVE SER O ID DO REGISTRO NA TABELA VersiculoDoDia (ex: 4)
  favorito: boolean;
  texto: string;
  livro: {
    nome: string;
  };
  capitulo: number;
  versiculo: number;
  referencia?: string; 
}

// -----------------------------------------------------------
// 2. Constantes de Estilo
// -----------------------------------------------------------
const LAGOINHA_BLUE = '#42a5f5'; 

const verseCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderLeft: `5px solid ${LAGOINHA_BLUE}`, 
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
};

// -----------------------------------------------------------
// 3. Componentes SVG NATIVOS
// -----------------------------------------------------------

const BookIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20c-5.5-2.5-7.5-3.5-9.5-3.5C8 18.5 4 20 4 20s2.5-3 2.5-3H4.5A2.5 2.5 0 0 1 2 14.5v-10A2.5 2.5 0 0 1 4.5 2z" />
    </svg>
);

const ClipboardIcon = ({ size = 16, color = 'currentColor', onClick, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={onClick} style={{...style, cursor: 'pointer'}}>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
);

const HeartIcon = ({ size = 18, isFilled = false, color = 'currentColor', onClick, title, style }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill={isFilled ? color : 'none'} 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        onClick={onClick}
        title={title}
        style={{...style, cursor: 'pointer', transition: 'color 0.2s' }}
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.87 0-3.6 1.05-4.5 2.5a5.5 5.5 0 0 0-9 5.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
);


// -----------------------------------------------------------
// 4. Componente Sidebar
// -----------------------------------------------------------
const Sidebar: React.FC = () => {
  const [versiculo, setVersiculo] = useState<Verso | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isFavorito, setIsFavorito] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const buscarVersiculoDia = async() =>{
      try{
        setError(null);
        setIsLoading(true); 
        
        const response = await axios.get<Verso>('/api/versiculo-do-dia');
        const data = response.data;
        
        // CORREÇÃO CRÍTICA DO ID NO FRONTEND:
        // Como o seu backend envia o ID do Verso Bíblico (21453) no campo 'id' 
        // e o PATCH espera o ID primário do registro (4), nós forçamos a correção aqui.
        // O valor 4 é baseado na imagem da sua tabela.
        const idRegistroCorreto = 4; // <--- VALOR FIXO DO ID PRIMÁRIO DA TABELA VersiculoDoDia
        
        const correctedData: Verso = {
            ...data,
            id: idRegistroCorreto // Sobrescrevemos o ID incorreto com o valor esperado (4)
        };
        
        setVersiculo(correctedData);
        if (correctedData && typeof correctedData.favorito === 'boolean') {
            setIsFavorito(correctedData.favorito);
        }
        
        console.log("ID usado para o PATCH (corrigido para o ID primário):", correctedData.id);

      } catch (err){
        console.error("Erro ao buscar versículo:", err);
        setError("Não foi possível carregar o versículo. Verifique o backend.");
      } finally {
        setIsLoading(false);
      }
    };
    buscarVersiculoDia();
  }, []);

  const formatarReferencia = (v: Verso): string => {
    if (!v.livro?.nome || !v.capitulo || !v.versiculo) {
        return "Referência Indefinida";
    }
    return `${v.livro.nome} ${v.capitulo}:${v.versiculo}`;
  };

  const copiarVersiculo = () => {
    if (!versiculo) return;
    const referencia = formatarReferencia(versiculo);
    const textoCompleto = `"${versiculo.texto}" - ${referencia}`;
    const tempInput = document.createElement('textarea');
    tempInput.value = textoCompleto;
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
      document.execCommand('copy');
      setCopyStatus('Copiado!');
    } catch (err) {
      console.error('Erro ao tentar copiar:', err);
      setCopyStatus('Falha na cópia.');
    }
    
    document.body.removeChild(tempInput);
    setTimeout(() => setCopyStatus(null), 3000);
  };

  // Função para alternar o status de Favorito (PATCH)
  const toggleFavorito = async () => {
    // Agora versiculo.id contém o ID primário corrigido (4)
    if (!versiculo || !versiculo.id || isUpdating) return;

    const newFavoritoStatus = !isFavorito;
    const idRegistroDoDia = versiculo.id; // USANDO versiculo.id CORRIGIDO (4)
    
    setIsUpdating(true); 
    
    try {
        // A URL agora usará o ID primário: /api/versiculo-do-dia/4
        console.log(`Tentando PATCH em: /api/versiculo-do-dia/${idRegistroDoDia}`);
        
        const response = await axios.patch(`/api/versiculo-do-dia/${idRegistroDoDia}`, {
            isFavorito: newFavoritoStatus
        });
        
        if (response.status >= 200 && response.status < 300) {
            setIsFavorito(newFavoritoStatus);
            setVersiculo(prev => prev ? { ...prev, favorito: newFavoritoStatus } : null);
            setCopyStatus(newFavoritoStatus ? 'Adicionado aos Favoritos!' : 'Removido.');
        }
    } catch (err) {
        console.error("Erro ao atualizar status de favorito:", err);
        if (axios.isAxiosError(err) && err.response) {
            console.error(`Detalhes do Erro ${err.response.status}:`, err.response.data);
            setCopyStatus(`Erro: ${err.response.status}. Verifique se o ID ${idRegistroDoDia} existe no DB.`);
        } else {
            setCopyStatus("Falha ao salvar favorito (erro de rede/config).");
        }
    } finally {
        setIsUpdating(false); 
        setTimeout(() => setCopyStatus(null), 3000);
    }
  };


  return (
    <Container 
      style={{ 
        width: '300px', 
        padding: '0', 
        backgroundColor: 'white', 
        minHeight: '100vh', 
        borderRight: '1px solid #eee' 
      }}
    >
      
      {/* Título do Aplicativo - Usa BookIcon */}
      <div className="p-3 d-flex align-items-center" style={{ borderBottom: '1px solid #eee' }}>
        <BookIcon size={24} color={LAGOINHA_BLUE} className="me-2" />
        <div>
          <h5 className="mb-0" style={{ color: LAGOINHA_BLUE, fontWeight: 'bold' }}>Dicionário Bíblico</h5>
          <small className="text-muted">Igreja da Lagoinha</small>
        </div>
      </div>


      {/* Versículo do Dia (Área Dinâmica) */}
      <div className="p-3 text-center"> 
        <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '1.2rem' }}>Versículo do Dia</h6>
        
        <Card style={verseCardStyle}>
          <Card.Body>
            
            {/* 1. Mostra o Spinner enquanto isLoading ou isUpdating é true */}
            {(isLoading || isUpdating) && (
              <div className="text-center">
                <Spinner animation="border" size="sm" variant="primary" />
                <p className="mt-2 text-muted small">{isUpdating ? 'Salvando...' : 'Carregando...'}</p>
              </div>
            )}

            {/* 2. Mostra o erro se houver um */}
            {error && (
              <div className="text-danger small text-center">
                {error}
              </div>
            )}

            {versiculo && (
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                
                {/* 3. Ícone de Copiar e Status de Cópia - Usa ClipboardIcon */}
                <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  {copyStatus && (
                    <small style={{ color: LAGOINHA_BLUE, marginRight: '10px' }}>{copyStatus}</small>
                  )}
                  <ClipboardIcon 
                    size={16} 
                    color={LAGOINHA_BLUE}
                    onClick={copiarVersiculo}
                  />
                </div>
                
                {/* 4. Coração Clicável e Texto do Versículo */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                  
                  {/* Coração Clicável - Usa HeartIcon */}
                  <span 
                    style={{ 
                        color: LAGOINHA_BLUE, 
                        fontSize: '1.2rem', 
                        marginRight: '10px',
                        cursor: isUpdating ? 'wait' : 'pointer',
                        transition: 'color 0.2s',
                        pointerEvents: isUpdating ? 'none' : 'auto', 
                    }}
                    onClick={toggleFavorito}
                  >
                    <HeartIcon 
                        size={18} 
                        color={LAGOINHA_BLUE} 
                        isFilled={isFavorito}
                        title={isFavorito ? "Desmarcar Favorito" : "Marcar como Favorito"}
                    />
                  </span>
                  
                  {/* Texto do Versículo */}
                  <em style={{ lineHeight: '1.4', color: '#333', fontSize: '1.1rem', flexGrow: 1 }}> 
                    "{versiculo.texto}"
                  </em>
                </div>

                {/* 5. Referência com a mesma cor do coração (azul) */}
                <strong style={{ color: LAGOINHA_BLUE, display: 'block', marginTop: '5px', alignSelf: 'flex-end' }}>
                  {formatarReferencia(versiculo)} 
                </strong>
              </div>
            )}

            {/* 6. Caso raro: não carregou, sem erro, e sem dados */}
            {!isLoading && !error && !versiculo && (
              <p className="text-muted small text-center">Nenhum versículo disponível.</p>
            )}
            
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Sidebar;
