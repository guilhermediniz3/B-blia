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
  Pagination
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
  first: boolean;
  last: boolean;
}

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

  // 🔥 CARREGA TODOS OS REGISTROS AO INICIAR
  useEffect(() => {
    carregarTodosVersiculos();
  }, []);

  // 🔥 MÉTODO 1: Carrega TODOS os versículos
  const carregarTodosVersiculos = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await axios.get<PageResponse>("http://localhost:8081/versos/todos", {
        params: { page: page, size: pageSize }
      });
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

  // 🔥 MÉTODO 2: Busca COM filtros
  const buscarComFiltros = async (page: number = 0) => {
    setLoading(true);
    try {
      const params: any = { page: page, size: pageSize };

      // 🔥 FILTROS CORRETOS - Só adiciona se tiver valor
      if (searchText.trim() !== '') params.texto = searchText;
      if (livro !== "Todos") params.livro = livro;
      if (testamento !== "Ambos") {
        params.testamento = testamento === "Antigo Testamento" ? "1" : "2";
      }
      if (capitulo && capitulo !== '') params.capitulo = parseInt(capitulo);

      console.log("🔍 Buscando com filtros:", params);

      const response = await axios.get<PageResponse>("http://localhost:8081/versos/buscar", {
        params: params
      });
      
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
    // 🔥 LÓGICA INTELIGENTE: Se tem algum filtro ativo, busca com filtros
    const temFiltroAtivo = 
      searchText.trim() !== '' || 
      livro !== "Todos" || 
      testamento !== "Ambos" || 
      (capitulo && capitulo !== '');

    console.log("Tem filtro ativo?", temFiltroAtivo);

    if (temFiltroAtivo) {
      await buscarComFiltros(page);
    } else {
      // Se não tem filtros, carrega todos
      await carregarTodosVersiculos(page);
    }
  };

  const handleClear = () => {
    setSearchText("");
    setLivro("Todos");
    setTestamento("Ambos");
    setCapitulo("");
    setCurrentPage(0);
    // Recarrega TODOS os registros
    carregarTodosVersiculos(0);
  };

  // 🔥 MÉTODO: Mudar página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    handleSearch(pageNumber);
  };

  // 🔥 MÉTODO: Mudar tamanho da página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    handleSearch(0);
  };

  const handleExplicacao = async (id: number) => {
    try {
      const response = await axios.get(`http://localhost:8081/versos/${id}/explicacao`);
      alert("Explicação: " + response.data);
    } catch (error) {
      console.error("Erro ao buscar explicação:", error);
      alert("Erro ao buscar explicação.");
    }
  };

  // Função para capturar Enter na busca
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(0);
    }
  };

  // 🔥 COMPONENTE DE PAGINAÇÃO
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Ajusta o início se estiver perto do final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Botão Anterior
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      />
    );

    // Primeira página
    if (startPage > 0) {
      items.push(
        <Pagination.Item key={0} onClick={() => handlePageChange(0)}>
          1
        </Pagination.Item>
      );
      if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    // Páginas do meio
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

    // Última página
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item key={totalPages - 1} onClick={() => handlePageChange(totalPages - 1)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    // Botão Próximo
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      />
    );

    return (
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <span className="text-muted">
            Mostrando {versiculos.length} de {totalElements} versículos
          </span>
        </div>
        
        <Pagination className="mb-0">
          {items}
        </Pagination>

        <div>
          <Form.Select 
            size="sm" 
            style={{ width: '80px' }}
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Sidebar />

      <main style={{ flexGrow: 1, padding: "30px", overflowY: "auto" }}>
        <h2 className="text-primary mb-4">Pesquisar Versículos</h2>

        {/* FORMULÁRIO DE FILTROS */}
        <Card className="shadow-sm mb-4 p-4 border-0">
          <Form>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Label>Buscar texto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite palavras ou frases..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={handleKeyPress}
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
                  placeholder="Nº"
                  value={capitulo}
                  onChange={(e) => setCapitulo(e.target.value)}
                  min="1"
                />
              </Col>

              <Col xs="12" className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="primary" onClick={() => handleSearch(0)}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Buscando...
                    </>
                  ) : (
                    "Pesquisar"
                  )}
                </Button>
                <Button variant="outline-secondary" onClick={handleClear}>
                  Limpar Filtros
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {versiculos.length > 0 && (
          <h5 className="text-secondary mb-3">
            {totalElements} versículo(s) encontrado(s) - Página {currentPage + 1} de {totalPages}
          </h5>
        )}

        {versiculos.map((v) => (
          <Card key={v.id} className="mb-3 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-primary d-flex justify-content-between align-items-center">
                {v.livro} {v.capitulo}:{v.versiculo}
                <Badge 
                  bg={v.testamento === "1" ? "warning" : "success"} 
                  text="dark"
                >
                  {v.testamento === "1" ? "Antigo Testamento" : "Novo Testamento"}
                </Badge>
              </Card.Title>
              <Card.Text className="fst-italic">"{v.texto}"</Card.Text>

              <div className="d-flex gap-2 mt-3">
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
                <Button
                  variant={v.favorito ? "warning" : "outline-warning"}
                  size="sm"
                >
                  {v.favorito ? "★ Favorito" : "☆ Favoritar"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}

        {/* 🔥 PAGINAÇÃO */}
        {renderPagination()}

        {!loading && versiculos.length === 0 && (
          <p className="text-muted text-center mt-4">
            Nenhum versículo encontrado. Faça uma pesquisa acima.
          </p>
        )}
      </main>
    </div>
  );
};

export default Content;