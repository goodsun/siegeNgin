// siegeNgin - Pointing UI MVP
// Ported from XPathGenie/Jasmine

const state = {
  selections: [],  // { selector, tag, text, attributes, element }
  currentURL: null,
  hovered: null,
};

// --- DOM refs ---
const urlInput = document.getElementById('urlInput');
const previewFrame = document.getElementById('previewFrame');
const placeholder = document.getElementById('placeholder');
const selectionList = document.getElementById('selectionList');
const selectionBadge = document.getElementById('selectionBadge');
const statusText = document.getElementById('statusText');
const statusUrl = document.getElementById('statusUrl');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');

// --- CSS Selector Generator ---
function getCSSSelector(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const parts = [];
  let current = el;
  while (current && current.nodeType === 1 && current.tagName !== 'HTML') {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/)
        .filter(c => !c.startsWith('sn-'))  // skip our classes
        .slice(0, 2);
      if (classes.length) selector += '.' + classes.map(CSS.escape).join('.');
    }
    // nth-child for disambiguation
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

// --- Element info extraction ---
function getElementInfo(el) {
  const tag = el.tagName.toLowerCase();
  const selector = getCSSSelector(el);
  const text = (el.textContent || '').trim().slice(0, 200);
  const attrs = {};
  for (const attr of el.attributes) {
    if (!attr.name.startsWith('class') && !attr.name.startsWith('sn-')) {
      attrs[attr.name] = attr.value.slice(0, 100);
    }
  }
  if (el.className && typeof el.className === 'string') {
    attrs['class'] = el.className.split(/\s+/).filter(c => !c.startsWith('sn-')).join(' ');
  }
  return { tag, selector, text, attributes: attrs };
}

// --- Breadcrumb (ancestor chain) ---
function getAncestorChain(el) {
  const chain = [];
  let current = el;
  while (current && current.tagName !== 'HTML') {
    chain.unshift(current);
    current = current.parentElement;
  }
  return chain;
}

// --- Meaningful element walk-up ---
const SECTION_TAGS = ['div', 'section', 'main', 'article', 'table', 'form', 'ul', 'ol', 'dl', 'nav', 'header', 'footer', 'aside', 'fieldset'];
const INLINE_TAGS = ['a', 'span', 'strong', 'em', 'b', 'i', 'label', 'input', 'select', 'textarea', 'button', 'img', 'td', 'th', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];

function findMeaningfulElement(target, shiftKey) {
  // With shift, allow inline elements (precise pointing)
  if (shiftKey) {
    // Walk up only if it's a text node or very small inline
    if (target.tagName === 'BODY' || target.tagName === 'HTML') return null;
    return target;
  }
  // Without shift, walk up to section-level
  let el = target;
  while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
    const tag = el.tagName.toLowerCase();
    if (SECTION_TAGS.includes(tag)) return el;
    if (INLINE_TAGS.includes(tag)) return el;  // stop at meaningful inline too
    el = el.parentElement;
  }
  return null;
}

// --- Inject interaction handlers into iframe ---
function injectHandlers(doc) {
  // Inject highlight styles
  const style = doc.createElement('style');
  style.textContent = `
    .sn-hover { outline: 3px dashed rgba(255, 140, 66, 0.7) !important; outline-offset: 2px !important; cursor: pointer !important; }
    .sn-selected { outline: 3px solid #ff8c42 !important; outline-offset: 2px !important; background-color: rgba(255, 140, 66, 0.08) !important; }
  `;
  doc.head.appendChild(style);

  // Hover
  doc.addEventListener('mouseover', (e) => {
    const target = findMeaningfulElement(e.target, false);
    if (!target) return;
    if (state.hovered && state.hovered !== target) {
      state.hovered.classList.remove('sn-hover');
    }
    if (!target.classList.contains('sn-selected')) {
      target.classList.add('sn-hover');
    }
    state.hovered = target;
  });

  doc.addEventListener('mouseout', (e) => {
    if (state.hovered) {
      state.hovered.classList.remove('sn-hover');
      state.hovered = null;
    }
  });

  // Click
  doc.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const target = findMeaningfulElement(e.target, e.shiftKey);
    if (!target) return;

    target.classList.remove('sn-hover');
    const info = getElementInfo(target);

    // Single selection: clear previous, set new
    state.selections.forEach(s => s._el?.classList.remove('sn-selected'));
    state.selections = [];
    target.classList.add('sn-selected');
    state.selections.push({ ...info, _el: target });

    updateSelectionUI();
  }, true);

  // Prevent navigation
  doc.addEventListener('submit', e => e.preventDefault(), true);
  doc.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }, true);
  });
}

// --- Selection UI ---
function updateSelectionUI() {
  selectionBadge.textContent = state.selections.length;
  selectionBadge.style.display = state.selections.length > 0 ? 'inline-block' : 'none';
  selectionList.innerHTML = '';

  state.selections.forEach((sel, idx) => {
    const li = document.createElement('li');
    li.className = 'sel-item';

    // Build breadcrumb
    const chain = sel._el ? getAncestorChain(sel._el) : [];
    let breadcrumbHTML = '';
    if (chain.length > 1) {
      const crumbs = chain.map((ancestor, i) => {
        const tag = ancestor.tagName.toLowerCase();
        const id = ancestor.id ? `#${ancestor.id}` : '';
        const label = tag + id;
        const isActive = ancestor === sel._el;
        return `<span class="crumb${isActive ? ' active' : ''}" data-sel-idx="${idx}" data-ancestor-idx="${i}" onclick="refocusSel(${idx}, ${i})">${escHtml(label)}</span>`;
      });
      breadcrumbHTML = `<div class="breadcrumb">${crumbs.join('<span class="sep">›</span>')}</div>`;
    }

    li.innerHTML = `
      <span class="tag">${sel.tag}</span>
      ${sel.attributes.id ? `<span style="color:#6a5a8a;font-size:0.7rem;">#${sel.attributes.id}</span>` : ''}
      <span class="selector">${escHtml(sel.selector)}</span>
      ${sel.text ? `<div class="text-preview">${escHtml(sel.text.slice(0, 120))}</div>` : ''}
      ${breadcrumbHTML}
      <div class="actions">
        <button title="コピー" onclick="copySingle(${idx})">📋</button>
        <button title="削除" onclick="removeSel(${idx})">✕</button>
      </div>
    `;
    // Hover to highlight in iframe
    li.addEventListener('mouseenter', () => sel._el?.classList.add('sn-hover'));
    li.addEventListener('mouseleave', () => sel._el?.classList.remove('sn-hover'));
    selectionList.appendChild(li);
  });
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// --- Actions ---
window.removeSel = function(idx) {
  const sel = state.selections[idx];
  if (sel._el) sel._el.classList.remove('sn-selected');
  state.selections.splice(idx, 1);
  updateSelectionUI();
};

window.refocusSel = function(selIdx, ancestorIdx) {
  const sel = state.selections[selIdx];
  if (!sel._el) return;
  const chain = getAncestorChain(sel._el);
  const newEl = chain[ancestorIdx];
  if (!newEl || newEl.tagName === 'BODY') return;

  // Update highlight
  sel._el.classList.remove('sn-selected');
  newEl.classList.add('sn-selected');

  // Update selection data
  const info = getElementInfo(newEl);
  sel.tag = info.tag;
  sel.selector = info.selector;
  sel.text = info.text;
  sel.attributes = info.attributes;
  sel._el = newEl;

  updateSelectionUI();
  showToast(`${info.tag} にフォーカス変更`);
};

window.copySingle = function(idx) {
  const sel = state.selections[idx];
  const info = { tag: sel.tag, selector: sel.selector, text: sel.text?.slice(0, 200), attributes: sel.attributes };
  navigator.clipboard.writeText(JSON.stringify(info, null, 2));
  showToast('コピーしました 📋');
};

window.copyAllText = function() {
  if (state.selections.length === 0) return;
  const lines = state.selections.map((s, i) =>
    `[${i + 1}] <${s.tag}> ${s.selector}\n    ${s.text?.slice(0, 150) || '(empty)'}`
  );
  const header = `🏰 siegeNgin selections — ${state.currentURL}\n${'─'.repeat(50)}`;
  navigator.clipboard.writeText(header + '\n' + lines.join('\n\n'));
  showToast(`${state.selections.length}件コピーしました 📋`);
};

window.sendToTeddy = async function() {
  if (state.selections.length === 0) { showToast('要素を選択してね'); return; }
  const sel = state.selections[0];
  const comment = document.getElementById('commentInput').value.trim();
  const data = {
    url: state.currentURL,
    timestamp: new Date().toISOString(),
    comment: comment || null,
    tag: sel.tag,
    selector: sel.selector,
    text: sel.text?.slice(0, 500),
    attributes: sel.attributes,
  };
  try {
    const resp = await fetch('/siegengin/api/point', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await resp.json();
    if (result.ok) {
      showToast('テディに送信しました 🧸');
      document.getElementById('commentInput').value = '';
      // Flush any old response before polling
      await fetch('/siegengin/api/response').catch(() => {});
      showSpeech('受け取ったよ！考え中... 🤔');
      pollForResponse();
    }
    else showToast('エラー: ' + result.error);
  } catch (e) {
    showToast('送信失敗: ' + e.message);
  }
};

// --- XPath generator from element ---
function getXPath(el) {
  if (el.id) return `//*[@id="${el.id}"]`;
  const parts = [];
  let current = el;
  while (current && current.nodeType === 1 && current.tagName !== 'HTML') {
    let tag = current.tagName.toLowerCase();
    if (current.id) {
      parts.unshift(`//*[@id="${current.id}"]`);
      break;
    }
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(current) + 1;
        tag += `[${idx}]`;
      }
    }
    parts.unshift(tag);
    current = current.parentElement;
  }
  return '//' + parts.join('/');
}

window.copyXPath = function() {
  if (state.selections.length === 0) { showToast('要素を選択してね'); return; }
  const sel = state.selections[0];
  const xpath = sel._el ? getXPath(sel._el) : sel.selector;
  navigator.clipboard.writeText(xpath);
  showToast('XPath コピーしました 📋');
};

window.clearSelections = function() {
  const frame = document.getElementById('previewFrame');
  const doc = frame.contentDocument;
  if (doc) {
    doc.querySelectorAll('.sn-selected').forEach(el => el.classList.remove('sn-selected'));
  }
  state.selections = [];
  state.currentURL = null;
  updateSelectionUI();
  previewFrame.style.display = 'none';
  previewFrame.srcdoc = '';
  placeholder.style.display = '';
  urlInput.value = '';
  localStorage.removeItem(STORAGE_KEY);
  setStatus('URLを入力してページを読み込み', '');
};

// --- Fetch page ---
window.fetchPage = async function() {
  const url = urlInput.value.trim();
  if (!url) return;

  state.currentURL = url;
  localStorage.setItem(STORAGE_KEY, url);
  state.selections = [];
  updateSelectionUI();
  setStatus('読み込み中...', url);
  showLoading(true);
  placeholder.style.display = 'none';
  previewFrame.style.display = 'block';

  try {
    const resp = await fetch(`/siegengin/api/fetch?url=${encodeURIComponent(url)}`);
    const data = await resp.json();

    if (data.error) {
      setStatus(`エラー: ${data.error}`, url);
      showLoading(false);
      return;
    }

    const baseTag = `<base href="${new URL(url).origin}/" />`;
    const html = data.html.replace('</head>', baseTag + '</head>');
    previewFrame.srcdoc = html;

    previewFrame.onload = () => {
      injectHandlers(previewFrame.contentDocument);
      setStatus('読み込み完了 — クリックで要素を選択 ✨', url);
      showLoading(false);
    };
  } catch (err) {
    setStatus(`エラー: ${err.message}`, url);
    showLoading(false);
  }
};

// --- Helpers ---
function setStatus(msg, url) {
  statusText.textContent = msg;
  statusUrl.textContent = url || '';
}

function showLoading(show) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function showSpeech(msg) {
  const bubble = document.getElementById('speechBubble');
  bubble.textContent = msg;
  bubble.classList.add('show');
  clearTimeout(bubble._hideTimer);
  bubble._hideTimer = setTimeout(() => bubble.classList.remove('show'), 10000);
}

// --- Poll for Teddy's response ---
function pollForResponse(attempts = 0) {
  if (attempts > 30) {  // 30 sec timeout
    showSpeech('ちょっと時間かかってるかも... 💦');
    return;
  }
  setTimeout(async () => {
    try {
      const resp = await fetch('/siegengin/api/response');
      if (resp.status === 200) {
        const data = await resp.json();
        if (data.message) {
          showSpeech(data.message);
          return;
        }
      }
    } catch (e) {}
    pollForResponse(attempts + 1);
  }, 1000);
}

// Enter key to fetch
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchPage();
});

// Init
const STORAGE_KEY = 'sn_last_url';
const savedUrl = localStorage.getItem(STORAGE_KEY);
if (savedUrl) {
  urlInput.value = savedUrl;
  fetchPage();
} else {
  setStatus('URLを入力してページを読み込み', '');
}
