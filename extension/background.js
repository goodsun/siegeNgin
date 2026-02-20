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
  const { method, endpoint, body } = msg;
  const url = `${API_BASE}${endpoint}`;

  // Get token from storage
  const { sn_token } = await chrome.storage.local.get('sn_token');

  const opts = {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (sn_token) {
    opts.headers['X-SiegeNgin-Token'] = sn_token;
  }

  if (body) {
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(url, opts);
  const data = resp.status === 204 ? {} : await resp.json();
  return { status: resp.status, data };
}
