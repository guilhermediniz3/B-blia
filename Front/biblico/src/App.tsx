import React from 'react';
import Sidebar from './components/Sidebar'; 




const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}> 
      
      <Sidebar /> 

      <main style={{ flexGrow: 1, padding: '30px', overflowY: 'auto' }}>
        
        <h1 className="mb-4 text-primary">Bem-vindo(a) ao Dicionário Bíblico Online</h1>
        <p className="lead">
          Navegue pelas opções da barra lateral para começar a usar o dicionário ou ver o versículo do dia.
        </p>
        
        <div className="card mt-5 p-4 shadow-sm">
            <h5>Área de Conteúdo</h5>
            <p>Aqui você pode exibir os resultados de pesquisa, definições, ou outros componentes da sua aplicação.</p>
            <button className="btn btn-outline-primary mt-2">Exemplo de Botão</button>
        </div>

      </main>
    </div>
  );
};

export default App;