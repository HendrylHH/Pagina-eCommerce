// Calculadora de Frete
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { obterInfoCep, formatarCep } from '../utils/cepApi';
import { type InformacaoEnvio } from '../types/product';
import useArmazenamentoLocal from '../hooks/useLocalStorage';

interface DadosFormularioFrete {
  codigoPostal: string;
}

interface PropsCalculadoraFrete {
  aoCalcularFrete?: (info: InformacaoEnvio | null) => void;
}

const CalculadoraFrete: React.FC<PropsCalculadoraFrete> = ({ aoCalcularFrete }) => {
  const [carregando, setCarregando] = useState(false);
  const [infoFrete, setInfoFrete] = useArmazenamentoLocal<InformacaoEnvio | null>('shippingInfo', null);
  
  // Verifica se o objeto infoFrete possui a estrutura esperada
  const validarInfoFrete = (info: any): info is InformacaoEnvio => {
    return info && 
      typeof info === 'object' && 
      'codigoPostal' in info && 
      typeof info.codigoPostal === 'string';
  };
  
  // Código postal seguro
  const codigoPostalSeguro = validarInfoFrete(infoFrete) ? infoFrete.codigoPostal : '';
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DadosFormularioFrete>({
    defaultValues: {
      codigoPostal: codigoPostalSeguro,
    }
  });

  const aoEnviar = async (dados: DadosFormularioFrete) => {
    try {
      setCarregando(true);
      const resultado = await obterInfoCep(dados.codigoPostal);
      if (resultado) {
        setInfoFrete(resultado);
        setValue('codigoPostal', formatarCep(resultado.codigoPostal));
        toast.success('Endereço encontrado!');
        
        // Notifica o componente pai que o frete foi calculado
        if (aoCalcularFrete) {
          aoCalcularFrete(resultado);
        }
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (erro) {
      toast.error('Erro ao buscar o CEP');
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };  
  
  const aoMudarCep = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const cepFormatado = formatarCep(valor);
    setValue('codigoPostal', cepFormatado);        // Se o campo estiver vazio, limpar as informações de frete
    if (!valor.trim()) {
      setInfoFrete(null);
      // Notifica o componente pai que o frete foi removido
      if (aoCalcularFrete) {
        aoCalcularFrete(null);
      }
    }
  };
  
  // Função para garantir acesso seguro às propriedades
  const obterValorSeguro = (obj: any, propriedade: string, alternativa: string): string => {
    if (!obj) return alternativa;
    return obj[propriedade] || alternativa;
  };

  return (
    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900">Calcular Frete</h3>
      
      <form onSubmit={handleSubmit(aoEnviar)} className="mt-2">
        <div className="flex space-x-2">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Digite seu CEP"
              maxLength={9}
              className="input-field"
              {...register('codigoPostal', { 
                required: 'CEP é obrigatório',
                pattern: {
                  value: /^[0-9]{5}-?[0-9]{3}$/,
                  message: 'CEP inválido'
                }
              })}
              onChange={aoMudarCep}
            />
            {errors.codigoPostal && (
              <p className="mt-1 text-red-600 text-sm">{errors.codigoPostal.message}</p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={carregando}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-blue-300"
          >
            {carregando ? 'Calculando...' : 'Calcular'}
          </button>
        </div>
      </form>        {infoFrete && validarInfoFrete(infoFrete) && (
        <div className="mt-4 p-3 bg-white rounded-md border">
          <h4 className="font-medium text-gray-800">Endereço de Entrega</h4>
          <p className="mt-2 text-gray-600">{infoFrete.rua || '-'}</p>
          <p className="text-gray-600">{infoFrete.bairro || '-'}</p>
          <p className="text-gray-600">{infoFrete.cidade || '-'} - {infoFrete.estado || '-'}</p>
          <p className="text-gray-600">CEP: {formatarCep(infoFrete.codigoPostal)}</p>
          
          <div className="mt-3 space-y-2">
            <h5 className="font-medium text-gray-800">Opções de Entrega</h5>
            
            <div className="p-2 bg-blue-50 rounded border border-blue-200 flex items-center">
              <div className="w-5 h-5 mr-2 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Entrega Expressa</p>
                <p className="text-xs text-blue-600">Receba em 2-3 dias úteis</p>
              </div>
              <div className="font-medium text-blue-800">
                R$ 29,90
              </div>
            </div>
            
            <div className="p-2 bg-green-50 rounded border border-green-200 flex items-center">
              <div className="w-5 h-5 mr-2 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Entrega Padrão</p>
                <p className="text-xs text-green-600">Receba em 4-7 dias úteis</p>
              </div>
              <div className="font-medium text-green-800">
                R$ 12,90
              </div>
            </div>
            
            <div className="p-2 bg-purple-50 rounded border border-purple-200 flex items-center">
              <div className="w-5 h-5 mr-2 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-800">Retirar na Loja</p>
                <p className="text-xs text-purple-600">Disponível em 1 dia útil</p>
              </div>
              <div className="font-medium text-purple-800">
                Grátis
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculadoraFrete;
