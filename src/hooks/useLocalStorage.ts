import { useState, useEffect } from 'react';

const SUFIXO_CHAVE_EXPIRACAO = '_expiracao';
const EXPIRACAO_PADRAO = 15 * 60 * 1000; // 15 minutos em milissegundos

function useArmazenamentoLocal<T>(chave: string, valorInicial: T, tempoExpiracao: number = EXPIRACAO_PADRAO) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const chaveExpiracao = `${chave}${SUFIXO_CHAVE_EXPIRACAO}`;
      const timestampExpiracao = localStorage.getItem(chaveExpiracao);
      
      if (timestampExpiracao) {
        const dataExpiracao = parseInt(timestampExpiracao, 10);
        const agora = Date.now();
        
        if (agora > dataExpiracao) {
          // Valor expirou, limpe-o
          localStorage.removeItem(chave);
          localStorage.removeItem(chaveExpiracao);
          return valorInicial;
        }
      }
      
      const valorArmazenado = localStorage.getItem(chave);
      return valorArmazenado ? JSON.parse(valorArmazenado) : valorInicial;
    } catch (erro) {
      console.error('Erro ao ler do localStorage:', erro);
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      const chaveExpiracao = `${chave}${SUFIXO_CHAVE_EXPIRACAO}`;
      const dataExpiracao = Date.now() + tempoExpiracao;
      localStorage.setItem(chaveExpiracao, dataExpiracao.toString());
    } catch (erro) {
      console.error('Erro ao escrever no localStorage:', erro);
    }
  }, [chave, valor, tempoExpiracao]);

  return [valor, setValor] as const;
}

export default useArmazenamentoLocal;
