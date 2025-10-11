import React, { useState, useEffect } from 'react';
import { Container, Nav, Card, Spinner } from 'react-bootstrap';
// Importando BsClipboard para o botão de copiar
import { BsBook, BsHouseDoorFill, BsSearch, BsClipboard } from 'react-icons/bs';
import axios from 'axios';

// -----------------------------------------------------------
// 1. Tipagem (Interface) ATUALIZADA
// -----------------------------------------------------------
interface Verso {
  texto: string;
  livro: {
    nome: string; // Nome do Livro (ex: "Ezequiel")
  };
  capitulo: number; // Número do Capítulo (ex: 33)
  versiculo: number; // Número do Versículo (ex: 21)
  referencia?: string; 
}

// -----------------------------------------------------------
// 2. Constantes de Estilo
// -----------------------------------------------------------
const LAGOINHA_BLUE = '#42a5f5'; 
const LAGOINHA_ORANGE = '#ffa500'; // Cor para o coração, se desejar alterar

const activeLinkStyle: React.CSSProperties = {
  backgroundColor: LAGOINHA_BLUE, 
  color: 'white', 
  borderRadius: '4px',
  padding: '8px 15px',
  marginBottom: '5px',
  textDecoration: 'none', 
};

const normalLinkStyle: React.CSSProperties = {
  color: 'black',
  padding: '8px 15px',
  marginBottom: '5px',
  textDecoration: 'none', 
};

const verseCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderLeft: `5px solid ${LAGOINHA_BLUE}`, 
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
};

// -----------------------------------------------------------
// 3. Componente Sidebar
// -----------------------------------------------------------
const Sidebar: React.FC = () => {
  // Estados para gerenciar os dados
  const [versiculo, setVersiculo] = useState<Verso | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const buscarVersiculoDia = async() =>{
      try{
        setError(null);
        setIsLoading(true); 
        
        // Chamada assíncrona para o endpoint
        const response = await axios.get<Verso>('/api/versiculo-do-dia');
        setVersiculo(response.data);
      } catch (err){
        console.error("Erro ao buscar versículo:", err);
        setError("Não foi possível carregar o versículo. Verifique o backend.");
      } finally {
        setIsLoading(false);
      }
    };
    buscarVersiculoDia();
  }, []);

  // Função auxiliar para formatar a referência no padrão "Livro Capítulo:Versículo"
  const formatarReferencia = (v: Verso): string => {
    // Garante que todas as propriedades necessárias existem
    if (!v.livro?.nome || !v.capitulo || !v.versiculo) {
        return "Referência Indefinida";
    }
    // Formata a string usando template literals
    return `${v.livro.nome} ${v.capitulo}:${v.versiculo}`;
  };

  // Função para copiar o versículo
  const copiarVersiculo = () => {
    if (!versiculo) return;

    // Monta o texto completo para cópia
    const referencia = formatarReferencia(versiculo);
    const textoCompleto = `"${versiculo.texto}" - ${referencia}`;

    // Cria um elemento de texto temporário para a cópia (necessário para execCommand)
    const tempInput = document.createElement('textarea');
    tempInput.value = textoCompleto;
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
      // Executa o comando de cópia (navegadores modernos preferem navigator.clipboard, 
      // mas execCommand é mais compatível em certos ambientes de iframe)
      document.execCommand('copy');
      setCopyStatus('Copiado!');
    } catch (err) {
      console.error('Erro ao tentar copiar:', err);
      setCopyStatus('Falha na cópia.');
    }
    
    document.body.removeChild(tempInput);

    // Limpa a mensagem de status após 3 segundos
    setTimeout(() => setCopyStatus(null), 3000);
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
      
      {/* Título do Aplicativo */}
      <div className="p-3 d-flex align-items-center" style={{ borderBottom: '1px solid #eee' }}>
        <BsBook size={24} color={LAGOINHA_BLUE} className="me-2" />
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
            {/* RENDERIZAÇÃO CONDICIONAL */}
            
            {/* 1. Mostra o Spinner enquanto isLoading é true */}
            {isLoading && (
              <div className="text-center">
                <Spinner animation="border" size="sm" variant="primary" />
                <p className="mt-2 text-muted small">Carregando...</p>
              </div>
            )}

            {/* 2. Mostra o erro se houver um */}
            {error && (
              <div className="text-danger small text-center">
                {error}
              </div>
            )}

            {versiculo && (
              // Usamos display: flex e flex-direction: column para melhor controle do alinhamento
              <Card.Text style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                
                {/* 3. Ícone de Copiar e Status de Cópia */}
                <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  {copyStatus && (
                    <small style={{ color: LAGOINHA_BLUE, marginRight: '10px' }}>{copyStatus}</small>
                  )}
                  <BsClipboard 
                    size={16} 
                    color={LAGOINHA_BLUE}
                    style={{ cursor: 'pointer' }}
                    onClick={copiarVersiculo}
                  />
                </div>
                
                {/* 4. Coração à Esquerda do Texto */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                  {/* Coração agora está à esquerda e usa a cor azul */}
                  <span style={{ color: LAGOINHA_BLUE, fontSize: '1.2rem', fontWeight: 'bold', marginRight: '10px' }}>&hearts;</span>
                  
                  {/* Texto do Versículo */}
                  <em style={{ lineHeight: '1.4', color: '#333', fontSize: '1.1rem', flexGrow: 1 }}> 
                    "{versiculo.texto}"
                  </em>
                </div>

                {/* 5. Referência com a mesma cor do coração (azul) */}
                <strong style={{ color: LAGOINHA_BLUE, display: 'block', marginTop: '5px', alignSelf: 'flex-end' }}>
                  {formatarReferencia(versiculo)} 
                </strong>
              </Card.Text>
            )}

            {/* 4. Caso raro: não carregou, sem erro, e sem dados */}
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
