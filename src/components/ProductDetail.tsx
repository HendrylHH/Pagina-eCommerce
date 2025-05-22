import { useState, useEffect } from 'react';
import { type Produto } from '../types/product';
import GaleriaImagensProduto from './ProductImageGallery';
import SeletorVariante from './VariantSelector';
import CalculadoraFrete from './ShippingCalculator';
import SeletorQuantidade from './QuantitySelector';
import PopupCarrinho from './CartPopup';
import useArmazenamentoLocal from '../hooks/useLocalStorage';

interface PropriedadesDetalhesProduto {
  product: Produto;
}

const DetalhesProduto: React.FC<PropriedadesDetalhesProduto> = ({ product }) => {
  const [estaCarrinhoAberto, setEstaCarrinhoAberto] = useState(false);
  // Cor e tamanho usados para o carrinho
  const [, setCorSelecionada] = useArmazenamentoLocal<string | null>('selectedColorName', 'Preto');
  const [, setTamanhoSelecionado] = useArmazenamentoLocal<string | null>('selectedSizeName', 'M');
  const [idCorSelecionada, setIdCorSelecionada] = useArmazenamentoLocal<string | null>('selectedColor', 'color-1');
  const [imagensFiltradas, setImagensFiltradas] = useState<string[]>(product.imagens.slice(0, 2));
  const [infoFrete, setInfoFrete] = useArmazenamentoLocal<any | null>('shippingInfo', null);
  const [freteCaculadoAgora, setFreteCalculadoAgora] = useState<boolean>(false);
  const [tentativaAdicionarAoCarrinho, setTentativaAdicionarAoCarrinho] = useState<boolean>(false);
  
  const formatarPreco = (preco: number): string => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  // Filtrar imagens baseadas na cor selecionada
  const atualizarImagensPorCor = (idCor: string) => {
    let indiceInicio = 0;
    
    if (idCor === 'color-1') { // Preto
      indiceInicio = 0;
    } else if (idCor === 'color-2') { // Branco
      indiceInicio = 2;
    } else if (idCor === 'color-3') { // Azul
      indiceInicio = 4;
    }
    
    setImagensFiltradas(product.imagens.slice(indiceInicio, indiceInicio + 2));
  };
  
  // Inicializa com as imagens da cor padrão
  useEffect(() => {
    if (idCorSelecionada) {
      atualizarImagensPorCor(idCorSelecionada);
    }
  }, [idCorSelecionada, product.imagens]);
  
  const aoSelecionarCor = (id: string, nome: string) => {
    setCorSelecionada(nome);
    setIdCorSelecionada(id);
    atualizarImagensPorCor(id);
  };
  
  const aoSelecionarTamanho = (_id: string, nome: string) => {
    setTamanhoSelecionado(nome);
  };  
  
  const aoAdicionarAoCarrinho = () => {
    // Forçar uma sincronização com o localStorage
    try {
      const infoFreteDoLS = localStorage.getItem('shippingInfo');
      const infoAnalisada = infoFreteDoLS ? JSON.parse(infoFreteDoLS) : null;
      
      if (infoAnalisada && (!infoFrete || JSON.stringify(infoAnalisada) !== JSON.stringify(infoFrete))) {
        setInfoFrete(infoAnalisada);
      }
    } catch (erro) {
      console.error('Erro ao sincronizar dados do localStorage:', erro);
    }
    
    // Obter informações atualizadas
    const infoAtual = infoFrete || 
                    (localStorage.getItem('shippingInfo') ? 
                     JSON.parse(localStorage.getItem('shippingInfo') || 'null') : 
                     null);
    
    // Verificar se o infoFrete existe E se possui um CEP válido
    if (infoAtual && infoAtual.codigoPostal && infoAtual.codigoPostal.trim()) {
      setEstaCarrinhoAberto(true);
    } else {
      setTentativaAdicionarAoCarrinho(true);
      // Rolar para a seção de cálculo de frete
      const calculadoraFrete = document.getElementById('shipping-calculator');
      if (calculadoraFrete) {
        calculadoraFrete.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  // Efeito para sincronizar com alterações no localStorage
  useEffect(() => {
    // Função para sincronizar o estado com o localStorage
    const sincronizarDoLocalStorage = () => {
      try {
        const infoFreteDoLS = localStorage.getItem('shippingInfo');
        if (infoFreteDoLS) {
          const infoAnalisada = JSON.parse(infoFreteDoLS);
          setInfoFrete(infoAnalisada);
        }
      } catch (erro) {
        console.error('Erro ao sincronizar do localStorage:', erro);
      }
    };

    // Registrar listener para o evento storage
    window.addEventListener('storage', sincronizarDoLocalStorage);
    
    // Sincronizar quando o componente é montado
    sincronizarDoLocalStorage();

    // Limpeza ao desmontar
    return () => {
      window.removeEventListener('storage', sincronizarDoLocalStorage);
    };
  }, []); // Executar apenas na montagem

  return (
    <div className="flex min-h-screen">
      {/* Coluna esquerda - Imagens do produto - Fora da caixa de conteúdo */}
      <div className="w-[35vw] pt-8">
        <div className="pl-8">
          <GaleriaImagensProduto images={imagensFiltradas} />
        </div>
      </div>

      {/* Coluna direita - Informações do produto */}
      <div className="flex-1 bg-gray-100 p-8 min-h-screen">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900">{product.nome}</h1>
          <div className="mt-2">
            <p className="text-3xl text-gray-900 font-semibold">{formatarPreco(product.preco)}</p>
            <p className="mt-1 text-sm text-gray-500">
              Em até 10x de {formatarPreco(product.preco / 10)} sem juros
            </p>
          </div>

          <div className="mt-4 space-y-6">
            <p className="text-base text-gray-500">{product.descricao}</p>
          </div>

          {/* Seletores de variantes */}
          <SeletorVariante
            titulo="Cores"
            opcoes={product.variantes.cores}
            tipo="color"
            aoSelecionar={aoSelecionarCor}
          />
          
          <SeletorVariante
            titulo="Tamanhos"
            opcoes={product.variantes.tamanhos}
            tipo="size"
            aoSelecionar={aoSelecionarTamanho}
          />
          
          {/* Seletor de quantidade */}
          <SeletorQuantidade quantidadeInicial={1} />
          
          {/* Calculadora de frete */}
          <div id="shipping-calculator" className={`relative ${tentativaAdicionarAoCarrinho && !infoFrete ? 'ring-2 ring-red-300 rounded-lg animate-pulse' : ''}`}>
            {tentativaAdicionarAoCarrinho && !infoFrete && (
              <div className="absolute -right-2 -top-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                Obrigatório
              </div>
            )}
            
            <CalculadoraFrete 
              aoCalcularFrete={(info) => {
                if (info) {
                  // Atualizar o infoFrete local
                  setInfoFrete(info);
                  
                  // Resetar o estado de tentativa de adicionar ao carrinho
                  setTentativaAdicionarAoCarrinho(false);
                  
                  // Ativar animação de destaque no botão
                  setFreteCalculadoAgora(true);
                  
                  // Desativar a animação após 3 segundos
                  setTimeout(() => {
                    setFreteCalculadoAgora(false);
                  }, 3000);
                } else {
                  // CEP foi apagado/invalidado
                  setInfoFrete(null);
                  
                  // Se já tentou adicionar ao carrinho antes, manter o estado
                  // para continuar mostrando o aviso
                  setFreteCalculadoAgora(false);
                }
              }}
            />
          </div>
          
          {/* Botão de adicionar ao carrinho */}
          <div className="mt-8">
            {tentativaAdicionarAoCarrinho && !infoFrete && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                É necessário calcular o frete antes de adicionar ao carrinho
              </div>
            )}
            
            <button
              type="button"
              onClick={aoAdicionarAoCarrinho}
              className={`w-full ${!(infoFrete && infoFrete.codigoPostal && infoFrete.codigoPostal.trim()) ? 'bg-blue-500' : 'bg-blue-600'} border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${freteCaculadoAgora ? 'animate-pulse shadow-lg shadow-blue-300' : ''}`}
            >
              Adicionar ao carrinho
            </button>
          </div>
          
          {/* Popup do Carrinho */}
          <PopupCarrinho 
            isOpen={estaCarrinhoAberto} 
            onClose={() => setEstaCarrinhoAberto(false)} 
          />
        </div>
      </div>
    </div>
  );
};

export default DetalhesProduto;
