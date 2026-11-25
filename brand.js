// preenche nome, preço e links a partir de app/config.js em todas as páginas do site
(function () {
  const C = window.APP_CONFIG || {}; const b = C.brand || 'Mapa do Tesouro';

  /* ---------- Medição de anúncios (Pixel da Meta) ----------
     Regras (LGPD, arts. 7º, I, 8º e 14; Termos das Ferramentas de Negócios da Meta, em vigor desde 03/11/2025,
     itens 1.h e 3; fonte em docs/pesquisa/meta-termos-ferramentas-negocios-2026-09-26.md):
     1. Só nas páginas que declaram <body data-medicao> (hoje: index.html e obrigado.html).
     2. Nunca no app nem no quiz (o quiz pergunta a idade e o nível de leitura da criança),
        mesmo que alguém marque a página por engano.
     3. Só depois que o adulto aceita no aviso. Sem aceite, nenhum script da Meta é carregado.
     4. autoConfig desligado: a Meta não recebe cliques de botão nem metadados da página,
        só os eventos enviados aqui (PageView, InitiateCheckout, Purchase). */
  const CHAVE = 'mtp_medicao', VERSAO = 1; // subir VERSAO faz o aviso aparecer de novo (ex.: nova finalidade)
  const pixelId = String(C.pixelId || '').trim();
  const proibida = /\/(app|quiz)(\/|$)/i.test(location.pathname);
  let podeMedir = false, escolhaNaPagina = null; // se o armazenamento local estiver bloqueado, a escolha vale só para esta página
  let carregado = false, ativa = false, aviso = null, abriu = null; const fila = [];

  function lerEscolha() {
    try {
      const e = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (e && e.versao === VERSAO && (e.escolha === 'aceita' || e.escolha === 'recusada')) return e.escolha;
    } catch (err) { /* armazenamento indisponível */ }
    return escolhaNaPagina;
  }
  function gravarEscolha(v) {
    escolhaNaPagina = v;
    try { localStorage.setItem(CHAVE, JSON.stringify({ escolha: v, versao: VERSAO, em: new Date().toISOString() })); } catch (err) { /* idem */ }
  }
  function ativar() {
    if (!podeMedir || lerEscolha() !== 'aceita') return;
    if (!carregado) {
      carregado = true;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('set', 'autoConfig', false, pixelId); // precisa vir antes do init
      window.fbq('init', pixelId); window.fbq('track', 'PageView');
    } else if (!ativa) window.fbq('consent', 'grant'); // aceitou de novo depois de recusar nesta mesma página
    ativa = true;
    fila.splice(0).forEach(fn => { try { fn(window.fbq); } catch (err) { /* evento isolado não derruba a página */ } });
  }
  function apagarCookiesMeta() {
    const partes = location.hostname.split('.');
    ['_fbp', '_fbc'].forEach(n => {
      document.cookie = n + '=; Max-Age=0; path=/';
      for (let i = 0; i < partes.length - 1; i++) document.cookie = n + '=; Max-Age=0; path=/; domain=.' + partes.slice(i).join('.');
    });
  }
  function reservarEspaco() { // o aviso é fixo no pé da tela: sem isto, cobriria o rodapé (fornecedor e contato)
    document.body.style.paddingBottom = aviso && !aviso.hidden ? (aviso.offsetHeight + 24) + 'px' : '';
  }
  function fecharAviso() {
    if (!aviso || aviso.hidden) return;
    const focoNoAviso = aviso.contains(document.activeElement);
    aviso.hidden = true; reservarEspaco();
    if (abriu && document.contains(abriu)) abriu.focus();
    else if (focoNoAviso) { // o aviso abriu sozinho: o foco segue para o conteúdo, e não para o início da página
      const alvo = document.querySelector('main, .wrap') || document.body;
      if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
      alvo.focus({ preventScroll: true });
    }
    abriu = null;
  }
  function escolher(v) {
    gravarEscolha(v);
    fecharAviso();
    if (v === 'aceita') ativar();
    else { if (carregado && ativa) window.fbq('consent', 'revoke'); ativa = false; apagarCookiesMeta(); }
    mostrarEstado();
  }
  function mostrarAviso(origem) {
    if (!pixelId || proibida) return;
    if (!aviso) {
      aviso = document.createElement('div');
      aviso.className = 'aviso-medicao'; aviso.setAttribute('role', 'region'); aviso.setAttribute('aria-label', 'Medição de anúncios');
      aviso.innerHTML = '<p><strong>Medição de anúncios.</strong> Se você permitir, o Pixel da Meta grava um cookie neste navegador ' +
        'e envia à Meta dados de acesso, como a página visitada. Com isso, a Meta mede e direciona os anúncios do ' + b + '. ' +
        'A Meta pode tratar esses dados fora do Brasil. <a href="privacidade.html#medicao">Ler a política de privacidade</a></p>' +
        '<div class="aviso-botoes"><button type="button" class="btn" data-escolha="recusada">Recusar a medição</button>' +
        '<button type="button" class="btn" data-escolha="aceita">Aceitar a medição</button></div>';
      aviso.addEventListener('click', ev => { const bt = ev.target.closest('[data-escolha]'); if (bt) escolher(bt.dataset.escolha); });
      aviso.addEventListener('keydown', ev => { if (ev.key === 'Escape') fecharAviso(); }); // fecha sem escolher: nada é carregado
      document.body.prepend(aviso); // primeiro na ordem do teclado, embora apareça no pé da tela
      window.addEventListener('resize', reservarEspaco);
    }
    abriu = origem || null;
    aviso.hidden = false; reservarEspaco();
    if (origem) aviso.querySelector('button').focus();
  }
  function mostrarEstado() {
    const e = lerEscolha();
    document.querySelectorAll('[data-medicao-estado]').forEach(el => {
      el.textContent = !pixelId ? 'o Pixel da Meta não está ativo neste site no momento.'
        : e === 'aceita' ? 'medição aceita.' : e === 'recusada' ? 'medição recusada.' : 'nenhuma escolha feita até agora.';
    });
  }
  // para os scripts das páginas (ex.: Purchase em obrigado.html): roda agora, se a medição estiver ativa, ou quando for aceita
  window.mtpMedicao = { quandoAtiva(fn) { if (ativa) fn(window.fbq); else fila.push(fn); } };

  document.querySelectorAll('[data-brand]').forEach(e => { e.textContent = b; });
  document.querySelectorAll('[data-price]').forEach(e => { e.textContent = C.priceLabel || 'R$ 47'; });
  document.querySelectorAll('[data-anchor]').forEach(e => { e.textContent = C.anchorLabel || ''; });
  document.querySelectorAll('[data-price-num]').forEach(e => { e.textContent = String(C.priceValue || 47); });
  // Urgência só com fato real: o preço depois do lançamento e a data em que ele muda (config.js).
  if (C.priceAfterLabel) document.querySelectorAll('[data-price-after]').forEach(e => { e.textContent = C.priceAfterLabel; });
  if (C.launchUntil) document.querySelectorAll('[data-launch-until]').forEach(e => { e.textContent = C.launchUntil; });
  else document.querySelectorAll('[data-launch-wrap]').forEach(e => e.remove());
  // Botão de compra (revisão de 25/11/2026): sem checkoutUrl, o botão não pode prometer "comprar" e
  // levar à oferta ou a um caminho absoluto que quebra em hospedagem sob subpasta. Vira "Experimentar
  // grátis" e aponta para o app com caminho relativo à página (/quiz/ → ../app/, raiz → app/).
  const appRel = /\/quiz\/?$|\/quiz\/[^/]*$/.test(location.pathname) ? '../app/' : 'app/';
  document.querySelectorAll('[data-checkout]').forEach(a => {
    if (C.checkoutUrl) { a.href = C.checkoutUrl; a.target = '_blank'; a.rel = 'noopener'; }
    else if (/^#/.test(a.getAttribute('href') || '')) { a.dataset.semCheckout = '1'; } // "Quero o mapa" no topo leva à oferta, onde o preço e o botão real estão
    else { // o botão da oferta não pode levar à própria oferta
      a.href = appRel; a.dataset.semCheckout = '1';
      const txt = [...a.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      const rotulo = a.dataset.semCheckoutLabel || 'Experimentar grátis';
      if (txt) txt.textContent = rotulo + ' '; else a.textContent = rotulo;
    }
    a.addEventListener('click', () => { if (ativa && C.checkoutUrl) window.fbq('track', 'InitiateCheckout', { value: C.priceValue || 47, currency: C.priceCurrency || 'BRL' }); });
  });
  if (C.contactEmail) document.querySelectorAll('[data-contact]').forEach(a => { a.href = 'mailto:' + C.contactEmail; a.textContent = C.contactEmail; });
  else document.querySelectorAll('[data-contact-wrap], [data-contact]').forEach(e => e.remove());
  // Identificação do fornecedor: obrigatória em local de destaque no site de venda
  // (Decreto 7.962/2013, art. 2º, I e II — nome/razão social, CNPJ ou CPF e endereço eletrônico).
  document.querySelectorAll('[data-fornecedor]').forEach(e => { // com data-fornecedor-padrao, o texto da página fica quando o campo está vazio
    if (C.fornecedor) e.textContent = C.fornecedor; else if (!e.hasAttribute('data-fornecedor-padrao')) e.remove();
  });
  // Endereço físico: o art. 2º, I, pede "endereço físico e eletrônico". Vai ao lado do fornecedor.
  if (C.endereco) document.querySelectorAll('[data-endereco]').forEach(e => { e.textContent = C.endereco; });
  else document.querySelectorAll('[data-endereco-wrap], [data-endereco]').forEach(e => e.remove());
  if (!C.fornecedor || !C.contactEmail || !C.endereco) {
    console.warn('[config] Preencha "fornecedor", "endereco" e "contactEmail" em app/config.js: o Decreto 7.962/2013 (art. 2º, I e II) exige nome, CPF/CNPJ, endereço físico e eletrônico no site de venda.');
  }
  document.title = document.title.replace('{b}', b);

  // A medição liga por último e isolada: um erro nela não pode impedir o preenchimento de preço, checkout e fornecedor.
  try {
    podeMedir = !!pixelId && !proibida && document.body.hasAttribute('data-medicao');
    if (pixelId && !proibida) document.querySelectorAll('[data-medicao-prefs]').forEach(bt => bt.addEventListener('click', () => mostrarAviso(bt)));
    else document.querySelectorAll('[data-medicao-prefs-wrap]').forEach(e => e.remove());
    mostrarEstado();
    if (podeMedir) { const e = lerEscolha(); if (e === 'aceita') ativar(); else if (!e) mostrarAviso(null); }
  } catch (err) { console.warn('[medição] desligada por erro:', err); }
})();
