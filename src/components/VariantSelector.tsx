import { type VarianteProduto } from '../types/product';
import useArmazenamentoLocal from '../hooks/useLocalStorage';

interface PropriedadesSeletorVariante {
  titulo: string;
  opcoes: VarianteProduto[];
  tipo: 'color' | 'size';
  aoSelecionar?: (idVariante: string, nomeVariante: string) => void;
}

const SeletorVariante: React.FC<PropriedadesSeletorVariante> = ({ titulo, opcoes, tipo, aoSelecionar }) => {
  const [varianteSelecionada, setVarianteSelecionada] = useArmazenamentoLocal<string | null>(
    `selected${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, 
    opcoes.length > 0 ? opcoes[0].id : null
  );

  const aoClicar = (id: string) => {
    setVarianteSelecionada(id);
    const opcaoSelecionada = opcoes.find(opcao => opcao.id === id);
    if (aoSelecionar && opcaoSelecionada) {
      aoSelecionar(id, opcaoSelecionada.nome);
    }
  };

  if (!opcoes || opcoes.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-900">{titulo}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {opcoes.map((opcao) => (
          <button
            key={opcao.id}
            className={`variant-option ${
              varianteSelecionada === opcao.id ? 'variant-option-selected' : 'variant-option-unselected'
            }`}
            onClick={() => aoClicar(opcao.id)}            style={
              tipo === 'color'
                ? {
                    backgroundColor: opcao.valor,
                    border: varianteSelecionada === opcao.id ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '9999px',
                    boxShadow: varianteSelecionada === opcao.id ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                  }
                : {}
            }
          >
            {tipo === 'size' && opcao.nome}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeletorVariante;
