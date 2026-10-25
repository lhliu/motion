// 伺服器端截圖：Cloudflare Browser Run 的 snapshot（同時拿到截圖與頁面內容，用來讀出錯誤訊息）。
// 優先用 Pages 綁定 BROWSER；沒有就用 REST API（CF_ACCOUNT_ID + CF_BROWSER_TOKEN）。
import type { Env } from './env';

export const SHOT_SETUP =
  '伺服器截圖尚未設定。請網站管理者在 Cloudflare Pages 專案 → Settings → Variables and Secrets 加上 CF_ACCOUNT_ID（帳號 ID）與 CF_BROWSER_TOKEN（API Token，權限 Account → Browser Run → Edit，選加密），重新部署後即可使用。免費方案每天 10 分鐘瀏覽器時間，一次預覽約 10–25 秒。';

export const canShoot = (env: Env) => !!(env.BROWSER?.quickAction || (env.CF_ACCOUNT_ID && env.CF_BROWSER_TOKEN));

export interface Shot {
  /** base64 圖片 */
  image: string;
  mime: string;
  html: string;
}

export const snapshot = async (env: Env, url: string, viewport: { width: number; height: number }, waitMs: number): Promise<Shot> => {
  const body = {
    url,
    viewport: { ...viewport, deviceScaleFactor: 1 },
    gotoOptions: { waitUntil: 'load', timeout: 30000 },
    // 分格預覽頁在所有格子都停在目標時間後才會加上 #ready
    waitForSelector: { selector: '#ready', timeout: Math.min(60000, waitMs + 20000) },
    screenshotOptions: { fullPage: true, type: 'jpeg', quality: 72 },
  };
  let res: Response;
  if (env.BROWSER?.quickAction) res = await env.BROWSER.quickAction('snapshot', body);
  else if (env.CF_ACCOUNT_ID && env.CF_BROWSER_TOKEN)
    res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-run/snapshot`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.CF_BROWSER_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  else throw new Error(SHOT_SETUP);
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 429) throw new Error('今天的截圖額度用完了（Browser Run 免費方案每天 10 分鐘），請改用 play_url 讓使用者看，或明天再試。');
    throw new Error(`截圖服務回應 ${res.status}：${text.slice(0, 300)}`);
  }
  const j = JSON.parse(text) as { result?: { screenshot?: string; content?: string }; screenshot?: string; content?: string };
  const r = j.result ?? j;
  if (!r.screenshot) throw new Error('截圖服務沒有回傳圖片');
  return { image: r.screenshot, mime: 'image/jpeg', html: r.content ?? '' };
};

/** 透明背景 PNG 截圖（小地圖輸出用） */
export const screenshotPng = async (env: Env, url: string, viewport: { width: number; height: number }): Promise<ArrayBuffer> => {
  const body = {
    url,
    viewport: { ...viewport, deviceScaleFactor: 1 },
    gotoOptions: { waitUntil: 'load', timeout: 30000 },
    waitForSelector: { selector: '#ready', timeout: 20000 },
    screenshotOptions: { type: 'png', omitBackground: true },
  };
  let res: Response;
  if (env.BROWSER?.quickAction) res = await env.BROWSER.quickAction('screenshot', body);
  else if (env.CF_ACCOUNT_ID && env.CF_BROWSER_TOKEN)
    res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-run/screenshot`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.CF_BROWSER_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  else throw new Error(SHOT_SETUP);
  if (!res.ok) throw new Error(res.status === 429 ? '今天的截圖額度用完了，請改下載 SVG 或明天再試。' : `截圖服務回應 ${res.status}：${(await res.text()).slice(0, 300)}`);
  return res.arrayBuffer();
};
