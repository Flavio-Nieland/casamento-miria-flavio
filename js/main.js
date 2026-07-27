// ===== Contagem regressiva =====
// Ajustar aqui quando o horário da cerimônia for definido (hoje: meia-noite, horário de Brasília)
const DATA_CASAMENTO = new Date('2027-03-06T00:00:00-03:00');

const els = {
  dias: document.getElementById('cdDias'),
  horas: document.getElementById('cdHoras'),
  min: document.getElementById('cdMin'),
  seg: document.getElementById('cdSeg'),
};

function atualizarContagem() {
  const diff = DATA_CASAMENTO - new Date();

  if (diff <= 0) {
    els.dias.textContent = '0';
    els.horas.textContent = '00';
    els.min.textContent = '00';
    els.seg.textContent = '00';
    return;
  }

  const seg = Math.floor(diff / 1000);
  els.dias.textContent = Math.floor(seg / 86400);
  els.horas.textContent = String(Math.floor((seg % 86400) / 3600)).padStart(2, '0');
  els.min.textContent = String(Math.floor((seg % 3600) / 60)).padStart(2, '0');
  els.seg.textContent = String(seg % 60).padStart(2, '0');
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
