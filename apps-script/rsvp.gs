/**
 * RSVP do site do casamento — Miriã & Flávio
 * Script preso à planilha "casamento". Publicado como App da Web (doGet + doPost).
 *
 * Publicar uma mudança: Implantar → Gerenciar implantações → lápis →
 * Versão: "Nova versão" → Implantar. Só salvar não publica, e "Nova implantação"
 * gera outra URL (o site continuaria apontando pra versão velha).
 *
 * Regras (grill de 20/10/2026):
 *  - GET  devolve a lista da aba "Convidados Site": nome (coluna A) + fazenda (coluna D)
 *  - POST recebe { chave, nomes: [..], isca } e só aceita nomes IDÊNTICOS aos da
 *    coluna A (ignorando acento, maiúscula e espaço duplo). Nome desconhecido rejeita
 *    o pedido inteiro; nada vai pra aba de fallback.
 *  - marca cada linha casada: B = true, C = data/hora de Brasília (reconfirmação sobrescreve)
 *  - responde fazenda = true só se TODOS os nomes confirmados têm D = TRUE
 */

const ABA_LISTA = 'Convidados Site';
const CHAVE     = '6u96XvGyPwSW2unH6bNjbMx2u9eH';   // tem que bater com a do js/main.js
const FUSO      = 'America/Sao_Paulo';
const MAX_NOMES = 20;

/* ============================================================
   Entrada
   ============================================================ */

function doGet() {
  const convidados = lerLista().map(function (c) {
    return { nome: c.nome, fazenda: c.fazenda };
  });
  return responde({ ok: true, convidados: convidados });
}

function doPost(e) {
  try {
    const corpo = JSON.parse(e.postData.contents);

    // chave fixa: barra robô que achou a URL varrendo, não quem lê o JS
    if (corpo.chave !== CHAVE) return responde({ ok: false, erro: 'chave' });

    // campo isca: humano nunca preenche, robô de spam sim
    if (corpo.isca) return responde({ ok: true, fazenda: false });

    const nomes = Array.isArray(corpo.nomes) ? corpo.nomes.map(function (n) { return String(n || ''); }) : [];
    if (!nomes.length || nomes.length > MAX_NOMES) return responde({ ok: false, erro: 'nomes' });

    return responde(registra(nomes));

  } catch (err) {
    console.error(err);
    return responde({ ok: false, erro: 'interno' });
  }
}

function responde(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
   Planilha
   ============================================================ */

/** [{ linha, nome, fazenda }] da aba, pulando o cabeçalho e as linhas vazias */
function lerLista() {
  const lista = SpreadsheetApp.getActive().getSheetByName(ABA_LISTA);
  if (!lista) throw new Error('aba "' + ABA_LISTA + '" não encontrada');

  // a coluna E ("Nomes Miri") desce muito mais que a A — por isso leio a coluna
  // inteira e filtro, em vez de confiar no getLastRow() da aba
  const valores = lista.getRange(1, 1, lista.getMaxRows(), 4).getValues();
  const saida = [];
  for (let i = 1; i < valores.length; i++) {          // i=1 pula o cabeçalho
    const nome = limpaEspacos(String(valores[i][0] || ''));
    if (!nome) continue;
    saida.push({ linha: i + 1, nome: nome, fazenda: valores[i][3] === true || String(valores[i][3]).toUpperCase() === 'TRUE' });
  }
  return saida;
}

function registra(nomes) {
  // trava: duas pessoas confirmando ao mesmo tempo não se atropelam
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const lista = lerLista();
    const porChave = {};
    lista.forEach(function (c) { porChave[chave(c.nome)] = c; });

    const alvos = [];
    for (let i = 0; i < nomes.length; i++) {
      const achado = porChave[chave(nomes[i])];
      if (!achado) return { ok: false, erro: 'desconhecido', nome: nomes[i] };
      if (alvos.indexOf(achado) === -1) alvos.push(achado);
    }

    const aba   = SpreadsheetApp.getActive().getSheetByName(ABA_LISTA);
    const agora = Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy HH:mm:ss');
    alvos.forEach(function (c) {
      aba.getRange(c.linha, 2).setValue(true);     // B = Confirmado?
      aba.getRange(c.linha, 3).setValue(agora);    // C = Data da confirmação
    });

    const todosNaFazenda = alvos.every(function (c) { return c.fazenda; });
    return { ok: true, fazenda: todosNaFazenda };

  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
   Normalização
   ============================================================ */

function limpaEspacos(s) {
  return s.replace(/\s+/g, ' ').trim();
}

/** "  Flávio  NIELAND da Silva " -> "flavio nieland da silva" */
function chave(s) {
  return limpaEspacos(String(s))
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
