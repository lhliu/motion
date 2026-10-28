// 擴充包繪製核心：把各包的招式表合併，依 P.mode 分派。kit 與各包都要自給自足（toString 內嵌）。
import type { XC, XFx, XK } from './kit';

export const xpackCore = (kitF: () => XK, packs: ((K: XK) => Record<string, XFx>)[]) => {
  const K = kitF();
  const REG: Record<string, XFx> = {};
  for (const p of packs) Object.assign(REG, p(K));
  const list = (s: unknown) => String(s ?? '').split(/[,，、|]/).map((v) => v.trim());
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const fx = REG[String(P.mode)] ?? REG[Object.keys(REG)[0]];
    const S = K.site(ctx.canvas);
    K.setFont(S.font);
    const fg = String(P.fg || '') || S.fg, ac = String(P.color || '') || S.ac, ac2 = String(P.color2 || '') || S.ac2;
    const u = Math.min(W, H) / 1080, DW = W / u, DH = H / u;
    const sp = Math.max(0.2, K.num(P.speed, 1));
    const items = list(P.items), vals = list(P.values);
    const bgk = fx.bg ?? 'site';
    const bg = bgk === 'site' ? S.bg : bgk === 'cream' ? K.CREAM : bgk;
    ctx.save();
    if (P.bgfill !== 0 && P.bgfill !== '0' && bgk !== 'none') { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
    ctx.scale(u, u);
    const c: XC = {
      t: t * sp, W: DW, H: DH, land: DW > DH * 1.05, loop, fg: bgk === 'cream' && !P.fg ? K.INK : fg, bg, ac, ac2,
      s: (i, d) => items[i] || d, v: (i, d) => vals[i] || d,
      title: (d) => String(P.title || '').trim() || d, sub: (d) => String(P.sub ?? '').trim() || d,
      fit: (w, h, fn, m = 0.06) => { const s = Math.min((DW * (1 - 2 * m)) / w, (DH * (1 - 2 * m)) / h); ctx.save(); ctx.translate((DW - w * s) / 2, (DH - h * s) / 2); ctx.scale(s, s); fn(); ctx.restore(); },
    };
    fx.d(ctx, c);
    ctx.restore();
    return { cx: W / 2, cy: H / 2, r: Math.min(W, H) * 0.45 };
  };
  return { draw, modes: Object.keys(REG) };
};
