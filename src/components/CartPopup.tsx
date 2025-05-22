import { useEffect } from 'react';
import { formatarCep } from '../utils/cepApi';
import useArmazenamentoLocal from '../hooks/useLocalStorage';
import type { DetalhesAtualizacaoCarrinho } from '../types/events';

interface PropsPopupCarrinho {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemCarrinho {
  id?: string;
  nome: string;
  cor: string;
  tamanho: string;
  quantidade: number;
  cep?: string;
  adicionadoEm?: number;
}

const PopupCarrinho: React.FC<PropsPopupCarrinho> = ({ isOpen, onClose }) => {
  const [itemCarrinho, setItemCarrinho] = useArmazenamentoLocal<ItemCarrinho | null>('cartItem', null);
  const [infoFrete] = useArmazenamentoLocal<any | null>('shippingInfo', null);  
  
  // Função para sincronizar com localStorage ao receber eventos externos
  const sincronizarComLocalStorage = () => {
    try {
      const infoFreteDoLS = localStorage.getItem('shippingInfo');
      if (infoFreteDoLS) {
        const analisado = JSON.parse(infoFreteDoLS);
        if (analisado && analisado.codigoPostal) {
          // Atualiza silenciosamente
        }
      }
    } catch (erro) {
      console.error('Erro ao sincronizar com localStorage:', erro);
    }
  };
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Registra o handler para eventos de cartUpdated
    const lidarComAtualizacaoCarrinho = (evento: CustomEvent<DetalhesAtualizacaoCarrinho>) => {
      // Ignora eventos originados deste próprio componente
      if (evento.detail && evento.detail.fonte === 'popupCarrinho') {
        return;
      }
      
      sincronizarComLocalStorage();
    };
    
    window.addEventListener('cartUpdated', lidarComAtualizacaoCarrinho as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', lidarComAtualizacaoCarrinho as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const quantidadeProduto = localStorage.getItem('productQuantity');
    const valorQuantidade = quantidadeProduto ? JSON.parse(quantidadeProduto) : 1;
    
    // Busque o nome da cor selecionada do localStorage
    const nomeCoresSelecionadas = localStorage.getItem('selectedColorName');
    const nomeCor = nomeCoresSelecionadas ? JSON.parse(nomeCoresSelecionadas) : 'Desconhecida';
    
    // Busque o nome do tamanho selecionado do localStorage
    const nomeTamanhoSelecionado = localStorage.getItem('selectedSizeName');
    const nomeTamanho = nomeTamanhoSelecionado ? JSON.parse(nomeTamanhoSelecionado) : 'Desconhecido';
    
    const novoItemCarrinho = {
      id: `item-${Date.now()}`, // Adiciona um ID único para identificar o item
      nome: 'Camiseta Básica Premium',
      cor: nomeCor,
      tamanho: nomeTamanho,
      quantidade: valorQuantidade,
      cep: infoFrete?.codigoPostal,
      adicionadoEm: Date.now() // Adicionando timestamp para controlar os 15 minutos
    };
    
    // Salve o item no array de itens do carrinho
    const itensArmazenados = localStorage.getItem('cartItems');
    let itensCarrinho = [];
    
    if (itensArmazenados) {
      try {
        itensCarrinho = JSON.parse(itensArmazenados);
      } catch (e) {
        console.error('Erro ao carregar itens do carrinho:', e);
      }
    }
    
    if (!Array.isArray(itensCarrinho)) {
      itensCarrinho = [];
    }
    
    // Adiciona o novo item
    itensCarrinho.push(novoItemCarrinho);
      // Salva o array atualizado
    localStorage.setItem('cartItems', JSON.stringify(itensCarrinho));
      // Dispara um único evento customizado para notificar outras partes da aplicação
    window.dispatchEvent(new CustomEvent<DetalhesAtualizacaoCarrinho>('cartUpdated', { 
      detail: { fonte: 'popupCarrinho', acao: 'adicionarItem' } 
    }));
    
    setItemCarrinho(novoItemCarrinho);
  }, [isOpen, infoFrete, setItemCarrinho]);
  // Agora estamos usando valores diretos do localStorage em vez de busca

  if (!isOpen || !itemCarrinho) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produto Adicionado ao Carrinho</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
              {/* Imagem baseada na cor do produto - padronizada para o formato 3:4 */}              <div className="aspect-[3/4] w-full h-full relative">
                <img 
                  src={`/images/${itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'preto' ? 'black' : 
                       itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'branco' ? 'white' : 
                       itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'azul' ? 'blue' : 'black'}-tshirt-${itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'branco' ? '3' : '1'}.jpg`}
                  alt={`${itemCarrinho.nome} ${itemCarrinho.cor || 'Desconhecida'}`} 
                  className="w-full h-full object-contain absolute inset-0"
                  onError={(e) => {
                    // Fallback para uma imagem do placeholder com a cor correta
                    const corPlaceholder = itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'preto' ? '000000' : 
                                           itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'branco' ? 'ffffff' : 
                                           itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'azul' ? '0047AB' : 'cccccc';                    const corTexto = itemCarrinho.cor && itemCarrinho.cor.toLowerCase() === 'branco' ? '333333' : 'ffffff';
                    e.currentTarget.src = `https://via.placeholder.com/80x80/${corPlaceholder}/${corTexto}?text=${itemCarrinho.cor || 'Desconhecida'}`;
                  }}
                />
              </div>
            </div>              <div className="flex-1">
              <h3 className="font-medium">{itemCarrinho.nome || 'Produto'}</h3>              <div className="mt-2 text-sm text-gray-600">
                <p>Cor: <span className="font-medium">{itemCarrinho.cor || 'Não especificada'}</span></p>
                <p>Tamanho: <span className="font-medium">{itemCarrinho.tamanho || 'Não especificado'}</span></p>
                <p>Quantidade: <span className="font-medium">{itemCarrinho.quantidade || 1}</span></p>
                {itemCarrinho.cep && (
                  <p>Entrega para CEP: <span className="font-medium">{formatarCep(itemCarrinho.cep)}</span></p>
                )}
              </div>
              <div className="mt-2">
                <button 
                  className="text-red-600 text-sm hover:text-red-700 flex items-center"                  onClick={(e) => {
                    e.stopPropagation();
                    // Obter itens atuais
                    const itensArmazenados = localStorage.getItem('cartItems');
                    if (!itensArmazenados) return;
                    
                    try {
                      let itensAnalisados = JSON.parse(itensArmazenados);
                      if (!Array.isArray(itensAnalisados)) return;
                        // Filtrar o item atual
                      if (itemCarrinho.id) {
                        itensAnalisados = itensAnalisados.filter(item => item.id !== itemCarrinho.id);
                      } else {                        // Para compatibilidade com itens sem id, remove correspondendo outras propriedades
                        const indice = itensAnalisados.findIndex(item => 
                          (itemCarrinho.cor ? item.cor === itemCarrinho.cor : true) && 
                          (itemCarrinho.tamanho ? item.tamanho === itemCarrinho.tamanho : true) && 
                          (itemCarrinho.quantidade ? item.quantidade === itemCarrinho.quantidade : true)
                        );
                        if (indice !== -1) {
                          itensAnalisados.splice(indice, 1);
                        }
                      }
                      
                      // Salvar de volta no localStorage
                      localStorage.setItem('cartItems', JSON.stringify(itensAnalisados));
                      
                      // Fechar popup já que estamos removendo o item
                      onClose();
                        // Enviar apenas um evento customizado com informações para evitar loops
                      window.dispatchEvent(new CustomEvent<DetalhesAtualizacaoCarrinho>('cartUpdated', { 
                        detail: { fonte: 'popupCarrinho', acao: 'removerItem' } 
                      }));
                    } catch (e) {
                      console.error('Erro ao remover item do carrinho:', e);
                    }
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
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Continuar Comprando
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupCarrinho;
