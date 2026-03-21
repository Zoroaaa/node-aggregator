/**
 * Node Aggregator - Cloudflare Worker
 * Supports: VLESS, VMess, Trojan, SS, SSR, Hysteria, Hysteria2, TUIC, SOCKS5, HTTP
 */

// ─── HTML PAGE ───────────────────────────────────────────────────────────────

const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>节点聚合器 · Node Aggregator</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: rgba(255,255,255,0.06);
    --border-hover: rgba(255,255,255,0.14);
    --accent: #7c6af7;
    --accent2: #3ecfcf;
    --accent3: #f7856a;
    --text: #e8e8f0;
    --text-dim: rgba(232,232,240,0.45);
    --text-muted: rgba(232,232,240,0.25);
    --success: #4ade80;
    --error: #f87171;
    --radius: 12px;
    --radius-sm: 8px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Animated grid bg */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,106,247,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,106,247,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* Glow blobs */
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 { width: 600px; height: 600px; background: rgba(124,106,247,0.08); top: -200px; right: -100px; }
  .blob-2 { width: 400px; height: 400px; background: rgba(62,207,207,0.06); bottom: -100px; left: -100px; }

  .app { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 48px 24px 80px; }

  /* Header */
  header { margin-bottom: 56px; }

  .logo-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }

  .logo-icon {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    box-shadow: 0 0 24px rgba(124,106,247,0.4);
  }

  h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }

  .tagline {
    font-size: 13px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .header-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }

  .badge {
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    border: 1px solid;
  }
  .badge-vless { color: #7c6af7; border-color: rgba(124,106,247,0.3); background: rgba(124,106,247,0.08); }
  .badge-vmess { color: #3ecfcf; border-color: rgba(62,207,207,0.3); background: rgba(62,207,207,0.08); }
  .badge-trojan { color: #f7856a; border-color: rgba(247,133,106,0.3); background: rgba(247,133,106,0.08); }
  .badge-ss { color: #f7c76a; border-color: rgba(247,199,106,0.3); background: rgba(247,199,106,0.08); }
  .badge-hy2 { color: #a78bfa; border-color: rgba(167,139,250,0.3); background: rgba(167,139,250,0.08); }
  .badge-more { color: var(--text-dim); border-color: var(--border-hover); background: rgba(255,255,255,0.03); }

  /* Card */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 20px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: var(--border-hover); }

  .card-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
  }

  .card-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .icon-purple { background: rgba(124,106,247,0.15); }
  .icon-cyan { background: rgba(62,207,207,0.15); }
  .icon-orange { background: rgba(247,133,106,0.15); }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .card-subtitle { font-size: 11px; color: var(--text-dim); margin-top: 1px; }

  /* Textarea */
  .input-area {
    position: relative;
  }

  textarea {
    width: 100%;
    min-height: 200px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    line-height: 1.7;
    padding: 16px;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124,106,247,0.12);
  }
  textarea::placeholder { color: var(--text-muted); }

  .textarea-footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 10px;
  }

  .node-count {
    font-size: 11px; color: var(--text-dim);
    display: flex; align-items: center; gap: 6px;
  }
  .count-badge {
    background: rgba(124,106,247,0.15);
    color: var(--accent);
    border-radius: 100px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    min-width: 20px;
    text-align: center;
  }

  .btn-clear {
    background: none; border: none;
    color: var(--text-dim); font-size: 11px; cursor: pointer;
    font-family: inherit;
    padding: 4px 8px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
  }
  .btn-clear:hover { color: var(--error); background: rgba(248,113,113,0.08); }

  /* Config row */
  .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 560px) { .config-grid { grid-template-columns: 1fr; } }

  .field label {
    display: block;
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  input[type="text"], select {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124,106,247,0.12);
  }
  select { cursor: pointer; }
  select option { background: var(--surface2); }

  /* Name row */
  .name-row { margin-bottom: 16px; }

  /* Btn */
  .btn-generate {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--accent), #5b4fd4);
    border: none;
    border-radius: var(--radius-sm);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 24px rgba(124,106,247,0.35);
    margin-top: 20px;
    position: relative;
    overflow: hidden;
  }
  .btn-generate::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-generate:hover::before { opacity: 1; }
  .btn-generate:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,106,247,0.45); }
  .btn-generate:active { transform: translateY(0); }
  .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Result */
  .result-card { display: none; }
  .result-card.show { display: block; }

  .sub-links { display: flex; flex-direction: column; gap: 10px; }

  .sub-item {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    transition: border-color 0.2s;
  }
  .sub-item:hover { border-color: var(--border-hover); }

  .sub-type {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 6px;
    flex-shrink: 0;
    min-width: 60px;
    text-align: center;
  }
  .type-base64 { background: rgba(124,106,247,0.15); color: var(--accent); }
  .type-clash { background: rgba(62,207,207,0.15); color: var(--accent2); }
  .type-singbox { background: rgba(247,133,106,0.15); color: var(--accent3); }
  .type-raw { background: rgba(74,222,128,0.15); color: var(--success); }

  .sub-url {
    flex: 1;
    font-size: 11px;
    color: var(--text-dim);
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub-actions { display: flex; gap: 6px; flex-shrink: 0; }

  .btn-copy, .btn-qr {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
    font-family: inherit;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-copy {
    background: rgba(124,106,247,0.1);
    color: var(--accent);
    border-color: rgba(124,106,247,0.2);
  }
  .btn-copy:hover { background: rgba(124,106,247,0.2); }
  .btn-copy.copied { background: rgba(74,222,128,0.15); color: var(--success); border-color: rgba(74,222,128,0.3); }
  .btn-qr { background: transparent; color: var(--text-dim); }
  .btn-qr:hover { background: var(--surface2); color: var(--text); }

  /* Stats */
  .stats-row {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .stat-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    font-size: 11px;
    color: var(--text-dim);
  }
  .stat-num { color: var(--text); font-weight: 500; }

  /* QR Modal */
  .modal-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
    z-index: 100; align-items: center; justify-content: center;
  }
  .modal-overlay.show { display: flex; }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border-hover);
    border-radius: 16px;
    padding: 32px;
    max-width: 360px;
    width: 90%;
    text-align: center;
    animation: popIn 0.2s ease;
  }
  @keyframes popIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  #qr-canvas {
    border-radius: 8px;
    border: 8px solid #fff;
    display: block;
    margin: 0 auto 20px;
  }

  .btn-modal-close {
    width: 100%;
    padding: 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-modal-close:hover { background: rgba(255,255,255,0.05); }

  /* Toast */
  .toast {
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: var(--surface);
    border: 1px solid var(--border-hover);
    border-radius: 100px;
    padding: 10px 20px;
    font-size: 13px;
    color: var(--text);
    z-index: 200;
    opacity: 0;
    transition: opacity 0.3s, bottom 0.3s;
    pointer-events: none;
    white-space: nowrap;
  }
  .toast.show { opacity: 1; bottom: 40px; }
  .toast.success { border-color: rgba(74,222,128,0.3); color: var(--success); }
  .toast.error { border-color: rgba(248,113,113,0.3); color: var(--error); }

  /* Divider */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  /* Link */
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .footer {
    text-align: center;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 60px;
    letter-spacing: 0.04em;
  }

  /* Loading spinner */
  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>
</head>
<body>
<div class="blob blob-1"></div>
<div class="blob blob-2"></div>

<div class="app">
  <!-- Header -->
  <header>
    <div class="logo-row">
      <div class="logo-icon">⬡</div>
      <div>
        <h1>节点聚合器</h1>
        <div class="tagline">Node Aggregator · Multi-Protocol Subscription</div>
      </div>
    </div>
    <div class="header-badges">
      <span class="badge badge-vless">VLESS</span>
      <span class="badge badge-vmess">VMess</span>
      <span class="badge badge-trojan">Trojan</span>
      <span class="badge badge-ss">Shadowsocks</span>
      <span class="badge badge-hy2">Hysteria2</span>
      <span class="badge badge-more">+SSR · TUIC · HTTP · SOCKS5</span>
    </div>
  </header>

  <!-- Input Card -->
  <div class="card">
    <div class="card-header">
      <div class="card-icon icon-purple">📥</div>
      <div>
        <div class="card-title">粘贴节点</div>
        <div class="card-subtitle">每行一个节点链接，支持所有主流协议</div>
      </div>
    </div>

    <div class="input-area">
      <textarea id="nodes-input"
        placeholder="vless://uuid@host:port?type=ws&security=tls#name&#10;vmess://base64...&#10;trojan://password@host:port#name&#10;ss://method:password@host:port#name&#10;hysteria2://password@host:port#name&#10;ssr://...&#10;tuic://...&#10;&#10;支持混合粘贴多种协议，每行一个"
        oninput="updateCount()"
        onpaste="setTimeout(updateCount,50)"
      ></textarea>
      <div class="textarea-footer">
        <div class="node-count">
          已识别节点：<span class="count-badge" id="node-count">0</span>
        </div>
        <button class="btn-clear" onclick="clearInput()">清空</button>
      </div>
    </div>
  </div>

  <!-- Config Card -->
  <div class="card">
    <div class="card-header">
      <div class="card-icon icon-cyan">⚙️</div>
      <div>
        <div class="card-title">订阅配置</div>
        <div class="card-subtitle">自定义订阅名称与去重选项</div>
      </div>
    </div>

    <div class="name-row field">
      <label>订阅名称（可选）</label>
      <input type="text" id="sub-name" placeholder="My Subscription" maxlength="50">
    </div>

    <div class="config-grid">
      <div class="field">
        <label>去重策略</label>
        <select id="dedup">
          <option value="none">不去重</option>
          <option value="host">按地址去重</option>
          <option value="name">按名称去重</option>
        </select>
      </div>
      <div class="field">
        <label>节点过滤</label>
        <select id="filter">
          <option value="">全部保留</option>
          <option value="vless">仅 VLESS</option>
          <option value="vmess">仅 VMess</option>
          <option value="trojan">仅 Trojan</option>
          <option value="ss">仅 Shadowsocks</option>
          <option value="ssr">仅 SSR</option>
          <option value="hysteria2">仅 Hysteria2</option>
          <option value="hysteria">仅 Hysteria</option>
          <option value="tuic">仅 TUIC</option>
        </select>
      </div>
    </div>

    <button class="btn-generate" id="gen-btn" onclick="generate()">
      ⚡ 生成订阅链接
    </button>
  </div>

  <!-- Result Card -->
  <div class="card result-card" id="result-card">
    <div class="card-header">
      <div class="card-icon icon-orange">🔗</div>
      <div>
        <div class="card-title">订阅链接</div>
        <div class="card-subtitle">复制链接到你的代理客户端</div>
      </div>
    </div>

    <div class="stats-row" id="stats-row"></div>
    <div class="sub-links" id="sub-links"></div>
  </div>

  <div class="footer">
    Powered by Cloudflare Workers · 数据仅存储在浏览器本地
  </div>
</div>

<!-- QR Modal -->
<div class="modal-overlay" id="qr-modal" onclick="closeQR(event)">
  <div class="modal">
    <div class="modal-title">扫码导入</div>
    <canvas id="qr-canvas" width="240" height="240"></canvas>
    <button class="btn-modal-close" onclick="closeQRBtn()">关闭</button>
  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>
// ─── Protocol detection ──────────────────────────────────────────────────────
const PROTOCOLS = ['vless','vmess','trojan','ss','ssr','hysteria2','hysteria','tuic','socks5','http'];

function detectProtocol(line) {
  line = line.trim();
  if (!line) return null;
  for (const p of PROTOCOLS) {
    if (line.toLowerCase().startsWith(p + '://')) return p;
  }
  return null;
}

function parseNodes(text) {
  const lines = text.split(/\\n|\\r\\n|\\r/).map(l => l.trim()).filter(Boolean);
  const nodes = [];
  for (const line of lines) {
    const proto = detectProtocol(line);
    if (proto) nodes.push({ proto, raw: line });
  }
  return nodes;
}

// ─── Count update ────────────────────────────────────────────────────────────
function updateCount() {
  const text = document.getElementById('nodes-input').value;
  const nodes = parseNodes(text);
  document.getElementById('node-count').textContent = nodes.length;
}

function clearInput() {
  document.getElementById('nodes-input').value = '';
  updateCount();
  document.getElementById('result-card').classList.remove('show');
}

// ─── Generate ────────────────────────────────────────────────────────────────
async function generate() {
  const text = document.getElementById('nodes-input').value.trim();
  if (!text) { showToast('请先粘贴节点内容', 'error'); return; }

  const nodes = parseNodes(text);
  if (nodes.length === 0) { showToast('未识别到有效节点', 'error'); return; }

  const btn = document.getElementById('gen-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>生成中...';

  try {
    const name = document.getElementById('sub-name').value.trim() || 'My Subscription';
    const dedup = document.getElementById('dedup').value;
    const filter = document.getElementById('filter').value;

    const res = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: text, name, dedup, filter })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || '生成失败');

    renderResult(data);
    showToast('订阅生成成功 ✓', 'success');
  } catch(e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '⚡ 生成订阅链接';
  }
}

// ─── Render result ───────────────────────────────────────────────────────────
function renderResult(data) {
  const card = document.getElementById('result-card');
  card.classList.add('show');

  // Stats
  const statsRow = document.getElementById('stats-row');
  const protoMap = {};
  data.stats.protocols.forEach(p => protoMap[p.name] = p.count);

  const statItems = [
    { label: '总节点', value: data.stats.total },
    ...data.stats.protocols.map(p => ({ label: p.name.toUpperCase(), value: p.count }))
  ];

  statsRow.innerHTML = statItems.map(s =>
    \`<div class="stat-pill"><span class="stat-num">\${s.value}</span> \${s.label}</div>\`
  ).join('');

  // Links
  const linksEl = document.getElementById('sub-links');
  const links = [
    { type: 'base64', label: 'BASE64', url: data.urls.base64, cls: 'type-base64' },
    { type: 'clash', label: 'CLASH', url: data.urls.clash, cls: 'type-clash' },
    { type: 'singbox', label: 'SING-BOX', url: data.urls.singbox, cls: 'type-singbox' },
    { type: 'raw', label: 'RAW', url: data.urls.raw, cls: 'type-raw' },
  ];

  linksEl.innerHTML = links.map(l => \`
    <div class="sub-item">
      <span class="sub-type \${l.cls}">\${l.label}</span>
      <span class="sub-url" title="\${l.url}">\${l.url}</span>
      <div class="sub-actions">
        <button class="btn-copy" onclick="copyUrl('\${l.url}', this)">复制</button>
        <button class="btn-qr" onclick="showQR('\${l.url}')">二维码</button>
      </div>
    </div>
  \`).join('');

  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Copy ────────────────────────────────────────────────────────────────────
async function copyUrl(url, btn) {
  try {
    await navigator.clipboard.writeText(url);
    btn.textContent = '✓ 已复制';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
  } catch {
    showToast('复制失败，请手动复制', 'error');
  }
}

// ─── QR Code ─────────────────────────────────────────────────────────────────
let qrInstance = null;

function showQR(url) {
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 240, 240);

  document.getElementById('qr-modal').classList.add('show');

  // Simple QR using qrcodejs
  const container = document.createElement('div');
  try {
    new QRCode(container, { text: url, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M });
    setTimeout(() => {
      const img = container.querySelector('img') || container.querySelector('canvas');
      if (img) {
        const tmpImg = new Image();
        tmpImg.onload = () => { ctx.drawImage(tmpImg, 0, 0, 240, 240); };
        tmpImg.src = img.src || img.toDataURL();
      }
    }, 100);
  } catch(e) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,240,240);
    ctx.fillStyle = '#333';
    ctx.font = '12px monospace';
    ctx.fillText('QR生成失败', 60, 120);
  }
}

function closeQR(e) { if (e.target.id === 'qr-modal') closeQRBtn(); }
function closeQRBtn() { document.getElementById('qr-modal').classList.remove('show'); }

// ─── Toast ───────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// Enter to generate
document.getElementById('nodes-input').addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') generate();
});
</script>
</body>
</html>`;

// ─── Utilities ────────────────────────────────────────────────────────────────

function nanoid(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) id += chars[b % chars.length];
  return id;
}

function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64decode(str) {
  try {
    return decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
  } catch {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }
}

// ─── Protocol parsing ─────────────────────────────────────────────────────────

const PROTOCOLS = ['vless', 'vmess', 'trojan', 'ss', 'ssr', 'hysteria2', 'hysteria', 'tuic', 'socks5', 'http'];

function detectProtocol(line) {
  line = line.trim();
  for (const p of PROTOCOLS) {
    if (line.toLowerCase().startsWith(p + '://')) return p;
  }
  return null;
}

function parseNodes(text, filter = '') {
  const lines = text.split(/\n|\r\n|\r/).map(l => l.trim()).filter(Boolean);
  const nodes = [];

  for (const line of lines) {
    const proto = detectProtocol(line);
    if (!proto) continue;
    if (filter && proto !== filter) continue;

    let name = '';
    let host = '';

    try {
      // Extract name from fragment
      const hashIdx = line.lastIndexOf('#');
      if (hashIdx > 0) {
        name = decodeURIComponent(line.slice(hashIdx + 1));
      }

      // Extract host for dedup
      if (proto === 'vmess') {
        const b64 = line.slice('vmess://'.length).split('#')[0];
        try {
          const obj = JSON.parse(b64decode(b64));
          host = `${obj.add}:${obj.port}`;
          if (!name) name = obj.ps || obj.add || '';
        } catch {}
      } else {
        const url = new URL(line.split('#')[0]);
        host = `${url.hostname}:${url.port}`;
        if (!name) name = url.hostname;
      }
    } catch {}

    nodes.push({ proto, raw: line, name, host });
  }

  return nodes;
}

function deduplicate(nodes, strategy) {
  if (strategy === 'none') return nodes;
  const seen = new Set();
  return nodes.filter(n => {
    const key = strategy === 'host' ? n.host : n.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Format converters ────────────────────────────────────────────────────────

function toBase64Sub(nodes) {
  const raw = nodes.map(n => n.raw).join('\n');
  return b64encode(raw);
}

function toRaw(nodes) {
  return nodes.map(n => n.raw).join('\n');
}

function toClashYaml(nodes) {
  const proxies = [];
  const names = [];

  for (const node of nodes) {
    try {
      const proxy = convertToClashProxy(node);
      if (proxy) {
        proxies.push(proxy);
        names.push(proxy.name);
      }
    } catch {}
  }

  const yaml = `mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
external-controller: 127.0.0.1:9090

proxies:
${proxies.map(p => toYamlProxy(p)).join('\n')}

proxy-groups:
  - name: 🌐 Proxy
    type: select
    proxies:
      - DIRECT
${names.map(n => `      - ${yamlStr(n)}`).join('\n')}

  - name: 🎯 Final
    type: select
    proxies:
      - 🌐 Proxy
      - DIRECT

rules:
  - MATCH,🎯 Final
`;
  return yaml;
}

function yamlStr(s) {
  if (/[:#\[\]{},|>&*!,?]/.test(s) || s.includes("'")) {
    return `"${s.replace(/"/g, '\\"')}"`;
  }
  return s;
}

function toYamlProxy(p) {
  const entries = Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const lines = entries.map(([k, v]) => {
    if (typeof v === 'boolean') return `    ${k}: ${v}`;
    if (typeof v === 'number') return `    ${k}: ${v}`;
    if (typeof v === 'object') return `    ${k}: ${JSON.stringify(v)}`;
    return `    ${k}: ${yamlStr(String(v))}`;
  });
  return `  - ${lines[0].trim()}\n${lines.slice(1).join('\n')}`;
}

function convertToClashProxy(node) {
  const { proto, raw } = node;

  if (proto === 'vmess') {
    const b64 = raw.slice('vmess://'.length).split('#')[0];
    const obj = JSON.parse(b64decode(b64));
    const p = {
      name: obj.ps || obj.add || 'vmess',
      type: 'vmess',
      server: obj.add,
      port: parseInt(obj.port),
      uuid: obj.id,
      alterId: parseInt(obj.aid || 0),
      cipher: obj.scy || 'auto',
    };
    if (obj.net === 'ws') {
      p.network = 'ws';
      p['ws-opts'] = { path: obj.path || '/', headers: obj.host ? { Host: obj.host } : undefined };
    } else if (obj.net === 'grpc') {
      p.network = 'grpc';
      p['grpc-opts'] = { 'grpc-service-name': obj.path || '' };
    }
    if (obj.tls === 'tls') {
      p.tls = true;
      if (obj.sni) p.servername = obj.sni;
      if (obj.fp) p['client-fingerprint'] = obj.fp;
    }
    return p;
  }

  if (proto === 'vless') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    const p = {
      name,
      type: 'vless',
      server: url.hostname,
      port: parseInt(url.port),
      uuid: url.username,
      udp: true,
    };
    const net = params.get('type') || 'tcp';
    if (net === 'ws') {
      p.network = 'ws';
      p['ws-opts'] = { path: params.get('path') || '/', headers: params.get('host') ? { Host: params.get('host') } : undefined };
    } else if (net === 'grpc') {
      p.network = 'grpc';
      p['grpc-opts'] = { 'grpc-service-name': params.get('serviceName') || '' };
    } else if (net === 'http') {
      p.network = 'http';
    }
    const sec = params.get('security');
    if (sec === 'tls' || sec === 'reality') {
      p.tls = true;
      if (params.get('sni')) p.servername = params.get('sni');
      if (params.get('fp')) p['client-fingerprint'] = params.get('fp');
      if (sec === 'reality') {
        p['reality-opts'] = {
          'public-key': params.get('pbk') || '',
          'short-id': params.get('sid') || '',
        };
      }
    }
    const flow = params.get('flow');
    if (flow) p.flow = flow;
    return p;
  }

  if (proto === 'trojan') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    const p = {
      name,
      type: 'trojan',
      server: url.hostname,
      port: parseInt(url.port),
      password: decodeURIComponent(url.username),
      udp: true,
    };
    if (params.get('sni')) p.sni = params.get('sni');
    const net = params.get('type');
    if (net === 'ws') {
      p.network = 'ws';
      p['ws-opts'] = { path: params.get('path') || '/' };
    } else if (net === 'grpc') {
      p.network = 'grpc';
      p['grpc-opts'] = { 'grpc-service-name': params.get('serviceName') || '' };
    }
    if (params.get('allowInsecure') === '1') p['skip-cert-verify'] = true;
    return p;
  }

  if (proto === 'ss') {
    // ss://BASE64@host:port#name  or  ss://method:pass@host:port#name
    const fragIdx = raw.lastIndexOf('#');
    const name = fragIdx > 0 ? decodeURIComponent(raw.slice(fragIdx + 1)) : '';
    const core = raw.slice('ss://'.length, fragIdx > 0 ? fragIdx : undefined);
    let method, password, server, port;

    const atIdx = core.lastIndexOf('@');
    if (atIdx > 0) {
      const hostPart = core.slice(atIdx + 1);
      const [h, po] = hostPart.split(':');
      server = h; port = parseInt(po);
      const credPart = core.slice(0, atIdx);
      if (credPart.includes(':')) {
        [method, password] = credPart.split(':');
      } else {
        // base64 encoded method:pass
        const decoded = b64decode(credPart);
        [method, password] = decoded.split(':');
      }
    } else {
      // fully base64
      const decoded = b64decode(core);
      const atI = decoded.lastIndexOf('@');
      const hostPart = decoded.slice(atI + 1);
      const [h, po] = hostPart.split(':');
      server = h; port = parseInt(po);
      const credPart = decoded.slice(0, atI);
      [method, password] = credPart.split(':');
    }
    return { name: name || server, type: 'ss', server, port, cipher: method, password, udp: true };
  }

  if (proto === 'hysteria2' || proto === 'hy2') {
    const url = new URL(raw.split('#')[0].replace('hy2://', 'hysteria2://'));
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    return {
      name,
      type: 'hysteria2',
      server: url.hostname,
      port: parseInt(url.port) || 443,
      password: decodeURIComponent(url.username || url.password || ''),
      sni: params.get('sni') || url.hostname,
      'skip-cert-verify': params.get('insecure') === '1',
    };
  }

  if (proto === 'hysteria') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    return {
      name,
      type: 'hysteria',
      server: url.hostname,
      port: parseInt(url.port) || 443,
      'auth-str': params.get('auth') || params.get('auth_str') || '',
      protocol: params.get('protocol') || 'udp',
      up: params.get('upmbps') || '10',
      down: params.get('downmbps') || '50',
      sni: params.get('peer') || url.hostname,
      'skip-cert-verify': params.get('insecure') === '1',
    };
  }

  // Fallback: return null for unsupported (SSR, TUIC etc clash handles differently)
  return null;
}

function toSingboxJson(nodes) {
  const outbounds = [];

  for (const node of nodes) {
    try {
      const ob = convertToSingbox(node);
      if (ob) outbounds.push(ob);
    } catch {}
  }

  const names = outbounds.map(o => o.tag);

  const config = {
    log: { level: 'info', timestamp: true },
    dns: {
      servers: [
        { tag: 'google', address: 'https://8.8.8.8/dns-query' },
        { tag: 'local', address: '223.5.5.5', detour: 'direct' }
      ],
      rules: [{ geosite: 'cn', server: 'local' }]
    },
    inbounds: [
      { type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 2080 }
    ],
    outbounds: [
      ...outbounds,
      { type: 'selector', tag: 'proxy', outbounds: ['auto', ...names] },
      { type: 'urltest', tag: 'auto', outbounds: names, url: 'https://www.gstatic.com/generate_204', interval: '3m' },
      { type: 'direct', tag: 'direct' },
      { type: 'block', tag: 'block' },
      { type: 'dns', tag: 'dns-out' }
    ],
    route: {
      rules: [
        { protocol: 'dns', outbound: 'dns-out' },
        { geosite: 'cn', outbound: 'direct' },
        { geoip: 'cn', outbound: 'direct' }
      ],
      final: 'proxy'
    }
  };

  return JSON.stringify(config, null, 2);
}

function convertToSingbox(node) {
  const { proto, raw } = node;

  if (proto === 'vless') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    const ob = {
      type: 'vless',
      tag: name,
      server: url.hostname,
      server_port: parseInt(url.port),
      uuid: url.username,
    };
    const sec = params.get('security');
    if (sec === 'tls') {
      ob.tls = { enabled: true, server_name: params.get('sni') || url.hostname };
    } else if (sec === 'reality') {
      ob.tls = {
        enabled: true,
        server_name: params.get('sni') || url.hostname,
        reality: { enabled: true, public_key: params.get('pbk') || '', short_id: params.get('sid') || '' }
      };
      if (params.get('fp')) ob.tls.utls = { enabled: true, fingerprint: params.get('fp') };
    }
    const net = params.get('type');
    if (net === 'ws') {
      ob.transport = { type: 'ws', path: params.get('path') || '/', headers: params.get('host') ? { Host: params.get('host') } : undefined };
    } else if (net === 'grpc') {
      ob.transport = { type: 'grpc', service_name: params.get('serviceName') || '' };
    }
    if (params.get('flow')) ob.flow = params.get('flow');
    return ob;
  }

  if (proto === 'vmess') {
    const b64 = raw.slice('vmess://'.length).split('#')[0];
    const obj = JSON.parse(b64decode(b64));
    const ob = {
      type: 'vmess',
      tag: obj.ps || obj.add,
      server: obj.add,
      server_port: parseInt(obj.port),
      uuid: obj.id,
      alter_id: parseInt(obj.aid || 0),
      security: obj.scy || 'auto',
    };
    if (obj.tls === 'tls') {
      ob.tls = { enabled: true, server_name: obj.sni || obj.host || obj.add };
    }
    if (obj.net === 'ws') {
      ob.transport = { type: 'ws', path: obj.path || '/', headers: obj.host ? { Host: obj.host } : undefined };
    } else if (obj.net === 'grpc') {
      ob.transport = { type: 'grpc', service_name: obj.path || '' };
    }
    return ob;
  }

  if (proto === 'trojan') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    const ob = {
      type: 'trojan',
      tag: name,
      server: url.hostname,
      server_port: parseInt(url.port),
      password: decodeURIComponent(url.username),
      tls: { enabled: true, server_name: params.get('sni') || url.hostname },
    };
    if (params.get('type') === 'ws') {
      ob.transport = { type: 'ws', path: params.get('path') || '/' };
    }
    return ob;
  }

  if (proto === 'ss') {
    const clash = convertToClashProxy(node);
    if (!clash) return null;
    return {
      type: 'shadowsocks',
      tag: clash.name,
      server: clash.server,
      server_port: clash.port,
      method: clash.cipher,
      password: clash.password,
    };
  }

  if (proto === 'hysteria2') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    return {
      type: 'hysteria2',
      tag: name,
      server: url.hostname,
      server_port: parseInt(url.port) || 443,
      password: decodeURIComponent(url.username || url.password || ''),
      tls: {
        enabled: true,
        server_name: params.get('sni') || url.hostname,
        insecure: params.get('insecure') === '1',
      },
    };
  }

  if (proto === 'tuic') {
    const url = new URL(raw.split('#')[0]);
    const params = url.searchParams;
    const name = raw.includes('#') ? decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1)) : url.hostname;
    return {
      type: 'tuic',
      tag: name,
      server: url.hostname,
      server_port: parseInt(url.port),
      uuid: url.username,
      password: decodeURIComponent(url.password || ''),
      tls: { enabled: true, server_name: params.get('sni') || url.hostname },
      congestion_control: params.get('congestion_control') || 'bbr',
    };
  }

  return null;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function getStats(nodes) {
  const counts = {};
  for (const n of nodes) {
    counts[n.proto] = (counts[n.proto] || 0) + 1;
  }
  return {
    total: nodes.length,
    protocols: Object.entries(counts).map(([name, count]) => ({ name, count }))
  };
}

// ─── KV storage ───────────────────────────────────────────────────────────────

async function saveSubscription(env, id, data) {
  await env.SUBSCRIPTIONS.put(id, JSON.stringify(data), { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days
}

async function getSubscription(env, id) {
  const data = await env.SUBSCRIPTIONS.get(id);
  if (!data) return null;
  return JSON.parse(data);
}

// ─── Request handlers ─────────────────────────────────────────────────────────

async function handleCreate(request, env, origin) {
  const body = await request.json();
  const { nodes: text, name, dedup = 'none', filter = '' } = body;

  if (!text || text.trim().length === 0) {
    return jsonResponse({ success: false, error: '节点内容不能为空' }, 400);
  }

  let nodes = parseNodes(text, filter);
  if (nodes.length === 0) {
    return jsonResponse({ success: false, error: '未识别到有效节点' }, 400);
  }

  nodes = deduplicate(nodes, dedup);

  const id = nanoid(20);
  await saveSubscription(env, id, { nodes: nodes.map(n => n.raw), name, createdAt: Date.now() });

  const stats = getStats(nodes);
  const urls = {
    base64: `${origin}/sub/${id}?format=base64`,
    clash: `${origin}/sub/${id}?format=clash`,
    singbox: `${origin}/sub/${id}?format=singbox`,
    raw: `${origin}/sub/${id}?format=raw`,
  };

  return jsonResponse({ success: true, id, stats, urls, name });
}

async function handleSub(id, format, env) {
  const sub = await getSubscription(env, id);
  if (!sub) {
    return new Response('Not Found', { status: 404 });
  }

  const rawText = sub.nodes.join('\n');
  const nodes = parseNodes(rawText);
  const name = sub.name || 'Subscription';

  const headers = {
    'subscription-userinfo': `upload=0; download=0; total=107374182400; expire=4102416000`,
    'profile-title': `base64:${btoa(name)}`,
    'profile-update-interval': '24',
    'content-disposition': `attachment; filename="${encodeURIComponent(name)}"`,
  };

  if (format === 'clash') {
    headers['content-type'] = 'text/yaml; charset=utf-8';
    return new Response(toClashYaml(nodes), { headers });
  }

  if (format === 'singbox') {
    headers['content-type'] = 'application/json; charset=utf-8';
    return new Response(toSingboxJson(nodes), { headers });
  }

  if (format === 'raw') {
    headers['content-type'] = 'text/plain; charset=utf-8';
    return new Response(toRaw(nodes), { headers });
  }

  // Default: base64
  headers['content-type'] = 'text/plain; charset=utf-8';
  return new Response(toBase64Sub(nodes), { headers });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = url.origin;
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'content-type',
        }
      });
    }

    // Main page
    if (path === '/' || path === '') {
      return new Response(HTML_PAGE, {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // API: create subscription
    if (path === '/api/create' && request.method === 'POST') {
      return handleCreate(request, env, origin);
    }

    // Subscription endpoint
    if (path.startsWith('/sub/')) {
      const id = path.slice(5).split('?')[0];
      const format = url.searchParams.get('format') || 'base64';
      return handleSub(id, format, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};
