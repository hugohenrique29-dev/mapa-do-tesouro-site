// ===== núcleo: estado local, moedas, mapa, portão do capitão, ativação por código, roteador =====
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const BRAND = CFG.brand || 'Mapa do Tesouro';
  const $ = id => document.getElementById(id);
  const screen = $('screen'), titleEl = $('title'), btnBack = $('btn-back'), coinsEl = $('coins-count');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- armazenamento (tudo local; nada sai do aparelho) ----
  const LS = {
    get: (k, d) => { try { const v = localStorage.getItem('mtp_' + k); return v == null ? d : v; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem('mtp_' + k, String(v)); return true; } catch (e) { return false; } }, // false: modo privado ou cota cheia
    json: (k, d) => { try { const v = JSON.parse(localStorage.getItem('mtp_' + k)); return v == null ? d : v; } catch (e) { return d; } },
    setJson: (k, v) => LS.set(k, JSON.stringify(v)),
    del: k => { try { localStorage.removeItem('mtp_' + k); } catch (e) { /* ok */ } }
  };

  // ---- data local (fuso do aparelho): única fonte de "que dia é hoje" ----
  function diaLocal(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function diaMais(iso, n) { const [y, m, d] = iso.split('-').map(Number); return diaLocal(new Date(y, m - 1, d + n)); }
  const HOJE = () => diaLocal();

  // ---- idioma ----
  const urlLang = new URLSearchParams(location.search).get('lang');
  LANG = LANGS.includes(urlLang) ? urlLang : (LANGS.includes(LS.get('lang')) ? LS.get('lang') : ((navigator.language || 'pt').slice(0, 2) === 'es' ? 'es' : (navigator.language || 'pt').slice(0, 2) === 'en' ? 'en' : 'pt'));
  function setLang(l) { if (!LANGS.includes(l)) return; LANG = l; LS.set('lang', l); document.documentElement.lang = LOCALE_IDIOMA[l]; aplicaEstaticos(); }
  function aplicaEstaticos() { document.title = t('app'); $('logo').querySelector('img').alt = t('app') + ' · ' + t('sub'); const im = $('install-msg'); if (im) im.textContent = t('install_msg'); const ib = $('btn-install'); if (ib) ib.textContent = t('install'); btnBack.setAttribute('aria-label', t('back')); $('btn-parent').setAttribute('aria-label', t('gate_title')); }
  const nomeMissao = m => m.custom ? m.txt : ((MISSOES.find(x => x.id === m.id) || {}).t || {})[LANG] || m.txt || m.id;
  const nomeRec = id => { const r = RECOMPENSAS.find(x => x.id === id); return r ? r.t[LANG] : id; };

  // ---- acesso completo (ativação por código, validada no aparelho) ----
  // Modo de desenvolvimento (acesso completo sem código): só em localhost E com `?dev=1` na URL
  // (revisão de 25/11/2026). Antes bastava abrir em localhost ou na rede local, e o pacote público
  // carregava essa porta aberta; agora ela exige um gesto explícito de quem desenvolve.
  const HOST_DEV = ['localhost', '127.0.0.1'].includes(location.hostname);
  // A marca fica em sessionStorage (morre ao fechar a aba): sem isso, o fim do cadastro limpa a URL
  // e o recarregamento seguinte perdia o modo. Fora de localhost a marca é ignorada.
  const DEV = HOST_DEV && (() => { try { if (/[?&]dev=1(&|$)/.test(location.search)) sessionStorage.setItem('mtp_dev', '1'); return sessionStorage.getItem('mtp_dev') === '1'; } catch (e) { return /[?&]dev=1(&|$)/.test(location.search); } })();
  let premium = DEV || LS.get('ativado') === '1';
  function setPremium(v) { premium = DEV || v; LS.set('ativado', v ? '1' : '0'); }
  const isPremium = () => premium;
  // O mapa de 20 casas é gratuito de propósito (decisão de 27/09/2026): o Contrato da Tripulação
  // que a criança assina promete o grande tesouro em 20 moedas, e cortar o mapa na casa 5 fazia o
  // app quebrar essa promessa — justamente o contrário do método que o produto ensina. O acesso
  // completo abre o kit para imprimir, a Missão Telas, a Missão Escola, o diário de bordo, as
  // missões criadas por vocês e os outros piratas.
  const LIMITES = () => premium ? { piratas: 4, missoes: 5, casas: 20, custom: true } : { piratas: 1, missoes: 3, casas: 20, custom: false };

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let hashesCache = null;
  const SAIS = ['tesouro-v1:']; // ao trocar o sal, acrescente o novo no início e nunca remova os antigos
  async function validarCodigo(txt) {
    const limpo = String(txt || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (limpo.length < 12) return false;
    if (!hashesCache) { try { const r = await fetch('codigos.json', { cache: 'no-store' }); hashesCache = (await r.json()).hashes || []; } catch (e) { hashesCache = null; return false; } }
    try { for (const sal of SAIS) { if (hashesCache.includes(await sha256(sal + limpo))) return true; } } catch (e) { return false; }
    return false;
  }

  // ---- estado dos piratas ----
  // pirata: {id, t (criação), _t (último ajuste), nome, tesouro, missoes:[{id,custom,txt,e,dificil}], premios:{5,10,20}, telaMin, viagemBase, viagens,
  //          log:[{d,m,b,c,rara,t}], gastos:[{d,c,min,uso,t}], escola:{comb:['',''],dias:{}}}
  // state:  {piratas, ativo, pin, pinT, apagados:{chave: carimbo}, corte, _rev}
  // Forma garantida de um pirata (revisão de 26/11/2026). Cada tela lê p.escola.dias, p.premios[20],
  // p.missoes.filter… sem conferir. Uma cópia com a Escola pela metade ({comb} sem dias) passava na
  // validação e a Missão Escola quebrava ao abrir. Toda entrada de dados (carregar, importar, mesclar
  // com outra aba) passa por aqui: o que faltar ou vier com o tipo errado recebe o padrão.
  const ehObj = x => x != null && typeof x === 'object' && !Array.isArray(x);
  function normalizarPirata(p) {
    const txt = x => (typeof x === 'string' ? x : '');
    const num = (x, d) => (typeof x === 'number' && isFinite(x) ? x : d);
    p.nome = txt(p.nome); p.tesouro = txt(p.tesouro);
    p.missoes = Array.isArray(p.missoes) ? p.missoes.filter(ehObj) : [];
    const pr = ehObj(p.premios) ? p.premios : {};
    p.premios = { 5: txt(pr[5]), 10: txt(pr[10]), 20: txt(pr[20]) };
    p.telaMin = Math.max(5, num(p.telaMin, 15)); // mesmo piso da tela de Telas; sem teto, para não alterar o que a família combinou
    p.viagemBase = Math.max(0, num(p.viagemBase, 0)); p.viagens = Math.max(1, num(p.viagens, 1));
    const e = ehObj(p.escola) ? p.escola : {}; const comb = Array.isArray(e.comb) ? e.comb : [];
    p.escola = { comb: [txt(comb[0]), txt(comb[1])], dias: ehObj(e.dias) ? e.dias : {} };
    if (!Array.isArray(p.log)) p.log = [];
    if (!Array.isArray(p.gastos)) p.gastos = [];
    return p;
  }
  const state = Object.assign({ piratas: [], ativo: null, pin: '', pinT: 0, apagados: {}, corte: 0 }, LS.json('state', {}));
  if (!ehObj(state.apagados)) state.apagados = {};
  if (!Array.isArray(state.piratas)) state.piratas = [];
  state.piratas = state.piratas.filter(ehObj).map(normalizarPirata); // quem importou uma cópia quebrada na 0.7.1 volta a abrir a Missão Escola
  // ---- gravação segura entre abas ----
  // Duas abas (ou o app instalado + o navegador) gravam no mesmo localStorage. Cada gravação leva um
  // carimbo `_rev`; se o carimbo guardado não é o que esta aba conhece, outra aba gravou no meio e
  // mesclamos antes de gravar. A mescla segue três regras, cada uma fechando um furo encontrado na
  // revisão de 05/10/2026:
  //   1. Lápides. Apagar (pirata, entrega desfeita) é um fato que se propaga: `state.apagados`
  //      guarda {chave: carimbo}. Na mescla, um item só entra se nasceu DEPOIS da lápide (`t`
  //      maior). Assim uma entrega desfeita não volta por uma aba atrasada, mas entregar a mesma
  //      missão de novo depois do desfazer funciona (é uma entrega nova, com `t` novo).
  //   2. Carimbo por item nos ajustes (PIN, dados do pirata): vale o mais recente, não o desta aba.
  //      Antes, a aba que não sabia do PIN gravava `pin: ''` por cima.
  //   3. Saldo nunca negativo. Depois da união, `podarGastos` descarta as trocas mais novas que
  //      não cabem no saldo — duas abas não podem gastar a mesma moeda.
  const novaRev = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const chaveLog = (pid, r) => pid + '/log/' + r.m + '/' + r.d;
  const chavePirata = pid => 'pirata/' + pid;
  const apagado = (chave, t) => { const l = state.apagados[chave]; return l != null && !(t > l); };
  // 4. Corte (revisão de 26/11/2026). Importar uma cópia e "Apagar tudo" substituem o aparelho
  //    inteiro, não só os piratas que ESTA aba conhece. Lápide por id não bastava: um pirata criado
  //    numa segunda aba que esta ainda não tinha visto sobrevivia e voltava ao disco na gravação
  //    seguinte da outra aba. `state.corte` é o instante da substituição; na mescla vale o maior, e
  //    todo pirata nascido até ele sai, venha de que aba vier.
  const morto = p => apagado(chavePirata(p.id), p.t || 0) || (p.t || 0) <= (state.corte || 0);
  function lapide(chave) { state.apagados[chave] = Date.now(); const ks = Object.keys(state.apagados); if (ks.length > 400) ks.sort((a, b) => state.apagados[a] - state.apagados[b]).slice(0, ks.length - 400).forEach(k => delete state.apagados[k]); }
  const CAMPOS_PIRATA = ['nome', 'tesouro', 'missoes', 'premios', 'telaMin', 'viagemBase', 'viagens', 'escola']; // ajustes versionados por `_t`
  function mesclar(outro) {
    if (!outro || !Array.isArray(outro.piratas)) return;
    // lápides: união, com o carimbo maior
    Object.keys(outro.apagados || {}).forEach(k => { if (!(state.apagados[k] >= outro.apagados[k])) state.apagados[k] = outro.apagados[k]; });
    if ((outro.corte || 0) > (state.corte || 0)) state.corte = outro.corte;
    // Um pirata anterior ao corte sai, mas o que uma aba atrasada lançou DEPOIS do corte (t maior) não
    // se perde: volta para o pirata de mesmo id que veio na cópia importada, se houver. O que é anterior
    // ao corte foi substituído pela importação e fica só na cópia anterior.
    const corte = state.corte || 0, sobras = [];
    const recolher = p => { if (!ehObj(p)) return; const log = (p.log || []).filter(r => (r.t || 0) > corte), gastos = (p.gastos || []).filter(g => (g.t || 0) > corte); if (log.length || gastos.length) sobras.push({ id: p.id, log, gastos }); };
    // piratas apagados aqui ou lá (ou anteriores a uma importação / "Apagar tudo") somem dos dois lados
    state.piratas.filter(morto).forEach(recolher);
    state.piratas = state.piratas.filter(p => !morto(p));
    outro.piratas.forEach(op => {
      if (morto(op)) { recolher(op); return; }
      const p = state.piratas.find(x => x.id === op.id);
      if (!p) { normalizarPirata(op); op.log = op.log.filter(r => !apagado(chaveLog(op.id, r), r.t || 0)); podarGastos(op); state.piratas.push(op); return; }
      // ajustes: vence o carimbo mais recente (normalizado: a outra aba pode ser de uma versão antiga)
      if ((op._t || 0) > (p._t || 0)) { CAMPOS_PIRATA.forEach(k => { if (op[k] !== undefined) p[k] = op[k]; }); p._t = op._t; normalizarPirata(p); }
      // entregas: união respeitando lápides
      p.log = p.log.filter(r => !apagado(chaveLog(p.id, r), r.t || 0));
      (op.log || []).forEach(r => { if (apagado(chaveLog(p.id, r), r.t || 0)) return; if (!p.log.some(x => x.m === r.m && x.d === r.d)) p.log.push(r); });
      // trocas: união por carimbo
      (op.gastos || []).forEach(g => { if (!p.gastos.some(x => (x.t && x.t === g.t) || JSON.stringify(x) === JSON.stringify(g))) p.gastos.push(g); });
      [...new Set(p.log.map(x => x.m))].forEach(mid => recalcMissao(p, mid));
      podarGastos(p);
    });
    sobras.forEach(s => {
      const p = state.piratas.find(x => x.id === s.id); if (!p) return; // pirata apagado de vez ("Apagar tudo"): o lançamento atrasado vai junto
      s.log.forEach(r => { if (!apagado(chaveLog(p.id, r), r.t || 0) && !p.log.some(x => x.m === r.m && x.d === r.d)) p.log.push(r); });
      s.gastos.forEach(g => { if (!p.gastos.some(x => x.t === g.t)) p.gastos.push(g); });
      [...new Set(s.log.map(x => x.m))].forEach(mid => recalcMissao(p, mid));
      podarGastos(p);
    });
    if ((outro.pinT || 0) > (state.pinT || 0)) { state.pin = outro.pin || ''; state.pinT = outro.pinT; }
    if (!state.piratas.some(p => p.id === state.ativo)) state.ativo = (state.piratas.find(p => p.id === outro.ativo) || state.piratas[0] || {}).id || null;
  }
  // Depois de uma mescla o saldo pode ter ficado negativo (duas abas trocaram a mesma moeda).
  // Descartamos as trocas mais recentes até o saldo caber: a moeda só pode virar tela uma vez.
  function podarGastos(p) {
    p.gastos.sort((a, b) => (a.t || 0) - (b.t || 0));
    while (p.gastos.length && saldo(p) < 0) p.gastos.pop();
  }
  // Devolve false se o navegador recusou gravar (modo privado, cota cheia): a tela avisa, em vez de
  // a família descobrir semanas depois que nada ficou guardado.
  let avisouFalha = 0;
  function save() {
    const guardado = LS.json('state', null);
    if (guardado && guardado._rev && guardado._rev !== state._rev) mesclar(guardado);
    state._rev = novaRev();
    const ok = LS.setJson('state', state);
    if (!ok && Date.now() - avisouFalha > 60000) { avisouFalha = Date.now(); try { feedback('pergaminho-mapa', t('save_failed'), '', 4000); } catch (e) { /* antes do DOM */ } }
    return ok;
  }
  // Para ajustes (PIN, dados do pirata): carimba e grava, para que a mudança vença entre abas.
  function setPin(v) { state.pin = v || ''; state.pinT = Date.now(); save(); }
  function tocar(p) { p._t = Date.now(); }
  window.addEventListener('storage', e => {
    if (e.key !== 'mtp_state' || !e.newValue) return;
    let outro = null; try { outro = JSON.parse(e.newValue); } catch (err) { return; }
    if (!outro || outro._rev === state._rev) return;
    mesclar(outro); state._rev = outro._rev;
    atualizaMoedas();
    if (atual && !/^(gate|onboarding|ativar)$/.test(atual.name)) go(atual.name, atual.arg, true); // redesenha a tela com os dados da outra aba
  });
  const pirataAtivo = () => state.piratas.find(p => p.id === state.ativo) || state.piratas[0] || null;
  function novoPirata(nome, tesouro) {
    const agora = Math.max(Date.now(), (state.corte || 0) + 1); // nasce depois do último corte, senão a mescla o descartaria
    const p = { id: 'p' + agora.toString(36) + Math.random().toString(36).slice(2, 5), t: agora, _t: agora, nome: nome || '', tesouro: tesouro || '', missoes: [], premios: { 5: '', 10: '', 20: tesouro || '' }, telaMin: 15, viagemBase: 0, viagens: 1, log: [], gastos: [], escola: { comb: ['', ''], dias: {} } };
    state.piratas.push(p); state.ativo = p.id; save(); return p;
  }
  function salvarPirata(p) { tocar(p); save(); }
  function removerPirata(pid) {
    lapide(chavePirata(pid));
    state.piratas = state.piratas.filter(x => x.id !== pid);
    if (state.ativo === pid) state.ativo = (state.piratas[0] || {}).id || null;
    save();
  }
  // "Apagar tudo deste aparelho" faz o que diz (revisão de 25/11/2026): além dos piratas e do PIN,
  // apaga o lembrete, as respostas do quiz (que incluem a pergunta sobre diagnóstico), a cópia
  // anterior à importação e a marca da última cópia. Fica só o idioma e a ativação do acesso completo.
  // Revisão de 26/11/2026 (auditoria): se a gravação falhava, a tela voltava ao cadastro e a cópia
  // anterior era apagada, mas o perfil reaparecia ao recarregar. Agora o estado vazio é gravado
  // primeiro; só se isso confirmar a memória troca e o resto é apagado. Devolve false sem mexer em nada.
  // O corte faz o "apagar" valer também para outras abas abertas, inclusive piratas que esta não viu.
  function resetar() {
    const agora = Math.max(Date.now(), (state.corte || 0) + 1);
    const novo = { piratas: [], ativo: null, pin: '', pinT: agora, apagados: Object.assign({}, state.apagados), corte: agora, _rev: novaRev() };
    state.piratas.forEach(p => { novo.apagados[chavePirata(p.id)] = agora; }); // para abas ainda na 0.7.1, que não conhecem o corte
    if (!LS.setJson('state', novo)) return false;
    Object.keys(state).forEach(k => delete state[k]); Object.assign(state, novo);
    ['lembrete', 'quiz', 'state_bak', 'state_bak_t', 'backup_t'].forEach(k => LS.del(k));
    try { Object.keys(localStorage).filter(k => /^mtp_purchase_/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ok */ }
    try { if (LEMBRETE.timer) clearTimeout(LEMBRETE.timer); } catch (e) { /* antes da definição */ }
    return true;
  }
  // Confere um arquivo de cópia antes de importar. Devolve {ok, motivo?, piratas:[nomes], entregas}.
  // Um arquivo errado (outro app, JSON truncado, pirata sem id) não pode apagar semanas de conquistas.
  // Revisão de 25/11/2026 (auditoria): a versão anterior só olhava id, nome, log e gastos. Uma cópia
  // com `missoes: null` passava, era gravada e a tela inicial quebrava ao filtrar as missões. Agora a
  // estrutura inteira é conferida, campo a campo, com limites de tamanho. `v` acima do que este app
  // conhece é recusado (cópia de versão futura); `v` ausente (cópias antigas) é aceito.
  const BACKUP_V = 1, MAX_PIRATAS = 8, MAX_LOG = 20000;
  const numOuNulo = x => x == null || (typeof x === 'number' && isFinite(x));
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  function validarBackup(j) {
    const nao = () => ({ ok: false, motivo: 'formato' });
    if (!ehObj(j) || !ehObj(j.state) || !Array.isArray(j.state.piratas)) return nao();
    if (j.v != null && (typeof j.v !== 'number' || j.v > BACKUP_V)) return { ok: false, motivo: 'versao' };
    const st = j.state, ps = st.piratas;
    if (!ps.length) return { ok: false, motivo: 'vazio' };
    if (ps.length > MAX_PIRATAS) return nao();
    if (st.ativo != null && typeof st.ativo !== 'string') return nao();
    if (st.pin != null && typeof st.pin !== 'string') return nao();
    if (st.apagados != null && !ehObj(st.apagados)) return nao();
    const ids = new Set();
    for (const p of ps) {
      if (!ehObj(p) || typeof p.id !== 'string' || !p.id || typeof p.nome !== 'string') return nao();
      if (ids.has(p.id)) return nao(); ids.add(p.id);
      if (p.tesouro != null && typeof p.tesouro !== 'string') return nao();
      if (p.missoes != null && (!Array.isArray(p.missoes) || p.missoes.some(m => !ehObj(m) || (m.custom ? typeof m.txt !== 'string' : typeof m.id !== 'string')))) return nao();
      if (p.premios != null && !ehObj(p.premios)) return nao();
      if (!numOuNulo(p.telaMin) || !numOuNulo(p.viagemBase) || !numOuNulo(p.viagens)) return nao();
      if (p.escola != null && (!ehObj(p.escola) || (p.escola.comb != null && (!Array.isArray(p.escola.comb) || p.escola.comb.some(c => c != null && typeof c !== 'string'))) || (p.escola.dias != null && !ehObj(p.escola.dias)))) return nao();
      if (p.premios != null && [5, 10, 20].some(c => p.premios[c] != null && typeof p.premios[c] !== 'string')) return nao();
      // Escola ou prêmios pela metade são aceitos (cópia antiga ou editada à mão): normalizarPirata completa.
      if (p.log != null && !Array.isArray(p.log)) return nao();
      if (p.gastos != null && !Array.isArray(p.gastos)) return nao();
      if ((p.log || []).length > MAX_LOG) return nao();
      if ((p.log || []).some(r => !ehObj(r) || typeof r.m !== 'string' || !ISO.test(r.d || '') || typeof r.c !== 'number' || !isFinite(r.c) || !numOuNulo(r.b))) return nao();
      if ((p.gastos || []).some(g => !ehObj(g) || typeof g.c !== 'number' || !isFinite(g.c) || g.c < 0 || (g.d != null && !ISO.test(g.d)))) return nao();
    }
    return { ok: true, piratas: ps.map(p => p.nome || '?'), entregas: ps.reduce((s, p) => s + (p.log || []).length, 0) };
  }
  // Grava várias chaves como uma operação só (revisão de 26/11/2026). Se uma gravação falhar, as já
  // feitas voltam ao valor de antes, na ordem inversa. Voltar ao valor anterior devolve o
  // armazenamento a uma configuração que já cabia, então o desfazer não esbarra na cota.
  // Na 0.7.1, uma falha ao gravar o estado novo apagava a cópia anterior que já existia.
  function gravarJuntos(pares) { // [[chave, texto ou null para apagar]]
    const antes = pares.map(([k]) => LS.get(k, null));
    for (let i = 0; i < pares.length; i++) {
      const [k, v] = pares[i];
      if (v == null) { LS.del(k); continue; }
      if (LS.set(k, v)) continue;
      for (let j = i - 1; j >= 0; j--) { const kj = pares[j][0]; if (antes[j] == null) LS.del(kj); else LS.set(kj, antes[j]); }
      return false;
    }
    return true;
  }
  // Cópia anterior: uma chave só, {t, state}, para a data e o conteúdo nunca se desencontrarem.
  // Na 0.7.1 eram duas (state_bak com o estado cru e state_bak_t com a data); ainda são lidas.
  function lerBak() {
    const j = LS.json('state_bak', null); if (!ehObj(j)) return null;
    if (Array.isArray(j.piratas)) return { t: parseInt(LS.get('state_bak_t', '0'), 10) || 0, state: j };
    return ehObj(j.state) && Array.isArray(j.state.piratas) ? { t: j.t || 0, state: j.state } : null;
  }
  const resumo = st => ({ piratas: (st.piratas || []).map(p => (p && p.nome) || '?'), entregas: (st.piratas || []).reduce((s, p) => s + (((p && p.log) || []).length), 0) });
  // Importar substitui o aparelho inteiro (todas as abas), sem perder o que pode ser recuperado:
  //   1. o estado novo é montado À PARTE, com carimbos novos e um corte (ver mesclar);
  //   2. o que estava no aparelho vira a cópia anterior. Se o aparelho estava sem piratas, a cópia
  //      anterior que já existia fica como está: um estado vazio não pode tomar o lugar dela;
  //   3. cópia anterior e estado novo são gravados juntos. Se qualquer gravação falhar, nada muda,
  //      nem a tela, nem o estado em disco, nem a cópia anterior. Devolve false.
  // Sem espaço para guardar a cópia anterior, a importação é recusada: a tela oferece guardar
  // uma cópia do que está aqui antes de tentar de novo.
  function importar(st) {
    const agora = Math.max(Date.now(), (state.corte || 0) + 1) + 1;
    const novo = { piratas: [], ativo: null, pin: '', pinT: agora, apagados: Object.assign({}, state.apagados), corte: agora - 1 };
    state.piratas.forEach(p => { novo.apagados[chavePirata(p.id)] = agora - 1; }); // para abas ainda na 0.7.1
    novo.piratas = (st.piratas || []).map(p => normalizarPirata(Object.assign({}, p, { t: agora, _t: agora, log: (p.log || []).map(r => Object.assign({}, r, { t: agora })), gastos: (p.gastos || []).map(g => Object.assign({}, g, { t: agora })) })));
    novo.piratas.forEach(p => { p.missoes = p.missoes.filter(m => m.custom ? m.txt : MISSOES.some(x => x.id === m.id)); [...new Set(p.log.map(x => x.m))].forEach(mid => recalcMissao(p, mid)); podarGastos(p); });
    novo.ativo = (novo.piratas.some(p => p.id === st.ativo) ? st.ativo : (novo.piratas[0] || {}).id) || null;
    novo.pin = typeof st.pin === 'string' ? st.pin : '';
    novo._rev = novaRev();
    const anterior = LS.json('state', null);
    const pares = [];
    if (ehObj(anterior) && Array.isArray(anterior.piratas) && anterior.piratas.length) pares.push(['state_bak', JSON.stringify({ t: agora, state: anterior })], ['state_bak_t', null]);
    pares.push(['state', JSON.stringify(novo)]);
    if (!gravarJuntos(pares)) return false;
    Object.keys(state).forEach(k => delete state[k]); Object.assign(state, novo);
    return true;
  }
  // Cópia anterior à última importação. Voltar é reversível: o que está no aparelho passa a ser a
  // cópia anterior (importar faz a troca), então um toque errado em "Voltar" também se desfaz.
  // Fica até a família descartar ou usar "Apagar tudo": não expira sozinha.
  const BAK = {
    info() { const b = lerBak(); return b ? Object.assign({ t: b.t }, resumo(b.state)) : null; },
    existe: () => lerBak() != null,
    quando: () => (lerBak() || {}).t || 0,
    apagar() { LS.del('state_bak'); LS.del('state_bak_t'); },
    restaurar() {
      const b = lerBak(); if (!b) return false;
      if (!validarBackup({ v: BACKUP_V, state: b.state }).ok) return false;
      return importar(b.state);
    }
  };
  // Lembrete de cópia: sem servidor, a cópia exportada é a única salvaguarda. Lembramos quando há
  // conquistas acumuladas (≥ 10 entregas) e a última cópia tem mais de 14 dias (ou nunca foi feita).
  const BACKUP = {
    marcar() { LS.set('backup_t', Date.now()); },
    ultimo() { return parseInt(LS.get('backup_t', '0'), 10) || 0; },
    precisa() { const n = state.piratas.reduce((s, p) => s + (p.log || []).length, 0); return n >= 10 && Date.now() - this.ultimo() > 14 * 86400000; },
    gerar() { this.marcar(); return JSON.stringify({ v: 1, state, ativado: premium }); }
  };
  // Sincroniza com o que está gravado (outra aba pode ter mexido) antes de uma decisão que depende do saldo.
  function sincronizar() { const g = LS.json('state', null); if (g && g._rev && g._rev !== state._rev) { mesclar(g); state._rev = g._rev; } }
  const ganhas = p => p.log.reduce((s, x) => s + x.c, 0);
  const gastas = p => p.gastos.reduce((s, x) => s + x.c, 0);
  const saldo = p => ganhas(p) - gastas(p);
  const casa = p => Math.min(20, Math.max(0, ganhas(p) - p.viagemBase)); // casa pintada nesta viagem
  const casaVisivel = p => Math.min(casa(p), LIMITES().casas);
  const entregue = (p, mid, d) => p.log.find(x => x.m === mid && x.d === d);
  function diasSeguidos(p, mid, d) { let n = 0, dia = d; while (entregue(p, mid, dia)) { n++; dia = diaMais(dia, -1); } return n; }
  // A moeda rara (3 dias seguidos) é propriedade da sequência, não de um dia solto. Por isso o
  // fator "rara" é recalculado para toda a sequência da missão sempre que uma entrega entra:
  // lançar os dias 1, 3 e depois o 2 dá o mesmo resultado que lançar 1, 2, 3. A base (1 ou 2
  // moedas, se a missão era difícil) fica gravada na entrega (`b`), para que mudar a dificuldade
  // depois não mexa em moeda já conquistada.
  // Regra de ouro (revisão de 05/10/2026): o recálculo SÓ PROMOVE. Uma entrega que já era rara
  // continua rara, mesmo que um lançamento retroativo desloque a contagem de trios — senão um dia
  // a mais lançado podia tirar moedas já conquistadas (e já trocadas por tela), deixando saldo
  // negativo e o mapa andando para trás. Trios novos que o dia retroativo forma viram raras
  // também: a criança nunca perde e ganha o que a sequência completa vale.
  const baseDe = reg => reg.b != null ? reg.b : (reg.rara ? reg.c / 2 : reg.c); // entradas antigas não têm `b`
  const ehRara = seguidos => seguidos >= VALORES_PADRAO.raraDias && seguidos % VALORES_PADRAO.raraDias === 0;
  function recalcMissao(p, mid) {
    p.log.filter(x => x.m === mid).forEach(reg => {
      const b = baseDe(reg), rara = !!reg.rara || ehRara(diasSeguidos(p, mid, reg.d));
      reg.b = b; reg.rara = rara; reg.c = Math.max(reg.c || 0, rara ? b * 2 : b);
    });
  }
  function entregar(p, m, d) {
    if (entregue(p, m.id, d)) return null;
    const antes = casa(p);
    const b = m.dificil ? VALORES_PADRAO.dificil : VALORES_PADRAO.missao;
    // `t` sempre maior que a lápide de uma entrega igual desfeita antes (senão a mescla a descartaria)
    const reg = { d, m: m.id, b, c: b, rara: false, t: Math.max(Date.now(), (state.apagados[chaveLog(p.id, { m: m.id, d })] || 0) + 1) };
    p.log.push(reg);
    recalcMissao(p, m.id); // define c/rara desta entrega e reavalia a sequência (ex.: lançar o dia que faltava no meio)
    save(); atualizaMoedas();
    const depois = casa(p);
    const premio = [5, 10, 20].find(c => antes < c && depois >= c && c <= LIMITES().casas);
    return { reg, seguidos: diasSeguidos(p, m.id, d), rara: reg.rara, premio };
  }
  // Desfazer é correção de toque errado, não retirada de conquista. Duas travas, coerentes com o
  // método que o kit ensina ("casa pintada nunca se apaga", "moeda conquistada não volta ao baú"):
  //   1. só o dia de hoje — lançamento de dias anteriores já virou história e não se apaga;
  //   2. nunca pode deixar o saldo negativo, porque parte das moedas já pode ter virado tela.
  // Devolve 'ok' | 'passado' | 'gasto' para a tela explicar o motivo à família.
  function podeDesfazer(p, mid, d) {
    const reg = entregue(p, mid, d); if (!reg) return 'ok';
    if (d !== HOJE()) return 'passado';
    if (saldo(p) - reg.c < 0) return 'gasto';
    return 'ok';
  }
  function desfazer(p, mid, d) {
    if (podeDesfazer(p, mid, d) !== 'ok') return false;
    const i = p.log.findIndex(x => x.m === mid && x.d === d);
    if (i >= 0) { lapide(chaveLog(p.id, p.log[i])); p.log.splice(i, 1); recalcMissao(p, mid); save(); atualizaMoedas(); return true; }
    return false;
  }
  // Trocar moedas por tela. Confere o saldo DEPOIS de sincronizar com o que está gravado: se outra
  // aba acabou de trocar, esta troca é recusada em vez de deixar o saldo negativo.
  function gastar(p, n, uso) {
    sincronizar();
    n = Math.max(1, parseInt(n, 10) || 1);
    if (saldo(p) < n) { atualizaMoedas(); return false; }
    const t = Date.now();
    p.gastos.push({ d: HOJE(), c: n, min: n * p.telaMin, uso: uso || '', t });
    save(); atualizaMoedas();
    return p.gastos.some(g => g.t === t); // a mescla pode ter podado a troca (duas abas no mesmo instante)
  }
  function atualizaMoedas() { const p = pirataAtivo(); coinsEl.textContent = p ? saldo(p) : 0; const b = $('coins-badge'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }

  // ---- feedback ----
  const overlay = $('feedback-overlay'), fcard = $('feedback-card');
  let fbTimer = null;
  function feedback(img, titulo, sub, ms) {
    fcard.innerHTML = `<img src="img/${esc(img)}.png" alt=""><b>${esc(titulo)}</b>${sub ? `<p class="muted">${esc(sub)}</p>` : ''}`;
    overlay.hidden = false; clearTimeout(fbTimer); fbTimer = setTimeout(() => { overlay.hidden = true; }, ms || 1600);
  }
  overlay.addEventListener('click', () => { overlay.hidden = true; });
  function confetti(n) {
    for (let i = 0; i < (n || 30); i++) { const s = document.createElement('i'); s.className = 'confetti'; s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = (Math.random() * .7) + 's'; s.style.width = s.style.height = (14 + Math.random() * 14) + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 2800); }
  }
  const moedaSom = () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(880, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + .12); g.gain.setValueAtTime(.18, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .35); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .36); } catch (e) { /* sem áudio */ } };

  // ---- portão do capitão (sessão de 10 min) ----
  let gateAte = 0;
  const gateOK = () => Date.now() < gateAte;
  function abrirGate() { gateAte = Date.now() + 10 * 60 * 1000; }
  function fecharGate() { gateAte = 0; }

  // ---- roteador ----
  const routes = {};
  let historyStack = [];
  let atual = null;
  function go(name, arg, replace) {
    if (!routes[name]) name = 'home';
    const precisaGate = /^(parent|deliver|missions|values|screen|school|report|phrases|kit|guide|pirates|full|ativar|settings|newmap)$/.test(name);
    if (precisaGate && !gateOK()) { return go('gate', { next: name, arg }); }
    if (atual && !replace) historyStack.push(atual);
    atual = { name, arg };
    screen.innerHTML = ''; screen.scrollTop = 0;
    btnBack.hidden = historyStack.length === 0;
    titleEl.textContent = t('app');
    routes[name](arg);
  }
  function back() { const prev = historyStack.pop(); if (prev) { atual = null; go(prev.name, prev.arg, true); } else go('home', null, true); btnBack.hidden = historyStack.length === 0; }
  btnBack.addEventListener('click', back);
  $('btn-parent').addEventListener('click', () => go(gateOK() ? 'parent' : 'gate', { next: 'parent' }));
  $('coins-badge').addEventListener('click', () => go('home'));
  $('logo').addEventListener('click', e => { e.preventDefault(); go('home'); });

  // ---- helpers de tela ----
  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
  function setTitle(s) { titleEl.textContent = s; }
  // Mapa da Ilha: a prancha do kit (img/mapa-ilha.png) com as casas pintadas por cima.
  // Posições medidas na prancha (coordenadas da página renderida a 150 dpi, recorte 53,307 → 1195,1353).
  const CASAS = (() => { const sx = [120, 243, 365, 488, 611], sy = { 1: 703, 2: 688, 3: 703, 4: 688, 5: 703, 6: 580, 7: 565, 8: 580, 9: 565, 10: 580, 11: 457, 12: 440, 13: 455, 14: 440, 15: 457, 16: 335, 17: 318, 18: 333, 19: 318, 20: 335 };
    const col = n => { const r = Math.floor((n - 1) / 5), c = (n - 1) % 5; return r % 2 === 0 ? c : 4 - c; };
    const o = {}; for (let n = 1; n <= 20; n++) o[n] = [((sx[col(n)] * 1.757 - 53) / 1142 * 100).toFixed(1), ((sy[n] * 1.757 - 307) / 1046 * 100).toFixed(1)]; return o; })();
  function mapaHTML(p) {
    const pintadas = casaVisivel(p), lim = LIMITES().casas;
    let s = `<div class="mapa"><img class="base" src="img/mapa-ilha.png" alt="${esc(t('map_title'))}">`;
    for (let n = 1; n <= 20; n++) { const [x, y] = CASAS[n]; s += `<div class="casa${n <= pintadas ? ' on' : (n > lim ? ' fora' : '')}" style="left:${x}%;top:${y}%"></div>`; }
    if (pintadas > 0) { const [x, y] = CASAS[pintadas]; s += `<img class="pin" src="img/pirata-mini.png" alt="" style="left:${x}%;top:${y}%">`; }
    return s + '</div>';
  }

  // ---- instalação ----
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (LS.get('install_off') !== '1') $('install-banner').hidden = false; });
  $('btn-install').addEventListener('click', async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $('install-banner').hidden = true; });
  $('btn-install-close').addEventListener('click', () => { $('install-banner').hidden = true; LS.set('install_off', '1'); });

  // ---- lembrete de entrega das moedas (100% local, sem servidor e sem push) ----
  // Limite real, e a tela diz isso à família: um PWA sem servidor não consegue acordar o aparelho
  // com o app fechado. A API Notification Triggers, que fazia isso, foi retirada do Chrome, e o iOS
  // nunca permitiu agendar notificação local na web. Então o lembrete funciona de dois modos:
  //   1. app aberto na hora marcada → notificação do sistema (se a família autorizou);
  //   2. app fechado na hora → no próximo dia em que abrirem, um aviso dentro do app sobre o dia
  //      que ficou sem moeda entregue.
  // Nada é enviado para fora: a hora fica no localStorage e o agendamento é um setTimeout local.
  const LEMBRETE = {
    hora: () => LS.get('lembrete', ''),
    set(hhmm) { if (hhmm) LS.set('lembrete', hhmm); else LS.del('lembrete'); this.agendar(); },
    async pedirPermissao() {
      if (!('Notification' in window)) return 'indisponivel';
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied') return 'denied';
      try { return await Notification.requestPermission(); } catch (e) { return 'denied'; }
    },
    notificar(corpo) {
      try {
        if (!('Notification' in window) || Notification.permission !== 'granted') return false;
        new Notification(t('rem_title'), { body: corpo, icon: 'icons/icon-192.png', tag: 'mtp-lembrete' });
        return true;
      } catch (e) { return false; }
    },
    timer: null,
    agendar() {
      clearTimeout(this.timer);
      const h = this.hora(); if (!h) return;
      const [hh, mm] = h.split(':').map(Number);
      const agora = new Date(), alvo = new Date();
      alvo.setHours(hh, mm, 0, 0);
      if (alvo <= agora) alvo.setDate(alvo.getDate() + 1); // já passou hoje: marca para amanhã
      this.timer = setTimeout(() => {
        const p = pirataAtivo();
        const faltou = p && !p.log.some(x => x.d === HOJE());
        if (faltou) this.notificar(t('rem_body', { n: p.nome }));
        this.agendar(); // reprograma para o dia seguinte
      }, alvo - agora);
    },
    // Dias sem nenhuma moeda entregue, entre a última entrega e ontem (só para o aviso interno).
    diasSemEntrega() {
      const p = pirataAtivo(); if (!p || !p.log.length) return 0;
      const ultimo = p.log.reduce((m, x) => (x.d > m ? x.d : m), p.log[0].d);
      let n = 0, dia = diaMais(HOJE(), -1);
      while (dia > ultimo && n < 30) { n++; dia = diaMais(dia, -1); }
      return n;
    },
    // Modo 3 (20/10/2026): o lembrete que de fato acorda o celular com o app fechado é o do
    // calendário do próprio aparelho. Geramos um evento .ics que se repete todos os dias, com
    // alarme na hora, e a família abre o arquivo uma vez (Calendário do iPhone, Google Agenda
    // ou Samsung Calendar aceitam). Continua sem servidor: o arquivo nasce aqui e fica com eles.
    ics(hhmm, nome) {
      const [hh, mm] = String(hhmm || '20:00').split(':').map(Number);
      const d = new Date(); d.setHours(hh, mm, 0, 0); if (d <= new Date()) d.setDate(d.getDate() + 1);
      const pad = n => String(n).padStart(2, '0');
      const fmt = x => x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' + pad(x.getHours()) + pad(x.getMinutes()) + '00';
      const local = fmt(d), fim = fmt(new Date(d.getTime() + 10 * 60000));
      const agora = new Date(), stamp = agora.getUTCFullYear() + pad(agora.getUTCMonth() + 1) + pad(agora.getUTCDate()) + 'T' + pad(agora.getUTCHours()) + pad(agora.getUTCMinutes()) + pad(agora.getUTCSeconds()) + 'Z';
      const limpa = s => String(s || '').replace(/[\\;,]/g, ' ').replace(/\r?\n/g, ' ');
      const titulo = limpa(t('rem_title') + (nome ? ' · ' + nome : ''));
      const corpo = limpa(t('rem_ics_body', { n: nome || '' }));
      return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mapa do Tesouro//Lembrete//PT', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
        'UID:mtp-lembrete-' + hhmm.replace(':', '') + '@mapadotesouro.app', 'DTSTAMP:' + stamp, 'DTSTART:' + local, 'DTEND:' + fim, 'RRULE:FREQ=DAILY',
        'SUMMARY:' + titulo, 'DESCRIPTION:' + corpo, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + titulo, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    }
  };

  // ---- nível do pirata (parecer de 27/09/2026, docs/progressao-aprovada.md, item 1) ----
  // Derivado só do total de moedas ganhas desde o início: nenhum dado novo. Sobe, nunca desce.
  const NIVEIS = [[0, 'grumete', 'pirata-mini'], [20, 'marujo', 'navio'], [60, 'contramestre', 'moeda-coragem'], [120, 'imediato', 'pirata-lanterna'], [200, 'capitao', 'bau-aberto']];
  function nivel(p) {
    const g = ganhas(p); let i = 0;
    while (i + 1 < NIVEIS.length && g >= NIVEIS[i + 1][0]) i++;
    const prox = NIVEIS[i + 1] ? NIVEIS[i + 1][0] - g : 0;
    return { i, id: NIVEIS[i][1], img: NIVEIS[i][2], nome: t('lvl_' + NIVEIS[i][1]), faltam: prox, proximo: NIVEIS[i + 1] ? t('lvl_' + NIVEIS[i + 1][1]) : '' };
  }

  // ---- API interna para rotas.js ----
  window.MTP = { CFG, BRAND, $, esc, el, LS, t, HOJE, diaLocal, diaMais, setLang, nomeMissao, nomeRec, isPremium, setPremium, LIMITES, validarCodigo, state, save, salvarPirata, setPin, removerPirata, resetar, validarBackup, importar, BACKUP, BAK, sincronizar, pirataAtivo, novoPirata, ganhas, gastas, saldo, casa, casaVisivel, entregue, diasSeguidos, entregar, podeDesfazer, desfazer, gastar, recalcMissao, atualizaMoedas, feedback, confetti, moedaSom, gateOK, abrirGate, fecharGate, routes, go, back, setTitle, mapaHTML, aplicaEstaticos, LEMBRETE, nivel, NIVEIS };

  // ---- início ----
  document.documentElement.lang = LOCALE_IDIOMA[LANG];
  window.addEventListener('DOMContentLoaded', () => {
    aplicaEstaticos(); atualizaMoedas(); LEMBRETE.agendar();
    const codigo = new URLSearchParams(location.search).get('codigo');
    if (codigo && !premium) { abrirGate(); go('ativar', codigo); return; }
    go(state.piratas.length ? 'home' : 'onboarding');
  });
})();
