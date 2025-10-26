import React, { useState, useEffect,useRef  } from 'react';
import { Card, Spinner } from 'react-bootstrap'; // Importamos Container/Row/Col/Form/Button etc. de Content.tsx. Aqui usamos Card e Spinner.
import axios from 'axios';

// -----------------------------------------------------------
// 1. Tipagem (Interface) - Estrutura Fiel ao DTO completo
// -----------------------------------------------------------
interface Livro {
    nome: string;
}

interface VersoDetalhe {
    id: number; // Este é o ID do Verso Bíblico (Ex: 21453)
    texto: string;
    livro: Livro;
    capitulo: number;
    versiculo: number;
}

interface VersiculoDoDiaDTO {
    id: number; // ESTE é o ID do Registro Diário (Ex: 4) - O ID CORRETO PARA O PATCH
    favorito: boolean;
    verso: VersoDetalhe;
    dataSelecao: string;
}

// -----------------------------------------------------------
// 2. Constantes de Endpoints e Estilo
// -----------------------------------------------------------
const LAGOINHA_BLUE = '#42a5f5'; 

// Endpoints: Usamos a rota '/ultimo' como a fonte primária de dados completos
const URL_GET_DADOS_COMPLETOS = `/api/versiculo-do-dia/ultimo`;
// Endpoint base para o PATCH (precisa do ID anexado)
const URL_PATCH_BASE = `/api/versiculo-do-dia/`; 
const URL_POST_CRIAR_VERSICULO = `/api/versiculo-do-dia`; // NOVO ENDPOINT
const verseCardStyle: React.CSSProperties = {
 backgroundColor: 'white',
 borderLeft: `5px solid ${LAGOINHA_BLUE}`, 
 boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
};

// -----------------------------------------------------------
// 3. Componentes SVG NATIVOS
// -----------------------------------------------------------

// NOVO ÍCONE: Livro Aberto com marcador de página (Book Open)
const BookIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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
 const [versiculoDoDia, setVersiculoDoDia] = useState<VersiculoDoDiaDTO | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isFavorito, setIsFavorito] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);



  
const postExecutado = useRef(false);

useEffect(() => {
  const criarVersiculoDoDiaNoRefresh = async (): Promise<void> => {
    if (postExecutado.current) return;
    postExecutado.current = true;
    
    try {
      const payload = {
        favorito: false,
        verso: { id: 1 }
      };
      
      await axios.post(URL_POST_CRIAR_VERSICULO, payload);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) return;
      throw error;
    }
  };

  criarVersiculoDoDiaNoRefresh();
}, []);

  



  // EFEITO: Busca todos os dados em uma única chamada
  useEffect(() => {
    const buscarVersiculoDia = async() =>{
      setIsLoading(true); 
      setError(null);
      
      try {
        console.log(`Tentando GET para DTO completo: ${URL_GET_DADOS_COMPLETOS}`);
        
        // 1. AXIOS.GET para buscar o DTO completo na nova rota
        const response = await axios.get<VersiculoDoDiaDTO>(URL_GET_DADOS_COMPLETOS);
        const data = response.data;
        
        console.log("Resposta JSON do backend (para debug):", data); 

        // 2. VERIFICAÇÃO RIGOROSA DO DTO
        if (!data || !data.id || typeof data.id !== 'number' || !data.verso || !data.verso.texto) {
            console.error("DTO incompleto. Campos esperados: id (number), verso, verso.texto.");
            throw new Error("O DTO principal retornou dados incompletos ou ID inválido. Consulte o console.");
        }

        setVersiculoDoDia(data);
        if (typeof data.favorito === 'boolean') {
            setIsFavorito(data.favorito);
        }

        console.log(`Carregamento concluído. ID do Registro para PATCH: ${data.id}`);
        
      } catch (err) {
        let errorMessage = `Erro de Conexão ou Formato. Verifique o console.`;
        if (axios.isAxiosError(err) && err.response) {
            errorMessage = `Falha HTTP ${err.response.status}. Verifique o CORS ou o status do backend.`;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        
        console.error(`Falha ao carregar versículo na rota ${URL_GET_DADOS_COMPLETOS}:`, err);
        setError(`Não foi possível carregar o versículo. ${errorMessage}`);
      }

       setIsLoading(false);
    };
    buscarVersiculoDia();
  }, []); 

  // Formata a referência usando os dados aninhados
  const formatarReferencia = (v: VersiculoDoDiaDTO): string => { 
    const verso = v.verso;
    if (!verso?.livro?.nome || !verso?.capitulo || !verso?.versiculo) {
        return "Referência Indefinida";
    }
    return `${verso.livro.nome} ${verso.capitulo}:${verso.versiculo}`;
  };

  const copiarVersiculo = () => {
    if (!versiculoDoDia || !versiculoDoDia.verso) return;
    
    const referencia = formatarReferencia(versiculoDoDia);
    const textoCompleto = `"${versiculoDoDia.verso.texto}" - ${referencia}`; 
    
    // Uso de document.execCommand('copy') por restrições de iFrame
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

  // FUNÇÃO PARA ATUALIZAR O FAVORITO (PATCH)
  const toggleFavorito = async () => {
    // Pegamos o ID PRINCIPAL (para o PATCH) diretamente do DTO carregado
    const idRegistroDoDia = versiculoDoDia?.id;

    if (!idRegistroDoDia || isUpdating) {
      if (!idRegistroDoDia) {
        setCopyStatus('ID de Registro não carregado.');
        setTimeout(() => setCopyStatus(null), 3000);
      }
      return; 
    }

    const newFavoritoStatus = !isFavorito;
    
    setIsUpdating(true); 
    
    try {
        // A URL do PATCH usa o ID dinâmico extraído do DTO carregado
        const patchUrl = `${URL_PATCH_BASE}${idRegistroDoDia}`; 
        
        console.log(`[PATCH] Tentando PATCH na ROTA CORRETA (ID: ${idRegistroDoDia}): ${patchUrl}`);
        
        // O payload usa 'isFavorito' como campo
        const response = await axios.patch<VersiculoDoDiaDTO>(patchUrl, {
            isFavorito: newFavoritoStatus 
        });
        
        if (response.status >= 200 && response.status < 300) {
            const favoritoFromBackend = response.data?.favorito;

            if (typeof favoritoFromBackend === 'boolean') {
                setIsFavorito(favoritoFromBackend); 
                // Atualiza o DTO no estado local
                setVersiculoDoDia(prev => prev ? { ...prev, favorito: favoritoFromBackend } : null);
                setCopyStatus(favoritoFromBackend ? 'Adicionado aos Favoritos!' : 'Removido.');
            } else {
                // Caso o backend não retorne o DTO completo, atualizamos pelo estado local
                 setIsFavorito(newFavoritoStatus); 
                 setVersiculoDoDia(prev => prev ? { ...prev, favorito: newFavoritoStatus } : null);
                 setCopyStatus(newFavoritoStatus ? 'Adicionado aos Favoritos!' : 'Removido.');
            }
        } else {
            setCopyStatus('Resposta do servidor inesperada no PATCH.');
        }
    } catch (err) {
        console.error("Erro ao atualizar status de favorito:", err);
        let errorStatusMessage = "Falha ao salvar (erro de rede/config).";
        if (axios.isAxiosError(err) && err.response) {
            const status = err.response.status;
            // Mensagem mais específica para o 400
            if (status === 400) {
                errorStatusMessage = `Erro 400: O payload '{"isFavorito": ${newFavoritoStatus}}' foi rejeitado.`;
            } else {
                errorStatusMessage = `Erro ${status}: Verifique se o PATCH está configurado corretamente.`;
            }
        }
        
        setCopyStatus(errorStatusMessage);
        
    } finally {
        setIsUpdating(false); 
        setTimeout(() => setCopyStatus(null), 3000);
    }
  };


  return (
    <div 
      style={{ 
        // REMOVIDO: width: '300px'
        padding: '0', 
        backgroundColor: 'white', 
        minHeight: '100vh', 
        borderRight: '1px solid #eee',
        flexShrink: 0
      }}
    >
      
      {/* Título do Aplicativo */}
      <div className="p-3 d-flex align-items-center" style={{ borderBottom: '1px solid #eee' }}>
        {/* Usando o ícone de Livro Aberto */}
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
            
            {/* Visualização de Status (Carregando / Erro) */}
            {(isLoading || isUpdating) && (
              <div className="text-center">
                <Spinner animation="border" size="sm" variant="primary" />
                <p className="mt-2 text-muted small">{isUpdating ? 'Salvando...' : 'Carregando Versículo...'}</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-danger small text-center">
                <p>{error}</p>
                <p className="small">Verifique a rota: <code>{URL_GET_DADOS_COMPLETOS}</code></p>
              </div>
            )}
            
            {/* O Versículo em si */}
            {!isLoading && versiculoDoDia && versiculoDoDia.verso && versiculoDoDia.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                
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
                
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                  
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
                  
                  <em style={{ lineHeight: '1.4', color: '#333', fontSize: '1.1rem', flexGrow: 1 }}> 
                    "{versiculoDoDia.verso.texto}"
                  </em>
                </div>

                <strong style={{ color: LAGOINHA_BLUE, display: 'block', marginTop: '5px', alignSelf: 'flex-end' }}>
                  {formatarReferencia(versiculoDoDia)} 
                </strong>

              </div>
            ) : (
                // Mensagem padrão caso não haja erro, mas o DTO não foi carregado
                !isLoading && !error && (
                    <p className="text-muted small text-center">Nenhum versículo disponível.</p>
                )
            )}
            
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Sidebar;