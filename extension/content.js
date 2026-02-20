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

  // API calls go through background.js (fixed origin + token)
  let selectedEl = null;
  let hoveredEl = null;
  let panelAction = false;

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
      <h3><img src="${chrome.runtime.getURL('icon48.png')}" style="width:18px;height:18px;border-radius:3px;vertical-align:middle;margin-right:4px;">siegeNgin</h3>
      <div id="sn-size-controls">
        <button id="sn-size-down">A-</button>
        <button id="sn-size-up">A+</button>
      </div>
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
    <div id="sn-resize-handle"></div>
  `;
  document.body.appendChild(panel);

  // --- Font size control ---
  let baseSize = parseInt(localStorage.getItem('sn_font_size') || '14');
  panel.style.setProperty('--sn-base-size', baseSize + 'px');
  
  document.getElementById('sn-size-up').onmousedown = (e) => {
    e.stopPropagation();
    panelAction = true;
    setTimeout(() => panelAction = false, 100);
    baseSize = Math.min(baseSize + 2, 24);
    panel.style.setProperty('--sn-base-size', baseSize + 'px');
    localStorage.setItem('sn_font_size', baseSize);
  };
  document.getElementById('sn-size-down').onmousedown = (e) => {
    e.stopPropagation();
    panelAction = true;
    setTimeout(() => panelAction = false, 100);
    baseSize = Math.max(baseSize - 2, 10);
    panel.style.setProperty('--sn-base-size', baseSize + 'px');
    localStorage.setItem('sn_font_size', baseSize);
  };

  // --- Panel drag ---
  const header = document.getElementById('sn-panel-header');
  let dragging = false, dragX = 0, dragY = 0;
  
  function onDragMove(e) {
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
    e.preventDefault();
  }
  function onDragEnd(e) {
    dragging = false;
    window.removeEventListener('mousemove', onDragMove, true);
    window.removeEventListener('mouseup', onDragEnd, true);
  }
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'sn-panel-close') return;
    dragging = true;
    const rect = panel.getBoundingClientRect();
    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = rect.left + 'px';
    panel.style.top = rect.top + 'px';
    window.addEventListener('mousemove', onDragMove, true);
    window.addEventListener('mouseup', onDragEnd, true);
    e.preventDefault();
  });

  // --- Panel resize (bottom-left corner) ---
  const resizeHandle = document.getElementById('sn-resize-handle');
  let resizing = false;
  
  resizeHandle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    resizing = true;
    panelAction = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    const startW = rect.width;
    const startH = rect.height;
    const startLeft = rect.left;
    // Switch to left/top positioning if not already
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = rect.left + 'px';
    panel.style.top = rect.top + 'px';
    
    function onResizeMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // bottom-right: width grows rightward, height grows downward
      const newW = Math.max(240, startW + dx);
      const newH = Math.max(200, startH + dy);
      panel.style.width = newW + 'px';
      panel.style.height = newH + 'px';
      e.preventDefault();
    }
    function onResizeEnd() {
      resizing = false;
      setTimeout(() => panelAction = false, 100);
      // Save size
      localStorage.setItem('sn_panel_w', panel.style.width);
      localStorage.setItem('sn_panel_h', panel.style.height);
      window.removeEventListener('mousemove', onResizeMove, true);
      window.removeEventListener('mouseup', onResizeEnd, true);
    }
    window.addEventListener('mousemove', onResizeMove, true);
    window.addEventListener('mouseup', onResizeEnd, true);
  });

  // Restore saved size
  const savedW = localStorage.getItem('sn_panel_w');
  const savedH = localStorage.getItem('sn_panel_h');
  if (savedW) panel.style.width = savedW;
  if (savedH) panel.style.height = savedH;

  // --- Breadcrumb splitter drag ---
  const breadcrumb = document.getElementById('sn-breadcrumb');
  const selInfo = document.getElementById('sn-selection-info');
  const commentEl = document.getElementById('sn-comment');

  breadcrumb.addEventListener('mousedown', (e) => {
    // Only drag on the breadcrumb background, not on crumbs
    if (e.target.classList.contains('crumb')) return;
    e.stopPropagation();
    e.preventDefault();
    panelAction = true;
    const startY = e.clientY;
    const startInfoH = selInfo.offsetHeight;
    const startCommentH = commentEl.offsetHeight;

    function onSplitMove(e) {
      const dy = e.clientY - startY;
      const newInfoH = Math.max(40, startInfoH + dy);
      const newCommentH = Math.max(40, startCommentH - dy);
      selInfo.style.height = newInfoH + 'px';
      selInfo.style.flex = 'none';
      commentEl.style.height = newCommentH + 'px';
      commentEl.style.flex = 'none';
      e.preventDefault();
    }
    function onSplitEnd() {
      setTimeout(() => panelAction = false, 100);
      localStorage.setItem('sn_info_h', selInfo.style.height);
      localStorage.setItem('sn_comment_h', commentEl.style.height);
      window.removeEventListener('mousemove', onSplitMove, true);
      window.removeEventListener('mouseup', onSplitEnd, true);
    }
    window.addEventListener('mousemove', onSplitMove, true);
    window.addEventListener('mouseup', onSplitEnd, true);
  });

  // Restore saved split
  const savedInfoH = localStorage.getItem('sn_info_h');
  const savedCommentH = localStorage.getItem('sn_comment_h');
  if (savedInfoH) { selInfo.style.height = savedInfoH; selInfo.style.flex = 'none'; }
  if (savedCommentH) { commentEl.style.height = savedCommentH; commentEl.style.flex = 'none'; }

  // --- Panel close ---
  document.getElementById('sn-panel-close').onmousedown = () => {
    panelAction = true;
    panel.remove();
    window.__siegeNginActive = false;
    document.querySelectorAll('.sn-hover, .sn-selected').forEach(el => {
      el.classList.remove('sn-hover', 'sn-selected');
    });
  };

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
      <div class="tag-line"><span class="tag">${ei.tag}</span>${ei.attributes.id ? `<span style="color:#6a5a8a;font-size:0.7rem;">#${ei.attributes.id}</span>` : ''}</div>
      <span class="selector">${ei.selector}</span>
      ${ei.text ? `<div class="text-preview">${ei.text.slice(0, 200)}</div>` : ''}
    `;
    // Breadcrumb (from body, max 8 nearest)
    let chain = getAncestorChain(selectedEl);
    if (chain.length > 8) {
      chain = [chain[0], ...chain.slice(-7)]; // body + last 7
    }
    bc.innerHTML = chain.map((ancestor, i) => {
      const tag = ancestor.tagName.toLowerCase();
      const id = ancestor.id ? `#${ancestor.id}` : '';
      const isActive = ancestor === selectedEl;
      return `<span class="crumb${isActive ? ' active' : ''}" data-idx="${i}">${tag}${id}</span>`;
    }).join('<span class="sep">›</span>');

    bc.querySelectorAll('.crumb').forEach((crumb, i) => {
      crumb.onmousedown = (e) => {
        e.stopPropagation();
        panelAction = true;
        setTimeout(() => panelAction = false, 100);
        const newEl = chain[i];
        if (newEl && newEl.tagName !== 'BODY') {
          selectedEl.classList.remove('sn-selected');
          selectedEl = newEl;
          selectedEl.classList.add('sn-selected');
          updateDisplay();
        }
      };
    });
  }

  // --- Block hover/click on panel ---
  panel.addEventListener('mouseover', (e) => e.stopPropagation(), true);
  panel.addEventListener('mouseout', (e) => e.stopPropagation(), true);
  panel.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); }, true);

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

  // --- Click (capture: intercept before page handlers) ---
  document.addEventListener('click', (e) => {
    // Let panel clicks through normally
    if (panel.contains(e.target) || panelAction) return;
    if (!window.__siegeNginActive) return;
    if (dragging || resizing) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const target = findMeaningful(e.target, e.shiftKey);
    if (!target) return;
    target.classList.remove('sn-hover');

    if (selectedEl) selectedEl.classList.remove('sn-selected');
    selectedEl = target;
    selectedEl.classList.add('sn-selected');
    updateDisplay();
  }, true);

  // --- XPath copy ---
  document.getElementById('sn-btn-xpath').onmousedown = (e) => {
    e.stopPropagation();
    panelAction = true;
    setTimeout(() => panelAction = false, 100);
    if (!selectedEl) return;
    navigator.clipboard.writeText(getXPath(selectedEl));
    showSpeech('XPath コピーしました 📋');
  };

  // --- Send to Teddy ---
  document.getElementById('sn-btn-send').onmousedown = async (e) => {
    e.stopPropagation();
    panelAction = true;
    setTimeout(() => panelAction = false, 100);
    if (!selectedEl) { showSpeech('要素を選択してね'); return; }
    await sendPointData();
  };

  async function sendPointData(otpToken = null) {
    const ei = getElementInfo(selectedEl);
    const comment = document.getElementById('sn-comment').value.trim();
    const data = {
      url: location.href,
      timestamp: new Date().toISOString(),
      comment: comment || null,
      tag: ei.tag,
      selector: ei.selector,
      text: ei.text?.slice(0, 500),
      html: selectedEl?.innerHTML?.slice(0, 200000) || null,
      attributes: ei.attributes,
    };
    try {
      // Flush old response (await to avoid race conditions)
      try { await chrome.runtime.sendMessage({ type: 'api', method: 'GET', endpoint: '/api/response' }); } catch(e) {}
      showSpeech('送信中... 🏰');
      
      const apiMsg = {
        type: 'api',
        method: 'POST',
        endpoint: '/api/point',
        body: data,
      };
      if (otpToken) {
        apiMsg.otpToken = otpToken;
      }

      const resp = await chrome.runtime.sendMessage(apiMsg);
      
      console.log('[siegeNgin] resp:', JSON.stringify(resp));
      
      if (resp.error) {
        showSpeech('送信失敗: ' + resp.error);
        return;
      }
      
      if (resp.status === 401 || (resp.data && resp.data.otp_generated)) {
        // OTP was generated, show input dialog
        showOTPDialog(data);
        return;
      }
      
      if (resp.status === 423) {
        showSpeech('🔒 アカウントがロックされています');
        return;
      }
      
      if (resp.data && resp.data.ok) {
        document.getElementById('sn-comment').value = '';
        showSpeech(resp.data.message || '届けました🏰');
        pollForResponse();
      } else {
        showSpeech('送信失敗: ' + (resp.data?.error || 'unknown'));
      }
    } catch (e) {
      showSpeech('送信失敗: ' + e.message);
    }
  }

  function showOTPDialog(originalData) {
    // Create OTP input dialog
    const overlay = document.createElement('div');
    overlay.id = 'sn-otp-overlay';
    overlay.innerHTML = `
      <div id="sn-otp-dialog">
        <div id="sn-otp-header">
          <h3>🏰 siegeNgin 通行証</h3>
        </div>
        <div id="sn-otp-content">
          <p>Telegramで受け取った6文字の通行証を入力してください：</p>
          <input type="text" id="sn-otp-input" placeholder="例: A7X92K" maxlength="6" style="text-transform: uppercase;">
          <div id="sn-otp-buttons">
            <button id="sn-otp-cancel">キャンセル</button>
            <button id="sn-otp-submit">送信</button>
          </div>
          <div id="sn-otp-message"></div>
        </div>
      </div>
    `;
    
    // Add styles for the OTP dialog
    const style = document.createElement('style');
    style.textContent = `
      #sn-otp-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 100001;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      #sn-otp-dialog {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        width: 300px;
        max-width: 90vw;
      }
      #sn-otp-header {
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
      }
      #sn-otp-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
      #sn-otp-content {
        padding: 20px;
      }
      #sn-otp-content p {
        margin: 0 0 16px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }
      #sn-otp-input {
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        text-align: center;
        letter-spacing: 4px;
        margin-bottom: 16px;
        box-sizing: border-box;
      }
      #sn-otp-input:focus {
        outline: none;
        border-color: #4a90e2;
      }
      #sn-otp-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      #sn-otp-buttons button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      #sn-otp-cancel {
        background: #f5f5f5;
        color: #666;
      }
      #sn-otp-cancel:hover {
        background: #e8e8e8;
      }
      #sn-otp-submit {
        background: #4a90e2;
        color: white;
      }
      #sn-otp-submit:hover {
        background: #357abd;
      }
      #sn-otp-submit:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      #sn-otp-message {
        margin-top: 12px;
        padding: 8px;
        border-radius: 4px;
        font-size: 13px;
        display: none;
      }
      #sn-otp-message.error {
        background: #fee;
        color: #c33;
        border: 1px solid #fcc;
      }
      #sn-otp-message.success {
        background: #efe;
        color: #363;
        border: 1px solid #cfc;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    const otpInput = document.getElementById('sn-otp-input');
    const submitBtn = document.getElementById('sn-otp-submit');
    const cancelBtn = document.getElementById('sn-otp-cancel');
    const messageDiv = document.getElementById('sn-otp-message');
    
    // Auto-focus and auto-uppercase
    otpInput.focus();
    otpInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
    
    // Submit on Enter
    otpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });
    
    // Cancel button
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      showSpeech('送信をキャンセルしました');
    };
    
    // Submit button
    submitBtn.onclick = async () => {
      const otp = otpInput.value.trim();
      if (otp.length !== 6) {
        showOTPMessage('6文字の通行証を入力してください', 'error');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';
      
      try {
        const apiMsg = {
          type: 'api',
          method: 'POST',
          endpoint: '/api/point',
          body: originalData,
          otpToken: otp
        };

        const resp = await chrome.runtime.sendMessage(apiMsg);
        
        if (resp.status === 200 && resp.data && resp.data.ok) {
          showOTPMessage('認証成功！送信しました', 'success');
          setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
            document.getElementById('sn-comment').value = '';
            showSpeech(resp.data.message || '届けました🏰');
            pollForResponse();
          }, 1000);
        } else if (resp.status === 401) {
          showOTPMessage('通行証が無効または期限切れです', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = '送信';
          otpInput.focus();
          otpInput.select();
        } else if (resp.status === 423) {
          showOTPMessage('アカウントがロックされています', 'error');
        } else {
          showOTPMessage('送信に失敗しました: ' + (resp.data?.error || 'unknown'), 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = '送信';
        }
      } catch (e) {
        showOTPMessage('送信に失敗しました: ' + e.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '送信';
      }
    };
    
    function showOTPMessage(msg, type) {
      messageDiv.textContent = msg;
      messageDiv.className = type;
      messageDiv.style.display = 'block';
    }
  }

  // --- Speech bubble ---
  function showSpeech(msg) {
    const el = document.getElementById('sn-speech');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.display = 'none'; }, 10000);
  }

  // --- Execute actions (form fill etc.) ---
  function executeActions(actions) {
    // Separate submit/click actions from value-setting actions
    const valueActions = actions.filter(a => a.action !== 'click' && a.action !== 'submit');
    const clickActions = actions.filter(a => a.action === 'click');
    const submitActions = actions.filter(a => a.action === 'submit');

    // Build confirmation summary
    const lines = [];
    for (const act of valueActions) {
      lines.push(`📝 [${act.selector}] ${act.label || ''} → ${String(act.value).slice(0, 50)}`);
    }
    for (const act of clickActions) {
      lines.push(`🖱️ click: [${act.selector}] ${act.label || ''}`);
    }
    for (const act of submitActions) {
      lines.push(`⚠️ SUBMIT: [${act.selector}] ${act.label || ''}`);
    }

    // Show confirmation dialog
    const summary = `siegeNgin Actions (${actions.length}件)\n\n${lines.join('\n')}\n\n実行しますか？`;
    if (!confirm(summary)) {
      showSpeech('❌ キャンセルしました');
      return;
    }

    // If there are submit actions, require additional confirmation
    if (submitActions.length > 0) {
      if (!confirm(`⚠️ ${submitActions.length}件のSUBMIT操作が含まれています！\nフォームが送信されます。本当に実行しますか？`)) {
        showSpeech('❌ SUBMIT操作をキャンセルしました（値入力のみ実行します）');
        // Execute only non-submit actions
        doExecute([...valueActions, ...clickActions]);
        return;
      }
    }

    doExecute(actions);
  }

  function doExecute(actions) {
    let filled = 0, failed = 0;
    for (const act of actions) {
      try {
        const el = document.querySelector(act.selector);
        if (!el) { console.warn('[siegeNgin] selector not found:', act.selector); failed++; continue; }

        if (act.action === 'click' || act.action === 'submit') {
          el.click();
          filled++;
        } else if (act.action === 'check') {
          el.checked = !!act.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        } else {
          // Default: set value (input/textarea/select)
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype :
            el.tagName === 'SELECT' ? window.HTMLSelectElement.prototype :
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, act.value);
          } else {
            el.value = act.value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));

          // Trigger jQuery/select2 change if available
          try { $(el).trigger('change'); } catch(_) {}
          filled++;
        }
      } catch (e) {
        console.error('[siegeNgin] action error:', act, e);
        failed++;
      }
    }
    const msg = `✅ ${filled}件入力完了` + (failed ? ` / ❌ ${failed}件失敗` : '');
    showSpeech(msg);
  }

  // --- Poll for response ---
  function pollForResponse(attempts = 0) {
    if (attempts > 30) { showSpeech('ちょっと時間かかってるかも... 💦'); return; }
    setTimeout(async () => {
      try {
        const resp = await chrome.runtime.sendMessage({
          type: 'api',
          method: 'GET',
          endpoint: '/api/response',
        });
        if (resp.status === 200 && resp.data && resp.data.message) {
          console.log('[siegeNgin] poll response:', JSON.stringify(resp.data).slice(0, 200));
          showSpeech(resp.data.message);
          // Execute actions if present
          if (resp.data.actions && Array.isArray(resp.data.actions)) {
            console.log('[siegeNgin] executing', resp.data.actions.length, 'actions');
            executeActions(resp.data.actions);
          }
          return;
        }
      } catch (e) {}
      pollForResponse(attempts + 1);
    }, 1000);
  }

})();
