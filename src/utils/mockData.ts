import { type Produto } from '../types/product';

export const mockProduct: Produto = {
  id: 'basic-tshirt-2025',
  nome: 'Camiseta Básica Premium',
  descricao: 'Camiseta básica de alta qualidade, confeccionada em 100% algodão sustentável. Corte regular fit, confortável e durável. Perfeita para uso diário e diversas ocasiões.',
  preco: 69.90,  imagens: [
    // Imagens da camiseta preta (2 variações)
    '/images/black-tshirt-1.jpg',
    '/images/black-tshirt-2.jpg',
    // Imagens da camiseta branca (2 variações)
    '/images/white-tshirt-1.jpg',
    '/images/white-tshirt-3.jpg',
    // Imagens da camiseta azul (2 variações)
    '/images/blue-tshirt-1.jpg',
    '/images/blue-tshirt-2.jpg',
  ],  variantes: {
    cores: [
      { id: 'color-1', nome: 'Preto', valor: '#000000' },
      { id: 'color-2', nome: 'Branco', valor: '#FFFFFF' },
      { id: 'color-3', nome: 'Azul', valor: '#0047AB' },
    ],    tamanhos: [
      { id: 'size-1', nome: 'PP', valor: 'PP' },
      { id: 'size-2', nome: 'P', valor: 'P' },
      { id: 'size-3', nome: 'M', valor: 'M' },
      { id: 'size-4', nome: 'G', valor: 'G' },
      { id: 'size-5', nome: 'GG', valor: 'GG' },
      { id: 'size-6', nome: 'XG', valor: 'XG' },
    ],
  },
};
