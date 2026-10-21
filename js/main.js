// ===== Contagem regressiva =====
// Ajustar aqui quando o horário da cerimônia for definido (hoje: meia-noite, horário de Brasília)
const DATA_CASAMENTO = new Date('2027-03-06T00:00:00-03:00');

const els = {
  dias: document.getElementById('cdDias'),
  horas: document.getElementById('cdHoras'),
  min: document.getElementById('cdMin'),
};

function atualizarContagem() {
  const diff = DATA_CASAMENTO - new Date();

  if (diff <= 0) {
    els.dias.textContent = '0';
    els.horas.textContent = '00';
    els.min.textContent = '00';
    return;
  }

  const seg = Math.floor(diff / 1000);
  els.dias.textContent = Math.floor(seg / 86400);
  els.horas.textContent = String(Math.floor((seg % 86400) / 3600)).padStart(2, '0');
  els.min.textContent = String(Math.floor((seg % 3600) / 60)).padStart(2, '0');
}

atualizarContagem();
setInterval(atualizarContagem, 1000);

// ===== Menu mobile =====
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => links.classList.toggle('is-open'));
links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') links.classList.remove('is-open');
});

// ===== RSVP + card "Onde" =====
// O endpoint é um App da Web do Apps Script preso à planilha "casamento".
// A chave não é segredo (fica visível aqui) — serve pra barrar robô que acha
// a URL varrendo a internet, não quem lê este arquivo.
const RSVP_URL   = 'https://script.google.com/macros/s/AKfycbxqi6StnXehf2qvmKgNCXJ1zPC74REGD5XH_H0EoiVQH4pPqcAR_ereT1AL1ObSFFc/exec';
const RSVP_CHAVE = '6u96XvGyPwSW2unH6bNjbMx2u9eH';

const MAPS_URL    = 'https://www.google.com/maps/search/?api=1&query=Fazenda+Brisa+do+Mar%2C+Palho%C3%A7a+-+SC';
const GALERIA_URL = 'https://fazendabrisadomar.com.br/galeria/';

const modal = document.getElementById('modal');
const modalCaixa = modal.querySelector('.modal__caixa');
const modalCorpo = document.getElementById('modalCorpo');
let focoAnterior = null;
let avisoTimer = null;

const passarinhos = '<div class="modal__art" aria-hidden="true"><img src="assets/img/lovebirds-indigo.png" alt=""></div>';

const miniMapa = `
  <div class="opcao__capa" aria-hidden="true">
    <svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid slice">
      <path d="M-10 96 C 60 82 120 104 180 88 C 240 72 280 84 310 74 L310 140 L-10 140 Z" fill="#93A6BE" opacity=".55"/>
      <path d="M-10 104 C 60 92 120 112 180 98 C 240 84 280 94 310 84" fill="none" stroke="#64789B" stroke-width="1.2" opacity=".7"/>
      <path d="M-10 40 C 70 34 110 58 170 52 C 230 46 260 30 310 36" fill="none" stroke="#87947A" stroke-width="2" opacity=".55"/>
      <path d="M40 -10 C 52 40 96 62 118 132" fill="none" stroke="#FBF8F1" stroke-width="7" opacity=".85"/>
      <path d="M40 -10 C 52 40 96 62 118 132" fill="none" stroke="#8C8578" stroke-width="1" stroke-dasharray="5 6" opacity=".5"/>
      <path d="M230 -10 C 214 44 250 78 246 132" fill="none" stroke="#FBF8F1" stroke-width="5" opacity=".7"/>
      <g transform="translate(150 52)">
        <ellipse cx="0" cy="34" rx="10" ry="3" fill="#2C3B54" opacity=".22"/>
        <g class="opcao__pin">
          <path d="M0 30 C -12 14 -13 3 -8 -4 C -3 -12 5 -12 9 -5 C 14 3 12 14 0 30 Z" fill="#3D4F6D"/>
          <circle cx="0.5" cy="2" r="4.2" fill="#FBF8F1"/>
        </g>
      </g>
    </svg>
  </div>`;

function abrirModal(html) {
  focoAnterior = document.activeElement;
  modalCorpo.innerHTML = html;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  modal.hidden = true;
  // reset seco, e não um remove() por modal: assim nenhuma largura vaza pro
  // próximo que abrir, e um modal novo não precisa lembrar de se limpar aqui
  modalCaixa.className = 'modal__caixa';
  rodarPalco();
  document.body.style.overflow = '';
  selecionados = [];
  if (focoAnterior) focoAnterior.focus();
}

// ---- modal do "Onde" ----
function abrirOnde() {
  abrirModal(`
    <div class="modal__pad">
      <h3 class="modal__titulo" id="modalTitulo">Fazenda Brisa do Mar</h3>
      <p class="onde__sub">Estrada Geral do Maciambú<br>Palhoça — SC, 88130-000</p>

      <a class="opcao" href="${MAPS_URL}" target="_blank" rel="noopener">
        ${miniMapa}
        <div class="opcao__corpo">
          <p class="opcao__nome">Ver no mapa</p>
          <p class="opcao__desc">Como chegar na fazenda</p>
        </div>
      </a>

      <a class="opcao" href="${GALERIA_URL}" target="_blank" rel="noopener">
        <div class="opcao__capa" aria-hidden="true"><img src="assets/img/fazenda-espaco.jpg" alt=""></div>
        <div class="opcao__corpo">
          <p class="opcao__nome">Conhecer o espaço</p>
          <p class="opcao__desc">Fotos no site da fazenda</p>
        </div>
      </a>
    </div>`);
}

// ---- modal do Dress Code ----
// O conteúdo mora no <template id="dressCodeTpl"> do index.html, não aqui:
// é o bloco que mais vai mudar, e lá ele fica em HTML legível.
// A exclusividade dos três módulos vem do próprio <details name="dc">.
function abrirDressCode() {
  focoAnterior = document.activeElement;
  modalCaixa.classList.add('modal__caixa--dc');
  modalCorpo.replaceChildren(document.getElementById('dressCodeTpl').content.cloneNode(true));
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

// ---- modal dos presentes ----
// Mesma ideia do dress code: o conteúdo vem do <template> do index.html.
function abrirPresentes() {
  focoAnterior = document.activeElement;
  modalCaixa.classList.add('modal__caixa--pres');
  modalCorpo.replaceChildren(document.getElementById('presentesTpl').content.cloneNode(true));
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

/** copia a chave e avisa embaixo do retângulo; o aviso some sozinho em 2s */
async function copiarChave(texto, botao) {
  const aviso = botao.parentElement.querySelector('.pres__ok');
  let copiou = false;

  try {
    // só existe em HTTPS (e em localhost); em http comum nem aparece
    await navigator.clipboard.writeText(texto);
    copiou = true;
  } catch {
    const campo = document.createElement('textarea');
    campo.value = texto;
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    try { copiou = document.execCommand('copy'); } catch {}
    campo.remove();
  }

  if (copiou) {
    aviso.textContent = 'Copiado!';
    botao.classList.add('copiou');
  } else {
    // último recurso: deixa a chave selecionada pra pessoa copiar na mão
    const trecho = document.createRange();
    trecho.selectNodeContents(botao.querySelector('.pres__chave-val'));
    getSelection().removeAllRanges();
    getSelection().addRange(trecho);
    aviso.textContent = 'Selecione e copie';
  }

  aviso.classList.add('aparece');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => {
    aviso.classList.remove('aparece');
    botao.classList.remove('copiou');
  }, 2000);
}

// ---- modal do RSVP ----
// A lista de convidados vem do Apps Script (GET) na primeira abertura e fica em
// memória. A pessoa busca o nome, ele vira um chip; pode adicionar quantos quiser.
// Só nomes da lista são aceitos — quem não acha o seu é orientado a falar com os noivos.
let convidados = null;   // [{ nome, fazenda, chave, rotulo }]
let selecionados = [];   // chips do modal aberto
let sugestoes = [];      // resultado da última busca
let sugestaoAtiva = -1;  // índice marcado pelo teclado

async function carregarConvidados() {
  if (convidados) return convidados;
  const resposta = await fetch(RSVP_URL);
  const dados = await resposta.json();
  if (!dados.ok || !Array.isArray(dados.convidados)) throw new Error('lista');
  convidados = dados.convidados.map((c) => ({
    nome: c.nome,
    fazenda: !!c.fazenda,
    chave: normaliza(c.nome),
    rotulo: maiusculas(c.nome),
  }));
  return convidados;
}

/** troca só o miolo do modal já aberto, sem mexer no foco guardado */
function trocarModal(html) { modalCorpo.innerHTML = html; }

async function abrirRsvp() {
  selecionados = [];
  abrirModal(`
    <div class="modal__pad">
      ${passarinhos}
      <h3 class="modal__titulo" id="modalTitulo">Quem vai?</h3>
      <p class="modal__texto">Carregando a lista de convidados…</p>
    </div>`);

  try {
    await carregarConvidados();
  } catch (e) {
    if (modal.hidden) return;
    trocarModal(`
      <div class="modal__pad">
        ${passarinhos}
        <h3 class="modal__titulo" id="modalTitulo">Quem vai?</h3>
        <p class="modal__texto">Não consegui carregar a lista agora.</p>
        <span class="modal__erro"></span>
        <button class="modal__btn" id="rsvpTentar" type="button">Tentar de novo</button>
      </div>`);
    document.getElementById('rsvpTentar').addEventListener('click', abrirRsvp);
    return;
  }

  if (modal.hidden) return;   // fechou enquanto carregava
  montarRsvp();
}

function montarRsvp() {
  trocarModal(`
    <div class="modal__pad">
      ${passarinhos}
      <h3 class="modal__titulo" id="modalTitulo">Quem vai?</h3>
      <p class="modal__texto rsvp-m__dica">Busque seu nome na lista e adicione quem mais vai com você.</p>
      <form id="rsvpForm" novalidate>
        <div class="chips" id="rsvpChips"></div>
        <div class="busca">
          <input class="modal__campo" id="rsvpBusca" type="text" autocomplete="off" maxlength="80"
                 placeholder="Digite seu nome" role="combobox" aria-autocomplete="list"
                 aria-expanded="false" aria-controls="rsvpSugestoes">
          <ul class="busca__lista" id="rsvpSugestoes" role="listbox" hidden></ul>
        </div>
        <!-- campo isca: fica fora da tela, humano não preenche, robô de spam sim -->
        <input id="rsvpIsca" name="sobrenome_confirmacao" tabindex="-1" autocomplete="off"
               aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">
        <span class="modal__erro" id="rsvpErro"></span>
        <button class="modal__btn" id="rsvpEnviar" type="submit" disabled>Confirmar</button>
      </form>
    </div>`);

  const campo = document.getElementById('rsvpBusca');
  const lista = document.getElementById('rsvpSugestoes');

  campo.addEventListener('input', () => { document.getElementById('rsvpErro').textContent = ''; buscar(campo.value); });
  campo.addEventListener('focus', () => buscar(campo.value));
  campo.addEventListener('blur', () => setTimeout(fecharSugestoes, 120));
  campo.addEventListener('keydown', (e) => {
    if (lista.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); marcarSugestao(sugestaoAtiva + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); marcarSugestao(sugestaoAtiva - 1); }
    if (e.key === 'Enter' && sugestoes.length) { e.preventDefault(); escolher(sugestoes[Math.max(sugestaoAtiva, 0)]); }
  });
  // pointerdown e não click: o click vem depois do blur, e o blur já teria fechado a lista
  lista.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const item = e.target.closest('[data-i]');
    if (item) escolher(sugestoes[Number(item.dataset.i)]);
  });
  document.getElementById('rsvpChips').addEventListener('click', (e) => {
    const x = e.target.closest('[data-tirar]');
    if (x) tirar(Number(x.dataset.tirar));
  });
  document.getElementById('rsvpForm').addEventListener('submit', enviarRsvp);
  setTimeout(() => campo.focus(), 60);
}

function buscar(texto) {
  const lista = document.getElementById('rsvpSugestoes');
  const campo = document.getElementById('rsvpBusca');
  const q = normaliza(texto);
  if (q.length < 2) { fecharSugestoes(); return; }

  // casa no começo de qualquer palavra do nome ("ped" acha "João Pedro", "joao p" também)
  const re = new RegExp('(^| )' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  sugestoes = convidados
    .filter((c) => !selecionados.includes(c) && re.test(c.chave))
    .slice(0, 8);
  sugestaoAtiva = -1;

  lista.innerHTML = sugestoes.length
    ? sugestoes.map((c, i) => `<li class="busca__item" role="option" data-i="${i}">${escapa(c.rotulo)}</li>`).join('')
    : `<li class="busca__vazio">Não encontramos esse nome na lista.<br>Fale com os noivos para confirmar.</li>`;
  lista.hidden = false;
  campo.setAttribute('aria-expanded', 'true');
}

function fecharSugestoes() {
  const lista = document.getElementById('rsvpSugestoes');
  const campo = document.getElementById('rsvpBusca');
  if (!lista) return;
  lista.hidden = true;
  campo.setAttribute('aria-expanded', 'false');
  sugestoes = [];
  sugestaoAtiva = -1;
}

function marcarSugestao(i) {
  if (!sugestoes.length) return;
  sugestaoAtiva = (i + sugestoes.length) % sugestoes.length;
  document.querySelectorAll('#rsvpSugestoes .busca__item').forEach((el, n) => {
    el.classList.toggle('is-ativo', n === sugestaoAtiva);
  });
}

function escolher(convidado) {
  if (!convidado || selecionados.includes(convidado)) return;
  selecionados.push(convidado);
  const campo = document.getElementById('rsvpBusca');
  campo.value = '';
  campo.placeholder = 'Adicionar outra pessoa';
  fecharSugestoes();
  desenharChips();
  campo.focus();
}

function tirar(i) {
  selecionados.splice(i, 1);
  desenharChips();
  if (!selecionados.length) document.getElementById('rsvpBusca').placeholder = 'Digite seu nome';
}

function desenharChips() {
  document.getElementById('rsvpChips').innerHTML = selecionados.map((c, i) => `
    <span class="chip">${escapa(c.rotulo)}
      <button class="chip__x" type="button" data-tirar="${i}" aria-label="Remover ${escapa(c.rotulo)}">&times;</button>
    </span>`).join('');
  document.getElementById('rsvpEnviar').disabled = !selecionados.length;
}

function agradecer(nomes) {
  const lista = nomes.length > 1
    ? nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
    : nomes[0];
  trocarModal(`
    <div class="modal__pad">
      ${passarinhos}
      <h3 class="modal__titulo" id="modalTitulo">Obrigado, ${escapa(lista)}!</h3>
      <p class="modal__texto">Seu interesse foi registrado.<br>Em breve entraremos em contato.</p>
    </div>`);
}

async function enviarRsvp(ev) {
  ev.preventDefault();
  if (!selecionados.length) return;

  const erro = document.getElementById('rsvpErro');
  const botao = document.getElementById('rsvpEnviar');
  const campo = document.getElementById('rsvpBusca');
  const isca = document.getElementById('rsvpIsca').value;

  botao.disabled = true;
  botao.textContent = 'Confirmando…';
  campo.disabled = true;
  erro.textContent = '';

  try {
    // text/plain de propósito: o Apps Script não responde ao preflight de CORS,
    // e com esse content-type o navegador manda direto, sem preflight.
    const resposta = await fetch(RSVP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ chave: RSVP_CHAVE, nomes: selecionados.map((c) => c.nome), isca: isca }),
    });
    const dados = await resposta.json();
    if (!dados.ok) throw new Error(dados.erro || 'falhou');

    // todo mundo da seleção fica na fazenda: a página de hospedagem assume daqui
    if (dados.fazenda) { window.location.href = 'fazenda.html'; return; }

    agradecer(selecionados.map((c) => c.rotulo));
    selecionados = [];
  } catch (e) {
    erro.textContent = 'Não consegui registrar agora. Toque em confirmar de novo.';
    botao.disabled = false;
    botao.textContent = 'Confirmar';
    campo.disabled = false;
  }
}

/** "  Flávio  NIELAND da Silva " -> "flavio nieland da silva" (mesma regra do Apps Script) */
function normaliza(s) {
  return String(s).replace(/\s+/g, ' ').trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** "flavio nieland da silva" -> "Flavio Nieland da Silva" */
function maiusculas(s) {
  const miudas = ['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du'];
  return s.toLowerCase().split(' ').map((p, i) =>
    (i > 0 && miudas.includes(p)) ? p : p.charAt(0).toUpperCase() + p.slice(1)
  ).join(' ');
}

function escapa(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ===== Galeria: uma foto por vez, e o modal com todas =====
const palco = document.getElementById('palcoBtn');
const palcoSlides = [...palco.querySelectorAll('.palco__slide')];
const palcoPontos = [...document.querySelectorAll('#palcoPontos .palco__ponto')];
const FOTOS = palcoSlides.map((s) => s.querySelector('img'));
const TROCA_MS = 5000;

let fotoAtual = 0;
let palcoTimer = null;

// o fundo desfocado de cada slide é a própria foto — sai daqui pra não repetir a URL no HTML.
// img.src (absoluta) e não getAttribute('src'): url() dentro do CSS resolve o caminho
// relativo a partir da folha de estilo, e viraria /css/assets/...
palcoSlides.forEach((s, i) => s.style.setProperty('--bg', `url("${FOTOS[i].src}")`));

function mostrarFoto(i) {
  fotoAtual = (i + FOTOS.length) % FOTOS.length;
  const foto = FOTOS[fotoAtual];
  // width/height do atributo, não naturalWidth: valem antes de a imagem baixar
  palco.style.setProperty('--ar', `${foto.getAttribute('width')} / ${foto.getAttribute('height')}`);
  palcoSlides.forEach((s, n) => s.classList.toggle('is-ativa', n === fotoAtual));
  palcoPontos.forEach((p, n) => p.classList.toggle('is-ativo', n === fotoAtual));
}

function rodarPalco() {
  clearInterval(palcoTimer);
  palcoTimer = setInterval(() => mostrarFoto(fotoAtual + 1), TROCA_MS);
}

function pararPalco() { clearInterval(palcoTimer); }

palcoPontos.forEach((p, n) => p.addEventListener('click', () => { mostrarFoto(n); rodarPalco(); }));

// aba em segundo plano não precisa ficar trocando foto
document.addEventListener('visibilitychange', () => (document.hidden ? pararPalco() : rodarPalco()));

mostrarFoto(0);
rodarPalco();

// ---- modal das fotos: abre na foto que está no palco e leva às outras ----
function abrirFotos(inicio) {
  pararPalco();
  fotoAtual = inicio;
  modalCaixa.classList.add('modal__caixa--fotos');
  abrirModal(`
    <div class="fotos">
      <h3 class="modal__titulo fotos__titulo" id="modalTitulo">Alguns momentos nossos</h3>
      <div class="fotos__palco">
        <button class="fotos__nav fotos__nav--ant" type="button" aria-label="Foto anterior">&lsaquo;</button>
        <img class="fotos__img" id="fotoGrande" src="" alt="">
        <button class="fotos__nav fotos__nav--prox" type="button" aria-label="Próxima foto">&rsaquo;</button>
      </div>
      <div class="fotos__minis" id="fotoMinis">
        ${FOTOS.map((f, i) => `
          <button class="fotos__mini" type="button" data-i="${i}" aria-label="Ver foto ${i + 1} de ${FOTOS.length}">
            <img src="${f.getAttribute('src')}" alt="">
          </button>`).join('')}
      </div>
    </div>`);

  modalCorpo.querySelector('.fotos__nav--ant').addEventListener('click', () => trocarNoModal(fotoAtual - 1));
  modalCorpo.querySelector('.fotos__nav--prox').addEventListener('click', () => trocarNoModal(fotoAtual + 1));
  modalCorpo.querySelectorAll('.fotos__mini').forEach((b) => {
    b.addEventListener('click', () => trocarNoModal(Number(b.dataset.i)));
  });

  trocarNoModal(inicio);
}

/** troca a foto do modal e, junto, a que fica no palco quando ele fechar */
function trocarNoModal(i) {
  fotoAtual = (i + FOTOS.length) % FOTOS.length;
  const grande = document.getElementById('fotoGrande');
  grande.src = FOTOS[fotoAtual].getAttribute('src');
  grande.alt = FOTOS[fotoAtual].alt;
  modalCorpo.querySelectorAll('.fotos__mini').forEach((b, n) => {
    b.classList.toggle('is-ativa', n === fotoAtual);
  });
  mostrarFoto(fotoAtual);
}

palco.addEventListener('click', () => abrirFotos(fotoAtual));

document.getElementById('rsvpBtn').addEventListener('click', abrirRsvp);

document.getElementById('dressCodeBtn').addEventListener('click', abrirDressCode);

document.getElementById('presentesBtn').addEventListener('click', abrirPresentes);

// o bloco inteiro da chave é o botão, então o clique no ícone também copia
modalCorpo.addEventListener('click', (e) => {
  const botao = e.target.closest('[data-copiar]');
  if (botao) copiarChave(botao.dataset.copiar, botao);
});

document.getElementById('ondeCard').addEventListener('click', (e) => {
  e.preventDefault();   // sem JS o href leva direto ao mapa; com JS, abre o modal
  abrirOnde();
});

modal.addEventListener('click', (e) => {
  if (e.target.closest('[data-fechar]')) fecharModal();
});

document.addEventListener('keydown', (e) => {
  if (modal.hidden) return;
  if (e.key === 'Escape') fecharModal();
  if (!document.getElementById('fotoGrande')) return;
  if (e.key === 'ArrowLeft') trocarNoModal(fotoAtual - 1);
  if (e.key === 'ArrowRight') trocarNoModal(fotoAtual + 1);
});
