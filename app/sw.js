// Service Worker — cache-first para funcionar offline (tudo local, inclusive fontes).
// Os PDFs do kit não são servidos por aqui: desde 27/09/2026 moram em entregaveis/kit/, fora da
// pasta publicada, e a entrega é feita pela plataforma de pagamento junto com o código de ativação.
let VERSAO = '0.1.0'; try { importScripts('./config.js'); VERSAO = (self.APP_CONFIG && self.APP_CONFIG.version) || VERSAO; } catch (e) { /* mantém a versão fixa */ }
const CACHE = 'tesouro-v' + VERSAO;
const ASSETS = ['./', './index.html', './manifest.json', './config.js', './css/styles.css', './fonts/fonts.css',
  './fonts/baloo2-latin.woff2', './fonts/baloo2-latin-ext.woff2', './fonts/fredoka-latin.woff2', './fonts/fredoka-latin-ext.woff2',
  './js/i18n.js', './js/data.js', './js/app.js', './js/rotas.js', './js/sw-registro.js', './codigos.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-48.png',
  './img/bau-aberto.png', './img/bau-praia.png', './img/bau.png', './img/ic-art.png', './img/ic-backpack.png', './img/ic-bath.png', './img/ic-bed-n.png', './img/ic-bed.png', './img/ic-book-n.png', './img/ic-book.png', './img/ic-calendar.png', './img/ic-clothes.png', './img/ic-ferris.png', './img/ic-food.png', './img/ic-friends.png', './img/ic-pajamas.png', './img/ic-pasta.png', './img/ic-popcorn.png', './img/ic-shower.png', './img/ic-star.png', './img/ic-tooth-n.png', './img/ic-tooth.png', './img/ic-toys.png', './img/ic-tv.png', './img/ilha-calma.png', './img/logo.png', './img/mapa-ilha.png', './img/mapa-mini.png', './img/moeda-bau.png', './img/moeda-bonus.png', './img/moeda-coragem.png', './img/moeda-cumprida.png', './img/moeda-dia.png', './img/moeda-esforco.png', './img/moeda-foco.png', './img/moeda-ouro.png', './img/moeda-rara.png', './img/navio.png', './img/papagaio.png', './img/pergaminho-mapa.png', './img/pirata-lanterna.png', './img/pirata-mini.png', './img/pirata.png', './img/sol.png', './img/fundo.jpg',
  // pranchas grandes (certificado da casa 20 e Pirata em Missão). Ficaram
  // fora do cache inicial até 05/10/2026 e a família offline não via o certificado no dia do tesouro.
  './img/certificado.png', './img/pirata-em-missao.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
// Limpeza restrita ao prefixo deste app (revisão de 25/11/2026). Antes apagava TODO cache da origem
// com nome diferente do atual; no GitHub Pages a origem é compartilhada por todos os projetos do
// usuário, e o Mapa do Tesouro apagava o cache dos outros.
const PREFIXO = 'tesouro-v';
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIXO) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// ignoreSearch: um "?v=" ou "?lang=pt" na URL não pode impedir o match com o arquivo guardado.
const doCache = req => caches.match(req, { ignoreSearch: true });
// config.js e codigos.json: rede primeiro, mas só uma resposta boa (2xx) substitui a guardada, e um
// erro HTTP (500, 404 temporário) devolve a última boa em vez de entregar o erro ao app.
const redePrimeiro = req => fetch(req).then(r => {
  if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }
  return doCache(req).then(cached => cached || r);
}).catch(() => doCache(req).then(cached => cached || new Response('', { status: 504, statusText: 'offline' })));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (/codigos\.json$|config\.js$/.test(url.pathname)) { e.respondWith(redePrimeiro(e.request)); return; }
  e.respondWith(doCache(e.request).then(cached => cached || fetch(e.request).then(resp => { if (resp && resp.ok && url.origin === location.origin) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return resp; }).catch(() => { if (e.request.mode === 'navigate') return caches.match('./index.html'); return new Response('', { status: 504, statusText: 'offline' }); })));
});
