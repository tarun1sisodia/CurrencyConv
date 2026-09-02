import { isValidCurrencyCode } from '@/lib/currencies';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { getBaseUrl } from '@/lib/site';
import { normalizeCode } from '@/lib/utils';

export const runtime = 'nodejs';

/**
 * Returns a self-contained HTML converter for iframe embeds.
 * Query: theme=light|dark&pair=USD-EUR
 */
export async function GET(request: Request): Promise<Response> {
  const limited = rateLimit(getClientIp(request));
  if (!limited.success) {
    return new Response('Rate limited', { status: 429 });
  }
  const url = new URL(request.url);
  const theme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';
  const pair = (url.searchParams.get('pair') ?? 'USD-EUR').toUpperCase();
  const [fromRaw, toRaw] = pair.split('-');
  const from = fromRaw && isValidCurrencyCode(fromRaw) ? normalizeCode(fromRaw) : 'USD';
  const to = toRaw && isValidCurrencyCode(toRaw) ? normalizeCode(toRaw) : 'EUR';
  const html = renderWidget(theme, from, to);
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors *",
    },
  });
}

function renderWidget(theme: 'light' | 'dark', from: string, to: string): string {
  const origin = getBaseUrl();
  const bg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const fg = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const muted = theme === 'dark' ? '#94a3b8' : '#475569';
  const accent = '#4f46e5';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${from} to ${to} converter</title>
  <style>
    :root { color-scheme: ${theme}; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: ${bg}; color: ${fg}; }
    .card { padding: 16px; }
    label { display: block; font-size: 12px; color: ${muted}; margin-bottom: 4px; }
    input { width: 100%; font-size: 24px; border: 0; background: transparent; color: inherit; outline: none; }
    .row { display: flex; justify-content: space-between; gap: 8px; margin: 12px 0; }
    .code { font-weight: 700; }
    .result { font-size: 28px; font-weight: 700; color: ${accent}; min-height: 36px; }
    .meta { font-size: 12px; color: ${muted}; margin-top: 8px; }
    a { color: ${accent}; }
  </style>
</head>
<body>
  <div class="card">
    <label for="amount">Amount (${from})</label>
    <input id="amount" type="text" inputmode="decimal" value="1" aria-label="Amount" />
    <div class="row"><span class="code">${from}</span><span>→</span><span class="code">${to}</span></div>
    <div class="result" id="result" aria-live="polite">—</div>
    <p class="meta" id="rate"></p>
    <p class="meta"><a href="${origin}/en/${from.toLowerCase()}-to-${to.toLowerCase()}" target="_blank" rel="noopener">CurrencyConv</a></p>
  </div>
  <script>
    const from = ${JSON.stringify(from)};
    const to = ${JSON.stringify(to)};
    const amountEl = document.getElementById('amount');
    const resultEl = document.getElementById('result');
    const rateEl = document.getElementById('rate');
    let rate = 0;
    function render() {
      const raw = amountEl.value.replace(/[^0-9.]/g, '');
      if (raw !== amountEl.value) amountEl.value = raw;
      const amount = parseFloat(raw);
      const value = !rate || !isFinite(amount) ? 0 : Math.round(amount * rate * 10000) / 10000;
      resultEl.textContent = value.toFixed(4) + ' ' + to;
      rateEl.textContent = rate ? ('1 ' + from + ' = ' + rate.toFixed(4) + ' ' + to) : 'Loading rates…';
    }
    fetch('/api/rates?base=' + encodeURIComponent(from))
      .then((r) => r.json())
      .then((data) => { rate = Number(data.rates[to]) || 0; render(); })
      .catch(() => { rateEl.textContent = 'Rates unavailable'; });
    amountEl.addEventListener('input', render);
    render();
  </script>
</body>
</html>`;
}
