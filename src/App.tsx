import './App.css'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import ProductDetail from './components/ProductDetail'
import HeaderCartPopup from './components/HeaderCartPopup'
import { mockProduct } from './utils/mockData'

function App() {
  const [estaCarrinhoHeaderAberto, setEstaCarrinhoHeaderAberto] = useState(false);
  const [contagemItensCarrinho, setContagemItensCarrinho] = useState(0);
  
  // Atualiza o contador de itens no carrinho
  useEffect(() => {
    const atualizarContagemCarrinho = () => {
      const itensArmazenados = localStorage.getItem('cartItems');
      if (itensArmazenados) {
        try {
          const itensAnalisados = JSON.parse(itensArmazenados);
          
          // Filtra apenas itens adicionados nos últimos 15 minutos
          const quinzeMinutosAtras = Date.now() - 15 * 60 * 1000;
          const itensRecentes = Array.isArray(itensAnalisados) ? 
            itensAnalisados.filter((item: any) => item.adicionadoEm && item.adicionadoEm > quinzeMinutosAtras) : 
            [];
            
          const totalItens = itensRecentes.reduce((total: number, item: any) => total + item.quantidade, 0);
          setContagemItensCarrinho(totalItens);
        } catch (e) {
          console.error('Erro ao carregar contagem do carrinho:', e);
          setContagemItensCarrinho(0);
        }
      } else {
        setContagemItensCarrinho(0);
      }
    };
    
    // Atualiza ao montar o componente
    atualizarContagemCarrinho();
    
    // Configura um intervalo para verificar a cada minuto
    const intervalo = setInterval(atualizarContagemCarrinho, 60000);
    
    // Listener para atualizações no localStorage
    const lidarComMudancaArmazenamento = () => atualizarContagemCarrinho();
    window.addEventListener('storage', lidarComMudancaArmazenamento);
    
    // Debounce para evitar atualizações múltiplas em curto período
    let tempoLimiteAtualizacao: NodeJS.Timeout | null = null;
    
    // Também ouve um evento personalizado que é disparado quando o carrinho é modificado
    const lidarComAtualizacaoCarrinho = (_evento: CustomEvent) => {
      if (tempoLimiteAtualizacao) {
        clearTimeout(tempoLimiteAtualizacao);
      }
      
      // Define um novo timeout de 100ms antes de atualizar o contador
      tempoLimiteAtualizacao = setTimeout(() => {
        atualizarContagemCarrinho();
      }, 100);
    };
    window.addEventListener('cartUpdated', lidarComAtualizacaoCarrinho);
    
    // Atualiza a contagem imediatamente para sincronizar
    atualizarContagemCarrinho();
    
    return () => {
      clearInterval(intervalo);
      if (tempoLimiteAtualizacao) {
        clearTimeout(tempoLimiteAtualizacao);
      }
      window.removeEventListener('storage', lidarComMudancaArmazenamento);
      window.removeEventListener('cartUpdated', lidarComAtualizacaoCarrinho);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="flex justify-between items-center py-4 px-8">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">Página e Função Simples de e-Commerce</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-600 hover:text-gray-900 relative"
              onClick={() => setEstaCarrinhoHeaderAberto(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {contagemItensCarrinho > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {contagemItensCarrinho}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <HeaderCartPopup 
        isOpen={estaCarrinhoHeaderAberto} 
        onClose={() => setEstaCarrinhoHeaderAberto(false)} 
      />
      
      <main className="pt-16">
        <ProductDetail product={mockProduct} />
      </main>
      
      <footer className="bg-gray-100 mt-0">
        <div className="px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Página e Função Simples de e-Commerce.
          </p>
          <p className="text-center text-gray-400 text-xs mt-2">
            Imagens de produtos obtidas de <a href="https://unsplash.com" className="underline hover:text-blue-500">Unsplash</a>. 
          </p>
        </div>
      </footer>
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App
