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
let nomeGuardado = '';

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
  modalCaixa.classList.remove('modal__caixa--dc');
  document.body.style.overflow = '';
  nomeGuardado = '';
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

// ---- modal do RSVP ----
function abrirRsvp(erro) {
  abrirModal(`
    <div class="modal__pad">
      ${passarinhos}
      <h3 class="modal__titulo" id="modalTitulo">Digite seu nome completo</h3>
      <form id="rsvpForm" novalidate>
        <input class="modal__campo" id="rsvpNome" type="text" autocomplete="name"
               maxlength="80" placeholder="Nome e sobrenome" value="${escapa(nomeGuardado)}">
        <!-- campo isca: fica fora da tela, humano não preenche, robô de spam sim -->
        <input id="rsvpIsca" name="sobrenome_confirmacao" tabindex="-1" autocomplete="off"
               aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">
        <span class="modal__erro" id="rsvpErro">${erro || ''}</span>
        <button class="modal__btn" id="rsvpEnviar" type="submit">${erro ? 'Tentar de novo' : 'Confirmar'}</button>
      </form>
    </div>`);

  document.getElementById('rsvpForm').addEventListener('submit', enviarRsvp);
  const campo = document.getElementById('rsvpNome');
  campo.addEventListener('input', () => { document.getElementById('rsvpErro').textContent = ''; });
  setTimeout(() => campo.focus(), 60);
}

function agradecer(nome) {
  abrirModal(`
    <div class="modal__pad">
      ${passarinhos}
      <h3 class="modal__titulo" id="modalTitulo">Obrigado, ${escapa(nome)}!</h3>
      <p class="modal__texto">Seu interesse foi registrado.<br>Em breve entraremos em contato.</p>
    </div>`);
}

async function enviarRsvp(ev) {
  ev.preventDefault();

  const campo = document.getElementById('rsvpNome');
  const erro = document.getElementById('rsvpErro');
  const botao = document.getElementById('rsvpEnviar');
  const isca = document.getElementById('rsvpIsca').value;

  nomeGuardado = campo.value.trim().replace(/\s+/g, ' ');

  if (!nomeGuardado) {
    erro.textContent = 'Digite seu nome para confirmar.';
    campo.focus();
    return;
  }
  if (nomeGuardado.split(' ').length < 2) {
    erro.textContent = 'Digite seu nome e sobrenome.';
    campo.focus();
    return;
  }

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
      body: JSON.stringify({ chave: RSVP_CHAVE, nome: nomeGuardado, isca: isca }),
    });
    const dados = await resposta.json();
    if (!dados.ok) throw new Error(dados.erro || 'falhou');

    agradecer(maiusculas(nomeGuardado));
    nomeGuardado = '';
  } catch (e) {
    abrirRsvp('Não consegui registrar agora. Toque em tentar de novo.');
  }
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

document.getElementById('rsvpBtn').addEventListener('click', () => abrirRsvp(''));

document.getElementById('dressCodeBtn').addEventListener('click', abrirDressCode);

document.getElementById('ondeCard').addEventListener('click', (e) => {
  e.preventDefault();   // sem JS o href leva direto ao mapa; com JS, abre o modal
  abrirOnde();
});

modal.addEventListener('click', (e) => {
  if (e.target.closest('[data-fechar]')) fecharModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) fecharModal();
});
