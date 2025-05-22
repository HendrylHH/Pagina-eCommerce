export interface DetalhesAtualizacaoCarrinho {
  fonte: string;
  acao?: string;
}

export interface EventoAtualizacaoCarrinho extends CustomEvent {
  detail: DetalhesAtualizacaoCarrinho;
}

// Declara os eventos customizados globalmente
declare global {
  interface WindowEventMap {
    'cartUpdated': EventoAtualizacaoCarrinho;
  }
}
