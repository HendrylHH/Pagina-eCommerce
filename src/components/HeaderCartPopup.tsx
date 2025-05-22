import { useState, useEffect } from 'react';
import type { DetalhesAtualizacaoCarrinho } from '../types/events';

interface PropsPopupCarrinhoHeader {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemCarrinho {
  id?: string; // Opcional pois itens antigos podem não ter
  nome: string;
  cor: string;
  tamanho: string;
  quantidade: number;
  cep?: string;
  adicionadoEm: number;
}

const PopupCarrinhoHeader: React.FC<PropsPopupCarrinhoHeader> = ({ isOpen, onClose }) => {
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
    const carregarItensCarrinho = (pularEventos = false) => {
    // Recupera os itens do localStorage
    const itensArmazenados = localStorage.getItem('cartItems');
    if (itensArmazenados) {
      try {
        const itensAnalisados = JSON.parse(itensArmazenados);
        
        // Filtra apenas itens adicionados nos últimos 15 minutos
        const quinzeMinutosAtras = Date.now() - 15 * 60 * 1000;
        const itensRecentes = Array.isArray(itensAnalisados) ? 
          itensAnalisados.filter((item: ItemCarrinho) => item.adicionadoEm && item.adicionadoEm > quinzeMinutosAtras) : 
          [];
          
        setItensCarrinho(itensRecentes);
        
        // Salva os itens de volta no localStorage apenas se houver itens expirados para remover
        if (Array.isArray(itensAnalisados) && itensAnalisados.length !== itensRecentes.length) {
          localStorage.setItem('cartItems', JSON.stringify(itensRecentes));
          
          // Dispara evento para atualizar outros componentes apenas se não estivermos 
          // já respondendo a um evento (para evitar loops infinitos)
          if (!pularEventos) {
            window.dispatchEvent(new Event('cartUpdated'));
          }
        }
      } catch (e) {
        console.error('Erro ao carregar itens do carrinho:', e);
      }
    } else {
      setItensCarrinho([]);
    }
  };
    useEffect(() => {
    if (!isOpen) return;
    
    carregarItensCarrinho();
      
    // Ouve eventos de armazenamento para manter o carrinho atualizado
    const lidarComMudancaArmazenamento = () => {
      if (isOpen) carregarItensCarrinho(true); // Passa true para evitar disparar novos eventos
    };
    
    // Novo manipulador para eventos customizados que verifica a origem do evento
    const lidarComAtualizacaoCarrinho = (evento: CustomEvent<DetalhesAtualizacaoCarrinho>) => {
      // Evita processamento circular se o evento for originado deste próprio componente
      if (evento.detail && evento.detail.fonte === 'carrinhoHeader') {
        return;
      }
      
      if (isOpen) carregarItensCarrinho(true);
    };
    
    window.addEventListener('storage', lidarComMudancaArmazenamento);
    window.addEventListener('cartUpdated', lidarComAtualizacaoCarrinho as EventListener);
    
    return () => {
      window.removeEventListener('storage', lidarComMudancaArmazenamento);
      window.removeEventListener('cartUpdated', lidarComAtualizacaoCarrinho as EventListener);
    };
  }, [isOpen]);
    // Utilitário para calcular o total de itens no carrinho
  const obterTotalItens = (): number => {
    return itensCarrinho.reduce((total, item) => total + item.quantidade, 0);
  };
  
  // Usa o valor no JSX para suprimir o aviso
  const contagemTotalItens = obterTotalItens();
  
  const obterPrecoTotal = () => {
    const preco = 69.90; // Preço base do produto
    return itensCarrinho.reduce((total, item) => total + (preco * item.quantidade), 0);
  };
  
  const formatarPreco = (preco: number): string => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-end z-50 pt-16">
      <div className="bg-black bg-opacity-50 absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 mr-4 mt-4 z-10 max-h-[80vh] overflow-y-auto">        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            Meu Carrinho {contagemTotalItens > 0 && <span className="text-sm ml-2 bg-blue-600 text-white px-2 py-1 rounded-full">{contagemTotalItens}</span>}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {itensCarrinho.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="mt-4 text-gray-600">Seu carrinho está vazio</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y">                {itensCarrinho.map((item, index) => (
                  <li key={index} className="py-4 transition-all duration-300 hover:bg-gray-50">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        {/* Imagem baseada na cor do produto - padronizada para o formato 3:4 */}
                        <div className="aspect-[3/4] w-full h-full relative">
                          <img
                            src={`/images/${item.cor.toLowerCase() === 'preto' ? 'black' : 
                                 item.cor.toLowerCase() === 'branco' ? 'white' : 
                                 item.cor.toLowerCase() === 'azul' ? 'blue' : 'black'}-tshirt-${item.cor.toLowerCase() === 'branco' ? '3' : '1'}.jpg`}
                            alt={`${item.nome} ${item.cor}`} 
                            className="w-full h-full object-contain absolute inset-0"
                            onError={(e) => {
                              // Fallback para uma imagem do placeholder com a cor correta
                              const corPlaceholder = item.cor.toLowerCase() === 'preto' ? '000000' : 
                                                     item.cor.toLowerCase() === 'branco' ? 'ffffff' : 
                                                     item.cor.toLowerCase() === 'azul' ? '0047AB' : 'cccccc';
                              const corTexto = item.cor.toLowerCase() === 'branco' ? '333333' : 'ffffff';
                              e.currentTarget.src = `https://via.placeholder.com/64x64/${corPlaceholder}/${corTexto}?text=${item.cor}`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.nome}</h4>
                        <p className="mt-1 text-sm text-gray-500">Cor: {item.cor}</p>
                        <p className="mt-1 text-sm text-gray-500">Tamanho: {item.tamanho}</p>                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">Qtd: {item.quantidade}</p>
                          <p className="font-medium text-gray-900">{formatarPreco(69.90 * item.quantidade)}</p>
                        </div>
                        <div className="mt-2">                          <button 
                            className="text-red-600 text-sm hover:text-red-700 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();                              const removerItem = (index: number, item: ItemCarrinho) => {
                                // Obtém itens atuais
                                const itensArmazenados = localStorage.getItem('cartItems');
                                if (!itensArmazenados) return;
                                
                                try {
                                  let itensAnalisados = JSON.parse(itensArmazenados);
                                  if (!Array.isArray(itensAnalisados)) return;
                                  
                                  // Se o item tem um ID, remove pelo ID
                                  if (item.id) {
                                    itensAnalisados = itensAnalisados.filter(i => i.id !== item.id);
                                  } else {
                                    // Caso contrário, remove o item no índice especificado
                                    itensAnalisados.splice(index, 1);
                                  }
                                  
                                  // Salva de volta no localStorage
                                  localStorage.setItem('cartItems', JSON.stringify(itensAnalisados));
                                  
                                  // Atualiza o estado local diretamente em vez de disparar recarga
                                  setItensCarrinho(itensAnalisados);
                                  
                                  // Se o carrinho estiver vazio, fecha o popup
                                  if (itensAnalisados.length === 0) {
                                    setTimeout(() => onClose(), 300);
                                  }
                                  
                                  // Despacha apenas um evento customizado com tipo específico
                                  window.dispatchEvent(new CustomEvent<DetalhesAtualizacaoCarrinho>('cartUpdated', { 
                                    detail: { fonte: 'carrinhoHeader', acao: 'removerItem' } 
                                  }));
                                } catch (e) {
                                  console.error('Erro ao remover item do carrinho:', e);
                                }
                              };
                              
                              removerItem(index, item);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
                <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatarPreco(obterPrecoTotal())}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Frete e descontos calculados no checkout</p>
                
                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700"
                  >
                    Finalizar Compra
                  </button>
                  <button
                    type="button"
                    className="w-full bg-gray-200 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-900 hover:bg-gray-300"
                    onClick={onClose}
                  >
                    Continuar Comprando
                  </button>
                  {itensCarrinho.length > 1 && (
                    <button
                      type="button"
                      className="w-full text-red-600 hover:text-red-700 text-sm mt-2 flex items-center justify-center"                      onClick={() => {
                        // Limpa todos os itens do carrinho
                        localStorage.setItem('cartItems', '[]');
                        
                        // Atualiza o estado local
                        setItensCarrinho([]);
                        
                        // Fecha o popup após um pequeno atraso
                        setTimeout(() => onClose(), 300);
                        
                        // Despacha evento customizado tipado
                        window.dispatchEvent(new CustomEvent<DetalhesAtualizacaoCarrinho>('cartUpdated', { 
                          detail: { fonte: 'carrinhoHeader', acao: 'limparCarrinho' } 
                        }));
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Limpar Carrinho
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupCarrinhoHeader;
