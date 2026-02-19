// siegeNgin Content Script - Pointing UI
(function() {
  // Prevent double injection
  if (window.__siegeNginActive) {
    // Toggle off
    const panel = document.getElementById('sn-panel');
    if (panel) panel.remove();
    window.__siegeNginActive = false;
    document.querySelectorAll('.sn-hover, .sn-selected').forEach(el => {
      el.classList.remove('sn-hover', 'sn-selected');
    });
    return;
  }
  window.__siegeNginActive = true;

  const API_BASE = 'https://teddy.bon-soleil.com/siegengin';
  let selectedEl = null;
  let hoveredEl = null;

  // --- CSS Selector Generator ---
  function getCSSSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    let current = el;
    while (current && current.nodeType === 1 && current.tagName !== 'HTML') {
      let selector = current.tagName.toLowerCase();
      if (current.id) { parts.unshift(`#${CSS.escape(current.id)}`); break; }
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/)
          .filter(c => !c.startsWith('sn-')).slice(0, 2);
        if (classes.length) selector += '.' + classes.map(CSS.escape).join('.');
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      parts.unshift(selector);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  // --- XPath Generator ---
  function getXPath(el) {
    if (el.id) return `//*[@id="${el.id}"]`;
    const parts = [];
    let current = el;
    while (current && current.nodeType === 1 && current.tagName !== 'HTML') {
      let tag = current.tagName.toLowerCase();
      if (current.id) { parts.unshift(`//*[@id="${current.id}"]`); break; }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) tag += `[${siblings.indexOf(current) + 1}]`;
      }
      parts.unshift(tag);
      current = current.parentElement;
    }
    return '//' + parts.join('/');
  }

  // --- Element Info ---
  function getElementInfo(el) {
    const tag = el.tagName.toLowerCase();
    const selector = getCSSSelector(el);
    const text = (el.textContent || '').trim().slice(0, 200);
    const attrs = {};
    for (const attr of el.attributes) {
      if (!attr.name.startsWith('sn-')) attrs[attr.name] = attr.value.slice(0, 100);
    }
    return { tag, selector, text, attributes: attrs };
  }

  // --- Ancestor Chain ---
  function getAncestorChain(el) {
    const chain = [];
    let current = el;
    while (current && current.tagName !== 'HTML') {
      chain.unshift(current);
      current = current.parentElement;
    }
    return chain;
  }

  // --- Find meaningful element ---
  const MEANINGFUL_TAGS = ['div','section','main','article','table','form','ul','ol','dl','nav','header','footer','aside','fieldset','a','span','strong','em','b','i','label','input','select','textarea','button','img','td','th','li','h1','h2','h3','h4','h5','h6','p'];
  function findMeaningful(target, precise) {
    if (precise) return (target.tagName === 'BODY' || target.tagName === 'HTML') ? null : target;
    let el = target;
    while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
      if (MEANINGFUL_TAGS.includes(el.tagName.toLowerCase())) return el;
      el = el.parentElement;
    }
    return null;
  }

  // --- Create Panel ---
  const panel = document.createElement('div');
  panel.id = 'sn-panel';
  panel.innerHTML = `
    <div id="sn-panel-header">
      <h3>🏰 siegeNgin</h3>
      <button id="sn-panel-close">✕</button>
    </div>
    <div id="sn-selection-info">クリックで要素を選択 ✨</div>
    <div id="sn-breadcrumb"></div>
    <textarea id="sn-comment" placeholder="テディへのコメント..." rows="3"></textarea>
    <div id="sn-panel-footer">
      <button id="sn-btn-xpath">📍 XPath</button>
      <button id="sn-btn-send">🧸 テディに送信</button>
    </div>
    <div id="sn-speech"></div>
  `;
  document.body.appendChild(panel);

  // --- Panel close ---
  document.getElementById('sn-panel-close').addEventListener('click', () => {
    panel.remove();
    window.__siegeNginActive = false;
    document.querySelectorAll('.sn-hover, .sn-selected').forEach(el => {
      el.classList.remove('sn-hover', 'sn-selected');
    });
  });

  // --- Update selection display ---
  function updateDisplay() {
    const info = document.getElementById('sn-selection-info');
    const bc = document.getElementById('sn-breadcrumb');
    if (!selectedEl) {
      info.innerHTML = 'クリックで要素を選択 ✨';
      bc.innerHTML = '';
      return;
    }
    const ei = getElementInfo(selectedEl);
    info.innerHTML = `
      <span class="tag">${ei.tag}</span>
      ${ei.attributes.id ? `<span style="color:#6a5a8a;font-size:0.7rem;">#${ei.attributes.id}</span>` : ''}
      <span class="selector">${ei.selector}</span>
      ${ei.text ? `<div class="text-preview">${ei.text.slice(0, 120)}</div>` : ''}
    `;
    // Breadcrumb
    const chain = getAncestorChain(selectedEl);
    bc.innerHTML = chain.map((ancestor, i) => {
      const tag = ancestor.tagName.toLowerCase();
      const id = ancestor.id ? `#${ancestor.id}` : '';
      const isActive = ancestor === selectedEl;
      return `<span class="crumb${isActive ? ' active' : ''}" data-idx="${i}">${tag}${id}</span>`;
    }).join('<span class="sep">›</span>');

    bc.querySelectorAll('.crumb').forEach((crumb, i) => {
      crumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const newEl = chain[i];
        if (newEl && newEl.tagName !== 'BODY') {
          selectedEl.classList.remove('sn-selected');
          selectedEl = newEl;
          selectedEl.classList.add('sn-selected');
          updateDisplay();
        }
      });
    });
  }

  // --- Hover ---
  document.addEventListener('mouseover', (e) => {
    if (panel.contains(e.target)) return;
    const target = findMeaningful(e.target, false);
    if (!target) return;
    if (hoveredEl && hoveredEl !== target) hoveredEl.classList.remove('sn-hover');
    if (!target.classList.contains('sn-selected')) target.classList.add('sn-hover');
    hoveredEl = target;
  }, true);

  document.addEventListener('mouseout', (e) => {
    if (hoveredEl) { hoveredEl.classList.remove('sn-hover'); hoveredEl = null; }
  }, true);

  // --- Click ---
  document.addEventListener('click', (e) => {
    if (panel.contains(e.target)) return;
    if (!window.__siegeNginActive) return;
    e.preventDefault();
    e.stopPropagation();

    const target = findMeaningful(e.target, e.shiftKey);
    if (!target) return;
    target.classList.remove('sn-hover');

    if (selectedEl) selectedEl.classList.remove('sn-selected');
    selectedEl = target;
    selectedEl.classList.add('sn-selected');
    updateDisplay();
  }, true);

  // --- XPath copy ---
  document.getElementById('sn-btn-xpath').addEventListener('click', () => {
    if (!selectedEl) return;
    navigator.clipboard.writeText(getXPath(selectedEl));
    showSpeech('XPath コピーしました 📋');
  });

  // --- Send to Teddy ---
  document.getElementById('sn-btn-send').addEventListener('click', async () => {
    if (!selectedEl) { showSpeech('要素を選択してね'); return; }
    const ei = getElementInfo(selectedEl);
    const comment = document.getElementById('sn-comment').value.trim();
    const data = {
      url: location.href,
      timestamp: new Date().toISOString(),
      comment: comment || null,
      tag: ei.tag,
      selector: ei.selector,
      text: ei.text?.slice(0, 500),
      attributes: ei.attributes,
    };
    try {
      // Flush old response
      await fetch(`${API_BASE}/api/response`).catch(() => {});
      showSpeech('受け取ったよ！考え中... 🤔');
      const resp = await fetch(`${API_BASE}/api/point`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await resp.json();
      if (result.ok) {
        document.getElementById('sn-comment').value = '';
        pollForResponse();
      }
    } catch (e) {
      showSpeech('送信失敗: ' + e.message);
    }
  });

  // --- Speech bubble ---
  function showSpeech(msg) {
    const el = document.getElementById('sn-speech');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.display = 'none'; }, 10000);
  }

  // --- Poll for response ---
  function pollForResponse(attempts = 0) {
    if (attempts > 30) { showSpeech('ちょっと時間かかってるかも... 💦'); return; }
    setTimeout(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/response`);
        if (resp.status === 200) {
          const data = await resp.json();
          if (data.message) { showSpeech(data.message); return; }
        }
      } catch (e) {}
      pollForResponse(attempts + 1);
    }, 1000);
  }

})();
