# Página de Produto E-commerce

Este projeto é uma página de produto de e-commerce desenvolvida com React, TypeScript e Tailwind CSS.

## Funcionalidades
- **Imagens do Produto**: Mostra uma imagem principal com miniaturas. Ao clicar em uma miniatura, a imagem principal é atualizada.
- **Produto Dinâmicas**: Seletores de cor e tamanho que são gerados dinamicamente a partir dos dados do produto.
- **Validação de CEP**: Valida CEPs e recupera informações de endereço da ViaCEP.
- **LocalStorage**: As ações do usuário são salvas no localStorage por 15 minutos.

## Stacks utilizadas
- **React**: Biblioteca de UI para construção dos componentes de interface
- **TypeScript**: Segurança de tipos para a aplicação
- **Tailwind CSS**: Para estilização dos componentes
- **React Hook Form**: Manipulação de formulários com validação
- **Axios**: Para requisições à API do ViaCEP
- **React Hot Toast**: Para exibir notificações toast


## Regras de Implementação de Funcionalidades

### Galeria de Imagens do Produto
- A imagem principal ocupa 35% da tela
- Miniaturas mostradas abaixo podem ser clicadas para alterar a imagem principal
- Seleção persiste via localStorage

### Variantes do Produto
- Opções de cor e tamanho são geradas dinamicamente a partir dos dados
- Seleção é salva no localStorage

### Informações de Envio
- Validação de CEP com integração à API ViaCEP
- Informações de endereço exibidas após validação bem-sucedida
- Erros de validação mostrados com notificações toast

## Créditos

Este projeto foi criado como uma demonstração das capacidades do React e Tailwind CSS para uma página de produto de ecommerce. Tratamos aqui apenas de funcionalidades, sem praticar tanto o frontend.