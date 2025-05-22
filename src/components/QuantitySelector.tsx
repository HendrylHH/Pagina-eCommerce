import useArmazenamentoLocal from '../hooks/useLocalStorage';

interface PropriedadesSeletorQuantidade {
  quantidadeInicial?: number;
}

const SeletorQuantidade: React.FC<PropriedadesSeletorQuantidade> = ({ quantidadeInicial = 1 }) => {
  const [quantidade, setQuantidade] = useArmazenamentoLocal<number>('productQuantity', quantidadeInicial);

  const diminuirQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  };

  const aumentarQuantidade = () => {
    if (quantidade < 10) {
      setQuantidade(quantidade + 1);
    }
  };

  const aoMudarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value);
    if (!isNaN(valor) && valor >= 1 && valor <= 10) {
      setQuantidade(valor);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-900">Quantidade</h3>
      <div className="mt-2 flex items-center">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={diminuirQuantidade}
        >
          -
        </button>
        <input
          type="text"
          value={quantidade}
          onChange={aoMudarInput}
          className="w-12 h-8 border-t border-b border-gray-300 text-center text-gray-700 focus:outline-none"
        />
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={aumentarQuantidade}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default SeletorQuantidade;
