import axios from 'axios';
import { type InformacaoEnvio } from '../types/product';

const URL_API = 'https://viacep.com.br/ws';

export const obterInfoCep = async (cep: string): Promise<InformacaoEnvio | null> => {
  try {
    // Remove qualquer caractere não-dígito
    const cepFormatado = cep.replace(/\D/g, '');
    
    if (cepFormatado.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }
    
    const resposta = await axios.get(`${URL_API}/${cepFormatado}/json/`);
    
    if (resposta.data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      codigoPostal: cepFormatado,
      rua: resposta.data.logradouro,
      bairro: resposta.data.bairro,
      cidade: resposta.data.localidade,
      estado: resposta.data.uf,
    };
  } catch (erro) {
    console.error('Erro ao buscar informações do CEP:', erro);
    return null;
  }
};

export const formatarCep = (cep: string | undefined | null): string => {
  // Se o CEP for undefined ou null, retorna uma string vazia
  if (cep === undefined || cep === null) {
    return '';
  }
  
  // Remove qualquer caractere não-dígito
  const digitos = cep.replace(/\D/g, '');
  
  // Formata como XXXXX-XXX
  if (digitos.length <= 5) {
    return digitos;
  }
  
  return `${digitos.slice(0, 5)}-${digitos.slice(5, 8)}`;
};
