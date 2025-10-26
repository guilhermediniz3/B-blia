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
}

interface Explicacao {
  versiculoTexto: string;
  contextoHistorico: string;
  significadoEspiritual: string;
  aplicacaoPratica: string;
  reflexaoPessoal: string;
}

// Cores definidas
const LAGOINHA_BLUE = "#42a5f5"; // Azul para o Antigo Testamento e outros elementos
const VERDE_NOVO_TESTAMENTO = "#00BAB4"; // Cor solicitada para o Novo Testamento

const HeartIcon = ({
  size = 18,
  isFilled = false,
  color = "currentColor",
  onClick,
  title,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={isFilled ? color : "none"}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    onClick={onClick}
    title={title}
    style={{ ...style, cursor: "pointer", transition: "color 0.2s" }}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.87 0-3.6 1.05-4.5 2.5a5.5 5.5 0 0 0-9 5.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

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
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [explicacao, setExplicacao] = useState<Explicacao | null>(null);
  const [loadingExplicacao, setLoadingExplicacao] = useState(false);
  const [versoSelecionado, setVersoSelecionado] = useState<number | null>(null);
  const [updatingFavorito, setUpdatingFavorito] = useState<number | null>(null);

  useEffect(() => {
    handleSearch(0);
  }, [pageSize]);

  const buscarComFiltros = async (page: number = 0) => {
    setLoading(true);
    try {
      const params: any = { page, size: pageSize };
      if (searchText.trim() !== "") params.texto = searchText;
      if (livro !== "Todos") params.livro = livro;
      if (testamento !== "Ambos")
        params.testamento = testamento === "Antigo Testamento" ? "1" : "2";
      if (capitulo && capitulo !== "") params.capitulo = parseInt(capitulo);
      if (somenteFavoritos) params.favorito = true;

      const response = await axios.get<PageResponse>(
        "http://localhost:8081/versos/buscar",
        { params }
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

  const carregarTodosVersiculos = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await axios.get<PageResponse>(
        "http://localhost:8081/versos/todos",
        { params: { page, size: pageSize } }
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

  const handleSearch = async (page: number = 0) => {
    const temFiltroAtivo =
      searchText.trim() !== "" ||
      livro !== "Todos" ||
      testamento !== "Ambos" ||
      (capitulo && capitulo !== "") ||
      somenteFavoritos;

    if (temFiltroAtivo) await buscarComFiltros(page);
    else await carregarTodosVersiculos(page);
  };

  const handleClear = () => {
    setSearchText("");
    setLivro("Todos");
    setTestamento("Ambos");
    setCapitulo("");
    setSomenteFavoritos(false);
    setCurrentPage(0);
    carregarTodosVersiculos(0);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    handleSearch(pageNumber);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const toggleFavorito = async (versiculoId: number, statusAtual: boolean) => {
    setUpdatingFavorito(versiculoId);
    try {
      const novoStatus = !statusAtual;
      await axios.patch(
        `http://localhost:8081/versos/${versiculoId}/favorito?status=${novoStatus}`
      );
      setVersiculos((prev) =>
        prev.map((v) =>
          v.id === versiculoId ? { ...v, favorito: novoStatus } : v
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
    } finally {
      setUpdatingFavorito(null);
    }
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
      if (lista && lista.length > 0) setExplicacao(lista[lista.length - 1]);
      else setExplicacao(null);
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
      console.error("Erro ao gerar explicação:", error);
    } finally {
      setLoadingExplicacao(false);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(0, endPage - maxVisiblePages + 1);

    items.push(
      <Pagination.First
        key="first"
        onClick={() => handlePageChange(0)}
        disabled={currentPage === 0}
      />,
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      />
    );

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

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      />,
      <Pagination.Last
        key="last"
        onClick={() => handlePageChange(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
      />
    );

    return (
      <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
        <span className="text-muted">
          Mostrando {versiculos.length} de {totalElements} versículos
        </span>
        <Pagination className="mb-0 flex-wrap">{items}</Pagination>
        <Form.Select
          size="sm"
          style={{ width: "80px" }}
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </Form.Select>
      </div>
    );
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/*
          🔥 ALTERAÇÃO 1: RESPONSIVIDADE DO SIDEBAR
          - Removido `xs={12}`: O sidebar não deve ocupar 12 colunas em mobile.
          - Adicionado `d-none d-md-block`: Oculta o sidebar em telas pequenas (xs, sm) e mostra a partir de md.
            Isso garante que ele não crie uma "faixa branca gigante" no mobile/telas menores.
        */}
        <Col md={3} lg={2} className="bg-light border-end d-none d-md-block">
          {/* Removido o sticky-top que pode causar problemas de altura */}
          <div className="p-3">
            <Sidebar />
          </div>
        </Col>

        {/*
          🔥 ALTERAÇÃO 2: COLUNA DE CONTEÚDO
          - xs={12}: Garante que o conteúdo ocupe 100% da tela em mobile (onde o sidebar está oculto).
          - md={9} lg={10}: Ocupa o restante do espaço em telas médias e grandes.
        */}
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4">
          <h2 style={{ color: LAGOINHA_BLUE }}>Pesquisar Versículos</h2>
          <Card className="shadow-sm mb-4 p-4 border-0">
            <Form>
              <Row className="align-items-end g-3">
                <Col md={4}>
                  <Form.Label>Buscar texto</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Livro</Form.Label>
                  <Form.Select
                    value={livro}
                    onChange={(e) => setLivro(e.target.value)}
                  >
                    <option>Todos</option>
                    <option>Gênesis</option>
                    <option>Salmos</option>
                    <option>Mateus</option>
                    <option>João</option>
                    <option>Romanos</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label>Testamento</Form.Label>
                  <Form.Select
                    value={testamento}
                    onChange={(e) => setTestamento(e.target.value)}
                  >
                    <option>Ambos</option>
                    <option>Antigo Testamento</option>
                    <option>Novo Testamento</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label>Capítulo</Form.Label>
                  <Form.Control
                    type="number"
                    value={capitulo}
                    onChange={(e) => setCapitulo(e.target.value)}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Check
                    type="checkbox"
                    label="Mostrar apenas favoritos"
                    checked={somenteFavoritos}
                    onChange={(e) => setSomenteFavoritos(e.target.checked)}
                  />
                </Col>
                <Col xs={12} className="d-flex justify-content-end gap-2 mt-3">
                  <Button onClick={() => handleSearch(0)} variant="primary">
                    Pesquisar
                  </Button>
                  <Button variant="outline-secondary" onClick={handleClear}>
                    Limpar
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" style={{ color: LAGOINHA_BLUE }} />
            </div>
          ) : (
            versiculos.map((v) => (
              <Card
                key={v.id}
                className="mb-3 shadow-sm border-0 rounded-3"
                style={{
                  backgroundColor:
                    v.testamento === "1" ? LAGOINHA_BLUE : VERDE_NOVO_TESTAMENTO,
                  padding: 0,
                }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 'calc(0.3rem - 1px)',
                    padding: '1rem',
                    marginLeft: '6px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Card.Title
                    className="d-flex justify-content-between align-items-center flex-wrap"
                    style={{ color: LAGOINHA_BLUE }}
                  >
                    {v.livro} {v.capitulo}:{v.versiculo}
                    <Badge
                      bg={v.testamento === "1" ? "primary" : "success"}
                      style={{
                        backgroundColor:
                          v.testamento === "1"
                            ? LAGOINHA_BLUE
                            : VERDE_NOVO_TESTAMENTO,
                      }}
                    >
                      {v.testamento === "1" ? "Antigo testamento" : "Novo testamento"}
                    </Badge>
                  </Card.Title>
                  <Card.Text>"{v.texto}"</Card.Text>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleExplicacao(v.id)}
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
                    <div
                      style={{
                        cursor: updatingFavorito === v.id ? "wait" : "pointer",
                      }}
                      onClick={() =>
                        updatingFavorito !== v.id &&
                        toggleFavorito(v.id, v.favorito)
                      }
                    >
                      {updatingFavorito === v.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <HeartIcon
                          size={20}
                          color={LAGOINHA_BLUE}
                          isFilled={v.favorito}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {renderPagination()}
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
        <Modal.Header
          closeButton
          style={{ backgroundColor: LAGOINHA_BLUE, color: "white" }}
        >
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

              <div
                className="p-3 bg-light rounded mb-3 border-start border-3"
                style={{ borderColor: LAGOINHA_BLUE }}
              >
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
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={gerarNovaExplicacao}
            disabled={loadingExplicacao}
            style={{
              backgroundColor: LAGOINHA_BLUE,
              borderColor: LAGOINHA_BLUE,
            }}
          >
            {loadingExplicacao ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Gerando...
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