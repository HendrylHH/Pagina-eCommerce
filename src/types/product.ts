export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagens: string[];
  variantes: {
    cores: VarianteProduto[];
    tamanhos: VarianteProduto[];
  };
}

export interface VarianteProduto {
  id: string;
  nome: string;
  valor: string;
}

export interface InformacaoEnvio {
  codigoPostal: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}
