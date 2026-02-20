// siegeNgin Background Service Worker

const API_BASE = 'https://teddy.bon-soleil.com/siegengin';

// Toggle content script on click
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['content.css']
  });
});

// API proxy — all requests go through background (fixed origin + token)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'api') {
    handleAPI(msg).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true; // async response
  }
});

async function handleAPI(msg) {
  const { method, endpoint, body, otpToken } = msg;
  const url = `${API_BASE}${endpoint}`;

  // Get session token from storage, or use provided OTP token
  let token = otpToken;
  if (!token) {
    const { sn_session_token } = await chrome.storage.local.get('sn_session_token');
    token = sn_session_token;
  }

  const opts = {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    opts.headers['X-SiegeNgin-Token'] = token;
  }

  if (body) {
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(url, opts);
  const data = resp.status === 204 ? {} : await resp.json();
  
  // Handle session token from successful OTP authentication
  if (resp.status === 200 && data.session_token) {
    await chrome.storage.local.set({ sn_session_token: data.session_token });
    console.log('[siegeNgin] Session token saved');
  }

  // Handle 401 responses — only clear session if NOT an OTP attempt
  // (OTP failure shouldn't invalidate an existing session)
  if (resp.status === 401 && !otpToken) {
    await chrome.storage.local.remove('sn_session_token');
    console.log('[siegeNgin] Session token cleared due to 401');
  }

  return { status: resp.status, data };
}
