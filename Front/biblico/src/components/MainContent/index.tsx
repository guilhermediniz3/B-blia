import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Spinner,
  Pagination,
  Modal,
} from "react-bootstrap";
import Sidebar from "../Sidebar";

// Tipos
interface Versiculo {
  id: number;
  livro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  favorito: boolean;
  testamento?: string;
}

interface PageResponse {
  content: Versiculo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface Explicacao {
  versiculoTexto: string;
  contextoHistorico: string;
  significadoEspiritual: string;
  aplicacaoPratica: string;
  reflexaoPessoal: string;
}

// Cores consistentes
const LAGOINHA_BLUE = '#42a5f5';
const VERDE_NOVO_TESTAMENTO = '#28a745';

// Componente HeartIcon
const HeartIcon = ({ size = 18, isFilled = false, color = 'currentColor', onClick, title, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill={isFilled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" onClick={onClick} title={title}
    style={{ ...style, cursor: 'pointer', transition: 'color 0.2s' }}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.87 0-3.6 1.05-4.5 2.5a5.5 5.5 0 0 0-9 5.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

// -----------------------------------------------------
const Content: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [livro, setLivro] = useState("Todos");
  const [testamento, setTestamento] = useState("Ambos");
  const [capitulo, setCapitulo] = useState("");
  const [versiculos, setVersiculos] = useState<Versiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [explicacao, setExplicacao] = useState<Explicacao | null>(null);
  const [loadingExplicacao, setLoadingExplicacao] = useState(false);
  const [versoSelecionado, setVersoSelecionado] = useState<number | null>(null);
  const [updatingFavorito, setUpdatingFavorito] = useState<number | null>(null);

  useEffect(() => {
    carregarTodosVersiculos();
  }, []);

  const carregarTodosVersiculos = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await axios.get<PageResponse>(
        "http://localhost:8081/versos/todos",
        { params: { page: page, size: pageSize } }
      );
      setVersiculos(response.data.content);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("Erro ao carregar versículos:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarComFiltros = async (page: number = 0) => {
    setLoading(true);
    try {
      const params: any = { page: page, size: pageSize };

      if (searchText.trim() !== "") params.texto = searchText;
      if (livro !== "Todos") params.livro = livro;
      if (testamento !== "Ambos") {
        params.testamento = testamento === "Antigo Testamento" ? "1" : "2";
      }
      if (capitulo && capitulo !== "") params.capitulo = parseInt(capitulo);

      const response = await axios.get<PageResponse>(
        "http://localhost:8081/versos/buscar",
        { params: params }
      );

      setVersiculos(response.data.content);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("Erro ao buscar versículos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 0) => {
    const temFiltroAtivo =
      searchText.trim() !== "" ||
      livro !== "Todos" ||
      testamento !== "Ambos" ||
      (capitulo && capitulo !== "");

    if (temFiltroAtivo) {
      await buscarComFiltros(page);
    } else {
      await carregarTodosVersiculos(page);
    }
  };

  const handleClear = () => {
    setSearchText("");
    setLivro("Todos");
    setTestamento("Ambos");
    setCapitulo("");
    setCurrentPage(0);
    carregarTodosVersiculos(0);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    handleSearch(pageNumber);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    handleSearch(0);
  };

  const handleExplicacao = async (id: number) => {
    setShowModal(true);
    setLoadingExplicacao(true);
    setVersoSelecionado(id);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/versos/${id}/explicacoes`
      );
      const lista = response.data;
      if (lista && lista.length > 0) {
        setExplicacao(lista[lista.length - 1]);
      } else {
        setExplicacao(null);
      }
    } catch (error) {
      console.error("Erro ao buscar explicação:", error);
      setExplicacao(null);
    } finally {
      setLoadingExplicacao(false);
    }
  };

  const gerarNovaExplicacao = async () => {
    if (!versoSelecionado) return;
    setLoadingExplicacao(true);
    try {
      const response = await axios.post(
        `http://localhost:8081/api/versos/${versoSelecionado}/explicacoes/gerar`
      );
      setExplicacao(response.data);
    } catch (error) {
      console.error("Erro ao gerar nova explicação:", error);
    } finally {
      setLoadingExplicacao(false);
    }
  };

  const toggleFavorito = async (versiculoId: number, statusAtual: boolean) => {
    setUpdatingFavorito(versiculoId);
    try {
      const novoStatus = !statusAtual;
      
      // Faz a requisição PATCH para atualizar o status
      await axios.patch(
        `http://localhost:8081/versos/${versiculoId}/favorito?status=${novoStatus}`
      );

      // Atualiza o estado local dos versículos
      setVersiculos(prevVersiculos => 
        prevVersiculos.map(v => 
          v.id === versiculoId ? { ...v, favorito: novoStatus } : v
        )
      );

    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
    } finally {
      setUpdatingFavorito(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(0);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      />
    );

    if (startPage > 0) {
      items.push(
        <Pagination.Item key={0} onClick={() => handlePageChange(0)}>
          1
        </Pagination.Item>
      );
      if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page + 1}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2)
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      items.push(
        <Pagination.Item
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      />
    );

    return (
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 gap-2">
        <div className="text-center text-md-start w-100 w-md-auto">
          <span className="text-muted">
            Mostrando {versiculos.length} de {totalElements} versículos
          </span>
        </div>

        <Pagination className="mb-0 justify-content-center flex-wrap">
          {items}
        </Pagination>

        <div className="text-center text-md-end w-100 w-md-auto">
          <Form.Select
            size="sm"
            style={{ width: "80px", display: "inline-block" }}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Form.Select>
        </div>
      </div>
    );
  };

  // -----------------------------------------------------
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar (colapsa em telas pequenas) */}
        <Col xs={12} md={3} lg={2} className="bg-light border-end">
          <div className="sticky-top p-3">
            <Sidebar />
          </div>
        </Col>

        {/* Conteúdo principal */}
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4">
          <h2 className="mb-4 text-center text-md-start" style={{ color: LAGOINHA_BLUE }}>
            Pesquisar Versículos
          </h2>

          <Card className="shadow-sm mb-4 p-4 border-0">
            <Form>
              <Row className="align-items-end g-3">
                <Col xs={12} md={4}>
                  <Form.Label style={{ color: LAGOINHA_BLUE, fontWeight: 'bold' }}>Buscar texto</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Digite palavras ou frases..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Label style={{ color: LAGOINHA_BLUE, fontWeight: 'bold' }}>Livro</Form.Label>
                  <Form.Select
                    value={livro}
                    onChange={(e) => setLivro(e.target.value)}
                  >
                    <option>Todos</option>
                    <option>Gênesis</option>
                    <option>Êxodo</option>
                    <option>Levítico</option>
                    <option>Números</option>
                    <option>Deuteronômio</option>
                    <option>Josué</option>
                    <option>Salmos</option>
                    <option>Provérbios</option>
                    <option>Mateus</option>
                    <option>Marcos</option>
                    <option>Lucas</option>
                    <option>João</option>
                    <option>Romanos</option>
                    <option>Apocalipse</option>
                  </Form.Select>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Label style={{ color: LAGOINHA_BLUE, fontWeight: 'bold' }}>Testamento</Form.Label>
                  <Form.Select
                    value={testamento}
                    onChange={(e) => setTestamento(e.target.value)}
                  >
                    <option>Ambos</option>
                    <option>Antigo Testamento</option>
                    <option>Novo Testamento</option>
                  </Form.Select>
                </Col>

                <Col xs={12} sm={6} md={2}>
                  <Form.Label style={{ color: LAGOINHA_BLUE, fontWeight: 'bold' }}>Capítulo</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Nº"
                    value={capitulo}
                    onChange={(e) => setCapitulo(e.target.value)}
                    min="1"
                  />
                </Col>

                <Col
                  xs={12}
                  className="d-flex flex-wrap justify-content-end gap-2 mt-3"
                >
                  <Button 
                    variant="primary" 
                    onClick={() => handleSearch(0)}
                    style={{ backgroundColor: LAGOINHA_BLUE, borderColor: LAGOINHA_BLUE }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Buscando...
                      </>
                    ) : (
                      "Pesquisar"
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleClear}
                  >
                    Limpar Filtros
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {versiculos.length > 0 && (
            <h5 className="text-secondary mb-3 text-center text-md-start">
              {totalElements} versículo(s) encontrado(s) — Página{" "}
              {currentPage + 1} de {totalPages}
            </h5>
          )}

          {versiculos.map((v) => (
            <Card key={v.id} className="mb-3 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center flex-wrap" style={{ color: LAGOINHA_BLUE }}>
                  {v.livro} {v.capitulo}:{v.versiculo}
                  <Badge
                    bg={v.testamento === "1" ? "primary" : "success"}
                    className="mt-2 mt-md-0"
                    style={{ 
                      backgroundColor: v.testamento === "1" ? LAGOINHA_BLUE : VERDE_NOVO_TESTAMENTO,
                      color: 'white'
                    }}
                  >
                    {v.testamento === "1"
                      ? "Antigo Testamento"
                      : "Novo Testamento"}
                  </Badge>
                </Card.Title>
                <Card.Text className="fst-italic">"{v.texto}"</Card.Text>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleExplicacao(v.id)}
                    style={{ borderColor: LAGOINHA_BLUE, color: LAGOINHA_BLUE }}
                  >
                    Explicação
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(v.texto)}
                  >
                    Copiar
                  </Button>
                  
                  {/* Ícone de Favorito sem borda */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
                      cursor: updatingFavorito === v.id ? 'wait' : 'pointer',
                      opacity: updatingFavorito === v.id ? 0.6 : 1
                    }}
                    onClick={() => updatingFavorito !== v.id && toggleFavorito(v.id, v.favorito)}
                    title={v.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    {updatingFavorito === v.id ? (
                      <Spinner animation="border" size="sm" style={{ color: LAGOINHA_BLUE }} />
                    ) : (
                      <HeartIcon 
                        size={20} 
                        color={LAGOINHA_BLUE} 
                        isFilled={v.favorito} 
                      />
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}

          {renderPagination()}

          {!loading && versiculos.length === 0 && (
            <p className="text-muted text-center mt-4">
              Nenhum versículo encontrado. Faça uma pesquisa acima.
            </p>
          )}
        </Col>
      </Row>

      {/* 🔥 MODAL DE EXPLICAÇÃO */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton style={{ backgroundColor: LAGOINHA_BLUE, color: 'white' }}>
          <Modal.Title>Explicação do Versículo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingExplicacao ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: LAGOINHA_BLUE }} />
              <p className="mt-3">Carregando explicação...</p>
            </div>
          ) : explicacao ? (
            <>
              <blockquote className="blockquote text-center text-muted mb-4">
                “{explicacao.versiculoTexto}”
              </blockquote>

              <div className="p-3 bg-light rounded mb-3 border-start border-3" style={{ borderColor: LAGOINHA_BLUE }}>
                <h5 style={{ color: LAGOINHA_BLUE }}>📜 Contexto Histórico</h5>
                <p>{explicacao.contextoHistorico}</p>
              </div>

              <div className="p-3 bg-light rounded mb-3 border-start border-3 border-info">
                <h5 className="text-info">💭 Significado Espiritual</h5>
                <p>{explicacao.significadoEspiritual}</p>
              </div>

              <div className="p-3 bg-light rounded mb-3 border-start border-3 border-success">
                <h5 className="text-success">🌿 Aplicação Prática</h5>
                <p>{explicacao.aplicacaoPratica}</p>
              </div>

              <div className="p-3 bg-light rounded border-start border-3 border-warning">
                <h5 className="text-warning">💡 Reflexão Pessoal</h5>
                <p>{explicacao.reflexaoPessoal}</p>
              </div>
            </>
          ) : (
            <p className="text-muted text-center">
              Nenhuma explicação disponível ainda.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex flex-wrap justify-content-between">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={gerarNovaExplicacao}
            disabled={loadingExplicacao}
            style={{ backgroundColor: LAGOINHA_BLUE, borderColor: LAGOINHA_BLUE }}
          >
            {loadingExplicacao ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Gerando...
              </>
            ) : (
              "Gerar Nova Explicação"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Content;