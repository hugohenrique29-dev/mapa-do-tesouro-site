// ===== telas: primeira vez, home da criança, Ilha da Calma, painel do capitão e suas seções =====
// Toda a iconografia vem das pranchas do kit (web/app/img). Sem emojis de interface.
(function () {
  'use strict';
  const M = window.MTP; const { $, esc, el, t, routes, go, setTitle } = M;
  const CAT_IMG = { manha: 'sol', escola: 'ic-backpack', casa: 'ic-toys', convivencia: 'ic-friends', noite: 'pirata-lanterna' };
  const CALMA_COR = { 1: '#E0562F', 2: '#F0A22A', 3: '#2FA08B', 4: '#2E6FA8', 5: '#8B5FC4', 6: '#D9358A', 7: '#E0562F', 8: '#F0A22A', 9: '#2FA08B', 10: '#2E6FA8' };
  const missaoDe = id => MISSOES.find(x => x.id === id);
  const missaoObj = m => m.custom ? m : Object.assign({}, missaoDe(m.id) || {}, m);
  const img = (n, cls) => `<img class="${cls || 'ic'}" src="img/${n}.png" alt="">`;
  const icone = mo => img(mo.img || 'ic-star');
  // Placa + fita: legendas longas (> 40 caracteres) não cabem numa fita e viram linha de apoio simples.
  const sign = (txt, sub) => `<div class="sign">${esc(txt)}</div>${sub ? (sub.length > 40 ? `<p class="muted small center">${esc(sub)}</p>` : `<div class="ribbon">${esc(sub)}</div>`) : ''}`;
  const foot = () => `<p class="foot">${esc(M.CFG.author || '')}<br>${esc(t('disclaimer'))}</p>`;
  const moedasTxt = n => n === 1 ? t('coin_1') : t('coins_n', { n });
  // Bloco de dica curta (título + texto), usado nas telas do capitão.
  const dica = (tit, txt, cls) => `<div class="dica${cls ? ' ' + cls : ''}"><b>${esc(tit)}</b><span>${esc(txt)}</span></div>`;
  // Missões agrupadas pelo momento do dia (manhã → escola → casa → convivência → noite), na ordem
  // em que o dia acontece. Criança e adulto leem "o que vem agora" sem procurar na lista.
  // Missão criada pela família entra no grupo "Em casa", a menos que tenha categoria marcada.
  function porMomento(p) {
    const grupos = CATS.map(c => ({ c, itens: [] }));
    p.missoes.forEach(m => { const mo = missaoObj(m); const g = grupos.find(x => x.c === (mo.cat || 'casa')) || grupos[2]; g.itens.push(m); });
    return grupos.filter(g => g.itens.length);
  }
  const tituloMomento = c => `<div class="momento">${img(CAT_IMG[c], 'ic-m')}<b>${esc(t('m_cat_' + c))}</b></div>`;

  // ---------- PRIMEIRA VEZ / NOVO PIRATA ----------
  routes.onboarding = function (arg) {
    setTitle(t('ob_title'));
    const lim = M.LIMITES();
    const sel = new Set(); const dif = {}; let assinP = false, assinC = false;
    const ideia = i => RECOMPENSAS[i + 3].t[LANG];
    // Vindo do quiz (`?m=cama,dentes_m,…`), as três missões sugeridas já chegam marcadas: a família
    // não precisa escolher tudo de novo. Só na primeira vez (não ao chamar outro pirata).
    const sugeridas = (arg && arg.extra) ? [] : String(new URLSearchParams(location.search).get('m') || '').split(',').filter(id => missaoDe(id));
    sugeridas.slice(0, lim.missoes).forEach(id => { sel.add(id); dif[id] = !!missaoDe(id).dificil; });
    const limpaUrl = () => { if (location.search) try { history.replaceState(null, '', location.pathname); } catch (e) { /* ok */ } };
    const w = el(`<div>
      ${sign(t('ob_contract'), t('ob_title'))}
      <div class="card"><div class="hero-pirata">${img('pirata', '')}<div class="balao">${esc(t('ob_intro'))}</div></div>
        <div class="chips">${LANGS.map(l => `<button class="chip${l === LANG ? ' on' : ''}" data-lang="${l}">${esc(t('lang_' + l))}</button>`).join('')}</div></div>
      <div class="card"><label class="lbl">${esc(t('ob_name'))}</label><input class="in" id="ob-nome" maxlength="24" placeholder="${esc(t('ob_name_ph'))}">
        <label class="lbl">${esc(t('ob_treasure'))}</label><input class="in" id="ob-treasure" maxlength="60" placeholder="${esc(t('ob_treasure_ph'))}"></div>
      <div class="card"><h2>${esc(t('p_missions'))}</h2><p class="muted">${sugeridas.length ? esc(t('ob_from_quiz')) + ' ' : ''}${esc(t('ob_pick'))}</p><div id="ob-cats"></div>
        <div id="ob-dif"></div></div>
      <div class="card"><h2>${esc(t('ob_rewards'))}</h2><p class="muted">${esc(t('ob_rewards_hint'))}</p>
        <label class="lbl">${esc(t('r_small'))}</label><input class="in" id="ob-r5" maxlength="60" placeholder="${esc(ideia(0))}">
        <label class="lbl">${esc(t('r_mid'))}</label><input class="in" id="ob-r10" maxlength="60" placeholder="${esc(ideia(1))}">
        <p class="muted small">${esc(t('r_big'))}: <b id="ob-r20">—</b></p></div>
      <div class="card contrato" id="ob-contrato"><h2>${esc(t('ob_contract'))}</h2><p id="ob-ctext"></p>
        <div class="btn-row"><button type="button" class="sig" id="sig-p" aria-pressed="false">${esc(t('sign_pirate'))}</button><button type="button" class="sig" id="sig-c" aria-pressed="false">${esc(t('sign_captain'))}</button></div><p class="muted small center">${esc(t('sign_hint'))}</p></div>
      <div class="btn-row"><button class="btn btn-gold full" id="ob-ok" disabled>${esc(t('start'))}</button></div><p class="muted small center" id="ob-msg"></p>
      ${foot()}</div>`);
    const cats = w.querySelector('#ob-cats');
    CATS.forEach(c => {
      const bloco = el(`<div><h3>${esc(t('m_cat_' + c))}</h3><div class="chips"></div></div>`);
      const chips = bloco.querySelector('.chips');
      MISSOES.filter(m => m.cat === c).forEach(m => {
        const b = el(`<button class="chip${m.dificil ? ' hard' : ''}${sel.has(m.id) ? ' on' : ''}" data-id="${m.id}">${icone(m)}${esc(m.t[LANG])}</button>`);
        b.addEventListener('click', () => {
          if (sel.has(m.id)) { sel.delete(m.id); delete dif[m.id]; } else { if (sel.size >= lim.missoes) { M.feedback('pergaminho-mapa', t('ob_max'), M.isPremium() ? '' : t('m_free_limit'), 2200); return; } sel.add(m.id); dif[m.id] = !!m.dificil; }
          b.classList.toggle('on', sel.has(m.id)); atualiza();
        });
        chips.appendChild(b);
      });
      cats.appendChild(bloco);
    });
    const nome = w.querySelector('#ob-nome'), tes = w.querySelector('#ob-treasure'), ok = w.querySelector('#ob-ok'), msg = w.querySelector('#ob-msg');
    const difBox = w.querySelector('#ob-dif');
    function atualiza() {
      const n = nome.value.trim() || '_____', tt = tes.value.trim() || '_____';
      w.querySelector('#ob-r20').textContent = tes.value.trim() || '—';
      const lista = [...sel].map(id => missaoDe(id).t[LANG] + (dif[id] ? ' (' + t('contract_hard_mark') + ')' : '')).join('; ') || '_____';
      // O contrato diz a regra inteira antes da assinatura: 1 moeda, 2 se for difícil, dobro em 3 dias
      // seguidos. Antes dizia só "uma moeda", e a criança via 2 ou 4 chegarem sem saber por quê.
      w.querySelector('#ob-ctext').textContent = t('contract_text', { n, m: lista, t: tt }) + ' ' + t('contract_values');
      // Dificuldade por missão escolhida: o adulto marca o que é difícil PARA ESTA criança.
      difBox.innerHTML = sel.size ? `<p class="muted small">${esc(t('ob_hard_hint'))}</p>` : '';
      [...sel].forEach(id => { const m = missaoDe(id); const row = el(`<label class="row small" style="font-weight:600;cursor:pointer"><input type="checkbox" ${dif[id] ? 'checked' : ''}> ${icone(m)} ${esc(m.t[LANG])} · ${esc(t('m_hard_toggle'))}</label>`);
        row.querySelector('input').addEventListener('change', e => { dif[id] = e.target.checked; atualiza(); }); difBox.appendChild(row); });
      ok.disabled = !(nome.value.trim() && tes.value.trim() && sel.size >= 3 && assinP && assinC);
      msg.textContent = sel.size < 3 ? t('ob_min') : '';
    }
    nome.addEventListener('input', atualiza); tes.addEventListener('input', atualiza);
    // Assinaturas são <button> (revisão de 25/11/2026): antes eram <div> só com clique, e quem navega
    // por teclado ou leitor de tela não conseguia concluir o cadastro. aria-pressed diz o estado.
    const assina = (id, k, get, set) => w.querySelector(id).addEventListener('click', e => { set(!get()); e.currentTarget.classList.toggle('on', get()); e.currentTarget.setAttribute('aria-pressed', String(get())); e.currentTarget.textContent = t(k) + (get() ? ' · ' + t('signed') : ''); atualiza(); });
    assina('#sig-p', 'sign_pirate', () => assinP, v => { assinP = v; }); assina('#sig-c', 'sign_captain', () => assinC, v => { assinC = v; });
    w.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { M.setLang(b.dataset.lang); go('onboarding', arg, true); }));
    ok.addEventListener('click', () => {
      const p = M.novoPirata(nome.value.trim(), tes.value.trim());
      p.missoes = [...sel].map(id => ({ id, dificil: !!dif[id] }));
      p.premios = { 5: w.querySelector('#ob-r5').value.trim() || ideia(0), 10: w.querySelector('#ob-r10').value.trim() || ideia(1), 20: tes.value.trim() };
      M.salvarPirata(p); M.atualizaMoedas(); limpaUrl(); M.confetti(); M.feedback('pirata-mini', t('start'), '', 1400);
      setTimeout(() => go('home', null, true), 900);
    });
    atualiza();
    $('screen').appendChild(w);
  };

  // ---------- HOME DA CRIANÇA ----------
  routes.home = function () {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('home_hi', { n: p.nome }));
    const hoje = M.HOJE(), c = M.casa(p), lim = M.LIMITES();
    const prox = [5, 10, 20].find(x => x > c && x <= lim.casas);
    const nv = M.nivel(p);
    const feitas = p.missoes.filter(m => M.entregue(p, missaoObj(m).id, hoje)).length;
    const w = el(`<div>
      ${sign(t('map_title'), t('map_sub'))}
      <div class="card"><div class="hero-pirata">${img('pirata-mini', '')}<div class="balao">${esc(t('home_hi', { n: p.nome }))} ${prox ? esc(t('next_prize', { f: prox - c, c: prox, p: p.premios[prox] || '…' })) : (c >= 20 ? esc(t('treasure_found')) : '')}</div></div>
        ${M.mapaHTML(p)}
        <div class="progresso"><div class="barra"><i style="width:${Math.min(100, c * 5)}%"></i></div><b>${esc(t('map_progress', { c }))}</b></div>
        <div class="nivel">${img(nv.img, 'ic')}<div class="tx"><b>${esc(t('lvl_label', { n: nv.nome }))}</b><small>${nv.faltam ? esc(t('lvl_next', { f: nv.faltam, n: nv.proximo })) : esc(t('lvl_top'))}</small></div></div>
        ${!M.isPremium() && c >= 5 ? `<p class="muted small">${esc(t('map_free_note'))}</p>` : ''}
        <p class="small center"><span class="pill">${esc(t('map_rule'))}</span></p>
        ${c >= 20 ? `<div class="btn-row"><button class="btn btn-gold full" id="b-cert">${esc(t('treasure_found'))}</button></div>` : ''}</div>
      <div class="card"><h2>${esc(t('today'))}</h2>${p.missoes.length ? `<p class="muted small">${esc(feitas === p.missoes.length ? t('today_all') : t('today_count', { f: feitas, n: p.missoes.length }))}</p>` : ''}<div class="list" id="hoje"></div></div>
      <div class="row" style="margin-bottom:14px"><button class="btn btn-gold" id="b-calma" style="flex:1">${esc(t('calm_btn'))}</button><button class="btn" id="b-afirm" style="flex:1">${esc(t('affirm_title'))}</button></div>
      ${foot()}</div>`);
    const lista = w.querySelector('#hoje');
    if (!p.missoes.length) lista.innerHTML = `<p class="muted">${esc(t('today_none'))}</p>`;
    porMomento(p).forEach(g => {
      lista.appendChild(el(tituloMomento(g.c)));
      g.itens.forEach(m => {
        const mo = missaoObj(m), reg = M.entregue(p, mo.id, hoje);
        lista.appendChild(el(`<div class="item${reg ? ' done' : ''}">${icone(mo)}<div class="tx">${esc(M.nomeMissao(mo))}<small>${reg ? esc(moedasTxt(reg.c)) + ' ' + esc(t('coin_got')) : (mo.dificil ? esc(t('deliver_hard')) : '')}</small></div>${reg ? img('moeda-cumprida', 'ic') : '<span class="flag"></span>'}</div>`));
      });
    });
    w.querySelector('#b-calma').addEventListener('click', () => go('calma'));
    w.querySelector('#b-afirm').addEventListener('click', () => go('afirm'));
    const bc = w.querySelector('#b-cert'); if (bc) bc.addEventListener('click', () => go('certificado'));
    $('screen').appendChild(w);
  };

  // ---------- ILHA DA CALMA ----------
  routes.calma = function () {
    setTitle(t('calm_title'));
    const w = el(`<div>${sign(t('calm_title'), t('calm_sub'))}
      <div class="card mar"><div class="ilha"><img src="img/ilha-calma.png" alt="${esc(t('calm_title'))}"></div>
        <p class="muted small center">${esc(t('calm_pick'))}</p><div class="calm-list" id="cl"></div>
        <p class="center small"><span class="pill">${esc(t('calm_all'))}</span></p></div>
      <div class="card">${dica(CRISE[LANG].titulo, t('calm_adult'), 'mar')}<ul style="padding-left:18px;line-height:1.45">${CRISE[LANG].faz.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="muted small">${esc(CRISE[LANG].depois)}</p></div>${foot()}</div>`);
    const ilha = w.querySelector('.ilha'), cl = w.querySelector('#cl');
    CALMA.forEach(c => {
      const hot = el(`<button aria-label="${c.n}. ${esc(c.t[LANG][0])}" style="left:${c.x}%;top:${c.y}%"></button>`); hot.addEventListener('click', () => go('calmacard', c.n)); ilha.appendChild(hot);
      const b = el(`<button style="--c:${CALMA_COR[c.n]}"><i>${c.n}</i><span>${esc(c.t[LANG][0])}</span></button>`); b.addEventListener('click', () => go('calmacard', c.n)); cl.appendChild(b);
    });
    $('screen').appendChild(w);
  };
  routes.calmacard = function (n) {
    const c = CALMA.find(x => x.n === n) || CALMA[0]; setTitle(c.t[LANG][0]);
    const dicaAdulto = (CALMA_ADULTO[LANG] || CALMA_ADULTO.pt)[c.n - 1];
    $('screen').appendChild(el(`<div><div class="calm-big" style="--c:${CALMA_COR[c.n]}"><div class="num">${c.n}</div><h2>${esc(c.t[LANG][0])}</h2>${n === 1 ? '<div class="breath"></div>' : ''}<p>${esc(c.t[LANG][1])}</p>${dicaAdulto ? `<p class="dica"><b>${esc(CRISE[LANG].titulo)}</b>${esc(dicaAdulto)}</p>` : ''}</div><div class="btn-row"><button class="btn btn-ghost full" id="b-out">${esc(t('back'))}</button></div></div>`));
    $('screen').querySelector('#b-out').addEventListener('click', M.back);
  };
  routes.afirm = function () {
    const p = M.pirataAtivo(); setTitle(t('affirm_title'));
    $('screen').appendChild(el(`<div>${sign(t('affirm_title'), t('affirm_sub'))}<div class="prancha"><img src="img/pirata-em-missao.png" alt="${esc(t('affirm_title'))}"><div class="foto">${img('pirata', '')}</div><div class="nome">${esc(p ? p.nome : '')}</div></div>
      <div class="card"><div class="chips">${AFIRMACOES[LANG].map(a => `<span class="chip tag on">${esc(a)}</span>`).join('')}</div><p class="muted small">${esc(t('affirm_hint'))}</p></div>${foot()}</div>`));
  };
  routes.certificado = function () {
    const p = M.pirataAtivo(); setTitle(t('treasure_found'));
    $('screen').appendChild(el(`<div>${sign(t('treasure_found'))}<div class="prancha"><img src="img/certificado.png" alt=""><div class="nome-cert">${esc(p ? p.nome : '')}</div></div>
      <div class="btn-row"><button class="btn" id="c-print">${esc(t('e_print'))}</button></div>${foot()}</div>`));
    $('screen').querySelector('#c-print').addEventListener('click', () => window.print());
  };

  // ---------- PORTÃO ----------
  routes.gate = function (arg) {
    setTitle(t('gate_title'));
    // Com PIN configurado, só o PIN abre: a soma é a barreira padrão para quem não configurou nada,
    // e uma criança de 8 anos resolve "7 + 5" — então ela não pode continuar valendo quando a
    // família pediu proteção de verdade.
    const comPin = !!M.state.pin;
    const a = 3 + Math.floor(Math.random() * 7), b = 2 + Math.floor(Math.random() * 8);
    const w = el(`<div>${sign(t('gate_title'))}<div class="card"><div class="hero-pirata">${img('papagaio', '')}<div class="balao">${esc(comPin ? t('gate_pin_q') : t('gate_q', { a, b }))}</div></div>
      <input class="in" id="g-in" inputmode="numeric" autocomplete="off" ${comPin ? 'type="password" maxlength="4"' : ''}>
      <div class="btn-row"><button class="btn full" id="g-ok">${esc(t('ok'))}</button></div><p class="muted small" id="g-msg"></p></div></div>`);
    const inp = w.querySelector('#g-in');
    const certo = () => comPin ? inp.value === M.state.pin : parseInt(inp.value, 10) === a + b;
    const tenta = () => { if (certo()) { M.abrirGate(); go(arg && arg.next || 'parent', arg && arg.arg, true); } else { w.querySelector('#g-msg').textContent = t('gate_bad'); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 450); inp.value = ''; } };
    w.querySelector('#g-ok').addEventListener('click', tenta); inp.addEventListener('keydown', e => { if (e.key === 'Enter') tenta(); }); if (comPin) inp.addEventListener('input', () => { if (inp.value.length === 4) tenta(); });
    $('screen').appendChild(w); setTimeout(() => inp.focus(), 50);
  };

  // ---------- PAINEL DO CAPITÃO ----------
  routes.parent = function () {
    const p = M.pirataAtivo(); setTitle(t('gate_title'));
    const prem = M.isPremium();
    // Três grupos em vez de onze cartões iguais: o que se faz todo dia, os combinados da família e as ferramentas.
    // Ícones só de imagens exportadas a ≥ 200px (mapa-mini/bau pequenos ficavam borrados ampliados).
    const grupos = [
      ['p_group_today', [['deliver', 'moeda-ouro', 'p_deliver', true, 'destaque'], ['phrases', 'papagaio', 'p_phrases', true], ['report', 'ic-book', 'p_report', prem]]],
      ['p_group_agree', [['missions', 'pergaminho-mapa', 'p_missions', true], ['values', 'moeda-rara', 'p_rewards', true], ['screen', 'ic-tv', 'p_screen', prem], ['school', 'ic-backpack', 'p_school', prem]]],
      ['p_group_tools', [['guide', 'pirata-lanterna', 'p_guide', true], ['kit', 'bau-aberto', 'p_kit', prem], ['pirates', 'pirata-mini', 'p_pirates', true], ['full', prem ? 'moeda-cumprida' : 'moeda-bau', 'p_full', true], ['settings', 'moeda-foco', 'p_settings', true]]]
    ];
    const w = el(`<div>${sign(t('gate_title'), p ? `${p.nome} · ${moedasTxt(M.ganhas(p))} · ${M.casa(p)}/20` : '')}<div id="menus"></div>${foot()}</div>`);
    const menus = w.querySelector('#menus');
    // Primeiros passos (20/10/2026): a família que acabou de instalar não sabe por onde começar e
    // o Guia de 10 passos é longo demais para a primeira noite. Quatro passos, cada um com o
    // botão que leva à tela certa, marcados sozinhos conforme o estado real. Some quando os
    // quatro estão feitos ou quando a família toca em "já sei".
    if (p && M.LS.get('guiado_off') !== '1') {
      const passos = [
        ['missions', 'ps_missions', p.missoes.length >= 3],
        ['values', 'ps_rewards', !!(p.premios[5] && p.premios[10] && p.premios[20])],
        ['deliver', 'ps_deliver', p.log.length > 0],
        ['settings', 'ps_reminder', !!M.LEMBRETE.hora()]
      ];
      const feitos = passos.filter(x => x[2]).length;
      if (feitos < passos.length) {
        const g = el(`<div class="card mar guiado"><h2>${esc(t('ps_title'))}</h2><p class="muted small">${esc(t('ps_hint', { f: feitos, n: passos.length }))}</p><div class="list"></div><div class="btn-row"><button class="btn btn-ghost" id="ps-off">${esc(t('ps_off'))}</button></div></div>`);
        const lista = g.querySelector('.list');
        passos.forEach(([r, k, ok], i) => {
          const it = el(`<button class="item${ok ? ' done' : ''}"><span class="num">${ok ? '✓' : i + 1}</span><div class="tx">${esc(t(k))}<small>${esc(t(k + '_s'))}</small></div></button>`);
          it.addEventListener('click', () => go(r));
          lista.appendChild(it);
        });
        g.querySelector('#ps-off').addEventListener('click', () => { M.LS.set('guiado_off', '1'); g.remove(); });
        w.insertBefore(g, menus);
      }
    }
    if (M.BACKUP.precisa()) { const av = el(`<div class="card">${dica(t('set_export'), t('backup_hint'), 'mar')}<div class="btn-row"><button class="btn btn-ghost" id="bk-go">${esc(t('set_export'))}</button></div></div>`); av.querySelector('#bk-go').addEventListener('click', () => go('settings')); w.insertBefore(av, menus); }
    grupos.forEach(([gk, itens]) => {
      const g = el(`<div><div class="grupo-t">${esc(t(gk))}</div><div class="menu"></div></div>`); const menu = g.querySelector('.menu');
      itens.forEach(([r, im, k, ok, extra]) => { const b = el(`<button class="tile${ok ? '' : ' locked'}${extra ? ' ' + extra : ''}">${img(im, '')}<span><b>${esc(t(k))}</b><small>${esc(t(k + '_s'))}</small></span></button>`); b.addEventListener('click', () => go(ok ? r : 'full')); menu.appendChild(b); });
      menus.appendChild(g);
    });
    $('screen').appendChild(w);
  };

  // entregar moedas
  routes.deliver = function (arg) {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('deliver_title'));
    let dia = (arg && arg.dia) || M.HOJE();
    // Plano B do lembrete: se o app estava fechado na hora marcada, o aviso aparece aqui, na tela
    // onde a entrega é feita — e com o botão de data já pronto para lançar o dia esquecido.
    const atras = M.LEMBRETE.hora() ? M.LEMBRETE.diasSemEntrega() : 0;
    const w = el(`<div>${sign(t('deliver_title'))}<div class="card"><p class="muted">${esc(t('deliver_hint'))}</p>
      ${atras > 0 ? `<p class="muted small"><span class="pill">${esc(atras === 1 ? t('rem_missed1') : t('rem_missed', { n: atras }))}</span></p>` : ''}
      <div class="row"><span class="pill">${esc(t('deliver_day'))}</span><input type="date" class="in" id="d-dia" style="width:auto;margin:0" value="${dia}" max="${M.HOJE()}"></div>
      <div class="list" id="d-list"></div></div>
      <div class="card">${dica(t('deliver_praise_t'), t('deliver_praise')[Math.floor(Date.now() / 864e5) % t('deliver_praise').length])}</div>${foot()}</div>`);
    const lista = w.querySelector('#d-list');
    function render() {
      lista.innerHTML = '';
      if (!p.missoes.length) { lista.innerHTML = `<p class="muted">${esc(t('today_none'))}</p>`; return; }
      porMomento(p).forEach(g => { lista.appendChild(el(tituloMomento(g.c))); g.itens.forEach(m => {
        const mo = missaoObj(m), reg = M.entregue(p, mo.id, dia), seg = M.diasSeguidos(p, mo.id, dia);
        // Entrega de dia anterior não tem botão de desfazer: já é conquista. No dia, "Desfazer"
        // corrige um toque errado, com confirmação, e só se a moeda não tiver sido trocada por tela.
        const pode = reg ? M.podeDesfazer(p, mo.id, dia) : 'ok';
        const it = el(`<div class="item${reg ? ' done' : ''}">${icone(mo)}<div class="tx">${esc(M.nomeMissao(mo))}<small>${reg ? (reg.rara ? esc(t('deliver_rare', { n: seg })) + ' · ' : '') + esc(moedasTxt(reg.c)) + (pode === 'passado' ? ' · ' + esc(t('deliver_kept')) : '') : (mo.dificil ? esc(t('deliver_hard')) : '')}</small></div>${reg && pode === 'passado' ? img('moeda-cumprida', 'ic') : `<button>${reg ? esc(t('deliver_undo')) : img(mo.dificil ? 'moeda-esforco' : 'moeda-ouro', '')}</button>`}</div>`);
        const bt = it.querySelector('button'); if (!bt) { lista.appendChild(it); return; }
        bt.addEventListener('click', () => {
          if (reg) {
            if (pode === 'gasto') { M.feedback('ic-tv', t('undo_spent'), '', 2600); return; }
            if (!confirm(t('undo_confirm', { m: M.nomeMissao(mo) }))) return;
            M.desfazer(p, mo.id, dia); render(); return;
          }
          const r = M.entregar(p, mo, dia); if (!r) return;
          M.moedaSom();
          if (r.premio === 20) { M.confetti(60); M.feedback('bau-aberto', t('treasure_found'), p.premios[20], 3000); }
          else if (r.premio) { M.confetti(40); M.feedback('bau', t('prize_reached', { c: r.premio, p: p.premios[r.premio] || '' }), '', 2600); }
          else if (r.rara) { M.confetti(25); M.feedback('moeda-rara', t('deliver_rare', { n: r.seguidos }), moedasTxt(r.reg.c), 1800); }
          else M.feedback(mo.dificil ? 'moeda-esforco' : 'moeda-cumprida', t('deliver_ok'), moedasTxt(r.reg.c), 1200);
          render();
        });
        lista.appendChild(it);
      }); });
    }
    w.querySelector('#d-dia').addEventListener('change', e => { dia = e.target.value || M.HOJE(); render(); });
    render(); $('screen').appendChild(w);
  };

  // missões
  routes.missions = function () {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('m_title')); const lim = M.LIMITES();
    const w = el(`<div>${sign(t('m_title'))}<div class="card"><p class="muted">${esc(t('m_hint'))}${!M.isPremium() ? ' ' + esc(t('m_free_limit')) : ''}</p><div class="list" id="m-atual"></div></div>
      <div class="card"><h3>${esc(t('m_custom'))}</h3>${dica(t('m_tip_t'), t('m_tip'))}<input class="in" id="m-txt" maxlength="60" placeholder="${esc(t('m_custom_ph'))}" ${lim.custom ? '' : 'disabled'}><label class="row" style="font-weight:700"><input type="checkbox" id="m-dif"> ${esc(t('m_hard'))}</label><div class="btn-row"><button class="btn" id="m-add" ${lim.custom ? '' : 'disabled'}>${esc(t('m_custom'))}</button></div>${lim.custom ? '' : `<p class="muted small">${esc(t('locked'))}</p>`}</div>
      <div class="card" id="m-cat"></div>${foot()}</div>`);
    const atual = w.querySelector('#m-atual');
    function render() {
      atual.innerHTML = '';
      // O kit diz que missão difícil é a que custa mais ÀQUELA criança: quem decide é o adulto, não
      // o catálogo. O catálogo só sugere o valor inicial; aqui ele pode ser trocado a qualquer hora.
      // Moedas já entregues guardam a base com que foram ganhas (não mudam retroativamente).
      p.missoes.forEach((m, i) => { const mo = missaoObj(m); const it = el(`<div class="item">${icone(mo)}<div class="tx">${esc(M.nomeMissao(mo))}<label class="row small" style="font-weight:600;cursor:pointer"><input type="checkbox" data-dif ${m.dificil ? 'checked' : ''}> ${esc(t('m_hard_toggle'))}</label></div><button class="x" aria-label="✕">✕</button></div>`);
        it.querySelector('[data-dif]').addEventListener('change', e => { m.dificil = e.target.checked; M.salvarPirata(p); });
        it.querySelector('button').addEventListener('click', () => { p.missoes.splice(i, 1); M.salvarPirata(p); render(); renderCat(); }); atual.appendChild(it); });
      if (!p.missoes.length) atual.innerHTML = `<p class="muted">${esc(t('today_none'))}</p>`;
    }
    const cat = w.querySelector('#m-cat');
    function renderCat() {
      cat.innerHTML = '';
      CATS.forEach(c => { const bloco = el(`<div><h3>${esc(t('m_cat_' + c))}</h3><div class="chips"></div></div>`); const chips = bloco.querySelector('.chips');
        MISSOES.filter(m => m.cat === c).forEach(m => { const on = p.missoes.some(x => x.id === m.id); const b = el(`<button class="chip${on ? ' on' : ''}${m.dificil ? ' hard' : ''}">${icone(m)}${esc(m.t[LANG])}</button>`); b.addEventListener('click', () => { if (on) p.missoes = p.missoes.filter(x => x.id !== m.id); else { if (p.missoes.length >= lim.missoes) { M.feedback('pergaminho-mapa', t('ob_max'), M.isPremium() ? '' : t('m_free_limit'), 2200); return; } p.missoes.push({ id: m.id, dificil: !!m.dificil }); } M.save(); render(); renderCat(); }); chips.appendChild(b); });
        cat.appendChild(bloco); });
    }
    w.querySelector('#m-add').addEventListener('click', () => { const txt = w.querySelector('#m-txt').value.trim(); if (!txt) return; if (p.missoes.length >= lim.missoes) { M.feedback('pergaminho-mapa', t('ob_max')); return; } p.missoes.push({ id: 'c' + Date.now().toString(36), custom: true, txt, img: 'ic-star', dificil: w.querySelector('#m-dif').checked }); w.querySelector('#m-txt').value = ''; M.salvarPirata(p); render(); });
    render(); renderCat(); $('screen').appendChild(w);
  };

  // valores e recompensas
  routes.values = function () {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('v_title'));
    const w = el(`<div>${sign(t('v_title'))}<div class="card">
      <div class="list"><div class="item">${img('moeda-cumprida')}<div class="tx">${esc(t('v_missao'))}</div><b>1</b></div><div class="item">${img('moeda-esforco')}<div class="tx">${esc(t('v_dificil'))}</div><b>2</b></div><div class="item">${img('moeda-rara')}<div class="tx">${esc(t('v_rara'))}</div><b>×2</b></div></div><p class="muted small">${esc(t('v_rara_retro'))}</p>
      <h3>${esc(t('v_prizes'))}</h3><div class="list" id="v-prizes"></div>
      <ol style="padding-left:20px;line-height:1.5"><li>${esc(t('v_rule1'))}</li><li>${esc(t('v_rule2'))}</li><li>${esc(t('v_rule3'))}</li></ol></div>
      <div class="card"><h3>${esc(t('v_ideas'))}</h3><div class="chips">${RECOMPENSAS.map(r => `<span class="chip tag">${img(r.img || 'ic-star')}${esc(r.t[LANG])}</span>`).join('')}</div>
        <h3>${esc(t('v_age_t'))}</h3><div class="dicas">${dica('4–5', t('v_age_4'))}${dica('6–8', t('v_age_6'))}</div></div>${foot()}</div>`);
    const pr = w.querySelector('#v-prizes');
    [5, 10, 20].forEach(c => { const it = el(`<div class="item premio">${img(c === 20 ? 'bau-praia' : 'moeda-bonus')}<div class="tx">${esc(t(c === 5 ? 'r_small' : c === 10 ? 'r_mid' : 'r_big'))}</div></div>`); const inp = el(`<input class="in" maxlength="60" value="${esc(p.premios[c] || '')}" placeholder="${esc(t('v_edit_prize'))}" style="margin:0">`); it.querySelector('.tx').appendChild(inp); inp.addEventListener('change', () => { p.premios[c] = inp.value.trim(); if (c === 20) p.tesouro = p.premios[20]; M.salvarPirata(p); }); pr.appendChild(it); });
    $('screen').appendChild(w);
  };

  // missão telas
  routes.screen = function () {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('s_title'));
    const w = el(`<div>${sign(t('s_title'), t('s_sub'))}<div class="card">
      <div class="row">${img('moeda-ouro', 'ic')}<b>1 =</b><input type="number" class="in" id="s-min" min="5" max="120" step="5" value="${p.telaMin}" style="width:90px;margin:0"><b>min</b></div><p class="muted small">${esc(t('s_rate_hint'))}</p>
      <p><b id="s-bal"></b></p>
      <div class="row"><input type="number" class="in" id="s-n" min="1" value="1" style="width:80px;margin:0"><input class="in" id="s-uso" placeholder="${esc(t('s_used_ph'))}" style="flex:1;margin:0"></div>
      <div class="btn-row"><button class="btn btn-gold full" id="s-go"></button></div>
      <p class="muted small">${esc(t('s_rule'))}</p></div>
      <div class="card">${dica(t('s_tip_t'), t('s_tip'))}</div>
      <div class="card"><h3>${esc(t('s_log'))}</h3><div class="list" id="s-log"></div></div>${foot()}</div>`);
    const nIn = w.querySelector('#s-n'), minIn = w.querySelector('#s-min'), bal = w.querySelector('#s-bal'), goB = w.querySelector('#s-go'), log = w.querySelector('#s-log');
    function render() { const s = M.saldo(p), n = Math.max(1, parseInt(nIn.value, 10) || 1); bal.textContent = t('s_balance', { n: s }); goB.textContent = t('s_spend', { n, m: n * p.telaMin }); goB.disabled = s < n; log.innerHTML = p.gastos.slice(-14).reverse().map(g => `<div class="item">${img('ic-tv')}<div class="tx">${g.d} · ${esc(moedasTxt(g.c))} → ${g.min} min<small>${esc(g.uso || '')}</small></div></div>`).join('') || `<p class="muted">${esc(t('s_none'))}</p>`; }
    minIn.addEventListener('change', () => { p.telaMin = Math.max(5, parseInt(minIn.value, 10) || 15); M.salvarPirata(p); render(); }); nIn.addEventListener('input', render);
    goB.addEventListener('click', () => { const n = Math.max(1, parseInt(nIn.value, 10) || 1); if (!M.gastar(p, n, w.querySelector('#s-uso').value.trim())) { M.feedback('ic-tv', t('screen_no_balance'), '', 2200); render(); return; } w.querySelector('#s-uso').value = ''; render(); });
    render(); $('screen').appendChild(w);
  };

  // missão escola
  routes.school = function () {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('e_title'));
    const hoje = M.HOJE(); const dow = new Date().getDay(); const seg = M.diaMais(hoje, -((dow + 6) % 7));
    const dias = [0, 1, 2, 3, 4].map(i => M.diaMais(seg, i)); const DN = { pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }[LANG];
    const w = el(`<div>${sign(t('e_title'), t('e_sub'))}<div class="card">
      <div class="list"><div class="item">${img('ic-backpack')}<div class="tx">${esc(t('e_bag'))}<small>${esc(t('e_bag_items'))}</small></div></div><div class="item">${img('ic-book')}<div class="tx">${esc(t('e_hw'))}<small>${esc(t('e_hw_steps'))}</small></div></div><div class="item">${img('moeda-rara')}<div class="tx"><small>${esc(t('e_note'))}</small></div></div></div></div>
      <div class="card" id="e-print"><h2>${esc(t('e_agree'))}</h2><p class="muted small">${esc(t('e_agree_hint'))}</p>
      <input class="in" id="e-c0" maxlength="60" placeholder="${esc(t('e_agree_ph'))} 1" value="${esc(p.escola.comb[0] || '')}"><input class="in" id="e-c1" maxlength="60" placeholder="${esc(t('e_agree_ph'))} 2" value="${esc(p.escola.comb[1] || '')}">
      <div class="week" id="e-week"></div><p class="center small"><span class="pill">${esc(t('e_sign'))}</span></p>
      <div class="btn-row"><button class="btn" id="e-pr">${esc(t('e_print'))}</button></div>
      <p class="muted small">${esc(t('e_pdf_hint'))}</p></div>${foot()}</div>`);
    const wk = w.querySelector('#e-week'); wk.style.gridTemplateColumns = 'repeat(5,1fr)';
    dias.forEach((d, i) => { const on = !!p.escola.dias[d]; const c = el(`<div class="${on ? 'on' : ''}"><b>${on ? '★' : '·'}</b>${DN[i]}</div>`); c.addEventListener('click', () => { p.escola.dias[d] = !p.escola.dias[d]; M.salvarPirata(p); go('school', null, true); }); wk.appendChild(c); });
    ['#e-c0', '#e-c1'].forEach((s, i) => w.querySelector(s).addEventListener('change', e => { p.escola.comb[i] = e.target.value.trim(); M.salvarPirata(p); }));
    w.querySelector('#e-pr').addEventListener('click', () => window.print());
    $('screen').appendChild(w);
  };

  // diário de bordo
  routes.report = function () {
    const p = M.pirataAtivo(); if (!p) return go('onboarding', null, true);
    setTitle(t('rep_title'));
    const hoje = M.HOJE(); const dias = [6, 5, 4, 3, 2, 1, 0].map(i => M.diaMais(hoje, -i));
    const porDia = dias.map(d => p.log.filter(x => x.d === d).reduce((s, x) => s + x.c, 0));
    const total = porDia.reduce((a, b) => a + b, 0), comMoeda = porDia.filter(x => x > 0).length;
    const cont = {}; p.log.filter(x => dias.includes(x.d)).forEach(x => { cont[x.m] = (cont[x.m] || 0) + 1; });
    const nomes = id => { const m = p.missoes.find(x => x.id === id); return m ? M.nomeMissao(missaoObj(m)) : id; };
    const ord = p.missoes.map(m => [m.id, cont[m.id] || 0]).sort((a, b) => b[1] - a[1]);
    // Histórico além de 7 dias (20/10/2026): as últimas 4 semanas, semana a semana, e o total
    // desde a primeira moeda. A família vê a tendência, não só o retrato de uma semana.
    const semanas = [3, 2, 1, 0].map(i => { const fim = M.diaMais(hoje, -7 * i), ini = M.diaMais(fim, -6); const regs = p.log.filter(x => x.d >= ini && x.d <= fim); return { ini, fim, moedas: regs.reduce((s, x) => s + x.c, 0), dias: new Set(regs.map(x => x.d)).size }; });
    const maxSem = Math.max(1, ...semanas.map(s => s.moedas));
    const primeiro = p.log.length ? p.log.reduce((m, x) => (x.d < m ? x.d : m), p.log[0].d) : '';
    const diasDesde = primeiro ? Math.round((new Date(hoje) - new Date(primeiro)) / 864e5) + 1 : 0;
    const fmtD = d => d.slice(8) + '/' + d.slice(5, 7);
    const nv = M.nivel(p);
    $('screen').appendChild(el(`<div>${sign(t('rep_title'), t('rep_week'))}<div class="card">
      <div class="week">${dias.map((d, i) => `<div class="${porDia[i] ? 'on' : ''}"><b>${porDia[i] || '·'}</b>${fmtD(d)}</div>`).join('')}</div>
      <div class="row">${img('moeda-ouro', 'ic')}<b>${total}</b> ${esc(t('rep_coins'))} · <b>${comMoeda}</b> ${esc(t('rep_days'))}</div>
      ${ord.length && total ? `<p class="small">${esc(t('rep_best'))}: <b>${esc(nomes(ord[0][0]))}</b> (${ord[0][1]})<br>${esc(t('rep_hard'))}: <b>${esc(nomes(ord[ord.length - 1][0]))}</b> (${ord[ord.length - 1][1]})</p>` : `<p class="muted">${esc(t('rep_none'))}</p>`}
      ${total ? `<p class="muted small">${esc(comMoeda <= 2 ? t('rep_tip_low') : t('rep_tip_ok'))}</p>` : ''}</div>
      ${p.log.length ? `<div class="card"><h2>${esc(t('rep_month'))}</h2><div class="semanas">${semanas.map(s => `<div class="${s.moedas ? 'on' : ''}"><i style="height:${Math.round(s.moedas / maxSem * 100)}%"></i><b>${s.moedas || '·'}</b><small>${fmtD(s.ini)}–${fmtD(s.fim)}</small></div>`).join('')}</div>
        <p class="muted small">${esc(t('rep_month_hint'))}</p></div>
      <div class="card"><h2>${esc(t('rep_total'))}</h2><div class="row">${img(nv.img, 'ic')}<div class="tx"><b>${esc(t('rep_total_line', { c: M.ganhas(p), d: diasDesde, v: p.viagens || 1 }))}</b><small>${esc(t('lvl_label', { n: nv.nome }))}${nv.faltam ? ' · ' + esc(t('lvl_next', { f: nv.faltam, n: nv.proximo })) : ''}</small></div></div></div>` : ''}${foot()}</div>`));
  };

  // kit
  // O kit em PDF NÃO é servido pelo site: a entrega é feita pela plataforma de pagamento, junto com
  // o código de ativação (decisão de 27/09/2026). Antes, os 6 PDFs ficavam em /app/kit/, acessíveis
  // por URL a quem nunca pagou — o produto inteiro estava aberto. Os arquivos moraram em
  // entregaveis/kit/, fora da pasta publicada (netlify.toml: publish = "web").
  routes.kit = function () {
    setTitle(t('kit_title'));
    const itens = ['kit_full', 'kit_guide', 'kit_calm', 'kit_school', 'kit_b1', 'kit_b2'];
    const icones = { kit_full: 'bau-aberto', kit_guide: 'pergaminho-mapa', kit_calm: 'papagaio', kit_school: 'ic-backpack', kit_b1: 'moeda-coragem', kit_b2: 'moeda-dia' };
    $('screen').appendChild(el(`<div>${sign(t('kit_title'))}
      <div class="card"><div class="hero-pirata">${img('bau-aberto', '')}<div class="balao">${esc(t('kit_email'))}</div></div>
        <p class="muted">${esc(t('kit_hint'))}</p>
        <div class="list">${itens.map(k => `<div class="item">${img(icones[k])}<div class="tx">${esc(t(k))}</div><span class="pill">PDF</span></div>`).join('')}</div>
        <p class="muted small">${esc(t('kit_lost'))}</p></div>${foot()}</div>`));
  };

  // guia
  routes.guide = function () {
    setTitle(t('p_guide'));
    $('screen').appendChild(el(`<div>${sign(t('p_guide'), t('p_guide_s'))}<div class="card"><div class="hero-pirata">${img('pirata', '')}<div class="balao">${esc(GUIA[LANG][0][1])}</div></div><ol style="padding-left:20px;line-height:1.5">${GUIA[LANG].slice(1).map(([h, b]) => `<li style="margin-bottom:8px"><b>${esc(h)}.</b> ${esc(b)}</li>`).join('')}</ol></div>
      <div class="card"><h2>${esc(t('faq_title'))}</h2><div>${FAQ[LANG].map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div>
      <div class="card mar"><h3>${esc(CRISE[LANG].titulo)}</h3><ul style="padding-left:18px;line-height:1.45">${CRISE[LANG].faz.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="small"><b>✕</b> ${CRISE[LANG].evita.map(esc).join(' · ')}</p></div>${foot()}</div>`));
  };

  // o que dizer: falas prontas para os momentos que mais travam (conteúdo de 09/10/2026, data.js → FRASES)
  routes.phrases = function () {
    setTitle(t('p_phrases'));
    $('screen').appendChild(el(`<div>${sign(t('p_phrases'), t('p_phrases_s'))}
      <div class="card"><div class="hero-pirata">${img('papagaio', '')}<div class="balao">${esc(t('calm_adult'))}</div></div></div>
      <div>${FRASES[LANG].map(([mom, faz, diga, pq]) => `<details class="card faq"><summary>${esc(mom)}</summary><p class="muted small" style="padding-bottom:6px">${esc(faz)}</p><p style="font-weight:800;color:var(--madeira-esc)">${esc(diga)}</p><p class="muted small">${esc(pq)}</p></details>`).join('')}</div>${foot()}</div>`));
  };

  // piratas
  routes.pirates = function () {
    setTitle(t('pir_title')); const lim = M.LIMITES();
    const w = el(`<div>${sign(t('pir_title'))}<div class="card"><div class="list" id="pl"></div><div class="btn-row"><button class="btn" id="p-add" ${M.state.piratas.length >= lim.piratas ? 'disabled' : ''}>${esc(t('pir_add'))}</button></div>${!M.isPremium() ? `<p class="muted small">${esc(t('pir_free'))}</p>` : ''}</div>
      <div class="card">${dica(t('p_pirates'), t('pir_siblings'))}</div>${foot()}</div>`);
    const pl = w.querySelector('#pl');
    M.state.piratas.forEach(p => { const on = p.id === M.state.ativo; const it = el(`<div class="item${on ? ' done' : ''}">${img('pirata-mini')}<div class="tx">${esc(p.nome)}<small>${esc(moedasTxt(M.ganhas(p)))} · ${M.casa(p)}/20 · ${on ? esc(t('pir_active')) : ''}</small></div><button data-a="use">${esc(t('pir_switch'))}</button><button data-a="rm" class="x">✕</button>${M.casa(p) >= 20 ? `<button data-a="new">${esc(t('new_map'))}</button>` : ''}</div>`);
      it.querySelector('[data-a=use]').addEventListener('click', () => { M.state.ativo = p.id; M.save(); M.atualizaMoedas(); go('pirates', null, true); });
      it.querySelector('[data-a=rm]').addEventListener('click', () => { if (!confirm(t('pir_confirm', { n: p.nome }))) return; M.removerPirata(p.id); M.atualizaMoedas(); go(M.state.piratas.length ? 'pirates' : 'onboarding', null, true); });
      const nb = it.querySelector('[data-a=new]'); if (nb) nb.addEventListener('click', () => { M.state.ativo = p.id; go('newmap'); });
      pl.appendChild(it); });
    w.querySelector('#p-add').addEventListener('click', () => go('onboarding', { extra: true }));
    $('screen').appendChild(w);
  };
  routes.newmap = function () {
    const p = M.pirataAtivo(); setTitle(t('new_map'));
    const w = el(`<div>${sign(t('new_map'))}<div class="card"><div class="hero-pirata">${img('bau-aberto', '')}<div class="balao">${esc(t('new_map_hint'))}</div></div><label class="lbl">${esc(t('ob_treasure'))}</label><input class="in" id="n-tes" maxlength="60" value="${esc(p.tesouro || '')}"><div class="btn-row"><button class="btn btn-gold full" id="n-ok">${esc(t('start'))}</button></div></div></div>`);
    w.querySelector('#n-ok').addEventListener('click', () => { p.viagemBase = M.ganhas(p); p.viagens = (p.viagens || 1) + 1; p.tesouro = w.querySelector('#n-tes').value.trim() || p.tesouro; p.premios[20] = p.tesouro; M.salvarPirata(p); M.confetti(); go('home', null, true); });
    $('screen').appendChild(w);
  };

  // acesso completo / ativação
  routes.full = function () {
    setTitle(t('full_title')); const C = M.CFG;
    const w = el(`<div>${sign(t('full_title'))}<div class="card"><div class="hero-pirata">${img(M.isPremium() ? 'bau-aberto' : 'bau', '')}<div class="balao">${esc(M.isPremium() ? t('full_active') : t('full_hint'))}</div></div>
      ${M.isPremium() ? '' : `<p style="margin:10px 0;line-height:1.5">${esc(t('full_list'))}</p><p class="center"><b class="preco">${esc(C.priceLabel || "")}</b></p>
        <div class="btn-row">${C.checkoutUrl ? `<a class="btn btn-gold full" href="${esc(C.checkoutUrl)}" target="_blank" rel="noopener">${esc(t('full_buy'))}</a>` : `<button class="btn btn-gold full" disabled>${esc(t('full_buy'))}</button>`}<button class="btn btn-ghost full" id="f-code">${esc(t('full_have'))}</button></div>${C.checkoutUrl ? '' : `<p class="muted small center">${esc(t('full_no_url'))}</p>`}`}
      </div>${foot()}</div>`);
    const fc = w.querySelector('#f-code'); if (fc) fc.addEventListener('click', () => go('ativar'));
    $('screen').appendChild(w);
  };
  routes.ativar = function (codigoInicial) {
    setTitle(t('full_have'));
    const w = el(`<div>${sign(t('full_have'))}<div class="card"><input type="text" id="cod" class="in" placeholder="${esc(t('code_ph'))}" autocapitalize="characters" autocomplete="off" spellcheck="false" value="${esc(codigoInicial || '')}"><div class="btn-row"><button class="btn btn-gold full" id="cod-ok">${esc(t('activate'))}</button></div><p class="muted small" id="cod-msg"></p></div></div>`);
    const inp = w.querySelector('#cod'), msg = w.querySelector('#cod-msg');
    const tenta = async () => { msg.textContent = '…'; const ok = await M.validarCodigo(inp.value); if (ok) { M.setPremium(true); M.confetti(); M.feedback('bau-aberto', t('code_ok'), '', 1800); setTimeout(() => go('parent', null, true), 1500); } else { msg.textContent = t('code_bad'); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); } };
    w.querySelector('#cod-ok').addEventListener('click', tenta); inp.addEventListener('keydown', e => { if (e.key === 'Enter') tenta(); });
    $('screen').appendChild(w); if (codigoInicial) tenta();
  };

  // ajustes
  routes.settings = function () {
    setTitle(t('p_settings'));
    const w = el(`<div>${sign(t('p_settings'))}<div class="card">
      <label class="lbl">${esc(t('set_lang'))}</label><div class="chips">${LANGS.map(l => `<button class="chip${l === LANG ? ' on' : ''}" data-lang="${l}">${esc(t('lang_' + l))}</button>`).join('')}</div>
      <label class="lbl">${esc(t('set_pin'))}</label><input class="in" id="st-pin" inputmode="numeric" maxlength="4" placeholder="${esc(t('set_pin_ph'))}" value="${esc(M.state.pin || '')}">
      <label class="lbl">${esc(t('rem_label'))}</label><input class="in" id="st-rem" type="time" value="${esc(M.LEMBRETE.hora())}">
      <p class="muted small" id="st-rem-msg">${esc(t('rem_hint'))}</p>
      <div class="btn-row"><button class="btn btn-ghost" id="st-rem-cal" ${M.LEMBRETE.hora() ? '' : 'disabled'}>${esc(t('rem_cal'))}</button><button class="btn btn-ghost" id="st-rem-off">${esc(t('rem_off'))}</button></div>
      <p class="muted small">${esc(t('rem_cal_hint'))}</p>
      <label class="lbl">${esc(t('set_copy'))}</label>
      <p class="muted small">${esc(t('set_privacy'))} ${esc(t('set_copy_hint'))}</p>
      <div class="btn-row"><button class="btn btn-ghost" id="st-exp">${esc(t('set_export'))}</button>${navigator.share ? `<button class="btn btn-ghost" id="st-share">${esc(t('set_share'))}</button>` : ''}<label class="btn btn-ghost" style="text-align:center">${esc(t('set_import'))}<input type="file" accept="application/json" id="st-imp" hidden></label></div>
      ${(bi => bi ? `<p class="muted small" id="st-bak-info">${esc(t('bak_hint', { d: bi.t ? new Date(bi.t).toLocaleString(LOCALE_IDIOMA[LANG], { dateStyle: 'short', timeStyle: 'short' }) : '—', nomes: bi.piratas.join(', '), n: bi.entregas }))}</p><div class="btn-row"><button class="btn btn-ghost" id="st-bak">${esc(t('bak_btn'))}</button><button class="btn btn-ghost" id="st-bak-del">${esc(t('bak_del'))}</button></div>` : '')(M.BAK.info())}
      <p class="muted small">${esc(t('set_reset_scope'))}</p>
      <div class="btn-row"><button class="btn btn-red full" id="st-reset">${esc(t('set_reset'))}</button></div></div>${foot()}</div>`);
    w.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { M.setLang(b.dataset.lang); go('settings', null, true); }));
    w.querySelector('#st-pin').addEventListener('change', e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); M.setPin(v.length === 4 ? v : ''); e.target.value = M.state.pin; });
    const remMsg = w.querySelector('#st-rem-msg');
    w.querySelector('#st-rem').addEventListener('change', async e => {
      const v = e.target.value;
      if (!v) { M.LEMBRETE.set(''); remMsg.textContent = t('rem_hint'); return; }
      const perm = await M.LEMBRETE.pedirPermissao();
      M.LEMBRETE.set(v);
      // Guardamos a hora mesmo sem permissão: o aviso dentro do app continua valendo.
      remMsg.textContent = perm === 'granted' ? t('rem_on', { h: v }) : t('rem_denied', { h: v });
      w.querySelector('#st-rem-cal').disabled = false;
    });
    w.querySelector('#st-rem-off').addEventListener('click', () => { M.LEMBRETE.set(''); w.querySelector('#st-rem').value = ''; remMsg.textContent = t('rem_hint'); w.querySelector('#st-rem-cal').disabled = true; });
    // Lembrete no calendário do aparelho: o único que toca com o app fechado. Gera o .ics na hora.
    const baixar = (conteudo, tipo, nome) => { const blob = new Blob([conteudo], { type: tipo }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); };
    w.querySelector('#st-rem-cal').addEventListener('click', () => {
      const h = M.LEMBRETE.hora(); if (!h) return;
      const p = M.pirataAtivo();
      baixar(M.LEMBRETE.ics(h, p ? p.nome : ''), 'text/calendar;charset=utf-8', 'lembrete-mapa-do-tesouro.ics');
      M.feedback('moeda-dia', t('rem_cal_done'), t('rem_cal_done_s'), 3200);
    });
    const nomeCopia = () => 'mapa-do-tesouro-' + M.HOJE() + '.json';
    w.querySelector('#st-exp').addEventListener('click', () => baixar(M.BACKUP.gerar(), 'application/json', nomeCopia()));
    // Mesma cópia, pela folha de compartilhar do celular (WhatsApp, e-mail, AirDrop): é o jeito
    // simples de levar o mapa para o celular do outro responsável, sem conta nem servidor.
    const sh = w.querySelector('#st-share'); if (sh) sh.addEventListener('click', async () => {
      if (!confirm(t('set_share_warn'))) return; // a cópia leva nome, moedas e PIN: avisar antes de sair do aparelho
      try { const f = new File([M.BACKUP.gerar()], nomeCopia(), { type: 'application/json' });
        if (navigator.canShare && !navigator.canShare({ files: [f] })) throw new Error('arquivo');
        await navigator.share({ files: [f], title: M.BRAND, text: t('set_share_text') }); }
      catch (e) { if (e && e.name !== 'AbortError') baixar(M.BACKUP.gerar(), 'application/json', nomeCopia()); }
    });
    w.querySelector('#st-imp').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; let j = null; try { j = JSON.parse(await f.text()); } catch (err) { j = null; }
      const v = M.validarBackup(j); e.target.value = '';
      if (!v.ok) { M.feedback('pergaminho-mapa', t(v.motivo === 'vazio' ? 'imp_empty' : v.motivo === 'versao' ? 'imp_newer' : 'imp_bad'), '', 3000); return; }
      const atuais = M.state.piratas.map(p => p.nome).join(', ') || '—';
      if (!confirm(t('imp_confirm', { novos: v.piratas.join(', '), n: v.entregas, atuais }))) return;
      // Só anuncia sucesso depois de a gravação confirmar; se falhou, nada mudou (tela, disco, cópia anterior).
      if (!M.importar(j.state)) { falhouGravar(); return; }
      M.atualizaMoedas(); M.feedback('bau', t('imp_done', { n: v.entregas }), '', 2200); go('parent', null, true); });
    // Sem espaço para guardar o que está aqui como cópia anterior, a importação não acontece.
    // Oferece levar esse estado para fora do navegador (arquivo), para a família liberar espaço e tentar de novo.
    function falhouGravar() {
      M.feedback('pergaminho-mapa', t('imp_fail'), '', 4000);
      if (M.state.piratas.length && confirm(t('imp_fail_export'))) baixar(M.BACKUP.gerar(), 'application/json', nomeCopia());
    }
    const bak = w.querySelector('#st-bak'); if (bak) bak.addEventListener('click', () => {
      const bi = M.BAK.info(); if (!bi) return go('settings', null, true);
      if (!confirm(t('bak_confirm', { nomes: bi.piratas.join(', '), n: bi.entregas, atuais: M.state.piratas.map(p => p.nome).join(', ') || '—' }))) return;
      if (!M.BAK.restaurar()) { falhouGravar(); return; }
      M.atualizaMoedas(); M.feedback('bau', t('bak_done'), t('bak_done_s'), 3200); go('parent', null, true);
    });
    const bakDel = w.querySelector('#st-bak-del'); if (bakDel) bakDel.addEventListener('click', () => {
      if (!confirm(t('bak_del_confirm'))) return;
      M.BAK.apagar(); go('settings', null, true);
    });
    w.querySelector('#st-reset').addEventListener('click', () => {
      if (!confirm(t('set_reset_confirm'))) return;
      // Se o navegador recusar gravar, nada foi apagado: a tela fica onde está e diz isso.
      if (!M.resetar()) { M.feedback('pergaminho-mapa', t('set_reset_fail'), '', 4000); return; }
      M.fecharGate(); M.atualizaMoedas(); go('onboarding', null, true);
    });
    $('screen').appendChild(w);
  };
})();
