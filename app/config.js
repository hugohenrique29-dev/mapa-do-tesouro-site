/* Configuração de comercialização — único arquivo a editar quando as contas estiverem prontas.
 * Rode `node tools/checar-config.mjs` antes de publicar. Sem contactEmail e fornecedor o site fica
 * irregular (Decreto 7.962/2013, art. 2º, I–II); sem checkoutUrl o botão "Comprar" não vende. */
self.APP_CONFIG = {
  brand: 'Mapa do Tesouro',        // nome do app; todos os textos usam este valor
  subtitle: 'Missão Pirata',
  version: '0.7.0',                // 20/10: lembrete no calendário (.ics), cópia para outro celular, primeiros passos, missões por momento do dia, patentes, diário de 4 semanas. Subir a versão invalida o cache do service worker
  siteLabel: 'mapadotesouro.app',  // CONFERIR: domínio precisa estar registrado (é impresso nas folhas)
  author: 'Psicóloga Roberta Leitão · CRP 10/08929',
  priceLabel: 'R$ 47',             // decisão em docs/modelo-e-preco.md
  priceValue: 47,
  priceCurrency: 'BRL',
  anchorLabel: '',                 // preço riscado: vazio de propósito
  priceAfterLabel: 'R$ 67',        // preço depois do lançamento (docs/direcao-2026-10-05.md). A página de venda mostra; só manter se for cumprido
  launchUntil: '',                 // data em que o lançamento termina (ex.: '30/11'). Vazio: a página não mostra data. Preencher só com data que será cumprida
  checkoutUrl: '',                 // PREENCHER: URL do checkout (Cakto/Hotmart) no CNPJ da Roberta
  contactEmail: '',                // PREENCHER: e-mail de suporte (obrigatório)
  fornecedor: '',                  // PREENCHER: razão social + CNPJ
  endereco: '',                    // PREENCHER: endereço físico (Decreto 7.962/2013, art. 2º, I exige, além do eletrônico). Pode ser o do consultório.
  pixelId: '',                     // opcional: Pixel da Meta (só carrega com aceite; nunca no app nem no quiz)
  privacyUrl: '../privacidade.html'
};
