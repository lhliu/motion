var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../src/util.ts
var esc = /* @__PURE__ */ __name((s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), "esc");
var chars = /* @__PURE__ */ __name((t, cls = "c", offset = 0) => {
  const list = Array.from(t);
  return list.map(
    (ch, i) => `<span class="${cls}" style="--i:${i + offset};--n:${list.length}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`
  ).join("");
}, "chars");
var pick = /* @__PURE__ */ __name((w, n, fallback) => {
  const given = w.filter(Boolean).slice(0, n);
  const src = given.length ? given : fallback;
  const out = [...given];
  let k = 0;
  while (out.length < n) out.push(src[k++ % src.length]);
  return out;
}, "pick");
var rand = /* @__PURE__ */ __name((seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}, "rand");
var range = /* @__PURE__ */ __name((n) => Array.from({ length: n }, (_, i) => i), "range");
var rep = /* @__PURE__ */ __name((n, f) => range(n).map(f).join(""), "rep");
var blobPath = /* @__PURE__ */ __name((cx, cy, radii, rot = 0) => {
  const n = radii.length;
  const p = radii.map((r, i) => {
    const a = rot + i / n * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const f = /* @__PURE__ */ __name((v) => v.toFixed(1), "f");
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}, "blobPath");
var lobes = /* @__PURE__ */ __name((n, base2, k, amp, phase = 0, wobble = 0, seed = 1) => range(n).map((i) => {
  const t = i / n * Math.PI * 2;
  return base2 * (1 + amp * Math.cos(k * t + phase) + wobble * (rand(seed * 31 + i) - 0.5));
}), "lobes");

// ../src/effects/impact.ts
var impact = [
  {
    id: "word-burst",
    cat: "impact",
    zh: "\u6587\u5B57\u7206\u958B",
    en: "Word Burst",
    desc: "\u55AE\u5B57\u549A\u4E00\u8072\u5F48\u51FA\u4F86\uFF0C\u56DB\u5468\u653E\u5C04\u7DDA\u70B8\u958B",
    tags: ["\u5F37\u8ABF", "\u4EAE\u9EDE"],
    tone: "ink",
    sample: ["\u7206\u6B3E"],
    hint: "2\u20134 \u5B57",
    motion: "\u6587\u5B57\u5F9E 0 \u500D\u5F48\u6027\u653E\u5927\u5230 115% \u518D\u56DE\u5230 100%\uFF08cubic-bezier \u56DE\u5F48\uFF09\uFF0C\u540C\u6642 12 \u689D\u653E\u5C04\u7DDA\u5F9E\u4E2D\u5FC3\u5411\u5916\u5C04\u51FA\u5F8C\u6D88\u5931\uFF1B\u505C\u7559\u5F8C\u6574\u9AD4\u653E\u5927\u6DE1\u51FA\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "The word pops from scale 0 to 115% then settles at 100% with a springy overshoot, while 12 radial lines shoot outward from the center and vanish; after a hold, it scales up and fades out, looping.",
    css: `
.S .w{font-size:calc(var(--u)*17);animation:K_pop 2.8s cubic-bezier(.2,1.6,.4,1) infinite both;position:relative;z-index:1}
.S i{position:absolute;left:50%;top:50%;width:calc(var(--u)*.7);height:calc(var(--u)*9);margin-left:calc(var(--u)*-.35);background:var(--ac);border-radius:9px;transform-origin:50% 0;transform:rotate(var(--r)) translateY(calc(var(--u)*10)) scaleY(0);animation:K_ray 2.8s ease-out infinite}
@keyframes K_pop{0%{transform:scale(0)}18%{transform:scale(1.15)}28%,82%{transform:scale(1);opacity:1}94%,100%{transform:scale(1.25);opacity:0}}
@keyframes K_ray{0%,6%{transform:rotate(var(--r)) translateY(calc(var(--u)*8)) scaleY(0)}16%{transform:rotate(var(--r)) translateY(calc(var(--u)*13)) scaleY(1)}30%,100%{transform:rotate(var(--r)) translateY(calc(var(--u)*24)) scaleY(0)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w">${esc(w[0])}</div>${rep(12, (i) => `<i style="--r:${i * 30}deg"></i>`)}`, "html")
  },
  {
    id: "letter-hit",
    cat: "impact",
    zh: "\u9010\u5B57\u6572\u64CA",
    en: "Letter Sequence",
    desc: "\u4E00\u500B\u5B57\u4E00\u500B\u5B57\u7838\u4E0A\u4F86\uFF0C\u5E36\u64E0\u58D3\u56DE\u5F48",
    tags: ["\u7BC0\u594F", "\u6B4C\u8A5E"],
    tone: "accent",
    sample: ["\u4E00\u5B57\u4E00\u62CD"],
    hint: "3\u20136 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u4F9D\u5E8F\u5F9E\u4E0A\u65B9\u5FEB\u901F\u843D\u4E0B\uFF0C\u843D\u5730\u77AC\u9593\u58D3\u6241\uFF08scaleY 0.7\u3001scaleX 1.2\uFF09\u518D\u56DE\u5F48\uFF0C\u5B57\u8207\u5B57\u9593\u9694 0.12 \u79D2\uFF1B\u5168\u90E8\u5230\u4F4D\u505C\u7559\u5F8C\u4E00\u8D77\u6DE1\u51FA\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Each character drops in from above one by one, squashing on impact (scaleY 0.7, scaleX 1.2) before springing back, 0.12s apart; after all land and hold, they fade out together, looping.",
    css: `
.S .t{font-size:calc(var(--u)*15);display:flex}
.S .c{animation:K_hit 3s infinite both;animation-delay:calc(var(--i)*.12s);transform-origin:50% 100%}
@keyframes K_hit{0%{transform:translateY(-150%);opacity:0}8%{transform:translateY(0) scale(1.2,.7);opacity:1}13%{transform:translateY(-8%) scale(.95,1.08)}17%,82%{transform:none;opacity:1}92%,100%{opacity:0;transform:translateY(10%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "stamp",
    cat: "impact",
    zh: "\u5370\u7AE0",
    en: "Text Stamp",
    desc: "\u50CF\u84CB\u7AE0\u4E00\u6A23\uFF0C\u4E00\u500B\u500B\u84CB\u4E0A\u53BB",
    tags: ["\u516C\u544A", "\u6C7A\u5B9A"],
    tone: "paper",
    sample: ["\u6838\u51C6", "\u901A\u904E", "\u5B9A\u6848"],
    hint: "\u6BCF\u500B\u8A5E 2\u20133 \u5B57\uFF0C\u6700\u591A 3 \u500B",
    motion: "\u4E09\u500B\u5370\u7AE0\u4F9D\u5E8F\u5F9E 2.6 \u500D\u5927\u3001\u534A\u900F\u660E\u5FEB\u901F\u58D3\u4E0B\u5230 1 \u500D\uFF0C\u843D\u4E0B\u77AC\u9593\u756B\u9762\u8F15\u5FAE\u9707\u52D5\uFF1B\u5370\u7AE0\u70BA\u7D05\u8272\u7C97\u6846\u3001\u7565\u70BA\u65CB\u8F49\u3001\u5E36\u6CB9\u58A8\u9846\u7C92\u8CEA\u611F\uFF0C\u5168\u90E8\u84CB\u5B8C\u505C\u7559\u5F8C\u6DE1\u51FA\u3002",
    motionEn: "Three rubber stamps slam down in sequence from 2.6x scale to 1x with a tiny screen shake on impact; red thick-bordered, slightly rotated, with ink grain texture; hold, then fade out.",
    css: `
.S{animation:K_shake 3.6s infinite}
.S .s.one{font-size:min(11cqw,8cqh);translate:-50% -50%}
.S .s{white-space:nowrap}
.S .s{position:absolute;font-size:calc(var(--u)*7.5);color:var(--ac);border:calc(var(--u)*.9) solid var(--ac);padding:calc(var(--u)*1.2) calc(var(--u)*2.4);border-radius:calc(var(--u)*1.4);transform:rotate(var(--r));opacity:0;animation:K_st 3.6s cubic-bezier(.3,1.4,.5,1) infinite both;animation-delay:calc(var(--i)*.5s);-webkit-mask:radial-gradient(circle at 30% 40%,#000 60%,#000a 61%,#000 75%)}
@keyframes K_st{0%{transform:rotate(var(--r)) scale(2.6);opacity:0}10%{transform:rotate(var(--r)) scale(.94);opacity:1}14%,80%{transform:rotate(var(--r)) scale(1);opacity:1}92%,100%{opacity:0;transform:rotate(var(--r)) scale(1)}}
@keyframes K_shake{0%,9%,13%,23%,27%,37%,41%,100%{transform:none}10%,24%,38%{transform:translate(1%,1%)}11%,25%,39%{transform:translate(-1%,-.5%)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const list = w.filter(Boolean).length ? w.filter(Boolean).slice(0, 3) : ["\u6838\u51C6", "\u901A\u904E", "\u5B9A\u6848"];
      const pos2 = [[[50, 50]], [[12, 22], [46, 50]], [[8, 18], [38, 46], [64, 20]]][list.length - 1];
      return list.map((t, i) => `<div class="s${list.length === 1 ? " one" : ""}" style="--i:${i};--r:${[-10, 6, -4][i]}deg;left:${pos2[i][0]}%;top:${pos2[i][1]}%">${esc(t)}</div>`).join("");
    }, "html")
  },
  {
    id: "punch-zoom",
    cat: "impact",
    zh: "\u885D\u64CA\u653E\u5927",
    en: "Punch Zoom",
    desc: "\u5F9E\u6DF1\u8655\u98DB\u51FA\u3001\u5F8C\u9762\u62D6\u8457\u6B98\u5F71",
    tags: ["\u958B\u5834", "\u5F37\u8ABF"],
    tone: "ink",
    sample: ["\u958B\u7BB1"],
    hint: "2\u20134 \u5B57",
    motion: "\u6587\u5B57\u5F9E\u756B\u9762\u6DF1\u8655\uFF08scale 0.05\uFF09\u9AD8\u901F\u885D\u5230 100%\uFF0C\u5F8C\u65B9\u8DDF\u8457 3 \u5C64\u900F\u660E\u5EA6\u905E\u6E1B\u7684\u6B98\u5F71\u5404\u5EF6\u9072 0.05 \u79D2\uFF1B\u5230\u4F4D\u5F8C\u5FAE\u5FAE\u9707\u52D5\uFF0C\u6700\u5F8C\u653E\u5927\u5230 3 \u500D\u6DE1\u51FA\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "The word rockets from deep in the frame (scale 0.05) to 100% at high speed, trailed by 3 fading ghost copies each 0.05s behind; it jolts slightly on arrival, then blows up to 3x and fades, looping.",
    css: `
.S .w{position:absolute;font-size:calc(var(--u)*18);animation:K_pz 2.6s cubic-bezier(.15,.9,.3,1.2) infinite both;animation-delay:calc(var(--k)*.08s);color:color-mix(in srgb,var(--ac) calc(100% - var(--k)*26%),transparent)}
.S .w:last-child{color:var(--fg)}
@keyframes K_pz{0%{transform:scale(.05);opacity:0}18%{transform:scale(1.06);opacity:1}22%{transform:scale(.98) translateX(1%)}26%,78%{transform:scale(1);opacity:1}100%{transform:scale(3);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => rep(4, (k) => `<div class="w" style="--k:${3 - k};z-index:${k + 1}">${esc(w[0])}</div>`), "html")
  },
  {
    id: "kinetic-stack",
    cat: "impact",
    zh: "\u52D5\u614B\u5806\u758A",
    en: "Kinetic Stack",
    desc: "\u8A5E\u4E00\u500B\u500B\u98DB\u9032\u4F86\u758A\u8D77\u4F86",
    tags: ["MV", "\u6B4C\u8A5E"],
    tone: "ink",
    sample: ["\u4ECA\u5929", "\u4E5F\u8981", "\u597D\u597D", "\u751F\u6D3B"],
    hint: "3\u20135 \u500B\u77ED\u8A5E",
    motion: "\u6BCF\u500B\u8A5E\u5F9E\u5DE6\u53F3\u4EA4\u932F\u65B9\u5411\u6A6B\u5411\u98DB\u5165\u4E26\u5806\u758A\u6210\u4E00\u500B\u65B9\u584A\u6392\u7248\uFF0C\u6BCF\u884C\u5927\u5C0F\u4E0D\u540C\u3001\u5176\u4E2D\u4E00\u884C\u7528\u4E3B\u8272\uFF1B\u6BCF\u884C\u9593\u9694 0.25 \u79D2\uFF0C\u5168\u90E8\u758A\u597D\u505C\u7559\uFF0C\u518D\u4E00\u8D77\u5F80\u4E0A\u6ED1\u51FA\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Words fly in horizontally from alternating left and right, stacking into a tight block layout with varying line sizes and one line in the accent color, 0.25s apart; hold, then slide up and out together, looping.",
    css: `
.S .b{display:flex;flex-direction:column;align-items:flex-start;animation:K_out 3.6s infinite}
.S .l{font-size:calc(var(--u)*var(--s));line-height:.95;animation:K_in 3.6s cubic-bezier(.2,.9,.2,1) infinite both;animation-delay:calc(var(--i)*.22s)}
.S .l:nth-child(2n){--d:1}.S .l:nth-child(3){color:var(--ac)}
@keyframes K_in{0%{transform:translateX(calc((var(--d,0)*2 - 1)*-120%));opacity:0}14%,100%{transform:none;opacity:1}}
@keyframes K_out{0%,82%{transform:none;opacity:1}100%{transform:translateY(-30%);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="b">${w.slice(0, 5).map((t, i) => `<div class="l" style="--i:${i};--s:${[13, 9, 15, 11, 9][i]}">${esc(t)}</div>`).join("")}</div>`, "html")
  },
  {
    id: "stretch",
    cat: "impact",
    zh: "\u4F38\u7E2E\u5B57",
    en: "Stretch Text",
    desc: "\u6587\u5B57\u4E0A\u4E0B\u62C9\u9577\u518D\u7E2E\u56DE",
    tags: ["\u4FCF\u76AE", "\u885D\u64CA"],
    tone: "accent",
    sample: ["\u62C9\u9577\u4E86"],
    hint: "2\u20134 \u5B57",
    motion: "\u6587\u5B57\u4EE5\u5E95\u90E8\u70BA\u57FA\u6E96\u9EDE\uFF0C\u5782\u76F4\u65B9\u5411\u88AB\u62C9\u9577\u5230 2.2 \u500D\u3001\u518D\u58D3\u6241\u5230 0.6 \u500D\u3001\u6700\u5F8C\u5F48\u56DE 1 \u500D\uFF0C\u50CF\u6A61\u76AE\u7B4B\uFF1B\u6BCF\u500B\u5B57\u6709 0.06 \u79D2\u7684\u6CE2\u6D6A\u5EF6\u9072\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Anchored at the baseline, the text stretches vertically to 2.2x, squashes to 0.6x, then springs back to 1x like a rubber band, with a 0.06s wave delay per character, looping.",
    css: `
.S .t{font-size:calc(var(--u)*14);display:flex}
.S .c{transform-origin:50% 85%;animation:K_st 2.4s cubic-bezier(.4,0,.2,1) infinite;animation-delay:calc(var(--i)*.06s)}
@keyframes K_st{0%,100%{transform:none}25%{transform:scaleY(2.2) scaleX(.85)}45%{transform:scaleY(.6) scaleX(1.2)}60%{transform:scaleY(1.15)}72%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "zoom-through",
    cat: "impact",
    zh: "\u7A7F\u8D8A\u653E\u5927",
    en: "Text Zoom Through",
    desc: "\u885D\u9032\u5B57\u88E1\uFF0C\u63A5\u5230\u4E0B\u4E00\u500B\u8A5E",
    tags: ["\u8F49\u5834", "\u901F\u5EA6\u611F"],
    tone: "paper",
    sample: ["\u6E96\u5099", "\u51FA\u767C", "\u5230\u7AD9"],
    hint: "3 \u500B\u8A5E",
    motion: "\u7B2C\u4E00\u500B\u8A5E\u51FA\u73FE\u5F8C\u93E1\u982D\u6025\u901F\u885D\u9032\u5B57\u7684\u7B46\u756B\u88E1\uFF08\u653E\u5927\u5230 30 \u500D\uFF09\uFF0C\u7A7F\u904E\u53BB\u5F8C\u4E0B\u4E00\u500B\u8A5E\u5F9E\u9060\u8655\u51FA\u73FE\uFF0C\u4E09\u500B\u8A5E\u9023\u7E8C\u7A7F\u8D8A\uFF0C\u6BCF\u500B\u8A5E\u7D04 1.2 \u79D2\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Each word appears, then the camera rushes into its strokes (scaling to 30x); passing through reveals the next word from the distance; three words chain together, about 1.2s each, looping.",
    css: `
.S .w{position:absolute;font-size:calc(var(--u)*16);opacity:0;animation:K_zt 3.6s cubic-bezier(.7,0,.9,.4) infinite both;animation-delay:calc(var(--i)*1.2s)}
.S .w:nth-child(2){color:var(--ac)}
@keyframes K_zt{0%{transform:scale(.2);opacity:0;animation-timing-function:cubic-bezier(.2,.9,.3,1)}7%{transform:scale(1);opacity:1;animation-timing-function:linear}24%{transform:scale(1.15);opacity:1;animation-timing-function:cubic-bezier(.7,0,1,.5)}33.3%{transform:scale(30);opacity:0}100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => pick(w, 3, ["\u6E96\u5099", "\u51FA\u767C", "\u5230\u7AD9"]).map((t, i) => `<div class="w" style="--i:${i}">${esc(t)}</div>`).join(""), "html")
  },
  {
    id: "squeeze",
    cat: "impact",
    zh: "\u64E0\u58D3\u5F48\u8DF3",
    en: "Text Squeeze",
    desc: "\u50CF\u6A61\u76AE\u4E00\u6A23\u58D3\u6241\u518D\u63DB\u5B57",
    tags: ["\u5F48\u6027", "\u5207\u63DB"],
    tone: "ink",
    sample: ["\u5F48\u529B", "\u97CC\u6027"],
    hint: "2 \u500B\u8A5E",
    motion: "\u6587\u5B57\u88AB\u5F80\u4E0B\u58D3\u6241\u6210\u4E00\u689D\u7DDA\uFF08scaleY 0.05\u3001scaleX 1.4\uFF09\uFF0C\u5728\u6700\u6241\u7684\u77AC\u9593\u63DB\u6210\u7B2C\u4E8C\u500B\u8A5E\uFF0C\u518D\u50CF\u5F48\u7C27\u4E00\u6A23\u5F48\u56DE\u4E26\u6643\u52D5\u5169\u4E0B\uFF0C\u5169\u500B\u8A5E\u4EA4\u66FF\u5FAA\u74B0\u3002",
    motionEn: "The text gets squashed flat into a line (scaleY 0.05, scaleX 1.4); at its flattest it swaps to the second word, then springs back with two wobbles; the two words alternate in a loop.",
    css: `
.S .w{position:absolute;font-size:calc(var(--u)*17);color:var(--ac);transform-origin:50% 80%;animation:K_sq 3.2s infinite both;animation-delay:calc(var(--i)*-1.6s)}
@keyframes K_sq{0%{transform:scale(1.4,.05);opacity:1}8%{transform:scale(.9,1.2)}14%{transform:scale(1.06,.92)}20%{transform:scale(.98,1.03)}25%,40%{transform:none;opacity:1}50%{transform:scale(1.4,.05);opacity:1}50.1%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => pick(w, 2, ["\u5F48\u529B", "\u97CC\u6027"]).map((t, i) => `<div class="w" style="--i:${i}">${esc(t)}</div>`).join(""), "html")
  },
  {
    id: "shake-alert",
    cat: "impact",
    zh: "\u9707\u52D5\u8B66\u793A",
    en: "Shake Alert",
    desc: "\u6587\u5B57\u5287\u70C8\u6296\u52D5\uFF0C\u7D05\u5149\u9583\u720D",
    tags: ["\u8B66\u544A", "\u6CE8\u610F"],
    tone: "ink",
    sample: ["\u6CE8\u610F\uFF01"],
    hint: "2\u20134 \u5B57",
    motion: "\u6587\u5B57\u5FEB\u901F\u5DE6\u53F3\u6296\u52D5\u4E26\u5E36\u8F15\u5FAE\u65CB\u8F49\uFF08\u6BCF 0.05 \u79D2\u4E00\u6B21\uFF09\uFF0C\u540C\u6642\u80CC\u666F\u4EE5\u4E3B\u8272\u9583\u720D\u5169\u4E0B\uFF0C\u6587\u5B57\u5916\u6846\u51FA\u73FE\u540C\u8272\u63CF\u908A\uFF1B\u6296\u5B8C\u505C\u9813 1 \u79D2\u518D\u91CD\u4F86\u3002",
    motionEn: "The text jitters rapidly side to side with slight rotation every 0.05s while the background flashes the accent color twice and the text gains a matching outline; pause 1s, then repeat.",
    css: `
.S{animation:K_bg 2s steps(1) infinite}
.S .w{font-size:calc(var(--u)*16);animation:K_sh 2s infinite;-webkit-text-stroke:calc(var(--u)*.3) var(--ac);paint-order:stroke fill}
@keyframes K_sh{0%,50%,100%{transform:none}5%{transform:translate(-3%,1%) rotate(-3deg)}10%{transform:translate(3%,-1%) rotate(2deg)}15%{transform:translate(-2%,-1%) rotate(-1deg)}20%{transform:translate(2%,1%) rotate(2deg)}25%{transform:translate(-1%,0) rotate(-1deg)}30%{transform:translate(1%,0)}}
@keyframes K_bg{0%,8%,16%,100%{background:var(--bg)}4%,12%{background:var(--ac)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w">${esc(w[0])}</div>`, "html")
  },
  {
    id: "slam",
    cat: "impact",
    zh: "\u91CD\u6454\u843D\u5730",
    en: "Heavy Slam",
    desc: "\u5DE8\u5B57\u5F9E\u5929\u800C\u964D\uFF0C\u843D\u5730\u63DA\u8D77\u7159\u5875",
    tags: ["\u958B\u5834", "\u6A19\u984C"],
    tone: "paper",
    sample: ["\u91CD\u78C5"],
    hint: "2\u20133 \u5B57",
    motion: "\u5DE8\u5927\u6587\u5B57\u5F9E\u756B\u9762\u4E0A\u65B9\u52A0\u901F\u589C\u843D\uFF0C\u7838\u5230\u5730\u9762\u6642\u6574\u500B\u756B\u9762\u4E0A\u4E0B\u9707\u52D5\u3001\u6587\u5B57\u5E95\u90E8\u5674\u51FA\u5DE6\u53F3\u5169\u5718\u7070\u8272\u7159\u5875\u7C92\u5B50\u4E26\u64F4\u6563\u6D88\u5931\uFF1B\u505C\u7559\u5F8C\u6587\u5B57\u5411\u4E0B\u6C89\u51FA\u756B\u9762\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Giant text accelerates down from above and slams onto the ground; the whole frame shakes vertically and two puffs of grey dust burst sideways from its base and dissipate; after a hold it sinks out of frame, looping.",
    css: `
.S{animation:K_q 3s infinite}
.S .w{font-size:calc(var(--u)*20);animation:K_drop 3s cubic-bezier(.55,0,1,.45) infinite both;position:relative;z-index:1}
.S .d{position:absolute;top:66%;left:50%;width:calc(var(--u)*6);height:calc(var(--u)*6);border-radius:50%;background:var(--mu);filter:blur(calc(var(--u)*1));opacity:0;animation:K_dust 3s ease-out infinite}
@keyframes K_drop{0%{transform:translateY(-140%)}18%{transform:translateY(0)}20%{transform:translateY(0) scaleY(.9)}24%,80%{transform:none}100%{transform:translateY(180%)}}
@keyframes K_q{0%,17%,30%,100%{transform:none}19%{transform:translateY(2%)}22%{transform:translateY(-1%)}25%{transform:translateY(.5%)}}
@keyframes K_dust{0%,17%{opacity:0;transform:translate(-50%,0) scale(.3)}22%{opacity:.8}50%,100%{opacity:0;transform:translate(calc(-50% + var(--x)),-60%) scale(3)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w">${esc(w[0])}</div>${rep(6, (i) => `<i class="d" style="--x:${(i < 3 ? -1 : 1) * (12 + i % 3 * 9)}cqw"></i>`)}`, "html")
  }
];

// ../src/effects/flow.ts
var loop = /* @__PURE__ */ __name((t, n, sep = " \u2022 ") => rep(n, () => `${esc(t)}${sep}`), "loop");
var flow = [
  {
    id: "huge-scroll",
    cat: "flow",
    zh: "\u5DE8\u5B57\u6ED1\u904E",
    en: "Huge Text Scroll",
    desc: "\u8D85\u5927\u5B57\u4E00\u5FEB\u4E00\u6162\u6A6B\u8D8A\u756B\u9762",
    tags: ["\u80CC\u666F", "\u9060\u666F"],
    tone: "ink",
    sample: ["\u53F0\u5317\u591C\u884C"],
    hint: "2\u20136 \u5B57",
    motion: "\u756B\u9762\u4E2D\u592E\u4E00\u884C\u8D85\u5927\u5B57\uFF08\u9AD8\u5EA6\u7D04\u4F54\u756B\u9762 60%\uFF09\u7531\u53F3\u5F80\u5DE6\u6162\u901F\u7121\u7E2B\u6EFE\u52D5\uFF0C\u4E0B\u65B9\u4E00\u884C\u5C0F\u5B57\u4EE5 3 \u500D\u901F\u5EA6\u540C\u65B9\u5411\u6EFE\u52D5\uFF0C\u7528\u300C\u2022\u300D\u5206\u9694\u91CD\u8907\uFF1B\u5169\u884C\u901F\u5EA6\u5DEE\u88FD\u9020\u666F\u6DF1\u3002",
    motionEn: "A single line of oversized text (about 60% of frame height) scrolls slowly right-to-left in a seamless loop, while a small repeating line below, separated by bullets, scrolls 3x faster in the same direction, creating depth from the speed difference.",
    css: `
.S{place-items:stretch;align-content:center;gap:calc(var(--u)*2)}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_m 14s linear infinite}
.S .r span{padding-right:.3em}
.S .big{font-size:calc(var(--u)*24)}
.S .sm{font-size:calc(var(--u)*4.4);color:var(--ac);animation-duration:5s}
@keyframes K_m{to{transform:translateX(-50%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="r big"><span>${esc(w[0])}</span><span>${esc(w[0])}</span><span>${esc(w[0])}</span><span>${esc(w[0])}</span></div><div class="r sm">${loop(w[0], 16)}</div>`, "html")
  },
  {
    id: "vertical-flow",
    cat: "flow",
    zh: "\u76F4\u66F8\u9006\u8D70",
    en: "Vertical Typography",
    desc: "\u76F4\u6392\u6587\u5B57\u5F80\u53CD\u65B9\u5411\u6D41",
    tags: ["\u6771\u65B9", "\u975C\u8207\u52D5"],
    tone: "accent",
    sample: ["\u975C\u5BC2", "\u75BE\u8D70"],
    hint: "2 \u500B\u8A5E\uFF0C\u5404 2\u20134 \u5B57",
    motion: "\u4E94\u6B04\u76F4\u6392\u6587\u5B57\uFF08writing-mode: vertical-rl\uFF09\u4E26\u6392\uFF0C\u5947\u6578\u6B04\u5411\u4E0A\u3001\u5076\u6578\u6B04\u5411\u4E0B\u7121\u7E2B\u6EFE\u52D5\uFF0C\u5927\u5B57\u6B04\u7528\u7C97\u660E\u9AD4\u3001\u7A84\u6B04\u7528\u5C0F\u5B57\u9ED1\u9AD4\uFF0C\u5F62\u6210\u6771\u65B9\u5831\u7D19\u7248\u9762\u7684\u7BC0\u594F\u3002",
    motionEn: "Five columns of vertical CJK text (writing-mode vertical-rl) side by side; odd columns scroll up and even columns scroll down seamlessly; wide columns use a heavy serif, narrow ones a small sans, evoking an East Asian newspaper rhythm.",
    css: `
.S{display:flex;justify-content:center;gap:calc(var(--u)*3);align-items:flex-start}
.S .col{writing-mode:vertical-rl;white-space:nowrap;animation:K_up 8s linear infinite;font-family:var(--serif)}
.S .col:nth-child(2n){animation-name:K_dn;font-family:var(--sans);font-size:calc(var(--u)*4.5)!important;opacity:.85}
.S .col span{padding-bottom:.5em}
@keyframes K_up{from{transform:translateY(0)}to{transform:translateY(-50%)}}
@keyframes K_dn{from{transform:translateY(-50%)}to{transform:translateY(0)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u975C\u5BC2", "\u75BE\u8D70"]);
      return rep(5, (i) => {
        const t = i % 2 ? b : a;
        return `<div class="col" style="font-size:calc(var(--u)*${[11, 0, 9, 0, 11][i] || 5})">${rep(8, () => `<span>${esc(t)}</span>`)}</div>`;
      });
    }, "html")
  },
  {
    id: "repeat-wave",
    cat: "flow",
    zh: "\u91CD\u8907\u6CE2\u6D6A",
    en: "Repeating Text",
    desc: "\u540C\u4E00\u500B\u8A5E\u6392\u6EFF\uFF0C\u6CE2\u6D6A\u5F0F\u8B8A\u8272",
    tags: ["\u80CC\u666F", "\u5716\u9A30"],
    tone: "paper",
    sample: ["\u6D41\u884C"],
    hint: "2\u20133 \u5B57",
    motion: "\u540C\u4E00\u500B\u8A5E\u4EE5\u7DB2\u683C\u6392\u6EFF\u6574\u500B\u756B\u9762\uFF0C\u984F\u8272\u5F9E\u6DE1\u7070\u5230\u4E3B\u8272\u518D\u56DE\u6DE1\u7070\uFF0C\u5EF6\u9072\u4F9D\u300C\u5217 + \u6B04\u300D\u8A08\u7B97\uFF0C\u5F62\u6210\u4E00\u9053\u659C\u5411\u7684\u8272\u5F69\u6CE2\u6D6A\u6383\u904E\u756B\u9762\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "The same word tiles the whole frame in a grid; each tile cycles from pale grey to the accent color and back, delayed by row + column, so a diagonal color wave sweeps across the frame, looping.",
    css: `
.S{grid-template-columns:repeat(7,auto);place-content:center;gap:calc(var(--u)*.6) calc(var(--u)*1.6)}
.S span{font-size:calc(var(--u)*5.6);color:var(--mu);animation:K_w 2.4s ease-in-out infinite;animation-delay:calc((var(--r) + var(--c))*.12s)}
@keyframes K_w{0%,60%,100%{color:color-mix(in srgb,var(--fg) 14%,transparent);transform:none}25%{color:var(--ac);transform:translateY(-12%)}}`,
    html: /* @__PURE__ */ __name((w) => rep(42, (i) => `<span style="--r:${Math.floor(i / 7)};--c:${i % 7}">${esc(w[0])}</span>`), "html")
  },
  {
    id: "diagonal-bands",
    cat: "flow",
    zh: "\u659C\u7DDA\u5E36",
    en: "Diagonal Text Bands",
    desc: "\u659C\u659C\u7684\u5E36\u5B50\uFF0C\u6587\u5B57\u53CD\u5411\u8DD1",
    tags: ["\u8F49\u5834", "\u4FCF\u76AE"],
    tone: "ink",
    sample: ["\u5929\u4EAE\u4EE5\u524D"],
    hint: "2\u20136 \u5B57",
    motion: "\u5169\u689D\u5BEC\u8272\u5E36\u4EE5 \xB18 \u5EA6\u659C\u89D2\u4EA4\u53C9\u6A6B\u8D8A\u756B\u9762\uFF0C\u4E00\u689D\u4E3B\u8272\u5E95\u9ED1\u5B57\u5411\u5DE6\u8DD1\u3001\u4E00\u689D\u767D\u5E95\u9ED1\u5B57\u5411\u53F3\u8DD1\uFF0C\u6587\u5B57\u7528\u300C\u2022\u300D\u5206\u9694\u7121\u7E2B\u91CD\u8907\u3002",
    motionEn: "Two wide bands cross the frame at \xB18 degrees; one accent-colored band scrolls left, one white band scrolls right, each filled with bullet-separated repeating text in a seamless loop.",
    css: `
.S .band{position:absolute;left:-10%;width:120%;padding:calc(var(--u)*1.2) 0;overflow:hidden;font-size:calc(var(--u)*6.4);color:#111}
.S .a{background:var(--ac);transform:rotate(-8deg);top:28%}
.S .b{background:#fff;transform:rotate(7deg);top:52%}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_l 9s linear infinite}
.S .b .r{animation-direction:reverse}
@keyframes K_l{to{transform:translateX(-50%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="band a"><div class="r">${loop(w[0], 14)}</div></div><div class="band b"><div class="r">${loop(w[0], 14)}</div></div>`, "html")
  },
  {
    id: "ribbon",
    cat: "flow",
    zh: "\u7DDE\u5E36",
    en: "Text Ribbon",
    desc: "\u6587\u5B57\u6CBF\u8457\u6CE2\u6D6A\u7DDA\u6D41\u52D5",
    tags: ["\u88DD\u98FE", "\u914D\u6A02\u611F"],
    tone: "ink",
    sample: ["\u8DDF\u8457\u7BC0\u594F\u8D70"],
    hint: "3\u20138 \u5B57",
    motion: "\u4E00\u689D S \u5F62\u6CE2\u6D6A\u66F2\u7DDA\u6A6B\u8D8A\u756B\u9762\uFF0C\u6587\u5B57\u6CBF\u66F2\u7DDA\u6392\u5217\uFF08SVG textPath\uFF09\u4E26\u6301\u7E8C\u5F80\u524D\u6D41\u52D5\uFF0C\u66F2\u7DDA\u672C\u8EAB\u662F\u534A\u900F\u660E\u4E3B\u8272\u7C97\u5E36\uFF0C\u6587\u5B57\u70BA\u767D\u8272\u3002",
    motionEn: "An S-shaped wave curve crosses the frame; text follows the curve via SVG textPath and continuously flows along it; the curve is a thick semi-transparent accent ribbon with white text on top.",
    css: `
.S svg{width:100%;height:100%}
.S .rb{fill:none;stroke:var(--ac);stroke-width:96;opacity:.9;stroke-linecap:round}
.S text{font-size:58px;font-weight:900;fill:#111;dominant-baseline:central}`,
    html: /* @__PURE__ */ __name((w) => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><path id="rbp" class="rb" d="M-200 620 C 200 300, 500 300, 800 450 S 1400 650, 1800 280"/><text><textPath href="#rbp" startOffset="0">${loop(w[0], 12, "\u3000\u2022\u3000")}<animate attributeName="startOffset" from="0" to="-900" dur="8s" repeatCount="indefinite"/></textPath></text></svg>`, "html")
  },
  {
    id: "marquee-stack",
    cat: "flow",
    zh: "\u8DD1\u99AC\u71C8",
    en: "Marquee",
    desc: "\u5B57\u9AD4\u3001\u901F\u5EA6\u90FD\u4E0D\u540C\u7684\u5E36\u5B50\u758A\u5728\u4E00\u8D77",
    tags: ["\u516C\u544A", "\u8857\u982D"],
    tone: "accent",
    sample: ["\u9650\u6642\u958B\u8CE3", "\u65B0\u54C1\u4E0A\u5E02", "\u9810\u8CFC\u4E2D", "\u6700\u5F8C\u4E00\u5929"],
    hint: "2\u20134 \u500B\u77ED\u8A5E",
    motion: "\u56DB\u689D\u6A6B\u5411\u8DD1\u99AC\u71C8\u4E0A\u4E0B\u5806\u758A\u4F48\u6EFF\u756B\u9762\uFF0C\u6BCF\u689D\u4F7F\u7528\u4E0D\u540C\u5B57\u91CD\uFF08\u7D30\u3001\u7C97\u3001\u660E\u9AD4\u3001\u7B49\u5BEC\uFF09\u3001\u4E0D\u540C\u901F\u5EA6\u8207\u65B9\u5411\uFF0C\u4EA4\u932F\u9ED1\u5E95\u8207\u4E3B\u8272\u5E95\uFF0C\u50CF\u8857\u982D\u6D77\u5831\u7684\u7BC0\u594F\u611F\u3002",
    motionEn: "Four horizontal marquees stacked to fill the frame, each with a different typeface weight (light, black, serif, mono), different speed and direction, alternating dark and accent backgrounds, like a street poster.",
    css: `
.S{grid-template-rows:repeat(4,1fr);place-items:stretch}
.S .row{display:flex;align-items:center;overflow:hidden;font-size:calc(var(--u)*7.4)}
.S .row:nth-child(2n){background:#111;color:var(--bg)}
.S .row:nth-child(2){font-family:var(--serif)}.S .row:nth-child(3){font-weight:300}.S .row:nth-child(4){font-family:var(--mono);font-size:calc(var(--u)*6)}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_l var(--d) linear infinite var(--dir)}
@keyframes K_l{to{transform:translateX(-50%)}}`,
    html: /* @__PURE__ */ __name((w) => pick(w, 4, ["\u9650\u6642\u958B\u8CE3", "\u65B0\u54C1\u4E0A\u5E02", "\u9810\u8CFC\u4E2D", "\u6700\u5F8C\u4E00\u5929"]).map(
      (t, i) => `<div class="row"><div class="r" style="--d:${[10, 7, 13, 8][i]}s;--dir:${i % 2 ? "reverse" : "normal"}">${loop(t, 12)}</div></div>`
    ).join(""), "html")
  },
  {
    id: "parallax-columns",
    cat: "flow",
    zh: "\u76F4\u66F8\u4E09\u5C64",
    en: "Parallax Columns",
    desc: "\u4E09\u5C64\u76F4\u6392\u6587\u5B57\u4E00\u8D77\u6D41\u52D5",
    tags: ["\u666F\u6DF1", "\u6771\u65B9"],
    tone: "paper",
    sample: ["\u591C\u96E8\u8857\u71C8"],
    hint: "3\u20135 \u5B57",
    motion: "\u4E09\u5C64\u76F4\u6392\u6587\u5B57\u6B04\uFF1A\u6700\u9060\u5C64\u5B57\u5C0F\u3001\u6DE1\u3001\u6162\uFF1B\u4E2D\u9593\u5C64\u4E2D\u7B49\uFF1B\u6700\u524D\u5C64\u5B57\u6700\u5927\u3001\u6700\u9ED1\u3001\u6700\u5FEB\uFF0C\u5168\u90E8\u5F80\u4E0A\u6D41\u52D5\uFF0C\u5F62\u6210\u8996\u5DEE\u666F\u6DF1\u3002",
    motionEn: "Three layers of vertical text columns: the far layer is small, faint and slow; the middle layer medium; the front layer largest, darkest and fastest; all flow upward, creating parallax depth.",
    css: `
.S .layer{position:absolute;inset:0;display:flex;justify-content:space-around;align-items:flex-start}
.S .col{writing-mode:vertical-rl;white-space:nowrap;font-family:var(--serif);animation:K_up var(--d) linear infinite}
.S .l1 .col{font-size:calc(var(--u)*3.2);opacity:.18;--d:16s}
.S .l2 .col{font-size:calc(var(--u)*5.5);opacity:.4;--d:10s}
.S .l3 .col{font-size:calc(var(--u)*10);--d:6s}
.S .l3{justify-content:center;gap:calc(var(--u)*12)}
@keyframes K_up{to{transform:translateY(-50%)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const col = /* @__PURE__ */ __name((n) => `<div class="col">${rep(n, () => esc(w[0]) + "\u3000")}</div>`, "col");
      return `<div class="layer l1">${rep(12, () => col(10))}</div><div class="layer l2">${rep(6, () => col(8))}</div><div class="layer l3">${rep(2, () => col(6))}</div>`;
    }, "html")
  },
  {
    id: "tape-cross",
    cat: "flow",
    zh: "\u5C01\u9396\u81A0\u5E36",
    en: "Tape Cross",
    desc: "\u5BEB\u8457\u5B57\u7684\u81A0\u5E36\u4EA4\u53C9\u6210 X",
    tags: ["\u8B66\u544A", "\u8857\u982D"],
    tone: "ink",
    sample: ["\u7981\u6B62\u9032\u5165"],
    hint: "2\u20136 \u5B57",
    motion: "\u5169\u689D\u9EC3\u9ED1\u659C\u7D0B\u908A\u7684\u8B66\u793A\u81A0\u5E36\u4EE5 X \u5F62\u4EA4\u53C9\u8CBC\u6EFF\u756B\u9762\uFF08\u7D04 \xB120 \u5EA6\uFF09\uFF0C\u81A0\u5E36\u4E2D\u592E\u7684\u9ED1\u5B57\u6301\u7E8C\u53CD\u5411\u6EFE\u52D5\uFF0C\u958B\u5834\u6642\u81A0\u5E36\u5F9E\u756B\u9762\u5916\u300C\u556A\u300D\u4E00\u8072\u62C9\u9032\u4F86\u3002",
    motionEn: "Two caution tapes with black-and-yellow striped edges cross in an X (about \xB120 degrees); the black text on each scrolls in opposite directions; at the start each tape snaps in from off-screen.",
    css: `
.S .tape{position:absolute;left:-20%;width:140%;top:44%;background:var(--ac);color:#111;font-size:calc(var(--u)*5.4);padding:calc(var(--u)*1.4) 0;overflow:hidden;border-block:calc(var(--u)*.9) solid transparent;border-image:repeating-linear-gradient(45deg,#111 0 12px,var(--ac) 12px 24px) 10;box-shadow:0 10px 30px #0006}
.S .t1{transform:rotate(-18deg);animation:K_in1 6s cubic-bezier(.2,.9,.2,1) infinite both}
.S .t2{transform:rotate(16deg);animation:K_in2 6s cubic-bezier(.2,.9,.2,1) .25s infinite both}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_l 8s linear infinite}
.S .t2 .r{animation-direction:reverse}
@keyframes K_l{to{transform:translateX(-50%)}}
@keyframes K_in1{0%{transform:rotate(-18deg) translateX(-110%)}12%,100%{transform:rotate(-18deg)}}
@keyframes K_in2{0%{transform:rotate(16deg) translateX(110%)}12%,100%{transform:rotate(16deg)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="tape t1"><div class="r">${loop(w[0], 14)}</div></div><div class="tape t2"><div class="r">${loop(w[0], 14)}</div></div>`, "html")
  },
  {
    id: "credits-roll",
    cat: "flow",
    zh: "\u7247\u5C3E\u540D\u55AE",
    en: "Credits Roll",
    desc: "\u540D\u55AE\u7531\u4E0B\u5F80\u4E0A\u7DE9\u7DE9\u6372\u52D5",
    tags: ["\u7247\u5C3E", "\u611F\u8B1D"],
    tone: "ink",
    sample: ["\u4F01\u5283\uFF5CKC", "\u651D\u5F71\uFF5C\u5C0F\u660E", "\u526A\u8F2F\uFF5C\u963F\u83EF", "\u97F3\u6A02\uFF5CLofi Lab", "\u7279\u5225\u611F\u8B1D\uFF5C\u6BCF\u4E00\u4F4D\u89C0\u773E"],
    hint: "\u7528\u300C\u8077\u7A31\uFF5C\u540D\u5B57\u300D\u5206\u591A\u884C",
    motion: "\u7F6E\u4E2D\u7684\u5169\u6B04\u540D\u55AE\uFF08\u5DE6\u6B04\u8077\u7A31\u9760\u53F3\u3001\u53F3\u6B04\u540D\u5B57\u9760\u5DE6\uFF0C\u4E2D\u9593\u4EE5\u7D30\u7DDA\u5206\u9694\uFF09\u7531\u756B\u9762\u4E0B\u65B9\u7DE9\u6162\u5F80\u4E0A\u6372\u52D5\uFF0C\u4E0A\u4E0B\u908A\u7DE3\u6709\u6F38\u5C64\u6DE1\u51FA\u906E\u7F69\u3002",
    motionEn: "A centered two-column credit list (role right-aligned on the left, name left-aligned on the right, thin divider) scrolls slowly upward from the bottom, with gradient fade masks at the top and bottom edges.",
    css: `
.S{-webkit-mask:linear-gradient(transparent,#000 20%,#000 80%,transparent);mask:linear-gradient(transparent,#000 20%,#000 80%,transparent)}
.S .list{display:grid;grid-template-columns:1fr auto 1fr;gap:calc(var(--u)*1.8) calc(var(--u)*2);font-size:calc(var(--u)*3.6);animation:K_up 9s linear infinite;align-self:start}
.S .k{text-align:right;font-weight:400;opacity:.6}.S .bar{width:1px;background:var(--ac)}
@keyframes K_up{from{transform:translateY(60cqh)}to{transform:translateY(-100%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="list">${w.map((l) => {
      const [k, v] = l.includes("\uFF5C") ? l.split("\uFF5C") : ["", l];
      return `<div class="k">${esc(k)}</div><div class="bar"></div><div>${esc(v ?? "")}</div>`;
    }).join("")}</div>`, "html")
  },
  {
    id: "circle-badge",
    cat: "flow",
    zh: "\u74B0\u5F62\u65CB\u8F49",
    en: "Rotating Badge",
    desc: "\u6587\u5B57\u7E5E\u6210\u5713\u5708\u6162\u6162\u8F49\uFF0C\u4E2D\u9593\u653E\u4E3B\u984C",
    tags: ["Logo", "\u5FBD\u7AE0"],
    tone: "paper",
    sample: ["\u5149\u5BD3\u79D1\u6280 \u2022 LEICHTHUB \u2022 ", "\u5149"],
    hint: "\u5916\u5708\u4E00\u53E5\u3001\u4E2D\u5FC3\u4E00\u5B57",
    motion: "\u4E00\u53E5\u6587\u5B57\u6CBF\u5713\u5468\u6392\u5217\u6210\u5FBD\u7AE0\u5916\u5708\u4E26\u6301\u7E8C\u9806\u6642\u91DD\u65CB\u8F49\uFF0810 \u79D2\u4E00\u5708\uFF09\uFF0C\u4E2D\u5FC3\u653E\u4E00\u500B\u5927\u5B57\u6216\u7B26\u865F\uFF0C\u5916\u5708\u8207\u4E2D\u5FC3\u4E4B\u9593\u6709\u4E00\u689D\u4E3B\u8272\u7D30\u5713\u7DDA\u3002",
    motionEn: "A phrase wraps around a circle as a badge rim and rotates clockwise continuously (10s per turn); a large glyph sits in the center, with a thin accent circle between rim and center.",
    css: `
.S svg{width:min(80cqw,80cqh);height:min(80cqw,80cqh);animation:K_r 10s linear infinite}
.S text{font-size:44px;font-weight:900;fill:var(--fg);letter-spacing:6px}
.S .ring{fill:none;stroke:var(--ac);stroke-width:4}
.S .mid{position:absolute;font-size:min(22cqw,22cqh);color:var(--ac)}
@keyframes K_r{to{transform:rotate(1turn)}}`,
    html: /* @__PURE__ */ __name((w) => `<svg viewBox="0 0 500 500"><path id="cbp" d="M250 250 m-190 0 a190 190 0 1 1 380 0 a190 190 0 1 1 -380 0" fill="none"/><circle class="ring" cx="250" cy="250" r="140"/><text><textPath href="#cbp" textLength="1180">${esc(w[0])}${esc(w[0])}</textPath></text></svg><div class="mid">${esc(w[1] ?? "\u5149")}</div>`, "html")
  }
];

// ../src/effects/depth.ts
var depth = [
  {
    id: "text-tunnel",
    cat: "depth",
    zh: "\u6587\u5B57\u96A7\u9053",
    en: "Text Tunnel",
    desc: "\u5F9E\u6587\u5B57\u4E2D\u9593\u7A7F\u904E\u53BB",
    tags: ["\u958B\u5834", "\u79D1\u5E7B"],
    tone: "ink",
    sample: ["\u7A7F\u8D8A"],
    hint: "2\u20133 \u5B57",
    motion: "\u591A\u5C64\u540C\u5FC3\u65B9\u6846\uFF0C\u6BCF\u5C64\u56DB\u908A\u90FD\u5BEB\u8457\u540C\u4E00\u500B\u8A5E\uFF0C\u5F9E\u756B\u9762\u4E2D\u5FC3\u7684\u6975\u5C0F\u5C3A\u5BF8\u4E0D\u65B7\u653E\u5927\u671D\u93E1\u982D\u885D\u4F86\u4E26\u6DE1\u51FA\uFF0C\u5C64\u8207\u5C64\u7B49\u8DDD\u932F\u958B\uFF0C\u5F62\u6210\u7121\u6B62\u76E1\u7684\u6587\u5B57\u96A7\u9053\u3002",
    motionEn: "Concentric square frames, each with the same word on all four sides, endlessly scale up from a tiny point at the center toward the camera and fade out, evenly staggered, forming an infinite text tunnel.",
    css: `
.S .f{position:absolute;width:40cqmin;height:40cqmin;border:2px solid color-mix(in srgb,var(--ac) 60%,transparent);animation:K_t 4s linear infinite both;animation-delay:calc(var(--i)*-.5s);display:grid}
.S .f b{position:absolute;font-size:5cqmin;white-space:nowrap;left:50%;top:50%}
.S .f b:nth-child(1){transform:translate(-50%,-50%) translateY(-23cqmin)}
.S .f b:nth-child(2){transform:translate(-50%,-50%) translateY(23cqmin) rotate(180deg)}
.S .f b:nth-child(3){transform:translate(-50%,-50%) translateX(-23cqmin) rotate(-90deg)}
.S .f b:nth-child(4){transform:translate(-50%,-50%) translateX(23cqmin) rotate(90deg)}
@keyframes K_t{0%{transform:scale(.02);opacity:0}15%{opacity:1}100%{transform:scale(4);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => rep(8, (i) => `<div class="f" style="--i:${i}">${rep(4, () => `<b>${esc(w[0])}</b>`)}</div>`), "html")
  },
  {
    id: "text-corridor",
    cat: "depth",
    zh: "\u6587\u5B57\u8D70\u5ECA",
    en: "Text Corridor",
    desc: "\u5730\u677F\u7246\u58C1\u90FD\u662F\u5B57\uFF0C\u4E00\u8DEF\u5F80\u524D",
    tags: ["\u6C89\u6D78", "MV"],
    tone: "accent",
    sample: ["\u524D\u9032"],
    hint: "2\u20133 \u5B57",
    motion: "3D \u900F\u8996\u8D70\u5ECA\uFF0C\u5730\u677F\u3001\u5929\u82B1\u677F\u3001\u5DE6\u53F3\u7246\u56DB\u500B\u9762\u90FD\u92EA\u6EFF\u91CD\u8907\u7684\u540C\u4E00\u500B\u8A5E\uFF0C\u6587\u5B57\u6301\u7E8C\u5F80\u93E1\u982D\u65B9\u5411\u79FB\u52D5\uFF0C\u50CF\u5728\u5B57\u505A\u6210\u7684\u8D70\u5ECA\u88E1\u4E00\u8DEF\u524D\u9032\uFF1B\u4E2D\u592E\u6D88\u5931\u9EDE\u4FDD\u6301\u7559\u767D\u3002",
    motionEn: "A 3D perspective corridor whose floor, ceiling and both walls are tiled with the same repeated word; the text keeps moving toward the camera as if travelling down a hallway made of words, with the vanishing point left empty.",
    css: `
.S{perspective:28cqw;perspective-origin:50% 50%}
.S .p{position:absolute;width:120cqw;height:300cqw;left:50%;top:50%;overflow:hidden;font-size:7cqw;line-height:1.1;color:#111;display:flex;flex-wrap:wrap;align-content:flex-start;gap:0 2cqw;justify-content:center}
.S .p>div{animation:K_go 3s linear infinite;display:flex;flex-wrap:wrap;justify-content:center;gap:0 2cqw}
.S .fl{transform:translate(-50%,-50%) translateY(28cqh) rotateX(90deg)}
.S .ce{transform:translate(-50%,-50%) translateY(-28cqh) rotateX(-90deg)}
.S .le{transform:translate(-50%,-50%) translateX(-50cqw) rotateY(90deg) rotate(90deg)}
.S .ri{transform:translate(-50%,-50%) translateX(50cqw) rotateY(-90deg) rotate(-90deg)}
.S .fog{position:absolute;inset:0;background:radial-gradient(closest-side,var(--bg) 18%,transparent 70%)}
@keyframes K_go{to{transform:translateY(8.8cqw)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const plane = /* @__PURE__ */ __name((c) => `<div class="p ${c}"><div>${rep(150, () => `<span>${esc(w[0])}</span>`)}</div></div>`, "plane");
      return plane("fl") + plane("ce") + plane("le") + plane("ri") + '<div class="fog"></div>';
    }, "html")
  },
  {
    id: "text-cylinder",
    cat: "depth",
    zh: "\u5713\u67F1",
    en: "Text Cylinder",
    desc: "\u6587\u5B57\u5713\u67F1\u53CD\u5411\u65CB\u8F49",
    tags: ["\u7ACB\u9AD4", "Logo"],
    tone: "paper",
    sample: ["\u8F49\u5708\u5708"],
    hint: "2\u20134 \u5B57\uFF0C\u6703\u91CD\u8907\u6392\u6EFF\u4E00\u5708",
    motion: "\u6587\u5B57\u9010\u5B57\u6392\u5217\u5728\u4E09\u500B\u4E0A\u4E0B\u5806\u758A\u7684 3D \u5713\u67F1\u8868\u9762\u4E0A\uFF0C\u6BCF\u4E00\u5708 12 \u500B\u5B57\uFF1B\u4E0A\u4E0B\u5169\u5708\u9806\u6642\u91DD\u3001\u4E2D\u9593\u5708\u9006\u6642\u91DD\u7E5E Y \u8EF8\u65CB\u8F49\uFF0C\u80CC\u9762\u7684\u5B57\u8B8A\u6DE1\uFF0C\u4E2D\u9593\u5708\u7528\u4E3B\u8272\u3002",
    motionEn: "Characters wrap around three stacked 3D cylinders, 12 glyphs per ring; the top and bottom rings rotate clockwise around the Y axis while the middle ring rotates counter-clockwise; back-facing glyphs dim and the middle ring uses the accent color.",
    css: `
.S{perspective:120cqw}
.S .ring{position:relative;width:1px;height:12cqmin;transform-style:preserve-3d;animation:K_r 9s linear infinite}
.S .ring:nth-child(2){animation-direction:reverse;color:var(--ac)}
.S .ring:nth-child(1){top:-14cqmin}.S .ring:nth-child(3){top:14cqmin}
.S .wrap{position:absolute;display:grid}
.S .g{position:absolute;left:0;top:0;font-size:10cqmin;width:12cqmin;margin-left:-6cqmin;text-align:center;transform:rotateY(calc(var(--i)*30deg)) translateZ(24cqmin);backface-visibility:visible}
@keyframes K_r{from{transform:rotateX(-12deg) rotateY(0)}to{transform:rotateX(-12deg) rotateY(-360deg)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const glyphs = Array.from(w[0] || "\u8F49");
      const ring = rep(12, (i) => `<span class="g" style="--i:${i}">${esc(glyphs[i % glyphs.length])}</span>`);
      return `<div class="wrap"><div class="ring">${ring}</div><div class="ring">${ring}</div><div class="ring">${ring}</div></div>`;
    }, "html")
  },
  {
    id: "text-vortex",
    cat: "depth",
    zh: "\u6F29\u6E26",
    en: "Text Vortex",
    desc: "\u6587\u5B57\u626D\u8F49\u6372\u6210\u6F29\u6E26",
    tags: ["\u5947\u5E7B", "\u4EAE\u9EDE"],
    tone: "ink",
    sample: ["\u6F29\u6E26"],
    hint: "2\u20133 \u5B57",
    motion: "\u6587\u5B57\u7684\u6BCF\u500B\u5B57\u6CBF\u8457\u5C0D\u6578\u87BA\u65CB\u6392\u5217\uFF0C\u7531\u5916\u800C\u5167\u5B57\u8D8A\u4F86\u8D8A\u5C0F\u3001\u8D8A\u4F86\u8D8A\u6DE1\uFF0C\u6574\u500B\u87BA\u65CB\u6301\u7E8C\u65CB\u8F49\u4E26\u7DE9\u6162\u7E2E\u653E\uFF0C\u50CF\u88AB\u5438\u5165\u6F29\u6E26\uFF1B\u4E2D\u592E\u653E\u5927\u7684\u4E3B\u8A5E\u7DAD\u6301\u4E0D\u52D5\u3002",
    motionEn: "Glyphs are arranged along a logarithmic spiral, shrinking and fading toward the center; the whole spiral spins and gently pulses in scale as if being sucked into a vortex, while the main word stays large and still in the middle.",
    css: `
.S .sp{position:absolute;width:0;height:0;animation:K_v 8s linear infinite}
.S .g{position:absolute;font-size:calc(var(--s)*1cqmin);opacity:var(--o);transform:rotate(var(--a)) translateX(calc(var(--d)*1cqmin)) rotate(90deg);translate:-50% -50%;color:var(--ac)}
.S .mid{font-size:16cqmin;position:relative;animation:K_p 4s ease-in-out infinite}
@keyframes K_v{to{transform:rotate(1turn)}}
@keyframes K_p{50%{transform:scale(1.08) rotate(-4deg)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const g = Array.from(w[0] || "\u6F29");
      return `<div class="sp">${rep(48, (i) => {
        const d = 6 + i * 1.15;
        return `<span class="g" style="--a:${i * 28}deg;--d:${d};--s:${2 + i * 0.12};--o:${0.15 + i / 60}">${esc(g[i % g.length])}</span>`;
      })}</div><div class="mid">${esc(w[0])}</div>`;
    }, "html")
  },
  {
    id: "ring-tunnel",
    cat: "depth",
    zh: "\u5713\u74B0\u96A7\u9053",
    en: "Ring Text Tunnel",
    desc: "\u4E00\u5708\u5708\u6587\u5B57\u64B2\u9762\u800C\u4F86",
    tags: ["\u958B\u5834", "\u79D1\u5E7B"],
    tone: "ink",
    sample: ["\u672A\u4F86\u5DF2\u4F86"],
    hint: "2\u20135 \u5B57",
    motion: "\u591A\u500B\u7531\u6587\u5B57\u6392\u6210\u7684\u5713\u74B0\uFF0C\u5F9E\u4E2D\u5FC3\u9EDE\u4E0D\u65B7\u653E\u5927\u671D\u93E1\u982D\u64B2\u4F86\uFF0C\u6BCF\u500B\u5713\u74B0\u540C\u6642\u7DE9\u6162\u65CB\u8F49\uFF0C\u5947\u6578\u74B0\u7528\u4E3B\u8272\uFF0C\u8D8A\u9760\u8FD1\u93E1\u982D\u8D8A\u900F\u660E\uFF0C\u5F62\u6210\u74B0\u72C0\u6642\u5149\u96A7\u9053\u3002",
    motionEn: "Multiple rings made of text continuously expand from the center toward the camera while slowly rotating; alternate rings use the accent color and fade as they near the lens, forming a circular time tunnel.",
    css: `
.S .rg{position:absolute;width:60cqmin;height:60cqmin;animation:K_z 4.8s linear infinite both;animation-delay:calc(var(--i)*-.8s)}
.S .rg:nth-child(2n){color:var(--ac)}
.S .rg svg{width:100%;height:100%;animation:K_r 12s linear infinite;overflow:visible}
.S text{font-size:30px;font-weight:900;fill:currentColor;letter-spacing:4px}
@keyframes K_z{0%{transform:scale(.02);opacity:0}20%{opacity:1}100%{transform:scale(3.2);opacity:0}}
@keyframes K_r{to{transform:rotate(1turn)}}`,
    html: /* @__PURE__ */ __name((w) => `<svg width="0" height="0" style="position:absolute"><defs><path id="rtp" d="M150 150 m-120 0 a120 120 0 1 1 240 0 a120 120 0 1 1 -240 0"/></defs></svg>${rep(
      6,
      (i) => `<div class="rg" style="--i:${i}"><svg viewBox="0 0 300 300"><text><textPath href="#rtp" textLength="740">${esc(w[0])}\u3000${esc(w[0])}\u3000${esc(w[0])}\u3000</textPath></text></svg></div>`
    )}`, "html")
  },
  {
    id: "text-orbit",
    cat: "depth",
    zh: "\u8ECC\u9053",
    en: "Text Orbit",
    desc: "\u55AE\u5B57\u5E36\u8457\u666F\u6DF1\u7E5E\u5708",
    tags: ["Logo", "\u6A19\u984C"],
    tone: "accent",
    sample: ["\u8ECC\u9053", "\u2605"],
    hint: "\u4E3B\u8A5E 2\u20134 \u5B57",
    motion: "\u4E3B\u8A5E\u5728\u4E2D\u592E\uFF0C\u4E00\u9846\u5C0F\u7B26\u865F\u6CBF\u8457\u50BE\u659C\u7684\u6A62\u5713\u865B\u7DDA\u8ECC\u9053\u7E5E\u884C\uFF0C\u7D93\u904E\u4E3B\u8A5E\u5F8C\u65B9\u6642\u88AB\u906E\u4F4F\u3001\u7D93\u904E\u524D\u65B9\u6642\u653E\u5927\uFF0C\u7522\u751F 3D \u666F\u6DF1\uFF1B\u4E3B\u8A5E\u672C\u8EAB\u8F15\u5FAE\u4E0A\u4E0B\u6D6E\u52D5\u3002",
    motionEn: "The main word sits in the center while a small symbol travels around a tilted dashed elliptical orbit, hidden when passing behind the word and enlarged when passing in front, creating 3D depth; the word gently floats up and down.",
    css: `
.S .orb{position:absolute;width:70cqw;height:22cqw;border:2px dashed color-mix(in srgb,#111 55%,transparent);border-radius:50%}
.S .w{font-size:15cqw;color:#111;position:relative;z-index:2;animation:K_f 3s ease-in-out infinite}
.S .dy{position:absolute;left:50%;top:50%;animation:K_y 4s ease-in-out infinite alternate;animation-delay:-2s}
.S .dot{display:block;font-size:6cqw;color:#fff;translate:-50% -50%;animation:K_x 4s ease-in-out infinite alternate;animation-delay:-1s;animation-duration:2s}
.S .dy{animation-duration:2s;animation-delay:0s}
@keyframes K_x{from{transform:translateX(-35cqw)}to{transform:translateX(35cqw)}}
@keyframes K_y{from{transform:translateY(-11cqw) scale(.7);z-index:1}49%{z-index:1}51%{z-index:3}to{transform:translateY(11cqw) scale(1.3);z-index:3}}
@keyframes K_f{50%{transform:translateY(-4%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="orb"></div><div class="w">${esc(w[0])}</div><div class="dy"><span class="dot">${esc(w[1] ?? "\u2605")}</span></div>`, "html")
  },
  {
    id: "text-cube",
    cat: "depth",
    zh: "\u65B9\u584A",
    en: "Text Cube",
    desc: "\u56DB\u9762\u5BEB\u5B57\u7684\u65B9\u584A\u76F4\u5411\u7FFB\u8F49",
    tags: ["\u5207\u63DB", "\u7ACB\u9AD4"],
    tone: "paper",
    sample: ["\u6625", "\u590F", "\u79CB", "\u51AC"],
    hint: "4 \u500B\u5B57\u6216\u77ED\u8A5E",
    motion: "\u4E00\u500B 3D \u7ACB\u65B9\u9AD4\uFF0C\u524D\u4E0A\u5F8C\u4E0B\u56DB\u500B\u9762\u5404\u5BEB\u4E00\u500B\u5B57\uFF08\u4E3B\u8272\u5E95\u767D\u5B57\uFF09\uFF0C\u6BCF\u9694 1 \u79D2\u7E5E X \u8EF8\u7FFB\u8F49 90 \u5EA6\u4E26\u5E36\u56DE\u5F48\uFF0C\u4F9D\u5E8F\u9732\u51FA\u4E0B\u4E00\u9762\uFF0C\u56DB\u9762\u8F2A\u5B8C\u5FAA\u74B0\u3002",
    motionEn: "A 3D cube with one word on each of four faces (white on accent); every second it flips 90 degrees around the X axis with a slight overshoot, revealing the next face, cycling through all four.",
    css: `
.S{perspective:120cqmin}
.S .cube{width:36cqmin;height:36cqmin;position:relative;transform-style:preserve-3d;animation:K_c 5.2s cubic-bezier(.5,-0.3,.4,1.4) infinite}
.S .fc{position:absolute;inset:0;display:grid;place-items:center;background:var(--ac);color:#fff;font-size:calc(36cqmin / var(--len,1) * .62);border:2px solid color-mix(in srgb,#000 15%,var(--ac))}
.S .fc:nth-child(1){transform:translateZ(18cqmin)}
.S .fc:nth-child(2){transform:rotateX(-90deg) translateZ(18cqmin)}
.S .fc:nth-child(3){transform:rotateX(-180deg) translateZ(18cqmin)}
.S .fc:nth-child(4){transform:rotateX(-270deg) translateZ(18cqmin)}
@keyframes K_c{0%,20%{transform:rotateX(0)}25%,45%{transform:rotateX(90deg)}50%,70%{transform:rotateX(180deg)}75%,95%{transform:rotateX(270deg)}100%{transform:rotateX(360deg)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="cube">${pick(w, 4, ["\u6625", "\u590F", "\u79CB", "\u51AC"]).map((t) => `<div class="fc" style="--len:${Math.max(1, Array.from(t).length)}">${esc(t)}</div>`).join("")}</div>`, "html")
  },
  {
    id: "extrude",
    cat: "depth",
    zh: "\u7ACB\u9AD4\u5B57",
    en: "Extrude Text",
    desc: "\u7ACB\u9AD4\u5B57\u7684\u539A\u5EA6\u65B9\u5411\u8F49\u4E00\u5708",
    tags: ["\u6A19\u984C", "\u5FA9\u53E4"],
    tone: "ink",
    sample: ["\u7ACB\u9AD4"],
    hint: "2\u20134 \u5B57",
    motion: "\u7C97\u9AD4\u6587\u5B57\u5E36\u6709 20 \u5C64\u5806\u758A\u7684\u539A\u5EA6\uFF08\u6BCF\u5C64\u4F4D\u79FB 1px\u3001\u984F\u8272\u6F38\u6DF1\uFF09\uFF0C\u539A\u5EA6\u7684\u65B9\u5411\u7E5E\u8457\u6587\u5B57\u8F49\u4E00\u5708\uFF08\u53F3\u4E0B\u2192\u5DE6\u4E0B\u2192\u5DE6\u4E0A\u2192\u53F3\u4E0A\uFF09\uFF0C\u50CF\u7ACB\u9AD4\u5B57\u5728\u64FA\u982D\uFF0C\u6B63\u9762\u7528\u4E3B\u8272\u3002",
    motionEn: "Bold text with a 20-layer stacked extrusion (1px per layer, progressively darker); the extrusion direction rotates around the letters (down-right \u2192 down-left \u2192 up-left \u2192 up-right) as if the 3D type is swaying; the face uses the accent color.",
    css: "",
    html: /* @__PURE__ */ __name((w) => `<div class="w">${esc(w[0])}</div>`, "html")
  },
  {
    id: "flip-chars",
    cat: "depth",
    zh: "\u9010\u5B57\u7FFB\u8F49",
    en: "3D Letter Flip",
    desc: "\u6BCF\u500B\u5B57\u4F9D\u5E8F\u7E5E Y \u8EF8\u7FFB\u4E00\u5708",
    tags: ["\u8F49\u5834", "\u6A19\u984C"],
    tone: "accent",
    sample: ["\u7FFB\u8F49\u4EBA\u751F"],
    hint: "3\u20136 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u4F9D\u5E8F\u7E5E Y \u8EF8 3D \u7FFB\u8F49 360 \u5EA6\uFF08\u5E36\u900F\u8996\uFF09\uFF0C\u7FFB\u8F49\u6642\u5B57\u7684\u80CC\u9762\u986F\u793A\u70BA\u6DF1\u8272\uFF0C\u5B57\u8207\u5B57\u9593\u9694 0.1 \u79D2\u5F62\u6210\u9AA8\u724C\u822C\u7684\u6CE2\u6D6A\uFF0C\u9593\u9694 1.5 \u79D2\u518D\u91CD\u4F86\u3002",
    motionEn: "Each character flips 360 degrees around the Y axis in 3D perspective in sequence, showing a dark back face mid-flip, 0.1s apart like a domino wave; repeats after a 1.5s pause.",
    css: `
.S{perspective:60cqw}
.S .t{display:flex;font-size:14cqw;color:#111}
.S .c{animation:K_f 3s cubic-bezier(.5,0,.3,1) infinite;animation-delay:calc(var(--i)*.1s);transform-style:preserve-3d}
@keyframes K_f{0%{transform:rotateY(0)}40%,100%{transform:rotateY(360deg)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "star-crawl",
    cat: "depth",
    zh: "\u661F\u969B\u958B\u5834",
    en: "Perspective Crawl",
    desc: "\u6587\u5B57\u5F80\u9060\u65B9\u5730\u5E73\u7DDA\u6372\u53BB",
    tags: ["\u958B\u5834", "\u96FB\u5F71\u611F"],
    tone: "ink",
    sample: ["\u5F88\u4E45\u5F88\u4E45\u4EE5\u524D", "\u5728\u4E00\u500B\u9059\u9060\u7684\u91CD\u5283\u5340", "\u6709\u4E00\u4F4D\u6301\u5BB6\u7537\u5B50", "\u6C7A\u5B9A\u958B\u59CB\u62CD\u5F71\u7247"],
    hint: "\u591A\u884C\u77ED\u53E5",
    motion: "\u96FB\u5F71\u958B\u5834\u5F0F\u7684\u900F\u8996\u6372\u52D5\uFF1A\u4E00\u6BB5\u7F6E\u4E2D\u7684\u6BB5\u843D\u6587\u5B57\u50BE\u5012\u6210 3D \u5E73\u9762\uFF08rotateX \u7D04 25 \u5EA6\uFF09\uFF0C\u7531\u756B\u9762\u4E0B\u65B9\u5F80\u9060\u65B9\u5730\u5E73\u7DDA\u6162\u6162\u6372\u53BB\u4E26\u7E2E\u5C0F\u6DE1\u51FA\uFF0C\u6587\u5B57\u4F7F\u7528\u4E3B\u8272\uFF0C\u80CC\u666F\u9EDE\u7DB4\u5C0F\u661F\u9EDE\u3002",
    motionEn: "A cinematic opening crawl: a centered paragraph tilted back into a 3D plane (about 25 degrees rotateX) scrolls from the bottom toward the distant horizon, shrinking and fading; text in the accent color over a starfield.",
    css: `
.S{perspective:40cqh;background:radial-gradient(1px 1px at 20% 30%,#fff 50%,transparent),radial-gradient(1px 1px at 70% 20%,#fff 50%,transparent),radial-gradient(1.5px 1.5px at 40% 80%,#fff 50%,transparent),radial-gradient(1px 1px at 85% 65%,#fff 50%,transparent),var(--bg)}
.S .plane{position:absolute;bottom:0;width:70cqw;height:200cqh;transform-origin:50% 100%;transform:rotateX(28deg);-webkit-mask:linear-gradient(transparent 5%,#000 45%);mask:linear-gradient(transparent 5%,#000 45%)}
.S .txt{position:absolute;top:100%;width:100%;text-align:center;color:var(--ac);font-size:6cqw;line-height:1.4;animation:K_cr 12s linear infinite}
@keyframes K_cr{to{transform:translateY(-180cqh)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="plane"><div class="txt">${w.map(esc).join("<br>")}</div></div>`, "html")
  }
];
var ext = /* @__PURE__ */ __name((dx, dy) => Array.from({ length: 20 }, (_, i) => `${dx * (i + 1)}px ${dy * (i + 1)}px 0 color-mix(in srgb,var(--ac) ${70 - i * 3}%,#000)`).join(","), "ext");
var extrude = depth.find((f) => f.id === "extrude");
extrude.css = `
.S .w{font-size:17cqw;color:var(--ac);filter:brightness(1.15);animation:K_e 4s ease-in-out infinite}
@keyframes K_e{0%,100%{text-shadow:${ext(1, 1)}}25%{text-shadow:${ext(-1, 1)}}50%{text-shadow:${ext(-1, -1)}}75%{text-shadow:${ext(1, -1)}}}`;

// ../src/effects/switch.ts
var switching = [
  {
    id: "split-flap",
    cat: "switch",
    zh: "\u7FFB\u724C",
    en: "Split Flap",
    desc: "\u50CF\u8ECA\u7AD9\u6642\u523B\u8868\u4E00\u6A23\u7FFB\u5230\u5B9A\u4F4D",
    tags: ["\u5FA9\u53E4", "\u8ECA\u7AD9"],
    tone: "ink",
    sample: ["\u5F80\u677F\u6A4B", "\u5F80\u6DE1\u6C34", "\u5F80\u5357\u6E2F"],
    hint: "\u591A\u500B\u7B49\u9577\u7684\u8A5E",
    motion: "\u4EFF\u6A5F\u5834\uFF0F\u8ECA\u7AD9\u7FFB\u724C\u770B\u677F\uFF1A\u6BCF\u683C\u4E00\u500B\u5B57\uFF0C\u4E0A\u4E0B\u5169\u534A\uFF0C\u5207\u63DB\u6642\u6BCF\u683C\u5FEB\u901F\u4E82\u7FFB 6\u201310 \u6B21\u96A8\u6A5F\u5B57\u5F8C\u505C\u5728\u76EE\u6A19\u5B57\uFF0C\u683C\u8207\u683C\u4E4B\u9593\u6709 0.05 \u79D2\u932F\u958B\uFF1B\u505C\u7559 1.5 \u79D2\u5F8C\u7FFB\u5230\u4E0B\u4E00\u500B\u8A5E\u3002",
    motionEn: "A split-flap departure board: one glyph per tile split into upper and lower halves; on change, each tile rapidly flips through 6\u201310 random glyphs before landing on the target, staggered 0.05s per tile; hold 1.5s, then flip to the next word.",
    css: `
.S .board{display:flex;gap:1cqw}
.S .tile{position:relative;width:13cqw;height:17cqw;background:#1c1c1c;border-radius:1cqw;display:grid;place-items:center;font-size:11cqw;color:#f4f1e8;box-shadow:inset 0 -.4cqw 0 #0006,0 .6cqw 1.2cqw #0008;overflow:hidden}
.S .tile::after{content:'';position:absolute;left:0;right:0;top:50%;height:.25cqw;background:#000}
.S .tile.flip{animation:K_fl .08s linear}
@keyframes K_fl{50%{transform:scaleY(.82);filter:brightness(.7)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="board">${rep(Math.max(...w.map((t) => Array.from(t).length)), () => '<div class="tile"></div>')}</div>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const tiles = Array.from(root.querySelectorAll(".tile"));
      const pool = "\u7684\u4E00\u662F\u5728\u4E0D\u4E86\u6709\u548C\u4EBA\u9019\u4E2D\u5927\u70BA\u4E0A\u500B\u570B\u6211\u4EE5\u8981\u4ED6\u6642\u4F86\u7528\u5011\u751F\u5230\u4F5C\u5730\u65BC\u51FA\u5C31\u5206\u5C0D\u6210\u6703\u53EF\u4E3B\u767C\u5E74\u52D5\u540C\u5DE5\u4E5F\u80FD\u4E0B\u904E\u5B50\u8AAA\u7522\u7A2E\u9762\u800C\u65B9\u5F8C\u591A\u5B9A\u884C\u5B78\u6CD5\u6240\u6C11\u5F97\u7D93\u5341\u4E09\u4E4B\u9032\u8457\u7B49\u90E8\u5EA6\u5BB6\u96FB\u529B\u88E1\u5982\u6C34\u5316\u9AD8\u81EA\u4E8C\u7406\u8D77\u5C0F\u7269\u73FE\u5BE6\u52A0\u91CF\u90FD\u5169\u9AD4\u5236\u6A5F\u7576\u4F7F\u9EDE\u5F9E\u696D\u672C\u53BB\u628A\u6027\u597D\u61C9\u958B\u5B83\u5408\u9084\u56E0\u7531\u5176\u4E9B\u7136\u524D\u5916\u5929\u653F\u56DB\u65E5\u90A3\u793E\u7FA9\u4E8B\u5E73\u5F62\u76F8\u5168\u8868\u9593\u6A23\u8207\u95DC\u5404\u91CD\u65B0\u7DDA\u5167\u6578\u6B63\u5FC3\u53CD\u4F60\u660E\u770B\u539F\u53C8\u9EBC\u5229\u6BD4\u6216\u4F46\u8CEA\u6C23\u7B2C\u5411\u9053\u547D\u6B64\u8B8A\u689D\u53EA\u6C92\u7D50\u89E3\u554F\u610F\u5EFA\u6708\u516C\u7121\u7CFB\u8ECD\u5F88\u60C5\u8005\u6700\u7ACB\u4EE3\u60F3\u5DF2\u901A\u4E26\u63D0\u76F4\u984C\u9EE8\u7A0B\u5C55\u4E94\u679C\u6599\u8C61\u54E1\u9769\u4F4D\u5165\u5E38\u6587\u7E3D\u6B21\u54C1\u5F0F\u6D3B\u8A2D\u53CA\u7BA1\u7279\u4EF6\u9577\u6C42\u8001\u982D\u57FA\u8CC7\u908A\u6D41\u8DEF\u7D1A\u5C11\u5716\u5C71\u7D71\u63A5\u77E5\u8F03\u5C07\u7D44\u898B\u8A08\u5225\u5979\u624B\u89D2\u671F\u6839\u8AD6\u904B\u8FB2\u6307\u5E7E\u4E5D\u5340\u5F37\u653E\u6C7A\u897F\u88AB\u5E79\u505A\u5FC5\u6230\u5148\u56DE\u5247\u4EFB\u53D6\u64DA\u8655\u5E9C\u7814";
      let k = 0;
      let alive = true;
      const timers = [];
      const show = /* @__PURE__ */ __name(() => {
        if (!alive) return;
        const target = Array.from(w[k % w.length]);
        tiles.forEach((tile, i) => {
          const final = target[i] ?? "";
          let n = 6 + Math.floor(Math.random() * 5);
          const step = /* @__PURE__ */ __name(() => {
            if (!alive) return;
            tile.classList.remove("flip");
            void tile.offsetWidth;
            tile.classList.add("flip");
            tile.textContent = n-- > 0 ? pool[Math.floor(Math.random() * pool.length)] : final;
            if (n >= 0) timers.push(window.setTimeout(step, 70));
          }, "step");
          timers.push(window.setTimeout(step, i * 50));
        });
        k++;
        timers.push(window.setTimeout(show, 2600));
      }, "show");
      show();
      return () => {
        alive = false;
        timers.forEach(clearTimeout);
      };
    }, "run")
  },
  {
    id: "flip-cards",
    cat: "switch",
    zh: "\u7FFB\u5361",
    en: "Flip Cards",
    desc: "\u4E00\u5F35\u5F35\u7FFB\u9762\u63DB\u5B57",
    tags: ["\u5207\u63DB", "\u516C\u544A"],
    tone: "accent",
    sample: ["\u6708\u5149\u4E0B", "\u661F\u7A7A\u88E1"],
    hint: "2 \u500B\u7B49\u9577\u7684\u8A5E",
    motion: "\u6BCF\u500B\u5B57\u662F\u4E00\u5F35\u6DF1\u8272\u5713\u89D2\u5361\u7247\uFF0C\u5361\u7247\u4F9D\u5E8F\u7E5E X \u8EF8 3D \u7FFB\u8F49 180 \u5EA6\uFF0C\u6B63\u9762\u662F\u7B2C\u4E00\u500B\u8A5E\u3001\u80CC\u9762\u662F\u7B2C\u4E8C\u500B\u8A5E\uFF0C\u9593\u9694 0.12 \u79D2\uFF1B\u505C\u7559\u5F8C\u518D\u7FFB\u56DE\u4F86\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Each glyph sits on a dark rounded card; cards flip 180 degrees around the X axis in 3D one after another, front showing the first word and back the second, 0.12s apart; hold, then flip back, looping.",
    css: `
.S .row{display:flex;gap:2cqw;perspective:80cqw}
.S .card{position:relative;width:16cqw;height:19cqw;transform-style:preserve-3d;animation:K_f 4s cubic-bezier(.6,-0.2,.3,1.3) infinite;animation-delay:calc(var(--i)*.12s)}
.S .card b{position:absolute;inset:0;display:grid;place-items:center;background:#1d1d1d;color:#fff;border-radius:2cqw;font-size:12cqw;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.S .card b+b{transform:rotateX(180deg);background:#fff;color:#111}
@keyframes K_f{0%,30%{transform:rotateX(0)}45%,80%{transform:rotateX(180deg)}95%,100%{transform:rotateX(360deg)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u6708\u5149\u4E0B", "\u661F\u7A7A\u88E1"]).map((t) => Array.from(t));
      const n = Math.max(a.length, b.length);
      return `<div class="row">${rep(n, (i) => `<div class="card" style="--i:${i}"><b>${esc(a[i] ?? "")}</b><b>${esc(b[i] ?? "")}</b></div>`)}</div>`;
    }, "html")
  },
  {
    id: "typewriter",
    cat: "switch",
    zh: "\u6253\u5B57\u6A5F",
    en: "Typewriter",
    desc: "\u4E00\u500B\u5B57\u4E00\u500B\u5B57\u6253\u51FA\u4F86\u518D\u63DB\u6389",
    tags: ["\u6545\u4E8B", "\u5B57\u5E55"],
    tone: "paper",
    sample: ["\u4ECA\u5929\u8981\u5E36\u5927\u5BB6", "\u53BB\u770B\u4E00\u9593\u623F\u5B50", "\u5148\u8AAA\u7D50\u8AD6"],
    hint: "\u591A\u53E5\u77ED\u53E5",
    motion: "\u6587\u5B57\u4EE5\u6BCF\u5B57 0.09 \u79D2\u7684\u901F\u5EA6\u9010\u5B57\u6253\u51FA\uFF0C\u5F8C\u65B9\u6709\u9583\u720D\u7684\u76F4\u7DDA\u6E38\u6A19\uFF1B\u6574\u53E5\u6253\u5B8C\u505C\u7559 1.2 \u79D2\uFF0C\u518D\u4EE5\u8F03\u5FEB\u901F\u5EA6\u9010\u5B57\u522A\u9664\uFF0C\u63DB\u4E0B\u4E00\u53E5\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Text types out one character every 0.09s with a blinking bar caret; after the full line holds for 1.2s, it deletes character by character at a faster pace, then types the next line, looping.",
    css: `
.S .t{font-size:7cqw;font-weight:700;display:flex;align-items:center;white-space:pre}
.S .cur{display:inline-block;width:.6cqw;height:8cqw;background:var(--ac);margin-left:.6cqw;animation:K_b .9s steps(1) infinite}
@keyframes K_b{50%{opacity:0}}`,
    html: /* @__PURE__ */ __name(() => `<div class="t"><span class="tx"></span><span class="cur"></span></div>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const el = root.querySelector(".tx");
      let alive = true;
      let t = 0;
      let line = 0;
      let i = 0;
      let dir = 1;
      const tick = /* @__PURE__ */ __name(() => {
        if (!alive) return;
        const s = Array.from(w[line % w.length]);
        if (dir > 0) {
          i++;
          el.textContent = s.slice(0, i).join("");
          if (i >= s.length) {
            dir = -1;
            t = window.setTimeout(tick, 1200);
            return;
          }
          t = window.setTimeout(tick, 90);
        } else {
          i--;
          el.textContent = s.slice(0, i).join("");
          if (i <= 0) {
            dir = 1;
            line++;
            t = window.setTimeout(tick, 350);
            return;
          }
          t = window.setTimeout(tick, 40);
        }
      }, "tick");
      tick();
      return () => {
        alive = false;
        clearTimeout(t);
      };
    }, "run")
  },
  {
    id: "slot-reel",
    cat: "switch",
    zh: "\u62C9\u9738",
    en: "Slot Text",
    desc: "\u6EFE\u8F2A\u8F49\u4E00\u8F49\u505C\u4E0B\u4F86",
    tags: ["\u7D50\u679C\u63ED\u66C9", "\u62BD\u734E"],
    tone: "paper",
    sample: ["\u5927\u5409", "\u5409", "\u51F6", "\u4E2D\u734E", "\u518D\u4F86"],
    hint: "\u7B2C\u4E00\u500B\u8A5E\u662F\u6700\u7D42\u7D50\u679C\uFF08\u6703\u9010\u5B57\u505C\u5728\u9019\u88E1\uFF09",
    motion: "\u50CF\u62C9\u9738\u6A5F\uFF1A\u6BCF\u500B\u5B57\u4F4D\u65BC\u4E00\u500B\u6DF1\u8272\u5713\u89D2\u8996\u7A97\u4E2D\uFF0C\u5B57\u4E32\u5728\u8996\u7A97\u5167\u5782\u76F4\u9AD8\u901F\u6EFE\u52D5\uFF08\u5E36\u52D5\u614B\u6A21\u7CCA\uFF09\uFF0C\u7531\u5DE6\u5230\u53F3\u4F9D\u5E8F\u6E1B\u901F\u505C\u4E0B\uFF0C\u6700\u5F8C\u62FC\u51FA\u7D50\u679C\u8A5E\uFF1B\u505C\u4E0B\u6642\u6709\u8F15\u5FAE\u56DE\u5F48\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Like a slot machine: each glyph sits in a dark rounded window; reels spin vertically at high speed with motion blur, then decelerate and stop left to right to spell the result word, with a slight bounce on landing, looping.",
    css: `
.S .row{display:flex;gap:2cqw}
.S .win{width:15cqw;height:18cqw;background:#1d1d1d;border-radius:2cqw;overflow:hidden;box-shadow:inset 0 2cqw 2cqw -1cqw #000a,inset 0 -2cqw 2cqw -1cqw #000a}
.S .reel{display:flex;flex-direction:column;animation:K_s 3.6s cubic-bezier(.3,0,.25,1.06) infinite;animation-delay:calc(var(--i)*.25s)}
.S .reel span{height:18cqw;display:grid;place-items:center;font-size:12cqw;color:#fff;flex:none}
.S .reel span:last-child{color:var(--ac)}
@keyframes K_s{0%{transform:translateY(0);filter:blur(0)}15%{filter:blur(.4cqw)}50%,90%{transform:translateY(calc(-18cqw * 15));filter:blur(0)}100%{transform:translateY(calc(-18cqw * 15));opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const target = Array.from(w[0] || "\u5927\u5409");
      const pool = Array.from(w.slice(1).join("") + "\u5409\u51F6\u798F\u797F\u58FD\u559C\u8CA1\u904B");
      return `<div class="row">${target.map(
        (ch, i) => `<div class="win"><div class="reel" style="--i:${i}">${rep(15, (k) => `<span>${esc(pool[(k * 7 + i * 3) % pool.length])}</span>`)}<span>${esc(ch)}</span></div></div>`
      ).join("")}</div>`;
    }, "html")
  },
  {
    id: "odometer",
    cat: "switch",
    zh: "\u8A08\u6578\u5668",
    en: "Odometer",
    desc: "\u6578\u5B57\u6EFE\u52D5\u5F80\u4E0A\u52A0",
    tags: ["\u6210\u7E3E", "\u6578\u5B57"],
    tone: "paper",
    sample: ["\u7D2F\u8A08", "52,800", "\u4EBA"],
    hint: "\u524D\u7DB4 / \u6578\u5B57 / \u55AE\u4F4D",
    motion: "\u5DE6\u5074\u5C0F\u5B57\u524D\u7DB4\u3001\u4E2D\u9593\u6BCF\u4E00\u4F4D\u6578\u662F\u4E00\u500B\u6DF1\u8272\u5713\u89D2\u683C\u5B50\u3001\u53F3\u5074\u55AE\u4F4D\uFF1B\u6578\u5B57\u5F9E 0 \u958B\u59CB\u6BCF\u4E00\u4F4D\u4EE5\u5782\u76F4\u6EFE\u8F2A\u65B9\u5F0F\u5411\u4E0A\u6EFE\u52D5\u5230\u76EE\u6A19\u503C\uFF0C\u9AD8\u4F4D\u6578\u6EFE\u5F97\u6162\u3001\u4F4E\u4F4D\u6578\u6EFE\u5F97\u5FEB\uFF0C\u505C\u4F4F\u5F8C\u505C\u7559 1.5 \u79D2\u91CD\u4F86\u3002",
    motionEn: "A small prefix on the left, each digit in its own dark rounded tile, a unit on the right; digits roll upward like an odometer from 0 to the target value, higher digits slower and lower digits faster; hold 1.5s, then restart.",
    css: `
.S .row{display:flex;align-items:center;gap:1.2cqw;font-size:5cqw}
.S .d{width:9cqw;height:12cqw;background:#1d1d1d;border-radius:1.4cqw;overflow:hidden;color:#fff;font-size:9cqw;font-family:var(--mono);font-weight:700}
.S .d.sep{background:none;color:var(--fg);width:3cqw}
.S .reel{display:flex;flex-direction:column;animation:K_r 3.5s cubic-bezier(.2,.7,.2,1) infinite both;animation-delay:calc(var(--i)*.05s)}
.S .reel span{height:12cqw;display:grid;place-items:center;flex:none}
@keyframes K_r{0%{transform:translateY(0)}55%,92%{transform:translateY(calc(var(--to)*-12cqw))}100%{transform:translateY(calc(var(--to)*-12cqw));opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [pre, num, unit] = pick(w, 3, ["\u7D2F\u8A08", "52,800", "\u4EBA"]);
      const digits = Array.from(num);
      let di = 0;
      const cells = digits.map((ch) => {
        if (!/\d/.test(ch)) return `<div class="d sep"><div class="reel" style="--to:0"><span>${esc(ch)}</span></div></div>`;
        const v = +ch;
        const loops = digits.length - di++;
        const seq = rep(loops * 10 + v + 1, (k) => `<span>${k % 10}</span>`);
        return `<div class="d"><div class="reel" style="--to:${loops * 10 + v};--i:${di}">${seq}</div></div>`;
      }).join("");
      return `<div class="row"><span>${esc(pre)}</span>${cells}<span>${esc(unit)}</span></div>`;
    }, "html")
  },
  {
    id: "headline-swap",
    cat: "switch",
    zh: "\u6A19\u984C\u5207\u63DB",
    en: "Headline Swap",
    desc: "\u65B0\u805E\u6A19\u984C\u4E00\u500B\u63DB\u4E00\u500B",
    tags: ["\u5FEB\u8A0A", "\u89E3\u8AAA"],
    tone: "accent",
    sample: ["\u5FEB\u8A0A", "\u6377\u904B\u65B0\u7AD9\u6B63\u5F0F\u52D5\u5DE5", "\u9031\u672B\u8CDE\u5C4B\u4EBA\u6F6E\u56DE\u6D41", "\u91CD\u5283\u5340\u4EA4\u5C4B\u6F6E\u4F86\u4E86"],
    hint: "\u6A19\u7C64 + 2\u20134 \u5247\u6A19\u984C",
    motion: "\u5DE6\u5074\u56FA\u5B9A\u7684\u767D\u5E95\u9ED1\u5B57\u6A19\u7C64\uFF08\u5982\u300C\u5FEB\u8A0A\u300D\uFF09\uFF0C\u53F3\u5074\u6DF1\u8272\u9577\u689D\u4E2D\u7684\u6A19\u984C\u6BCF 1.6 \u79D2\u5F9E\u4E0B\u5F80\u4E0A\u63A8\u5165\u66FF\u63DB\uFF0C\u820A\u6A19\u984C\u5F80\u4E0A\u63A8\u51FA\uFF1B\u9577\u689D\u958B\u5834\u6642\u5F9E\u5DE6\u5411\u53F3\u5C55\u958B\u3002",
    motionEn: 'A fixed white label on the left (e.g. "BREAKING"); in the dark bar on the right, headlines push up from below every 1.6s, shoving the previous one out the top; at the start the bar wipes open from left to right.',
    css: `
.S .bar{display:flex;align-items:stretch;width:84cqw;height:14cqw}
.S .lb{background:#fff;color:#111;font-size:6cqw;display:grid;place-items:center;padding:0 3cqw;z-index:1}
.S .hl{flex:1;background:#1d1d1d;color:#fff;position:relative;overflow:hidden;animation:K_open 6.4s cubic-bezier(.7,0,.2,1) infinite;transform-origin:0 50%}
.S .h{position:absolute;inset:0;display:flex;align-items:center;padding:0 3cqw;font-size:4.6cqw;white-space:nowrap;animation:K_h 6.4s cubic-bezier(.7,0,.2,1) infinite both;animation-delay:calc(var(--i)*1.6s)}
@keyframes K_open{0%{transform:scaleX(0)}8%,94%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes K_h{0%{transform:translateY(100%)}6%,25%{transform:none}31%,100%{transform:translateY(-100%)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [lb, ...hs] = w;
      const list = pick(hs, 4, ["\u6377\u904B\u65B0\u7AD9\u6B63\u5F0F\u52D5\u5DE5", "\u9031\u672B\u8CDE\u5C4B\u4EBA\u6F6E\u56DE\u6D41", "\u91CD\u5283\u5340\u4EA4\u5C4B\u6F6E\u4F86\u4E86", "\u4E0B\u96C6\u9810\u544A"]);
      return `<div class="bar"><div class="lb">${esc(lb)}</div><div class="hl">${list.map((h, i) => `<div class="h" style="--i:${i}">${esc(h)}</div>`).join("")}</div></div>`;
    }, "html")
  },
  {
    id: "led-board",
    cat: "switch",
    zh: "LED \u770B\u677F",
    en: "LED Text",
    desc: "\u9EDE\u9EDE\u7D44\u6210\u7684\u96FB\u5B50\u5B57",
    tags: ["\u5FA9\u53E4", "\u79D1\u6280"],
    tone: "ink",
    sample: ["\u6700\u65B0\u6D88\u606F"],
    hint: "2\u20138 \u5B57",
    motion: "\u4EFF LED \u9EDE\u9663\u770B\u677F\uFF1A\u6587\u5B57\u7531\u5713\u5F62\u767C\u5149\u9EDE\u7D44\u6210\uFF08\u4EAE\u9EDE\u70BA\u4E3B\u8272\u5E36\u5149\u6688\uFF0C\u6697\u9EDE\u70BA\u6975\u6697\u7070\uFF09\uFF0C\u6574\u6392\u6587\u5B57\u7531\u53F3\u5F80\u5DE6\u9010\u683C\u6372\u52D5\uFF0C\u9EDE\u9663\u80CC\u666F\u4FDD\u6301\u7DB2\u683C\u3002",
    motionEn: "A dot-matrix LED sign: text is built from round glowing dots (lit dots in the accent color with glow, unlit dots very dark grey); the message scrolls right-to-left one column at a time over the fixed dot grid.",
    css: `.S canvas{width:100%;height:100%;display:block}`,
    html: /* @__PURE__ */ __name(() => `<canvas></canvas>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const cv = root.querySelector("canvas");
      const ctx = cv.getContext("2d");
      const ac = getComputedStyle(root).getPropertyValue("--ac").trim() || "#d4ff3a";
      const rows = 22;
      const text = w.join("\u3000") + "\u3000\u3000";
      const off = document.createElement("canvas");
      const oc = off.getContext("2d", { willReadFrequently: true });
      off.height = rows;
      oc.font = `900 ${rows - 2}px "Noto Sans TC", sans-serif`;
      off.width = Math.ceil(oc.measureText(text).width) + 2;
      oc.font = `900 ${rows - 2}px "Noto Sans TC", sans-serif`;
      oc.fillStyle = "#fff";
      oc.textBaseline = "middle";
      oc.fillText(text, 0, rows / 2 + 1);
      const data = oc.getImageData(0, 0, off.width, rows).data;
      let x0 = 0;
      let raf = 0;
      let last = 0;
      const draw = /* @__PURE__ */ __name((ts) => {
        raf = requestAnimationFrame(draw);
        if (ts - last < 45) return;
        last = ts;
        const W2 = cv.width = cv.clientWidth * devicePixelRatio;
        const H2 = cv.height = cv.clientHeight * devicePixelRatio;
        const cell = H2 / (rows + 4);
        const cols = Math.ceil(W2 / cell);
        ctx.fillStyle = "#0b0b0b";
        ctx.fillRect(0, 0, W2, H2);
        for (let c = 0; c < cols; c++) {
          const sx = (c + x0) % off.width;
          for (let r = 0; r < rows; r++) {
            const on = data[(r * off.width + sx) * 4 + 3] > 110;
            ctx.beginPath();
            ctx.arc(c * cell + cell / 2, (r + 2) * cell + cell / 2, cell * 0.38, 0, 7);
            ctx.fillStyle = on ? ac : "#1e1e1e";
            ctx.shadowBlur = on ? cell : 0;
            ctx.shadowColor = ac;
            ctx.fill();
          }
        }
        x0++;
      }, "draw");
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }, "run")
  },
  {
    id: "split-halves",
    cat: "switch",
    zh: "\u4E0A\u4E0B\u88C2\u958B",
    en: "Split Halves",
    desc: "\u5B57\u88C2\u958B\uFF0C\u9732\u51FA\u53E6\u4E00\u500B\u8A5E",
    tags: ["\u8F49\u5834", "\u53CD\u5DEE"],
    tone: "ink",
    sample: ["\u5206\u88C2", "\u91CD\u751F"],
    hint: "2 \u500B\u8A5E",
    motion: "\u7B2C\u4E00\u500B\u8A5E\u6CBF\u6C34\u5E73\u4E2D\u7DDA\u5207\u6210\u4E0A\u4E0B\u5169\u534A\uFF0C\u4E0A\u534A\u5F80\u4E0A\u3001\u4E0B\u534A\u5F80\u4E0B\u6ED1\u958B\uFF0C\u4E2D\u9593\u9732\u51FA\u4E3B\u8272\u7684\u7B2C\u4E8C\u500B\u8A5E\u5F9E\u7D30\u7DDA\u5C55\u958B\uFF1B\u505C\u7559\u5F8C\u5169\u534A\u5408\u56DE\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "The first word is sliced along its horizontal midline; the top half slides up and the bottom half slides down, revealing the second word in the accent color unfolding from a thin line between them; hold, then the halves close again, looping.",
    css: `
.S .a,.S .b{position:absolute;font-size:17cqw}
.S .top{clip-path:inset(0 0 50% 0);animation:K_t 3.6s cubic-bezier(.7,0,.2,1) infinite}
.S .bot{clip-path:inset(50% 0 0 0);animation:K_d 3.6s cubic-bezier(.7,0,.2,1) infinite}
.S .b{color:var(--ac);animation:K_b 3.6s cubic-bezier(.7,0,.2,1) infinite}
@keyframes K_t{0%,20%,90%,100%{transform:none}35%,75%{transform:translateY(-82%)}}
@keyframes K_d{0%,20%,90%,100%{transform:none}35%,75%{transform:translateY(82%)}}
@keyframes K_b{0%,22%,88%,100%{transform:scaleY(0)}36%,74%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u5206\u88C2", "\u91CD\u751F"]);
      return `<div class="b">${esc(b)}</div><div class="a top">${esc(a)}</div><div class="a bot">${esc(a)}</div>`;
    }, "html")
  },
  {
    id: "scramble",
    cat: "switch",
    zh: "\u4E82\u78BC\u89E3\u78BC",
    en: "Text Scramble",
    desc: "\u4E82\u78BC\u8DF3\u52D5\u5F8C\u89E3\u78BC\u6210\u6B63\u78BA\u6587\u5B57",
    tags: ["\u79D1\u6280", "\u99ED\u5BA2"],
    tone: "ink",
    sample: ["\u8CC7\u6599\u89E3\u5BC6\u4E2D", "\u771F\u76F8\u5927\u767D"],
    hint: "\u591A\u500B\u8A5E\u8F2A\u6D41",
    motion: "\u6587\u5B57\u5148\u4EE5\u96A8\u6A5F\u7B26\u865F\uFF08\u82F1\u6578\u8207\u5E7E\u4F55\u7B26\u865F\uFF09\u9AD8\u901F\u8DF3\u52D5\uFF0C\u7531\u5DE6\u5230\u53F3\u9010\u5B57\u300C\u89E3\u78BC\u300D\u5B9A\u683C\u6210\u6B63\u78BA\u7684\u5B57\uFF0C\u672A\u89E3\u78BC\u7684\u5B57\u7528\u4E3B\u8272\u3001\u5DF2\u89E3\u78BC\u7528\u767D\u8272\uFF1B\u505C\u7559\u5F8C\u4E82\u78BC\u5316\u63DB\u4E0B\u4E00\u500B\u8A5E\u3002",
    motionEn: "Characters flicker rapidly through random glyphs (alphanumerics and geometric symbols), then decode left to right into the correct text; undecoded glyphs in the accent color, decoded ones in white; hold, then scramble into the next word.",
    css: `
.S .t{font-size:9cqw;font-family:var(--mono),var(--sans);letter-spacing:.05em;white-space:pre}
.S .t i{font-style:normal;color:var(--ac);opacity:.85}`,
    html: /* @__PURE__ */ __name(() => `<div class="t"></div>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const el = root.querySelector(".t");
      const sym = "!<>-_\\/[]{}\u2014=+*^?#\u2591\u2592\u2593\u2588\u25C6\u25C7\u25CB\u25CF\u25A1\u25A0\u25B3\u25BD01ABCDEFXYZ";
      let alive = true;
      let k = 0;
      let raf = 0;
      let t = 0;
      const go = /* @__PURE__ */ __name(() => {
        if (!alive) return;
        const target = Array.from(w[k++ % w.length]);
        const start = performance.now();
        const frame = /* @__PURE__ */ __name((now) => {
          if (!alive) return;
          const p = (now - start) / 1400;
          let html = "";
          target.forEach((ch, i) => {
            const at = 0.25 + i / target.length * 0.6;
            html += p >= at ? ch : `<i>${sym[Math.floor(Math.random() * sym.length)]}</i>`;
          });
          el.innerHTML = html;
          if (p < 1) raf = requestAnimationFrame(frame);
          else t = window.setTimeout(go, 1600);
        }, "frame");
        raf = requestAnimationFrame(frame);
      }, "go");
      go();
      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }, "run")
  },
  {
    id: "blinds",
    cat: "switch",
    zh: "\u767E\u8449\u7A97",
    en: "Venetian Blinds",
    desc: "\u5B57\u88AB\u5207\u6210\u689D\u72C0\uFF0C\u4E00\u689D\u689D\u7FFB\u6210\u65B0\u8A5E",
    tags: ["\u8F49\u5834", "\u8A2D\u8A08\u611F"],
    tone: "paper",
    sample: ["\u904E\u53BB", "\u73FE\u5728"],
    hint: "2 \u500B\u8A5E",
    motion: "\u6587\u5B57\u88AB\u5207\u6210 8 \u689D\u6C34\u5E73\u7D30\u689D\uFF0C\u6BCF\u4E00\u689D\u50CF\u767E\u8449\u7A97\u8449\u7247\u4E00\u6A23\u4F9D\u5E8F\u7E5E X \u8EF8\u7FFB\u8F49\uFF0C\u7FFB\u904E\u53BB\u5F8C\u9732\u51FA\u7B2C\u4E8C\u500B\u8A5E\u7684\u5C0D\u61C9\u7247\u6BB5\uFF0C\u7531\u4E0A\u800C\u4E0B\u9593\u9694 0.06 \u79D2\uFF1B\u505C\u7559\u5F8C\u518D\u7FFB\u56DE\u4F86\u3002",
    motionEn: "The text is cut into 8 horizontal strips; each strip flips around the X axis like a venetian blind slat in sequence, top to bottom 0.06s apart, revealing the matching slice of the second word; hold, then flip back.",
    css: `
.S .box{position:relative;width:90cqw;height:20cqw;perspective:100cqw}
.S .sl{position:absolute;left:0;right:0;top:calc(var(--i)*2.5cqw);height:2.5cqw;transform-style:preserve-3d;animation:K_b 4s cubic-bezier(.6,0,.3,1) infinite;animation-delay:calc(var(--i)*.06s)}
.S .sl b{position:absolute;inset:0;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.S .sl b span{position:absolute;left:0;right:0;top:calc(var(--i)*-2.5cqw);height:20cqw;display:grid;place-items:center;font-size:16cqw;line-height:1}
.S .sl b+b{transform:rotateX(180deg)}
.S .sl b+b span{color:var(--ac)}
@keyframes K_b{0%,25%{transform:rotateX(0)}45%,75%{transform:rotateX(180deg)}95%,100%{transform:rotateX(360deg)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u904E\u53BB", "\u73FE\u5728"]);
      return `<div class="box">${rep(8, (i) => `<div class="sl" style="--i:${i}"><b><span style="--i:${i}">${esc(a)}</span></b><b><span style="--i:${i}">${esc(b)}</span></b></div>`)}</div>`;
    }, "html")
  }
];

// ../src/effects/style.ts
var style = [
  {
    id: "outline-fill",
    cat: "style",
    zh: "\u7A7A\u5FC3\u5B57",
    en: "Outline Text",
    desc: "\u7A7A\u5FC3\u5B57\u4E00\u884C\u4E00\u884C\u586B\u4E0A\u984F\u8272",
    tags: ["\u8CEA\u611F", "MV"],
    tone: "ink",
    sample: ["\u75BE\u98A8\u6012\u6FE4"],
    hint: "2\u20136 \u5B57",
    motion: "\u756B\u9762\u6392\u6EFF 5 \u884C\u53EA\u6709\u767D\u8272\u63CF\u908A\u7684\u7A7A\u5FC3\u5B57\uFF08\u4EA4\u932F\u7E2E\u6392\uFF09\uFF0C\u6BCF\u6B21\u6709\u4E00\u884C\u4F9D\u5E8F\u88AB\u5BE6\u5FC3\u586B\u6EFF\u518D\u9000\u56DE\u7A7A\u5FC3\uFF0C\u7531\u4E0A\u800C\u4E0B\u9010\u884C\u9032\u884C\uFF0C\u5F62\u6210\u6383\u63CF\u822C\u7684\u7BC0\u594F\u3002",
    motionEn: "Five rows of white outline-only text fill the frame with staggered indents; one row at a time fills solid and then returns to outline, moving top to bottom like a scanning rhythm.",
    css: `
.S{align-content:center;place-items:start center;gap:.5cqw}
.S .l{font-size:10cqw;white-space:nowrap;color:transparent;-webkit-text-stroke:.22cqw var(--fg);animation:K_f 3s steps(1) infinite;animation-delay:calc(var(--i)*.6s)}
.S .l:nth-child(2n){transform:translateX(-12cqw)}
@keyframes K_f{0%{color:var(--fg)}20%,100%{color:transparent}}`,
    html: /* @__PURE__ */ __name((w) => rep(5, (i) => `<div class="l" style="--i:${i}">${esc(w[0])}\u3000${esc(w[0])}\u3000${esc(w[0])}</div>`), "html")
  },
  {
    id: "glitch-slices",
    cat: "style",
    zh: "\u6545\u969C\u5207\u7247",
    en: "Glitch Slices",
    desc: "\u5927\u5B57\u88AB\u5207\u6210\u597D\u5E7E\u689D\u932F\u958B",
    tags: ["\u885D\u64CA", "MV"],
    tone: "accent",
    sample: ["\u6545\u969C"],
    hint: "2\u20134 \u5B57",
    motion: "\u7C97\u9AD4\u5927\u5B57\u88AB\u6C34\u5E73\u5207\u6210 6 \u689D\uFF0C\u6BCF\u689D\u5728\u96A8\u6A5F\u6642\u9593\u9EDE\u5DE6\u53F3\u932F\u4F4D 3\u20138%\uFF0C\u4E26\u4F34\u96A8\u7D05\u85CD\u8272\u7248\u5206\u96E2\uFF08RGB split\uFF09\u6B98\u5F71\uFF0C\u6301\u7E8C 0.2 \u79D2\u7684\u5287\u70C8\u6545\u969C\u5F8C\u56DE\u6B63\u3001\u505C 1 \u79D2\u518D\u767C\u4F5C\u3002",
    motionEn: "Big bold text is sliced horizontally into 6 strips; strips jump sideways 3\u20138% at random moments with a red/cyan RGB-split ghost; after 0.2s of violent glitching it snaps back, rests 1s, and glitches again.",
    css: `
.S .box{position:relative;font-size:20cqw;color:#fff}
.S .base{visibility:hidden}
.S .sl{position:absolute;inset:0;clip-path:inset(calc(var(--i)*16.66%) 0 calc(100% - (var(--i) + 1)*16.66%) 0);animation:K_g 1.6s steps(1) infinite;animation-delay:calc(var(--i)*-.13s)}
.S .sl::before,.S .sl::after{content:attr(data-t);position:absolute;inset:0;mix-blend-mode:multiply;opacity:0;animation:K_c 1.6s steps(1) infinite}
.S .sl::before{color:#ff2a55;transform:translateX(-2%)}.S .sl::after{color:#00d0ff;transform:translateX(2%)}
@keyframes K_g{0%,12%,100%{transform:none}2%{transform:translateX(calc(var(--d)*1%))}5%{transform:translateX(calc(var(--d)*-.6%))}8%{transform:translateX(calc(var(--d)*.4%))}}
@keyframes K_c{0%,12%,100%{opacity:0}2%,8%{opacity:.9}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="box"><div class="base">${esc(w[0])}</div>${rep(6, (i) => `<div class="sl" data-t="${esc(w[0])}" style="--i:${i};--d:${[6, -8, 3, -5, 7, -3][i]}">${esc(w[0])}</div>`)}</div>`, "html")
  },
  {
    id: "pattern-mask",
    cat: "style",
    zh: "\u5716\u6848\u906E\u7F69",
    en: "Text Mask Pattern",
    desc: "\u6587\u5B57\u8B8A\u6210\u7A97\uFF0C\u689D\u7D0B\u5F9E\u88E1\u9762\u6D41\u904E",
    tags: ["\u4FCF\u76AE", "\u796D\u5178"],
    tone: "paper",
    sample: ["\u796D\u5178"],
    hint: "2\u20133 \u5B57\uFF0C\u8D8A\u7C97\u8D8A\u597D",
    motion: "\u8D85\u7C97\u9AD4\u6587\u5B57\u7576\u4F5C\u906E\u7F69\uFF08background-clip: text\uFF09\uFF0C\u6587\u5B57\u5167\u90E8\u586B\u6EFF 45 \u5EA6\u7684\u4E3B\u8272\u8207\u9ED1\u8272\u659C\u689D\u7D0B\u4E26\u6301\u7E8C\u6D41\u52D5\uFF1B\u6587\u5B57\u5F8C\u65B9\u6709\u4E00\u5C64\u504F\u79FB\u7684\u9ED1\u8272\u786C\u9670\u5F71\u589E\u52A0\u4EFD\u91CF\u3002",
    motionEn: "Ultra-bold text acts as a mask (background-clip: text) filled with flowing 45-degree stripes in the accent color and black; an offset hard black shadow sits behind the letters for weight.",
    css: `
.S .w{position:relative;font-size:22cqw}
.S .w::before{content:attr(data-t);position:absolute;inset:0;color:#111;transform:translate(1.2cqw,1.2cqw);z-index:-1}
.S .w span{background:repeating-linear-gradient(45deg,var(--ac) 0 1.6cqw,#111 1.6cqw 3.2cqw);background-size:4.525cqw 4.525cqw;-webkit-background-clip:text;background-clip:text;color:transparent;animation:K_m 1s linear infinite}
.S .w{isolation:isolate}
@keyframes K_m{to{background-position:4.525cqw 0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w" data-t="${esc(w[0])}"><span>${esc(w[0])}</span></div>`, "html")
  },
  {
    id: "long-shadow",
    cat: "style",
    zh: "\u9577\u9670\u5F71",
    en: "Long Shadow",
    desc: "\u9577\u9577\u7684\u5F71\u5B50\u8F49\u4E00\u5708",
    tags: ["\u6241\u5E73\u98A8"],
    tone: "ink",
    sample: ["\u5149\u8207\u5F71"],
    hint: "2\u20134 \u5B57",
    motion: "\u767D\u8272\u7C97\u9AD4\u5B57\u5F8C\u65B9\u62D6\u8457\u4E00\u689D\u4E3B\u8272\u3001\u9577\u5EA6\u7D04\u5B57\u9AD8 60% \u7684\u6241\u5E73\u9577\u9670\u5F71\uFF0840 \u5C64 text-shadow \u758A\u51FA\uFF09\uFF0C\u9670\u5F71\u65B9\u5411\u50CF\u65E5\u6677\u4E00\u6A23\u7E5E\u8457\u6587\u5B57\u7DE9\u6162\u8F49\u4E00\u5708\u3002",
    motionEn: "Bold white text casts a flat long shadow in the accent color, about 60% of the glyph height (40 stacked text-shadows); the shadow direction sweeps slowly around the text like a sundial.",
    css: "",
    html: /* @__PURE__ */ __name((w) => `<div class="w">${esc(w[0])}</div>`, "html")
  },
  {
    id: "liquid-fill",
    cat: "style",
    zh: "\u6DB2\u9AD4\u586B\u6EFF",
    en: "Liquid Fill",
    desc: "\u7A7A\u5FC3\u5B57\u88AB\u6DB2\u9AD4\u6162\u6162\u88DD\u6EFF",
    tags: ["\u6E05\u723D", "MV"],
    tone: "ink",
    sample: ["\u6EFF"],
    hint: "1\u20133 \u5B57",
    motion: "\u4E3B\u8272\u63CF\u908A\u7684\u7A7A\u5FC3\u5B57\uFF0C\u5167\u90E8\u6709\u5E36\u6CE2\u6D6A\u9802\u908A\u7684\u4E3B\u8272\u6DB2\u9AD4\u7531\u4E0B\u800C\u4E0A\u6162\u6162\u704C\u6EFF\uFF0C\u6DB2\u9762\u6CE2\u6D6A\u6301\u7E8C\u5DE6\u53F3\u6D41\u52D5\uFF1B\u88DD\u6EFF\u5F8C\u505C\u7559\uFF0C\u518D\u77AC\u9593\u6392\u7A7A\u91CD\u4F86\u3002",
    motionEn: "Outline text in the accent color slowly fills from bottom to top with liquid whose surface has a moving wave; once full it holds, then drains instantly and repeats.",
    css: `
.S .w{position:relative;font-size:26cqw}
.S .o{color:transparent;-webkit-text-stroke:.3cqw var(--ac)}
.S .f{position:absolute;inset:0;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400' preserveAspectRatio='none'%3E%3Cpath d='M0 20 Q25 0 50 20 T100 20 T150 20 T200 20 V400 H0Z'/%3E%3C/svg%3E") 0 0/50% 100% repeat-x;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400' preserveAspectRatio='none'%3E%3Cpath d='M0 20 Q25 0 50 20 T100 20 T150 20 T200 20 V400 H0Z'/%3E%3C/svg%3E") 0 0/50% 100% repeat-x;animation:K_w 1.2s linear infinite,K_l 5s ease-in-out infinite}
.S .f div{color:var(--ac);animation:K_li 5s ease-in-out infinite}
@keyframes K_w{to{-webkit-mask-position:100% 0;mask-position:100% 0}}
@keyframes K_l{0%{transform:translateY(100%)}80%,95%{transform:translateY(-6%)}100%{transform:translateY(100%)}}
@keyframes K_li{0%{transform:translateY(-100%)}80%,95%{transform:translateY(6%)}100%{transform:translateY(-100%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w"><div class="o">${esc(w[0])}</div><div class="f"><div>${esc(w[0])}</div></div></div>`, "html")
  },
  {
    id: "highlighter",
    cat: "style",
    zh: "\u87A2\u5149\u7B46",
    en: "Highlight Text",
    desc: "\u87A2\u5149\u7B46\u5F9E\u5B57\u5F8C\u9762\u5283\u904E",
    tags: ["\u5F37\u8ABF", "\u89E3\u8AAA"],
    tone: "accent",
    sample: ["\u4E00\u53E5\u8A71\u7684\u529B\u91CF"],
    hint: "\u4E00\u53E5\u77ED\u53E5",
    motion: "\u767D\u8272\u5361\u7247\u4E0A\u7684\u9ED1\u5B57\uFF0C\u4E00\u9053\u7565\u70BA\u50BE\u659C\u3001\u908A\u7DE3\u4E0D\u898F\u5247\u7684\u534A\u900F\u660E\u4E3B\u8272\u87A2\u5149\u7B46\u7B46\u5283\u5F9E\u5DE6\u5230\u53F3\u5283\u904E\u6587\u5B57\u4E0B\u534A\u90E8\uFF08\u7D04 0.6 \u79D2\uFF0C\u7DE9\u51FA\uFF09\uFF0C\u505C\u7559\u5F8C\u7B46\u5283\u5F9E\u53F3\u5074\u6536\u56DE\u3002",
    motionEn: "Black text on a white card; a slightly tilted, rough-edged, semi-transparent highlighter stroke in the accent color swipes left to right across the lower half of the text (about 0.6s, ease-out); after a hold it retracts to the right.",
    css: `
.S .card{background:#fff;padding:3cqw 5cqw;border-radius:1cqw;box-shadow:0 1cqw 3cqw #0002}
.S .t{position:relative;font-size:7.4cqw;color:#111;font-family:var(--serif)}
.S .t::before{content:'';position:absolute;left:-2%;right:-2%;bottom:2%;height:55%;background:var(--hl,#ffe14d);border-radius:.4cqw 1.2cqw .6cqw 1.4cqw;transform-origin:0 50%;transform:scaleX(0) skewX(-12deg) rotate(-1deg);animation:K_h 3.2s cubic-bezier(.3,.8,.3,1) infinite;z-index:0;opacity:.85}
.S .t span{position:relative;z-index:1}
@keyframes K_h{0%,10%{transform:scaleX(0) skewX(-12deg) rotate(-1deg);transform-origin:0 50%}30%,80%{transform:scaleX(1) skewX(-12deg) rotate(-1deg);transform-origin:0 50%}80.1%{transform-origin:100% 50%}95%,100%{transform:scaleX(0) skewX(-12deg) rotate(-1deg);transform-origin:100% 50%}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="card"><div class="t"><span>${esc(w[0])}</span></div></div>`, "html")
  },
  {
    id: "split-invert",
    cat: "style",
    zh: "\u96D9\u8272\u53CD\u8F49",
    en: "Split Invert",
    desc: "\u659C\u7DDA\u5206\u754C\uFF0C\u5169\u8272\u4E92\u63DB",
    tags: ["\u5207\u63DB", "\u6A19\u984C"],
    tone: "ink",
    sample: ["\u53CD\u8F49"],
    hint: "2\u20134 \u5B57",
    motion: "\u756B\u9762\u88AB\u4E00\u689D\u659C\u7DDA\u5206\u6210\u9ED1\u767D\u5169\u534A\uFF0C\u6587\u5B57\u5728\u9ED1\u5340\u662F\u767D\u8272\u3001\u5728\u767D\u5340\u662F\u9ED1\u8272\uFF08\u5B8C\u5168\u53CD\u76F8\uFF09\uFF1B\u5206\u754C\u659C\u7DDA\u5F9E\u5DE6\u5F80\u53F3\u6383\u904E\u6574\u500B\u756B\u9762\uFF0C\u8B93\u6587\u5B57\u984F\u8272\u8DDF\u8457\u7FFB\u8F49\uFF0C\u518D\u6383\u56DE\u4F86\u3002",
    motionEn: "A diagonal line splits the frame into black and white halves; the text is white over black and black over white (perfect inversion); the diagonal sweeps across the frame flipping the text color as it passes, then sweeps back.",
    css: `
.S .lay{position:absolute;inset:0;display:grid;place-items:center;font-size:20cqw}
.S .b{background:#f4f1e8;color:#111;clip-path:polygon(var(--sip) 0,100% 0,100% 100%,calc(var(--sip) - 30%) 100%);animation:K_s 4s cubic-bezier(.7,0,.3,1) infinite alternate}
@property --sip{syntax:'<percentage>';inherits:false;initial-value:20%}
@keyframes K_s{0%,15%{--sip:15%}85%,100%{--sip:115%}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="lay">${esc(w[0])}</div><div class="lay b">${esc(w[0])}</div>`, "html")
  },
  {
    id: "text-echo",
    cat: "style",
    zh: "\u6B98\u5F71",
    en: "Text Echo",
    desc: "\u5B57\u5F8C\u9762\u62D6\u8457\u4E00\u4E32\u6B98\u5F71",
    tags: ["\u6F02\u6D6E", "MV"],
    tone: "ink",
    sample: ["\u6B98\u5F71"],
    hint: "2\u20134 \u5B57",
    motion: "\u4E3B\u5B57\u5DE6\u53F3\u4F86\u56DE\u6F02\u79FB\uFF0C\u5F8C\u65B9\u8DDF\u8457 8 \u5C64\u4E3B\u8272\u6B98\u5F71\uFF0C\u8D8A\u5F8C\u9762\u7684\u6B98\u5F71\u8D8A\u6DE1\u3001\u8D8A\u6A21\u7CCA\u3001\u5EF6\u9072\u8D8A\u4E45\uFF0C\u50CF\u9577\u6642\u9593\u66DD\u5149\u7684\u62D6\u5C3E\uFF1B\u4E3B\u5B57\u4FDD\u6301\u767D\u8272\u6E05\u6670\u3002",
    motionEn: "The main word drifts side to side trailed by 8 accent-colored echoes, each further one fainter, blurrier and more delayed, like a long-exposure trail; the main word stays crisp white.",
    css: `
.S .e{position:absolute;font-size:14cqw;color:var(--ac);opacity:calc(.8 - var(--k)*.09);filter:blur(calc(var(--k)*.12cqw));animation:K_d 3s ease-in-out infinite;animation-delay:calc(var(--k)*-.06s)}
.S .e.m{color:#fff;opacity:1;filter:none;z-index:9}
@keyframes K_d{0%,100%{transform:translateX(-18cqw)}50%{transform:translateX(18cqw)}}`,
    html: /* @__PURE__ */ __name((w) => rep(9, (k) => `<div class="e${k === 0 ? " m" : ""}" style="--k:${k}">${esc(w[0])}</div>`), "html")
  },
  {
    id: "offset-stroke",
    cat: "style",
    zh: "\u932F\u4F4D\u63CF\u908A",
    en: "Offset Outline",
    desc: "\u5BE6\u5FC3\u5B57\u548C\u63CF\u908A\u5B57\u932F\u958B\u53C8\u5C0D\u9F4A",
    tags: ["\u6F6E\u6D41", "\u6A19\u984C"],
    tone: "paper",
    sample: ["\u8857\u982D"],
    hint: "2\u20134 \u5B57",
    motion: "\u4E00\u5C64\u4E3B\u8272\u5BE6\u5FC3\u5B57\u3001\u4E00\u5C64\u9ED1\u8272\u63CF\u908A\u7A7A\u5FC3\u5B57\u758A\u5728\u4E00\u8D77\uFF0C\u5169\u5C64\u4EE5\u76F8\u53CD\u65B9\u5411\u756B\u5C0F\u5713\u79FB\u52D5\uFF0C\u6642\u800C\u932F\u958B 2% \u6642\u800C\u5B8C\u5168\u91CD\u5408\uFF0C\u50CF\u5370\u5237\u5957\u8272\u4E0D\u6E96\u7684\u6F6E\u6D41\u6D77\u5831\u3002",
    motionEn: "A solid accent-colored layer and a black outline-only layer are stacked; they move in small circles in opposite directions, drifting 2% apart and then aligning perfectly, like a misregistered streetwear print.",
    css: `
.S .w{position:absolute;font-size:22cqw}
.S .s{color:var(--ac);animation:K_a 2.4s linear infinite}
.S .o{color:transparent;-webkit-text-stroke:.3cqw #111;animation:K_a 2.4s linear infinite reverse}
@keyframes K_a{0%{transform:translate(1.2cqw,0)}25%{transform:translate(0,1.2cqw)}50%{transform:translate(-1.2cqw,0)}75%{transform:translate(0,-1.2cqw)}100%{transform:translate(1.2cqw,0)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w s">${esc(w[0])}</div><div class="w o">${esc(w[0])}</div>`, "html")
  },
  {
    id: "paper-cut",
    cat: "style",
    zh: "\u526A\u7D19\u758A\u5C64",
    en: "Paper Cut Layers",
    desc: "\u591A\u5C64\u8272\u7D19\u758A\u51FA\u7ACB\u9AD4\u526A\u7D19\u611F",
    tags: ["\u6EAB\u6696", "\u624B\u4F5C"],
    tone: "paper",
    sample: ["\u624B\u4F5C"],
    hint: "2\u20133 \u5B57",
    motion: "5 \u5C64\u4E0D\u540C\u6DF1\u6DFA\u7684\u4E3B\u8272\u6587\u5B57\u758A\u6210\u526A\u7D19\u7ACB\u9AD4\u611F\uFF0C\u6BCF\u5C64\u90FD\u6709\u67D4\u548C\u6295\u5F71\uFF0C\u5C64\u5C64\u4F9D\u5E8F\u5F9E\u4E0B\u5F80\u4E0A\u300C\u556A\u300D\u5730\u5347\u8D77\uFF08\u50CF\u7D19\u7247\u7ACB\u8D77\u4F86\uFF09\uFF0C\u6700\u4E0A\u5C64\u70BA\u767D\u8272\uFF1B\u505C\u7559\u5F8C\u5C64\u5C64\u5012\u4E0B\u3002",
    motionEn: "Five layers of the text in graded shades of the accent color stack into a papercraft effect, each with a soft drop shadow; layers pop up one after another like paper standing up, topped by white; after a hold they fold back down.",
    css: `
.S .w{position:absolute;font-size:22cqw;color:color-mix(in srgb,var(--ac) calc(100% - var(--k)*16%),#fff);filter:drop-shadow(0 .4cqw .5cqw #0003);transform:translate(calc(var(--k)*-.6cqw),calc(var(--k)*-.6cqw));animation:K_up 3.6s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(var(--k)*.12s);transform-origin:50% 100%}
.S .w:last-child{color:#fff}
@keyframes K_up{0%{transform:translate(0,0) scaleY(0);opacity:0}12%,80%{transform:translate(calc(var(--k)*-.6cqw),calc(var(--k)*-.6cqw));opacity:1}95%,100%{transform:translate(0,0) scaleY(0);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => rep(5, (k) => `<div class="w" style="--k:${k}">${esc(w[0])}</div>`), "html")
  }
];
var ls = /* @__PURE__ */ __name((deg) => {
  const r = deg * Math.PI / 180;
  return Array.from({ length: 40 }, (_, i) => `${(Math.cos(r) * (i + 1) * 0.015).toFixed(3)}em ${(Math.sin(r) * (i + 1) * 0.015).toFixed(3)}em 0 var(--ac)`).join(",");
}, "ls");
var longShadow = style.find((f) => f.id === "long-shadow");
longShadow.css = `
.S .w{font-size:16cqw;color:#fff;animation:K_s 8s linear infinite;position:relative}
@keyframes K_s{${[45, 90, 135, 180, 225, 270, 315, 360, 405].map((d, i) => `${(i * 12.5).toFixed(1)}%{text-shadow:${ls(d)}}`).join("")}}`;

// ../src/effects/light.ts
var light = [
  {
    id: "neon-flicker",
    cat: "light",
    zh: "\u9713\u8679\u71C8",
    en: "Neon Flicker",
    desc: "\u9713\u8679\u71C8\u7BA1\u901A\u96FB\u9583\u720D\u5F8C\u9EDE\u4EAE",
    tags: ["\u591C\u666F", "\u9152\u5427"],
    tone: "ink",
    sample: ["\u6DF1\u591C\u71DF\u696D"],
    hint: "2\u20136 \u5B57",
    motion: "\u6587\u5B57\u662F\u767C\u5149\u9713\u8679\u71C8\u7BA1\uFF08\u7D30\u63CF\u908A + \u591A\u5C64\u540C\u8272\u5916\u5149\u6688\uFF09\uFF0C\u958B\u5834\u4E0D\u898F\u5247\u9583\u720D 3\u20134 \u6B21\u5F8C\u7A69\u5B9A\u9EDE\u4EAE\uFF0C\u5176\u4E2D\u4E00\u500B\u5B57\u6301\u7E8C\u63A5\u89F8\u4E0D\u826F\u5076\u723E\u7184\u6EC5\uFF1B\u7246\u9762\u6709\u6DE1\u6DE1\u7684\u53CD\u5149\u3002",
    motionEn: "Text rendered as glowing neon tubes (thin stroke plus layered same-color glow); it flickers irregularly 3\u20134 times on power-up before staying lit, while one character keeps shorting out occasionally; a faint glow reflects on the wall.",
    css: `
.S{background:radial-gradient(ellipse at 50% 55%,color-mix(in srgb,var(--ac) 14%,var(--bg)),var(--bg) 60%)}
.S .t{font-size:11cqw;font-weight:400;color:#fff;font-family:var(--sans);letter-spacing:.05em;text-shadow:0 0 .5cqw #fff,0 0 1.5cqw var(--ac),0 0 3cqw var(--ac),0 0 6cqw var(--ac);animation:K_on 4s infinite}
.S .c:nth-child(2){animation:K_bad 3s steps(1) infinite}
@keyframes K_on{0%{opacity:.1}3%{opacity:1}5%{opacity:.2}8%{opacity:1}9%{opacity:.3}12%,100%{opacity:1}}
@keyframes K_bad{0%,40%,44%,48%,100%{opacity:1}42%,46%{opacity:.15}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "glow-pulse",
    cat: "light",
    zh: "\u5149\u6688\u547C\u5438",
    en: "Glow Pulse",
    desc: "\u6587\u5B57\u50CF\u547C\u5438\u4E00\u6A23\u767C\u5149",
    tags: ["\u7642\u7652", "\u6C1B\u570D"],
    tone: "ink",
    sample: ["\u6162\u6162\u4F86"],
    hint: "2\u20135 \u5B57",
    motion: "\u6587\u5B57\u5916\u570D\u7684\u67D4\u548C\u5149\u6688\u4EE5 3 \u79D2\u9031\u671F\u7DE9\u6162\u589E\u5F37\u8207\u6E1B\u5F31\uFF0C\u50CF\u547C\u5438\uFF1B\u540C\u6642\u5B57\u8DDD\u8F15\u5FAE\u64F4\u5F35\u6536\u7E2E\uFF0C\u80CC\u666F\u6709\u4E00\u500B\u540C\u6B65\u8108\u52D5\u7684\u6A21\u7CCA\u5149\u7403\u3002",
    motionEn: "A soft glow around the text swells and fades on a slow 3s cycle like breathing; letter-spacing gently expands and contracts in sync, with a blurred orb of light pulsing behind.",
    css: `
.S .orb{position:absolute;width:50cqw;height:50cqw;border-radius:50%;background:var(--ac);filter:blur(10cqw);opacity:.25;animation:K_o 3s ease-in-out infinite}
.S .t{position:relative;font-size:12cqw;font-weight:700;animation:K_g 3s ease-in-out infinite}
@keyframes K_g{0%,100%{text-shadow:0 0 0 transparent;letter-spacing:0}50%{text-shadow:0 0 2cqw var(--ac),0 0 5cqw var(--ac);letter-spacing:.12em}}
@keyframes K_o{50%{transform:scale(1.3);opacity:.45}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="orb"></div><div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "shine-sweep",
    cat: "light",
    zh: "\u91D1\u5C6C\u6383\u5149",
    en: "Metal Shine",
    desc: "\u91D1\u5C6C\u5B57\u8868\u9762\u6709\u4E00\u9053\u5149\u6383\u904E",
    tags: ["\u8CEA\u611F", "\u9812\u734E"],
    tone: "ink",
    sample: ["\u5E74\u5EA6\u7CBE\u9078"],
    hint: "2\u20136 \u5B57",
    motion: "\u6587\u5B57\u662F\u62C9\u7D72\u91D1\u5C6C\u8CEA\u611F\uFF08\u4E0A\u4EAE\u4E0B\u6697\u7684\u6F38\u5C64\uFF09\uFF0C\u4E00\u9053\u659C 20 \u5EA6\u7684\u767D\u8272\u4EAE\u5149\u7531\u5DE6\u5230\u53F3\u6383\u904E\u5B57\u9762\uFF08\u7D04 0.8 \u79D2\uFF09\uFF0C\u6BCF 2.5 \u79D2\u4E00\u6B21\uFF1B\u6587\u5B57\u4E0B\u65B9\u6709\u7D30\u5C0F\u5012\u5F71\u3002",
    motionEn: "Brushed-metal text (light-to-dark vertical gradient); a white highlight band tilted 20 degrees sweeps across the letters left to right (about 0.8s) every 2.5s; a small reflection sits below.",
    css: `
.S .t{font-size:13cqw;background:linear-gradient(105deg,transparent 40%,#fff 50%,transparent 60%) -200% 0/200% 100% no-repeat,linear-gradient(#fafafa,#a8a8a8 48%,#5a5a5a 52%,#d8d8d8);-webkit-background-clip:text;background-clip:text;color:transparent;animation:K_s 2.5s ease-in-out infinite;-webkit-box-reflect:below -2cqw linear-gradient(transparent 60%,#0004)}
@keyframes K_s{0%{background-position:-200% 0,0 0}35%,100%{background-position:200% 0,0 0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "spotlight",
    cat: "light",
    zh: "\u805A\u5149\u71C8",
    en: "Spotlight",
    desc: "\u9ED1\u6697\u4E2D\u4E00\u675F\u5149\u7167\u51FA\u6587\u5B57",
    tags: ["\u63ED\u66C9", "\u821E\u53F0"],
    tone: "ink",
    sample: ["\u4ECA\u665A\u4E3B\u89D2"],
    hint: "2\u20136 \u5B57",
    motion: "\u5168\u9ED1\u756B\u9762\u4E2D\uFF0C\u4E00\u500B\u5713\u5F62\u805A\u5149\u71C8\u5149\u5708\u5728\u6587\u5B57\u4E0A\u65B9\u5DE6\u53F3\u6E38\u79FB\u641C\u5C0B\uFF0C\u53EA\u7167\u4EAE\u5149\u5708\u5167\u7684\u6587\u5B57\uFF1B\u6700\u5F8C\u5149\u5708\u505C\u5728\u6B63\u4E2D\u4E26\u653E\u5927\uFF0C\u7167\u4EAE\u5168\u90E8\u6587\u5B57\u3002",
    motionEn: "In a pitch-black frame, a circular spotlight wanders left and right searching across the text, illuminating only what is inside the beam; finally it settles in the center and widens to reveal the whole word.",
    css: `
.S .t{font-size:14cqw;color:#fff;-webkit-mask:radial-gradient(circle var(--spr) at var(--spx) 50%,#000 60%,transparent 100%);mask:radial-gradient(circle var(--spr) at var(--spx) 50%,#000 60%,transparent 100%);animation:K_l 5s ease-in-out infinite;padding:0 10cqw}
.S .halo{position:absolute;inset:0;background:radial-gradient(circle var(--spr) at var(--spx) 50%,color-mix(in srgb,var(--ac) 18%,transparent),transparent 100%);animation:K_l 5s ease-in-out infinite}
@property --spx{syntax:'<percentage>';inherits:false;initial-value:20%}
@property --spr{syntax:'<length>';inherits:false;initial-value:0px}
@keyframes K_l{0%{--spx:10%;--spr:12cqw}25%{--spx:80%;--spr:12cqw}45%{--spx:30%;--spr:12cqw}60%,90%{--spx:50%;--spr:60cqw}100%{--spx:10%;--spr:12cqw}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="halo"></div><div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "lightning",
    cat: "light",
    zh: "\u9583\u96FB",
    en: "Lightning Flash",
    desc: "\u96F7\u5149\u4E00\u9583\uFF0C\u7167\u4EAE\u6587\u5B57",
    tags: ["\u9707\u64BC", "\u9810\u544A"],
    tone: "ink",
    sample: ["\u9A5A\u5929"],
    hint: "2\u20134 \u5B57",
    motion: "\u6697\u8272\u756B\u9762\u4E2D\u6587\u5B57\u5E7E\u4E4E\u770B\u4E0D\u898B\uFF0C\u7A81\u7136\u5169\u6B21\u767D\u8272\u9583\u5149\u8B93\u756B\u9762\u66DD\u767D\u3001\u6587\u5B57\u4EE5\u4E3B\u8272\u5F37\u70C8\u767C\u5149\u4E26\u6296\u52D5\uFF0C\u9583\u5149\u5F8C\u6587\u5B57\u7559\u4E0B\u9010\u6F38\u6D88\u9000\u7684\u9918\u5149\uFF0C\u9593\u9694 2 \u79D2\u518D\u9583\u3002",
    motionEn: "The text is nearly invisible in the dark frame until two sudden white flashes blow out the screen; the text glows intensely in the accent color and jolts, leaving an afterglow that slowly fades; repeats every 2s.",
    css: `
.S{animation:K_bg 3s infinite}
.S .t{font-size:18cqw;color:var(--ac);animation:K_t 3s infinite}
@keyframes K_bg{0%,8%,12%,100%{background:var(--bg)}9%,11%{background:#fff}}
@keyframes K_t{0%,7%{opacity:.08;text-shadow:none;transform:none}9%{opacity:1;color:#111;transform:translate(-1%,1%)}11%{color:#111}13%{opacity:1;color:var(--ac);text-shadow:0 0 3cqw var(--ac),0 0 8cqw var(--ac);transform:translate(1%,-.5%)}16%{transform:none}70%,100%{opacity:.08;text-shadow:0 0 0 transparent}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "laser-scan",
    cat: "light",
    zh: "\u96F7\u5C04\u6383\u63CF",
    en: "Laser Scan",
    desc: "\u4E00\u9053\u96F7\u5C04\u5149\u7531\u4E0A\u800C\u4E0B\u6383\u51FA\u6587\u5B57",
    tags: ["\u79D1\u6280", "\u63ED\u9732"],
    tone: "ink",
    sample: ["\u6383\u63CF\u5B8C\u6210"],
    hint: "2\u20136 \u5B57",
    motion: "\u4E00\u689D\u767C\u5149\u7684\u4E3B\u8272\u6C34\u5E73\u96F7\u5C04\u7DDA\u7531\u4E0A\u5F80\u4E0B\u6383\u904E\uFF0C\u6383\u904E\u7684\u5340\u57DF\u51FA\u73FE\u6587\u5B57\uFF08\u4E0A\u65B9\u7DDA\u6846\u63CF\u908A\u3001\u4E0B\u65B9\u5BE6\u5FC3\uFF09\uFF0C\u96F7\u5C04\u7DDA\u7D93\u904E\u8655\u6709\u5149\u6688\u8207\u7D30\u5C0F\u706B\u82B1\uFF1B\u6383\u5B8C\u505C\u7559\u5F8C\u7531\u4E0B\u5F80\u4E0A\u62B9\u9664\u3002",
    motionEn: "A glowing horizontal laser line in the accent color scans from top to bottom; the text appears wherever it has passed (wireframe outline first, then solid), with glow and tiny sparks at the line; after a hold it wipes back up.",
    css: `
.S .box{position:relative;font-size:13cqw}
.S .t{clip-path:inset(0 0 calc(100% - var(--lsy)) 0);animation:K_y 3.6s cubic-bezier(.5,0,.5,1) infinite}
.S .o{position:absolute;inset:0;color:transparent;-webkit-text-stroke:.15cqw var(--ac);clip-path:inset(0 0 calc(100% - var(--lsy) - 8%) 0);animation:K_y 3.6s cubic-bezier(.5,0,.5,1) infinite;opacity:.8}
.S .ln{position:absolute;left:-8%;right:-8%;height:.4cqw;top:var(--lsy);background:var(--ac);box-shadow:0 0 1cqw var(--ac),0 0 3cqw var(--ac),0 0 6cqw #fff;animation:K_y 3.6s cubic-bezier(.5,0,.5,1) infinite}
@property --lsy{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes K_y{0%{--lsy:-5%}40%,70%{--lsy:105%}100%{--lsy:-5%}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="box"><div class="t">${esc(w[0])}</div><div class="o">${esc(w[0])}</div><div class="ln"></div></div>`, "html")
  },
  {
    id: "lens-flare",
    cat: "light",
    zh: "\u93E1\u982D\u5149\u6591",
    en: "Lens Flare",
    desc: "\u5149\u6591\u6A6B\u8D8A\u756B\u9762\uFF0C\u6587\u5B57\u767C\u4EAE",
    tags: ["\u96FB\u5F71\u611F", "\u7247\u982D"],
    tone: "ink",
    sample: ["ORIGINAL"],
    hint: "\u82F1\u6587\u6216 2\u20136 \u5B57",
    motion: "\u96FB\u5F71\u7247\u982D\u611F\uFF1A\u4E00\u9053\u6C34\u5E73\u62C9\u9577\u7684\u85CD\u767D\u8272\u8B8A\u5F62\u93E1\u982D\u5149\u6591\uFF08anamorphic flare\uFF09\u5F9E\u5DE6\u5230\u53F3\u6A6B\u6383\uFF0C\u7D93\u904E\u6642\u6587\u5B57\u7531\u6697\u8F49\u4EAE\u4E26\u77ED\u66AB\u904E\u66DD\uFF0C\u80CC\u5F8C\u6709\u5E7E\u9846\u534A\u900F\u660E\u5713\u5F62\u5149\u6591\u8DDF\u8457\u79FB\u52D5\u3002",
    motionEn: "Cinematic title: a horizontally stretched blue-white anamorphic lens flare sweeps left to right; as it passes, the text brightens from dark and briefly overexposes, with a few translucent circular bokeh orbs trailing behind.",
    css: `
.S .t{font-size:11cqw;letter-spacing:.2em;color:#fff;animation:K_t 4s ease-in-out infinite;font-weight:300}
.S .fl{position:absolute;top:50%;left:0;width:60cqw;height:.5cqw;margin-top:-.25cqw;background:radial-gradient(closest-side,#fff,#8ad 30%,transparent);filter:blur(.2cqw);box-shadow:0 0 4cqw 1cqw #6af6;animation:K_f 4s ease-in-out infinite;mix-blend-mode:screen}
.S .bk{position:absolute;border-radius:50%;width:var(--s);height:var(--s);background:radial-gradient(circle,transparent 50%,color-mix(in srgb,var(--ac) 40%,transparent));top:var(--y);animation:K_b 4s ease-in-out infinite;mix-blend-mode:screen}
@keyframes K_f{0%{transform:translateX(-70cqw) scaleX(.5);opacity:0}20%{opacity:1}55%{transform:translateX(110cqw) scaleX(1.4);opacity:1}60%,100%{opacity:0;transform:translateX(110cqw)}}
@keyframes K_t{0%,15%{opacity:.15;text-shadow:none}35%{opacity:1;text-shadow:0 0 2cqw #fff,0 0 6cqw #8cf}55%,85%{opacity:1;text-shadow:0 0 1cqw #fff4}100%{opacity:.15}}
@keyframes K_b{0%{transform:translateX(90cqw);opacity:0}25%{opacity:.8}60%{transform:translateX(-30cqw);opacity:0}100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div><div class="fl"></div>${rep(3, (i) => `<i class="bk" style="--s:${[6, 10, 4][i]}cqw;--y:${[30, 55, 64][i]}%"></i>`)}`, "html")
  },
  {
    id: "sunrise",
    cat: "light",
    zh: "\u65E5\u51FA\u6F38\u5C64",
    en: "Sunrise Gradient",
    desc: "\u6587\u5B57\u984F\u8272\u50CF\u65E5\u51FA\u4E00\u6A23\u6162\u6162\u8B8A\u4EAE",
    tags: ["\u65E9\u6668", "\u5E0C\u671B"],
    tone: "ink",
    sample: ["\u65E9\u5B89"],
    hint: "2\u20134 \u5B57",
    motion: "\u80CC\u666F\u7531\u6DF1\u85CD\u6F38\u5C64\u6162\u6162\u8F49\u70BA\u6A58\u7C89\u8272\u5929\u7A7A\uFF0C\u6587\u5B57\u5167\u90E8\u586B\u8272\u540C\u6B65\u7531\u6697\u7D2B\u2192\u6A58\u2192\u91D1\u9EC3\u6D41\u52D5\uFF0C\u5730\u5E73\u7DDA\u4E0B\u65B9\u6709\u4E00\u9846\u592A\u967D\u7DE9\u7DE9\u5347\u8D77\u4E26\u5E36\u5149\u6688\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "The background slowly shifts from a deep-blue gradient to an orange-pink sky while the text fill flows from dark purple to orange to gold in sync; a sun rises from below the horizon with a soft halo, looping.",
    css: `
.S{background:linear-gradient(#0c1030,#2a1f5c 50%,#ff8a5b 80%,#ffd27a);background-size:100% 300%;animation:K_sky 6s ease-in-out infinite}
.S .sun{position:absolute;width:30cqw;height:30cqw;border-radius:50%;background:radial-gradient(#fff6c8,#ffb347 60%,transparent 70%);bottom:-34cqw;animation:K_sun 6s ease-in-out infinite;filter:blur(.3cqw)}
.S .t{position:relative;top:-8%;font-size:18cqw;filter:drop-shadow(0 .5cqw 1.5cqw #2a1f5c88);background:linear-gradient(#fff6e0,#ffd36b,#ff7a59);background-size:100% 300%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:K_sky 6s ease-in-out infinite reverse}
@keyframes K_sky{0%,100%{background-position:0 0}50%{background-position:0 100%}}
@keyframes K_sun{0%,100%{transform:translateY(0)}50%{transform:translateY(-22cqw)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="sun"></div><div class="t">${esc(w[0])}</div>`, "html")
  }
];

// ../src/effects/reveal.ts
var reveal = [
  {
    id: "mask-rise",
    cat: "reveal",
    zh: "\u906E\u7F69\u4E0A\u5347",
    en: "Mask Rise",
    desc: "\u6BCF\u4E00\u884C\u5F9E\u96B1\u5F62\u7684\u7DDA\u5F8C\u65B9\u6ED1\u4E0A\u4F86",
    tags: ["\u6A19\u984C", "\u7C21\u5831"],
    tone: "paper",
    sample: ["\u597D\u7684\u8A2D\u8A08", "\u662F\u770B\u4E0D\u898B\u7684"],
    hint: "1\u20133 \u884C",
    motion: "\u6BCF\u4E00\u884C\u6587\u5B57\u88AB\u88DD\u5728 overflow hidden \u7684\u5BB9\u5668\u88E1\uFF0C\u5F9E\u5BB9\u5668\u4E0B\u65B9\u6ED1\u4E0A\u4F86\u5230\u5B9A\u4F4D\uFF08\u7DE9\u51FA\u66F2\u7DDA 0.8 \u79D2\uFF09\uFF0C\u884C\u8207\u884C\u9593\u9694 0.15 \u79D2\uFF1B\u505C\u7559\u5F8C\u5F80\u4E0A\u6ED1\u51FA\u6D88\u5931\u3002",
    motionEn: "Each line sits in an overflow-hidden container and slides up from below into place (0.8s ease-out), lines staggered by 0.15s; after a hold they slide up and out.",
    css: `
.S .b{display:flex;flex-direction:column;align-items:flex-start}
.S .m{overflow:hidden;padding-bottom:.08em}
.S .l{font-size:9cqw;animation:K_r 3.6s cubic-bezier(.2,.8,.1,1) infinite both;animation-delay:calc(var(--i)*.15s)}
.S .m:last-child .l{color:var(--ac)}
@keyframes K_r{0%{transform:translateY(110%)}22%,78%{transform:none}96%,100%{transform:translateY(-110%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="b">${w.slice(0, 3).map((t, i) => `<div class="m"><div class="l" style="--i:${i}">${esc(t)}</div></div>`).join("")}</div>`, "html")
  },
  {
    id: "blur-focus",
    cat: "reveal",
    zh: "\u6A21\u7CCA\u805A\u7126",
    en: "Blur to Focus",
    desc: "\u5F9E\u6726\u6727\u5931\u7126\u6162\u6162\u5C0D\u7126\u6E05\u695A",
    tags: ["\u56DE\u61B6", "\u96FB\u5F71\u611F"],
    tone: "ink",
    sample: ["\u90A3\u5E74\u590F\u5929"],
    hint: "2\u20136 \u5B57",
    motion: "\u6587\u5B57\u5F9E\u5F37\u70C8\u6A21\u7CCA\uFF08blur 20px\uFF09\u3001\u5B57\u8DDD\u62C9\u5BEC\u3001\u7565\u5FAE\u653E\u5927\u4E14\u534A\u900F\u660E\u7684\u72C0\u614B\uFF0C\u5728 1.5 \u79D2\u5167\u6162\u6162\u5C0D\u7126\u6E05\u695A\u3001\u5B57\u8DDD\u6536\u56DE\uFF1B\u505C\u7559\u5F8C\u518D\u6162\u6162\u5931\u7126\u6DE1\u51FA\u3002",
    motionEn: "Text starts heavily blurred (20px), widely tracked, slightly enlarged and translucent, then slowly racks into sharp focus over 1.5s as the tracking tightens; after a hold it defocuses and fades out.",
    css: `
.S .t{font-size:12cqw;font-weight:500;animation:K_b 4.2s cubic-bezier(.3,0,.2,1) infinite}
@keyframes K_b{0%{filter:blur(2cqw);letter-spacing:.6em;opacity:0;transform:scale(1.15)}38%,75%{filter:blur(0);letter-spacing:.08em;opacity:1;transform:none}100%{filter:blur(1.5cqw);opacity:0;letter-spacing:.2em}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "fade-chars",
    cat: "reveal",
    zh: "\u9010\u5B57\u6D6E\u73FE",
    en: "Staggered Fade",
    desc: "\u4E00\u500B\u5B57\u4E00\u500B\u5B57\u512A\u96C5\u5730\u6D6E\u4E0A\u4F86",
    tags: ["\u512A\u96C5", "\u91D1\u53E5"],
    tone: "paper",
    sample: ["\u6162\u4E00\u9EDE\u4E5F\u6C92\u95DC\u4FC2"],
    hint: "\u4E00\u53E5\u8A71",
    motion: "\u6BCF\u500B\u5B57\u7531\u4E0B\u65B9 30% \u8655\u3001\u5E36\u8F15\u5FAE\u6A21\u7CCA\u8207\u900F\u660E\u5EA6 0\uFF0C\u4F9D\u5E8F\u4E0A\u6D6E\u6DE1\u5165\u5230\u5B9A\u4F4D\uFF0C\u6BCF\u5B57\u9593\u9694 0.06 \u79D2\uFF0C\u4F7F\u7528\u660E\u9AD4\u7D30\u5B57\uFF1B\u505C\u7559\u5F8C\u6574\u53E5\u4E00\u8D77\u6DE1\u51FA\u3002",
    motionEn: "Each character rises from 30% below with a slight blur and zero opacity, fading into place in sequence 0.06s apart, set in a light serif; after a hold the whole line fades out together.",
    css: `
.S .t{font-size:7cqw;font-family:var(--serif);font-weight:500;display:flex}
.S .c{animation:K_f 4s cubic-bezier(.2,.7,.2,1) infinite both;animation-delay:calc(var(--i)*.06s)}
@keyframes K_f{0%{opacity:0;transform:translateY(30%);filter:blur(.5cqw)}20%,80%{opacity:1;transform:none;filter:none}95%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "box-wipe",
    cat: "reveal",
    zh: "\u8272\u584A\u64E6\u9664",
    en: "Box Reveal",
    desc: "\u8272\u584A\u5237\u904E\u53BB\uFF0C\u6587\u5B57\u7559\u5728\u539F\u5730",
    tags: ["\u7C21\u5831", "\u6A19\u984C"],
    tone: "ink",
    sample: ["\u7B2C\u4E00\u7AE0", "\u5F9E\u96F6\u958B\u59CB"],
    hint: "1\u20132 \u884C",
    motion: "\u6BCF\u4E00\u884C\u5148\u6709\u4E00\u584A\u4E3B\u8272\u9577\u65B9\u5F62\u5F9E\u5DE6\u5074\u4F38\u5C55\u8986\u84CB\u6574\u884C\uFF0C\u518D\u5F9E\u53F3\u5074\u6536\u8D70\uFF0C\u8272\u584A\u6536\u8D70\u7684\u540C\u6642\u6587\u5B57\u51FA\u73FE\u5728\u539F\u4F4D\uFF1B\u5169\u884C\u9593\u9694 0.2 \u79D2\uFF0C\u505C\u7559\u5F8C\u53CD\u5411\u64E6\u9664\u3002",
    motionEn: "For each line, an accent-colored block extends from the left to cover the line, then retracts to the right, leaving the text revealed in place; two lines 0.2s apart; after a hold the wipe reverses.",
    css: `
.S .b{display:flex;flex-direction:column;align-items:flex-start;gap:1cqw}
.S .l{position:relative;font-size:8cqw}
.S .l span{animation:K_t 4s steps(1) infinite;animation-delay:calc(var(--i)*.2s)}
.S .l::after{content:'';position:absolute;inset:-.05em -.1em;background:var(--ac);animation:K_w 4s cubic-bezier(.7,0,.2,1) infinite both;animation-delay:calc(var(--i)*.2s)}
.S .l:nth-child(2){font-size:5cqw;font-weight:500}
@keyframes K_w{0%{transform:scaleX(0);transform-origin:0 50%}12%{transform:scaleX(1);transform-origin:0 50%}12.1%{transform-origin:100% 50%}24%{transform:scaleX(0);transform-origin:100% 50%}70%{transform:scaleX(0);transform-origin:100% 50%}80%{transform:scaleX(1);transform-origin:100% 50%}80.1%{transform-origin:0 50%}92%,100%{transform:scaleX(0);transform-origin:0 50%}}
@keyframes K_t{0%{opacity:0}12%{opacity:1}80%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="b">${w.slice(0, 2).map((t, i) => `<div class="l" style="--i:${i}"><span>${esc(t)}</span></div>`).join("")}</div>`, "html")
  },
  {
    id: "ink-spread",
    cat: "reveal",
    zh: "\u58A8\u6C34\u6688\u958B",
    en: "Ink Spread",
    desc: "\u50CF\u58A8\u6EF4\u843D\u5728\u7D19\u4E0A\u6688\u51FA\u6587\u5B57",
    tags: ["\u6771\u65B9", "\u66F8\u6CD5"],
    tone: "paper",
    sample: ["\u58A8"],
    hint: "1\u20133 \u5B57\uFF0C\u66F8\u6CD5\u611F\u6700\u4F73",
    motion: "\u7C73\u767D\u5BA3\u7D19\u80CC\u666F\uFF0C\u4E00\u6EF4\u58A8\u5F9E\u4E2D\u5FC3\u843D\u4E0B\uFF0C\u4EE5\u4E0D\u898F\u5247\u908A\u7DE3\u7684\u5713\u5F62\u5411\u5916\u6688\u958B\uFF0C\u6688\u958B\u7684\u7BC4\u570D\u5167\u986F\u73FE\u9ED1\u8272\u660E\u9AD4\u5927\u5B57\uFF0C\u908A\u7DE3\u5E36\u6A21\u7CCA\u8207\u6C34\u6F2C\u611F\uFF1B\u505C\u7559\u5F8C\u58A8\u8272\u6DE1\u53BB\u3002",
    motionEn: "On off-white rice paper, an ink drop lands at the center and spreads outward in an irregular circle; the bold black serif glyph appears within the spread with soft, watery edges; after a hold the ink fades.",
    css: `
.S{background:radial-gradient(circle at 30% 30%,#0000000a,transparent 50%),var(--bg)}
.S .t{font-size:30cqw;font-family:var(--serif);color:#111;filter:url(#inkf);-webkit-mask:radial-gradient(circle var(--ir) at 50% 50%,#000 70%,transparent);mask:radial-gradient(circle var(--ir) at 50% 50%,#000 70%,transparent);animation:K_i 4.5s cubic-bezier(.2,.6,.3,1) infinite}
@property --ir{syntax:'<length>';inherits:false;initial-value:0px}
@keyframes K_i{0%{--ir:0px;opacity:1}45%,80%{--ir:40cqw;opacity:1}100%{--ir:40cqw;opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<svg width="0" height="0" style="position:absolute"><filter id="inkf"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="12"/></filter></svg><div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "curtain",
    cat: "reveal",
    zh: "\u62C9\u5E55",
    en: "Curtain Open",
    desc: "\u5169\u7247\u5E03\u5E55\u5F9E\u4E2D\u9593\u62C9\u958B",
    tags: ["\u63ED\u66C9", "\u958B\u5E55"],
    tone: "ink",
    sample: ["\u9686\u91CD\u767B\u5834"],
    hint: "2\u20136 \u5B57",
    motion: "\u5DE6\u53F3\u5169\u7247\u4E3B\u8272\u5E03\u5E55\uFF08\u5E36\u5782\u76F4\u8936\u76BA\u9670\u5F71\uFF09\u906E\u4F4F\u756B\u9762\uFF0C\u5F9E\u4E2D\u9593\u5F80\u5169\u5074\u62C9\u958B\uFF0C\u5F8C\u65B9\u6587\u5B57\u5F9E 90% \u653E\u5927\u5230 100% \u51FA\u73FE\uFF1B\u505C\u7559\u5F8C\u5E03\u5E55\u5408\u8D77\u3002",
    motionEn: "Two accent-colored curtains with vertical fold shading cover the frame and draw open from the center to the sides; the text behind scales from 90% to 100% as it is revealed; after a hold the curtains close.",
    css: `
.S .t{font-size:12cqw;animation:K_t 4.4s cubic-bezier(.6,0,.2,1) infinite}
.S .cl,.S .cr{position:absolute;top:0;bottom:0;width:51%;background:repeating-linear-gradient(90deg,color-mix(in srgb,var(--ac) 80%,#000) 0 1cqw,var(--ac) 2.5cqw,color-mix(in srgb,var(--ac) 80%,#000) 4cqw);animation:K_l 4.4s cubic-bezier(.6,0,.2,1) infinite;box-shadow:0 0 3cqw #000a}
.S .cl{left:0}.S .cr{right:0;animation-name:K_r}
@keyframes K_l{0%,10%,92%,100%{transform:none}35%,70%{transform:translateX(-100%)}}
@keyframes K_r{0%,10%,92%,100%{transform:none}35%,70%{transform:translateX(100%)}}
@keyframes K_t{0%,15%{transform:scale(.9)}40%,100%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div><div class="cl"></div><div class="cr"></div>`, "html")
  },
  {
    id: "handwrite",
    cat: "reveal",
    zh: "\u624B\u5BEB\u63CF\u908A",
    en: "Stroke Draw",
    desc: "\u7B46\u756B\u88AB\u4E00\u7B46\u4E00\u7B46\u63CF\u51FA\u4F86\u518D\u586B\u8272",
    tags: ["\u624B\u4F5C", "\u7C3D\u540D"],
    tone: "paper",
    sample: ["\u8B1D\u8B1D\u4F60"],
    hint: "2\u20135 \u5B57",
    motion: "\u6587\u5B57\u4EE5 SVG \u5448\u73FE\uFF0C\u5148\u7528\u4E3B\u8272\u7D30\u7DDA\u6CBF\u8457\u8F2A\u5ED3\u63CF\u908A\u756B\u51FA\uFF08stroke-dashoffset \u52D5\u756B\u7D04 2 \u79D2\uFF09\uFF0C\u63CF\u5B8C\u5F8C\u5167\u90E8\u4EE5\u9ED1\u8272\u6DE1\u5165\u586B\u6EFF\u3001\u63CF\u908A\u6DE1\u51FA\uFF1B\u505C\u7559\u5F8C\u91CD\u4F86\u3002",
    motionEn: "Text rendered as SVG: a thin accent-colored stroke traces the outlines (stroke-dashoffset animation, about 2s); once drawn, the fill fades in black while the stroke fades away; hold, then repeat.",
    css: `
.S svg{width:92%;height:60%;overflow:visible}
.S text{font-size:120px;font-weight:900;fill:#111;fill-opacity:0;stroke:var(--ac);stroke-width:2.5;stroke-dasharray:900;stroke-dashoffset:900;animation:K_d 4.5s ease-in-out infinite}
@keyframes K_d{0%{stroke-dashoffset:900;fill-opacity:0;stroke-opacity:1}50%{stroke-dashoffset:0;fill-opacity:0}65%,88%{fill-opacity:1;stroke-opacity:0;stroke-dashoffset:0}100%{fill-opacity:0;stroke-opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<svg viewBox="0 0 ${Math.max(2, Array.from(w[0]).length) * 125 + 20} 160"><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle">${esc(w[0])}</text></svg>`, "html")
  },
  {
    id: "iris",
    cat: "reveal",
    zh: "\u5713\u5F62\u958B\u5834",
    en: "Iris Reveal",
    desc: "\u4E00\u500B\u5713\u5F9E\u4E2D\u5FC3\u6253\u958B\uFF0C\u9732\u51FA\u6587\u5B57",
    tags: ["\u5FA9\u53E4", "\u8F49\u5834"],
    tone: "accent",
    sample: ["ACTION"],
    hint: "\u82F1\u6587\u6216 2\u20136 \u5B57",
    motion: "\u8001\u96FB\u5F71\u7684\u5149\u5708\u8F49\u5834\uFF1A\u9ED1\u8272\u756B\u9762\u4E2D\u4E00\u500B\u5713\u5F62\u5F9E\u4E2D\u5FC3\u64F4\u5927\u6253\u958B\uFF0C\u9732\u51FA\u4E3B\u8272\u80CC\u666F\u8207\u6587\u5B57\uFF0C\u6587\u5B57\u540C\u6642\u5F9E 120% \u7E2E\u5230 100%\uFF1B\u505C\u7559\u5F8C\u5713\u5F62\u7E2E\u56DE\u4E2D\u5FC3\u95DC\u9589\u3002",
    motionEn: "An old-film iris transition: from black, a circle opens from the center to reveal the accent background and the text, which shrinks from 120% to 100%; after a hold the iris closes back to a point.",
    css: `
.S{background:#000}
.S .in{position:absolute;inset:0;display:grid;place-items:center;background:var(--bg);clip-path:circle(var(--irr) at 50% 50%);animation:K_c 4s cubic-bezier(.7,0,.3,1) infinite}
.S .t{font-size:14cqw;color:#111;letter-spacing:.1em;animation:K_t 4s cubic-bezier(.3,0,.2,1) infinite}
@property --irr{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes K_c{0%,5%{--irr:0%}35%,75%{--irr:75%}95%,100%{--irr:0%}}
@keyframes K_t{0%,10%{transform:scale(1.2)}40%,100%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="in"><div class="t">${esc(w[0])}</div></div>`, "html")
  },
  {
    id: "line-unfold",
    cat: "reveal",
    zh: "\u7DDA\u689D\u5C55\u958B",
    en: "Line Unfold",
    desc: "\u4E00\u689D\u7DDA\u5EF6\u4F38\u958B\u4F86\uFF0C\u6587\u5B57\u5F9E\u7DDA\u4E0A\u5C55\u958B",
    tags: ["\u6975\u7C21", "\u7C21\u5831"],
    tone: "ink",
    sample: ["\u5C11\u5373\u662F\u591A"],
    hint: "2\u20136 \u5B57",
    motion: "\u756B\u9762\u4E2D\u592E\u5148\u756B\u51FA\u4E00\u689D\u5F9E\u4E2D\u5FC3\u5411\u5169\u5074\u5EF6\u4F38\u7684\u4E3B\u8272\u7D30\u7DDA\uFF0C\u63A5\u8457\u6587\u5B57\u5F9E\u7DDA\u7684\u4F4D\u7F6E\u5782\u76F4\u5C55\u958B\uFF08scaleY 0\u21921\uFF09\uFF0C\u7DDA\u689D\u540C\u6642\u5F80\u4E0A\u79FB\u5230\u6587\u5B57\u4E0B\u65B9\u7576\u4F5C\u5E95\u7DDA\uFF1B\u505C\u7559\u5F8C\u53CD\u5411\u6536\u56DE\u3002",
    motionEn: "A thin accent line first extends from the center outward; then the text unfolds vertically from the line (scaleY 0\u21921) while the line slides down to sit beneath the text as an underline; after a hold it reverses.",
    css: `
.S .box{position:relative;display:grid;place-items:center}
.S .t{font-size:11cqw;animation:K_t 4s cubic-bezier(.7,0,.2,1) infinite}
.S .ln{position:absolute;left:-6%;right:-6%;top:50%;height:.35cqw;background:var(--ac);animation:K_l 4s cubic-bezier(.7,0,.2,1) infinite}
@keyframes K_l{0%{transform:scaleX(0)}15%,25%{transform:scaleX(1)}40%,80%{transform:translateY(7.5cqw) scaleX(1)}92%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes K_t{0%,18%{transform:scaleY(0)}40%,80%{transform:none}92%,100%{transform:scaleY(0)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="box"><div class="t">${esc(w[0])}</div><div class="ln"></div></div>`, "html")
  },
  {
    id: "split-reveal",
    cat: "reveal",
    zh: "\u5DE6\u53F3\u5C0D\u958B",
    en: "Center Split",
    desc: "\u6587\u5B57\u5F9E\u4E2D\u7E2B\u5DE6\u53F3\u6ED1\u958B\u51FA\u73FE",
    tags: ["\u6A19\u984C", "\u6642\u5C1A"],
    tone: "paper",
    sample: ["NEW", "ARRIVAL"],
    hint: "2 \u500B\u8A5E",
    motion: "\u5169\u500B\u8A5E\u5206\u5225\u5F9E\u756B\u9762\u4E2D\u7DDA\u5411\u5DE6\u3001\u5411\u53F3\u6ED1\u51FA\uFF08\u88AB\u4E2D\u7DDA\u906E\u64CB\uFF09\uFF0C\u4E2D\u7DDA\u662F\u4E00\u689D\u5782\u76F4\u4E3B\u8272\u7D30\u7DDA\uFF1B\u5B57\u5230\u4F4D\u5F8C\u4E2D\u7DDA\u6DE1\u51FA\uFF0C\u505C\u7559\u5F8C\u5169\u8A5E\u6ED1\u56DE\u4E2D\u7DDA\u3002",
    motionEn: "Two words slide out from the vertical center line, one to the left and one to the right (masked at the seam), the seam drawn as a thin accent line that fades once the words land; after a hold the words slide back into the seam.",
    css: `
.S .row{display:flex;font-size:10cqw;letter-spacing:.05em}
.S .h{overflow:hidden;display:flex}
.S .h:first-child{justify-content:flex-end;padding-right:2cqw}
.S .h:last-child{padding-left:2cqw}
.S .h span{animation:K_l 4s cubic-bezier(.7,0,.2,1) infinite}
.S .h:last-child span{animation-name:K_r;color:var(--ac)}
.S .seam{position:absolute;width:.3cqw;height:16cqw;background:var(--ac);animation:K_s 4s ease infinite}
@keyframes K_l{0%,8%{transform:translateX(105%)}35%,75%{transform:none}95%,100%{transform:translateX(105%)}}
@keyframes K_r{0%,8%{transform:translateX(-105%)}35%,75%{transform:none}95%,100%{transform:translateX(-105%)}}
@keyframes K_s{0%,30%,80%,100%{opacity:1;transform:scaleY(1)}45%,70%{opacity:0;transform:scaleY(.3)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="row"><div class="h"><span>${esc(w[0])}</span></div><div class="h"><span>${esc(w[1] ?? "")}</span></div></div><div class="seam"></div>`, "html")
  }
];

// ../src/effects/caption.ts
var caption = [
  {
    id: "lower-third",
    cat: "caption",
    zh: "\u540D\u724C\u689D",
    en: "Lower Third",
    desc: "\u5DE6\u4E0B\u89D2\u6ED1\u51FA\u4EBA\u540D\u8207\u8077\u7A31",
    tags: ["\u8A2A\u8AC7", "\u4EBA\u540D"],
    tone: "ink",
    sample: ["\u6301\u5BB6\u7537\u5B50 KC", "\u623F\u5730\u7522 YouTuber"],
    hint: "\u540D\u5B57 / \u8077\u7A31",
    motion: "\u756B\u9762\u5DE6\u4E0B\u89D2\uFF1A\u5148\u6709\u4E00\u689D\u4E3B\u8272\u5782\u76F4\u77ED\u689D\u5F48\u51FA\uFF0C\u63A5\u8457\u767D\u5E95\u540D\u5B57\u689D\u5F9E\u77ED\u689D\u5F8C\u65B9\u5411\u53F3\u5C55\u958B\u3001\u540D\u5B57\u7531\u4E0B\u6ED1\u5165\uFF0C\u4E0B\u65B9\u8F03\u7D30\u7684\u6DF1\u8272\u8077\u7A31\u689D\u5EF6\u9072 0.15 \u79D2\u5C55\u958B\uFF1B\u505C\u7559 2 \u79D2\u5F8C\u4F9D\u53CD\u5E8F\u6536\u56DE\u3002",
    motionEn: "Bottom-left: an accent vertical tab pops in, then a white name bar expands rightward from behind it with the name sliding up, and a slimmer dark title bar below expands 0.15s later; after a 2s hold everything retracts in reverse order.",
    css: `
.S{place-items:end start;padding:0 0 10cqh 6cqw;background:linear-gradient(135deg,#3a3f47,#1b1d21)}
.S .lt{display:grid;grid-template-columns:auto 1fr;gap:0}
.S .tab{grid-row:1/3;width:1.2cqw;background:var(--ac);animation:K_tab 4.4s cubic-bezier(.7,0,.2,1) infinite;transform-origin:50% 100%}
.S .nm,.S .ti{overflow:hidden;transform-origin:0 50%;animation:K_bar 4.4s cubic-bezier(.7,0,.2,1) infinite both}
.S .nm{background:#fff;color:#111;font-size:4.6cqw;padding:1cqw 3cqw;animation-delay:.1s}
.S .ti{background:#111;color:#fff;font-size:2.6cqw;font-weight:500;padding:.8cqw 3cqw;justify-self:start;animation-delay:.25s}
.S .nm span,.S .ti span{display:block;animation:K_txt 4.4s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:inherit}
@keyframes K_tab{0%{transform:scaleY(0)}8%,88%{transform:none}96%,100%{transform:scaleY(0)}}
@keyframes K_bar{0%,6%{transform:scaleX(0)}18%,82%{transform:none}92%,100%{transform:scaleX(0)}}
@keyframes K_txt{0%,14%{transform:translateY(110%)}26%,80%{transform:none}88%,100%{transform:translateY(-110%)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [n, t] = pick(w, 2, ["\u6301\u5BB6\u7537\u5B50 KC", "\u623F\u5730\u7522 YouTuber"]);
      return `<div class="lt"><div class="tab"></div><div class="nm"><span>${esc(n)}</span></div><div class="ti"><span>${esc(t)}</span></div></div>`;
    }, "html")
  },
  {
    id: "news-ticker",
    cat: "caption",
    zh: "\u65B0\u805E\u8DD1\u99AC",
    en: "News Ticker",
    desc: "\u5E95\u90E8\u7D05\u8272\u6A19\u7C64\u52A0\u4E0A\u6372\u52D5\u8A0A\u606F",
    tags: ["\u65B0\u805E", "\u5373\u6642"],
    tone: "ink",
    sample: ["LIVE", "\u672C\u9031\u65B0\u6848\u958B\u7BB1\uFF5C\u901A\u52E4\u5BE6\u6E2C\uFF5C\u8B80\u8005 QA \u52DF\u96C6\u4E2D"],
    hint: "\u6A19\u7C64 / \u8A0A\u606F\uFF08\u53EF\u7528\uFF5C\u5206\u9694\uFF09",
    motion: "\u756B\u9762\u5E95\u90E8\u4E00\u689D\u6DF1\u8272\u8CC7\u8A0A\u689D\uFF0C\u5DE6\u5074\u6709\u4E3B\u8272\u300CLIVE\u300D\u6A19\u7C64\u8207\u9583\u720D\u7D05\u9EDE\uFF0C\u53F3\u5074\u8A0A\u606F\u6587\u5B57\u7531\u53F3\u5411\u5DE6\u7B49\u901F\u6372\u52D5\uFF0C\u8A0A\u606F\u4E4B\u9593\u7528\u5C0F\u83F1\u5F62\u5206\u9694\uFF1B\u8CC7\u8A0A\u689D\u958B\u5834\u7531\u4E0B\u5F80\u4E0A\u63A8\u5165\u3002",
    motionEn: 'A dark ticker bar at the bottom: an accent "LIVE" tag with a blinking red dot on the left, messages scrolling right-to-left at constant speed on the right separated by small diamonds; the bar pushes up from below at the start.',
    css: `
.S{place-items:end stretch;background:linear-gradient(160deg,#2c3440,#14181d)}
.S .bar{display:flex;height:9cqw;background:#0d0d0d;align-items:stretch;animation:K_in 8s cubic-bezier(.2,.8,.2,1) infinite}
.S .tag{background:var(--ac);color:#111;font-size:3.6cqw;display:flex;align-items:center;gap:1cqw;padding:0 2.4cqw;z-index:1}
.S .tag i{width:1.4cqw;height:1.4cqw;border-radius:50%;background:#e11;animation:K_b 1s steps(1) infinite}
.S .msg{flex:1;overflow:hidden;display:flex;align-items:center;color:#fff;font-size:3.6cqw;font-weight:500}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_m 12s linear infinite}
.S .r em{font-style:normal;color:var(--ac);padding:0 2cqw}
@keyframes K_m{to{transform:translateX(-50%)}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_in{0%{transform:translateY(100%)}6%,100%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [tag, msg] = pick(w, 2, ["LIVE", "\u672C\u9031\u65B0\u6848\u958B\u7BB1\uFF5C\u901A\u52E4\u5BE6\u6E2C\uFF5C\u8B80\u8005 QA \u52DF\u96C6\u4E2D"]);
      const items = msg.split("\uFF5C").map((m) => `${esc(m)}<em>\u25C6</em>`).join("");
      return `<div class="bar"><div class="tag"><i></i>${esc(tag)}</div><div class="msg"><div class="r">${rep(6, () => items)}</div></div></div>`;
    }, "html")
  },
  {
    id: "chat-bubbles",
    cat: "caption",
    zh: "\u5C0D\u8A71\u6CE1\u6CE1",
    en: "Chat Bubbles",
    desc: "\u8A0A\u606F\u4E00\u5247\u5247\u5F48\u51FA\u4F86\uFF0C\u50CF\u804A\u5929\u5BA4",
    tags: ["\u5C0D\u8A71", "\u6545\u4E8B"],
    tone: "paper",
    sample: ["\u9019\u9593\u591A\u5C11\uFF1F", "\u4F60\u731C\u731C\u770B", "\u4E0D\u8981\u8CE3\u95DC\u5B50\u5566\u{1F602}", "\u5F71\u7247\u6700\u5F8C\u516C\u5E03"],
    hint: "2\u20135 \u5247\uFF0C\u5DE6\u53F3\u4EA4\u66FF",
    motion: "\u804A\u5929\u4ECB\u9762\uFF1A\u8A0A\u606F\u6CE1\u6CE1\u5DE6\u53F3\u4EA4\u66FF\u51FA\u73FE\uFF0C\u6BCF\u5247\u5148\u986F\u793A\u300C\u8F38\u5165\u4E2D\u2026\u300D\u4E09\u9EDE\u8DF3\u52D5 0.4 \u79D2\uFF0C\u518D\u4EE5\u5F48\u6027\u653E\u5927\uFF08\u5F9E 0.6 \u5230 1\uFF09\u5F48\u51FA\uFF1B\u53F3\u5074\u6CE1\u6CE1\u70BA\u4E3B\u8272\u3001\u5DE6\u5074\u70BA\u767D\u8272\uFF0C\u820A\u8A0A\u606F\u5F80\u4E0A\u63A8\u3002",
    motionEn: "A chat interface: bubbles alternate left and right; each first shows a bouncing three-dot typing indicator for 0.4s, then pops in with a springy scale from 0.6 to 1; right bubbles in the accent color, left ones white, older messages pushing up.",
    css: `
.S{place-items:center}
.S .chat{display:flex;flex-direction:column;gap:min(1.6cqw,2.8cqh);width:min(62cqw,100cqh)}
.S .bb{max-width:75%;padding:min(1.4cqw,2.5cqh) min(2.6cqw,4.6cqh);border-radius:min(3cqw,5cqh);font-size:min(3.6cqw,6.4cqh);font-weight:500;background:#fff;color:#111;box-shadow:0 .5cqmin 1.5cqmin #0001;transform-origin:0 100%;animation:K_p 6s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.9s)}
.S .bb:nth-child(2n){align-self:flex-end;background:var(--ac);color:#111;transform-origin:100% 100%}
@keyframes K_p{0%{transform:scale(.6);opacity:0}6%,90%{transform:none;opacity:1}98%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="chat">${w.slice(0, 5).map((t, i) => `<div class="bb" style="--i:${i}">${esc(t)}</div>`).join("")}</div>`, "html")
  },
  {
    id: "karaoke",
    cat: "caption",
    zh: "\u5361\u62C9 OK \u5B57\u5E55",
    en: "Karaoke Fill",
    desc: "\u984F\u8272\u8DDF\u8457\u7BC0\u594F\u5F9E\u5DE6\u5230\u53F3\u586B\u6EFF",
    tags: ["\u6B4C\u8A5E", "\u6717\u8B80"],
    tone: "ink",
    sample: ["\u6211\u5011\u4E00\u8D77\u8D70\u904E\u7684\u8DEF"],
    hint: "\u4E00\u53E5\u6B4C\u8A5E",
    motion: "\u767D\u8272\u63CF\u908A\u7684\u5B57\u5E55\uFF0C\u4E3B\u8272\u4EE5\u6C34\u5E73\u64E6\u9664\u65B9\u5F0F\u5F9E\u5DE6\u5230\u53F3\u4F9D\u5E8F\u586B\u6EFF\u6BCF\u500B\u5B57\uFF08\u50CF KTV \u5B57\u5E55\u8DDF\u5531\uFF09\uFF0C\u586B\u6EFF\u8655\u5B57\u9AD4\u8F15\u5FAE\u653E\u5927\uFF1B\u6574\u53E5\u5531\u5B8C\u505C\u7559\u5F8C\u63DB\u884C\u91CD\u4F86\u3002",
    motionEn: "White outlined subtitles; the accent color wipes left to right through each character in turn (like KTV sing-along lyrics), with filled characters slightly enlarged; after the full line it holds, then restarts.",
    css: `
.S{place-items:end center;padding-bottom:12cqh;background:linear-gradient(#1a1a2e,#16213e)}
.S .t{position:relative;font-size:6.4cqw;-webkit-text-stroke:.5cqw #000;paint-order:stroke fill}
.S .b{color:#fff}
.S .f{position:absolute;inset:0;color:var(--ac);clip-path:inset(0 calc(100% - var(--kp)) 0 0);animation:K_k 5s linear infinite}
@property --kp{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes K_k{0%,5%{--kp:0%}75%,95%{--kp:100%}100%{--kp:0%}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t"><div class="b">${esc(w[0])}</div><div class="f">${esc(w[0])}</div></div>`, "html")
  },
  {
    id: "danmaku",
    cat: "caption",
    zh: "\u5F48\u5E55",
    en: "Danmaku Comments",
    desc: "\u6EFF\u6EFF\u7559\u8A00\u5F9E\u53F3\u98DB\u5230\u5DE6",
    tags: ["\u71B1\u9B27", "\u4E92\u52D5"],
    tone: "ink",
    sample: ["\u592A\u795E\u5566", "\u524D\u6392", "+1", "\u7B11\u6B7B", "\u6C42\u5730\u5740", "\u9019\u50F9\u683C\u5408\u7406\u55CE", "\u5DF2\u8A02\u95B1", "666"],
    hint: "\u591A\u5247\u77ED\u7559\u8A00",
    motion: "\u591A\u5247\u7559\u8A00\u4EE5\u4E0D\u540C\u5927\u5C0F\u3001\u4E0D\u540C\u901F\u5EA6\u3001\u4E0D\u540C\u5217\u4F4D\uFF0C\u5F9E\u756B\u9762\u53F3\u5074\u98DB\u5230\u5DE6\u5074\uFF08\u50CF B \u7AD9\u5F48\u5E55\uFF09\uFF0C\u90E8\u5206\u7559\u8A00\u7528\u4E3B\u8272\u6216\u5E36\u9ED1\u8272\u63CF\u908A\uFF0C\u756B\u9762\u4E2D\u592E\u6709\u88AB\u5F48\u5E55\u8986\u84CB\u7684\u4E3B\u756B\u9762\u611F\u3002",
    motionEn: "Many short comments fly from right to left across different rows at varied sizes and speeds (like Bilibili danmaku), some in the accent color or with black outlines, overlaying the main scene.",
    css: `
.S{background:linear-gradient(135deg,#334,#112)}
.S .d{position:absolute;left:100%;white-space:nowrap;font-weight:700;color:#fff;-webkit-text-stroke:.25cqw #000;paint-order:stroke fill;animation:K_d linear infinite}
.S .d.h{color:var(--ac)}
@keyframes K_d{to{transform:translateX(calc(-100cqw - 100%))}}`,
    html: /* @__PURE__ */ __name((w) => rep(18, (i) => {
      const t = w[i % w.length];
      return `<span class="d${rand(i) > 0.7 ? " h" : ""}" style="top:${5 + i % 9 * 10.5}%;font-size:${3 + rand(i + 3) * 2.5}cqw;animation-duration:${5 + rand(i + 7) * 5}s;animation-delay:${-rand(i + 11) * 10}s">${esc(t)}</span>`;
    }), "html")
  },
  {
    id: "callout",
    cat: "caption",
    zh: "\u91CD\u9EDE\u5708\u9078",
    en: "Callout Circle",
    desc: "\u624B\u7E6A\u5713\u5708\u5708\u4F4F\u91CD\u9EDE\uFF0C\u7BAD\u982D\u62C9\u51FA\u8AAA\u660E",
    tags: ["\u89E3\u8AAA", "\u91CD\u9EDE"],
    tone: "paper",
    sample: ["\u9019\u500B\u6578\u5B57\u5F88\u91CD\u8981", "\u95DC\u9375\u5728\u9019\u88E1"],
    hint: "\u4E3B\u53E5 / \u8A3B\u89E3",
    motion: "\u53E5\u5B50\u4E2D\u7684\u91CD\u9EDE\u5B57\u88AB\u4E00\u5708\u624B\u7E6A\u611F\u7684\u4E3B\u8272\u6A62\u5713\u5708\u8D77\u4F86\uFF08SVG \u63CF\u908A\u52D5\u756B 0.6 \u79D2\uFF09\uFF0C\u63A5\u8457\u4E00\u652F\u5F4E\u66F2\u7BAD\u982D\u5F9E\u5713\u5708\u756B\u51FA\uFF0C\u7BAD\u982D\u672B\u7AEF\u5F48\u51FA\u8A3B\u89E3\u6587\u5B57\uFF1B\u505C\u7559\u5F8C\u5168\u90E8\u6DE1\u51FA\u3002",
    motionEn: "A hand-drawn accent ellipse is traced around the key phrase (0.6s SVG stroke animation), then a curved arrow draws out from the circle and a note pops in at its tip; after a hold everything fades out.",
    css: `
.S .box{position:relative}
.S .t{font-size:7cqw;color:#111;position:relative;z-index:1}
.S svg{position:absolute;left:-6%;top:-35%;width:112%;height:170%;overflow:visible}
.S path{fill:none;stroke:var(--ac);stroke-width:5;stroke-linecap:round;stroke-dasharray:1200;stroke-dashoffset:1200;animation:K_d 4.5s ease-out infinite}
.S path.ar{stroke-dasharray:300;stroke-dashoffset:300;animation-name:K_a}
.S .note{position:absolute;right:-4%;top:-58%;font-size:3.8cqw;color:var(--ac);font-weight:700;animation:K_n 4.5s cubic-bezier(.3,1.6,.5,1) infinite both;transform-origin:0 100%}
@keyframes K_d{0%,5%{stroke-dashoffset:1200;opacity:1}22%,85%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}}
@keyframes K_a{0%,22%{stroke-dashoffset:300;opacity:1}34%,85%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}}
@keyframes K_n{0%,32%{transform:scale(0);opacity:0}40%,85%{transform:none;opacity:1}100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [t, n] = pick(w, 2, ["\u9019\u500B\u6578\u5B57\u5F88\u91CD\u8981", "\u95DC\u9375\u5728\u9019\u88E1"]);
      return `<div class="box"><div class="t">${esc(t)}</div><svg viewBox="0 0 400 170" preserveAspectRatio="none"><path d="M60 40 C 140 5, 330 10, 380 60 S 330 160, 180 150 S 10 120, 30 70 S 120 25, 200 28"/><path class="ar" d="M330 40 Q 370 0, 395 -20"/></svg><div class="note">${esc(n)}</div></div>`;
    }, "html")
  },
  {
    id: "hashtag-pop",
    cat: "caption",
    zh: "\u6A19\u7C64\u5F48\u51FA",
    en: "Tag Pop",
    desc: "\u4E00\u9846\u9846\u81A0\u56CA\u6A19\u7C64\u5F48\u51FA\u4F86",
    tags: ["\u95DC\u9375\u5B57", "\u793E\u7FA4"],
    tone: "accent",
    sample: ["#\u91CD\u5283\u5340", "#\u6377\u904B\u5B85", "#\u9996\u8CFC", "#\u958B\u7BB1", "#\u901A\u52E4"],
    hint: "3\u20136 \u500B\u6A19\u7C64",
    motion: "\u591A\u500B\u81A0\u56CA\u5F62\u6A19\u7C64\u4F9D\u5E8F\u4EE5\u5F48\u6027\u653E\u5927\u5F9E 0 \u5F48\u51FA\uFF08\u5E36\u8F15\u5FAE\u65CB\u8F49\uFF09\uFF0C\u9ED1\u5E95\u767D\u5B57\u8207\u767D\u5E95\u9ED1\u5B57\u4EA4\u932F\uFF0C\u6392\u6210\u81EA\u7136\u63DB\u884C\u7684\u6A19\u7C64\u96F2\uFF1B\u505C\u7559\u5F8C\u4F9D\u5E8F\u7E2E\u5C0F\u6D88\u5931\u3002",
    motionEn: "Pill-shaped tags pop in one by one with a springy scale from 0 and a slight rotation, alternating black-on-white and white-on-black, flowing into a wrapped tag cloud; after a hold they shrink away in order.",
    css: `
.S .cloud{display:flex;flex-wrap:wrap;justify-content:center;gap:1.6cqw;width:76cqw}
.S .tg{font-size:4.6cqw;padding:1.2cqw 3cqw;border-radius:99px;background:#111;color:#fff;animation:K_p 4.4s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.12s);rotate:var(--r)}
.S .tg:nth-child(2n){background:#fff;color:#111}
@keyframes K_p{0%{transform:scale(0)}12%,80%{transform:none}92%,100%{transform:scale(0)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="cloud">${w.slice(0, 7).map((t, i) => `<span class="tg" style="--i:${i};--r:${[-4, 3, -2, 5, -3, 2, -5][i]}deg">${esc(t)}</span>`).join("")}</div>`, "html")
  },
  {
    id: "shorts-caption",
    cat: "caption",
    zh: "\u77ED\u5F71\u97F3\u5927\u5B57\u5E55",
    en: "Shorts Caption",
    desc: "\u4E00\u6B21\u4E00\u5169\u500B\u8A5E\uFF0C\u95DC\u9375\u5B57\u8B8A\u8272\u8DF3\u52D5",
    tags: ["Shorts", "Reels"],
    tone: "ink",
    sample: ["\u9019\u9593", "\u623F\u5B50", "\u6700\u5927\u7684", "\u554F\u984C", "\u662F"],
    hint: "\u628A\u4E00\u53E5\u8A71\u62C6\u6210 3\u20136 \u6BB5",
    motion: "\u76F4\u5F0F\u77ED\u5F71\u97F3\u5B57\u5E55\uFF1A\u756B\u9762\u4E2D\u4E0B\u65B9\u4E00\u6B21\u53EA\u51FA\u73FE\u4E00\u6BB5 1\u20133 \u5B57\u7684\u5927\u5B57\uFF08\u7C97\u9ED1\u9AD4\u3001\u9ED1\u8272\u7C97\u63CF\u908A\u3001\u767D\u5B57\uFF09\uFF0C\u6BCF\u6BB5\u4EE5 110% \u5F48\u5165\uFF1B\u6307\u5B9A\u7684\u95DC\u9375\u6BB5\u843D\u6539\u6210\u4E3B\u8272\u4E26\u653E\u5927 120%\uFF0C\u6BCF\u6BB5\u7D04 0.4 \u79D2\u5FEB\u901F\u5207\u63DB\u3002",
    motionEn: "Vertical short-form captions: one chunk of 1\u20133 words at a time in the lower middle (heavy sans, thick black outline, white fill), each popping in at 110%; key chunks switch to the accent color at 120%; about 0.4s per chunk.",
    css: `
.S{background:linear-gradient(#556,#223)}
.S .w{position:absolute;top:58%;font-size:9cqmin;color:#fff;-webkit-text-stroke:1.4cqmin #000;paint-order:stroke fill;visibility:hidden}
.S .w.on{visibility:visible;animation:K_b .3s cubic-bezier(.3,1.8,.5,1) both}
.S .w.k{color:var(--ac);font-size:11cqmin}
@keyframes K_b{0%{transform:scale(.6)}100%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => w.slice(0, 8).map((t, i) => `<div class="w${i === Math.min(3, w.length - 1) ? " k" : ""}">${esc(t)}</div>`).join(""), "html"),
    run: /* @__PURE__ */ __name((root) => {
      const els = Array.from(root.querySelectorAll(".w"));
      let i = 0;
      const tick = /* @__PURE__ */ __name(() => {
        els.forEach((e) => e.classList.remove("on"));
        if (i < els.length) els[i].classList.add("on");
        i = (i + 1) % (els.length + 2);
      }, "tick");
      tick();
      const t = window.setInterval(tick, 450);
      return () => clearInterval(t);
    }, "run")
  },
  {
    id: "location-pin",
    cat: "caption",
    zh: "\u5730\u9EDE\u6A19\u8A18",
    en: "Location Pin",
    desc: "\u5B9A\u4F4D\u91DD\u6389\u4E0B\u4F86\uFF0C\u5F48\u51FA\u5730\u9EDE\u540D\u7A31",
    tags: ["\u5730\u9EDE", "\u5916\u666F"],
    tone: "paper",
    sample: ["\u6377\u904B\u7AD9\u51FA\u53E3", "\u6B65\u884C 3 \u5206\u9418"],
    hint: "\u5730\u9EDE / \u88DC\u5145\u8AAA\u660E",
    motion: "\u5730\u5716\u7DB2\u683C\u80CC\u666F\u4E0A\uFF0C\u4E00\u652F\u4E3B\u8272\u5B9A\u4F4D\u91DD\u5F9E\u4E0A\u65B9\u843D\u4E0B\u3001\u5F48\u8DF3\u4E00\u6B21\u4E26\u5728\u5730\u9762\u64F4\u6563\u4E00\u5708\u6F23\u6F2A\uFF0C\u63A5\u8457\u53F3\u5074\u5C55\u958B\u767D\u8272\u8CC7\u8A0A\u5361\uFF1A\u5927\u5B57\u5730\u9EDE\u540D\u7A31 + \u5C0F\u5B57\u88DC\u5145\u8AAA\u660E\uFF1B\u505C\u7559\u5F8C\u6536\u56DE\u3002",
    motionEn: "Over a faint map grid, an accent location pin drops from above, bounces once and sends out a ripple on the ground; a white info card then expands to its right with the place name in large type and a small note beneath; after a hold it retracts.",
    css: `
.S{background:linear-gradient(90deg,#0000000d 1px,transparent 1px) 0 0/6cqw 6cqw,linear-gradient(#0000000d 1px,transparent 1px) 0 0/6cqw 6cqw,var(--bg)}
.S .g{display:flex;align-items:center;gap:2cqw}
.S .pin{position:relative;width:8cqw;height:8cqw;animation:K_drop 4.6s cubic-bezier(.5,0,.5,1.4) infinite both}
.S .pin::before{content:'';position:absolute;inset:0;background:var(--ac);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.S .pin::after{content:'';position:absolute;inset:2.6cqw;background:#fff;border-radius:50%}
.S .rip{position:absolute;left:50%;bottom:-2cqw;width:8cqw;height:2.4cqw;margin-left:-4cqw;border:.4cqw solid var(--ac);border-radius:50%;animation:K_rip 4.6s ease-out infinite}
.S .card{background:#fff;border-radius:1.4cqw;padding:2cqw 3cqw;box-shadow:0 1cqw 3cqw #0002;transform-origin:0 50%;animation:K_card 4.6s cubic-bezier(.2,.9,.2,1) infinite both}
.S .card b{display:block;font-size:5cqw;color:#111}.S .card small{font-size:2.8cqw;color:#666;font-weight:500}
@keyframes K_drop{0%{transform:translateY(-60cqh);opacity:0}5%{opacity:1}18%,85%{transform:none;opacity:1}95%,100%{transform:translateY(-4cqw);opacity:0}}
@keyframes K_rip{0%,17%{transform:scale(.2);opacity:0}20%{opacity:1}40%,100%{transform:scale(2.4);opacity:0}}
@keyframes K_card{0%,22%{transform:scaleX(0);opacity:0}34%,82%{transform:none;opacity:1}92%,100%{transform:scaleX(0);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u6377\u904B\u7AD9\u51FA\u53E3", "\u6B65\u884C 3 \u5206\u9418"]);
      return `<div class="g"><div class="pin"><i class="rip"></i></div><div class="card"><b>${esc(a)}</b><small>${esc(b)}</small></div></div>`;
    }, "html")
  },
  {
    id: "subscribe-cta",
    cat: "caption",
    zh: "\u8A02\u95B1\u63D0\u793A",
    en: "Subscribe CTA",
    desc: "\u8A02\u95B1\u6309\u9215\u88AB\u9EDE\u4E0B\u3001\u5C0F\u9234\u943A\u6416\u52D5",
    tags: ["YouTube", "\u7247\u5C3E"],
    tone: "ink",
    sample: ["\u8A02\u95B1", "\u958B\u555F\u5C0F\u9234\u943A"],
    hint: "\u6309\u9215\u6587\u5B57 / \u63D0\u793A",
    motion: "\u756B\u9762\u4E0B\u65B9\u5F48\u51FA\u767D\u8272\u81A0\u56CA\u6309\u9215\u300C\u8A02\u95B1\u300D\uFF0C\u4E00\u500B\u6E38\u6A19\u7BAD\u982D\u5F9E\u53F3\u4E0B\u6ED1\u5165\u9EDE\u64CA\uFF0C\u6309\u9215\u88AB\u6309\u4E0B\u5F8C\u8B8A\u6210\u7070\u8272\u300C\u5DF2\u8A02\u95B1\u300D\uFF0C\u65C1\u908A\u7684\u9234\u943A\u5716\u793A\u5DE6\u53F3\u6416\u6643\u4E26\u51FA\u73FE\u63D0\u793A\u6587\u5B57\uFF1B\u505C\u7559\u5F8C\u6536\u56DE\u3002",
    motionEn: 'A white pill "Subscribe" button pops up at the bottom; a cursor slides in from the bottom right and clicks it; the button turns grey "Subscribed" while a bell icon beside it swings and a hint label appears; after a hold it retracts.',
    css: `
.S .g{display:flex;align-items:center;gap:2cqw;animation:K_in 5s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .btn{position:relative;font-size:6cqw;padding:1.8cqw 5cqw;border-radius:99px;background:var(--ac);color:#111}
.S .btn span{display:block;animation:K_txt 5s steps(1) infinite}
.S .btn::after{content:'\u5DF2\u8A02\u95B1';position:absolute;inset:0;display:grid;place-items:center;border-radius:99px;background:#3a3a3a;color:#ccc;opacity:0;animation:K_on 5s steps(1) infinite}
.S .bell{font-size:7cqw;transform-origin:50% 10%;animation:K_bell 5s ease-in-out infinite}
.S .hint{font-size:4cqw;font-weight:500;opacity:0;animation:K_h 5s ease infinite}
.S .cur{position:absolute;left:50%;top:50%;width:5cqw;height:5cqw;animation:K_cur 5s cubic-bezier(.4,0,.2,1) infinite;filter:drop-shadow(0 .3cqw .3cqw #0008)}
@keyframes K_in{0%{transform:translateY(30cqh) scale(.6)}10%,88%{transform:none}100%{transform:translateY(30cqh)}}
@keyframes K_cur{0%,12%{transform:translate(30cqw,25cqh)}30%{transform:translate(-14cqw,0)}33%{transform:translate(-14cqw,0) scale(.8)}36%,60%{transform:translate(-14cqw,0)}75%,100%{transform:translate(30cqw,25cqh)}}
@keyframes K_on{0%,33%{opacity:0}34%,100%{opacity:1}}
@keyframes K_txt{0%,33%{opacity:1}34%,100%{opacity:0}}
@keyframes K_bell{0%,40%,70%,100%{transform:none}45%{transform:rotate(20deg)}50%{transform:rotate(-18deg)}55%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}}
@keyframes K_h{0%,42%{opacity:0;transform:translateX(-1cqw)}50%,85%{opacity:1;transform:none}95%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [b, h] = pick(w, 2, ["\u8A02\u95B1", "\u958B\u555F\u5C0F\u9234\u943A"]);
      return `<div class="g"><div class="btn"><span>${esc(b)}</span></div><div class="bell">\u{1F514}</div><div class="hint">${esc(h)}</div></div><svg class="cur" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9.5 21z" fill="#fff" stroke="#000" stroke-width="1.2"/></svg>`;
    }, "html")
  }
];

// ../src/effects/card.ts
var card = [
  {
    id: "chapter-card",
    cat: "card",
    zh: "\u7AE0\u7BC0\u5361",
    en: "Chapter Card",
    desc: "\u5927\u865F\u7AE0\u7BC0\u7DE8\u865F\u52A0\u6A19\u984C\uFF0C\u6BB5\u843D\u5206\u9694\u7528",
    tags: ["\u7AE0\u7BC0", "\u9577\u7247"],
    tone: "ink",
    sample: ["02", "\u901A\u52E4\u5BE6\u6E2C"],
    hint: "\u7DE8\u865F / \u7AE0\u7BC0\u540D",
    motion: "\u5DE6\u5074\u8D85\u5927\u63CF\u908A\u6578\u5B57\u7531\u4E0B\u6ED1\u5165\uFF0C\u53F3\u5074\u5148\u756B\u51FA\u4E00\u689D\u4E3B\u8272\u77ED\u6A6B\u7DDA\uFF0C\u518D\u7531\u4E0B\u800C\u4E0A\u9732\u51FA\u5C0F\u5B57\u300CCHAPTER\u300D\u8207\u5927\u5B57\u7AE0\u7BC0\u540D\uFF1B\u505C\u7559\u5F8C\u6574\u7D44\u5F80\u5DE6\u6ED1\u51FA\u3002",
    motionEn: 'A huge outlined number slides up on the left; on the right an accent dash draws in, then a small "CHAPTER" label and the large chapter title rise into view; after a hold the group slides out to the left.',
    css: `
.S .g{display:flex;align-items:center;gap:4cqw;animation:K_out 4.4s cubic-bezier(.7,0,.2,1) infinite}
.S .num{font-size:28cqw;color:transparent;-webkit-text-stroke:.3cqw var(--ac);line-height:.8;font-family:var(--mono);overflow:hidden}
.S .num span{display:block;animation:K_up 4.4s cubic-bezier(.2,.8,.1,1) infinite both}
.S .r{display:flex;flex-direction:column;gap:1.4cqw}
.S .dash{width:8cqw;height:.6cqw;background:var(--ac);transform-origin:0 50%;animation:K_dash 4.4s cubic-bezier(.7,0,.2,1) infinite both}
.S .m{overflow:hidden}
.S .lb{font-size:2.6cqw;letter-spacing:.4em;opacity:.6;font-weight:500}
.S .ti{font-size:9cqw}
.S .m span{display:block;animation:K_up 4.4s cubic-bezier(.2,.8,.1,1) infinite both;animation-delay:calc(.2s + var(--i)*.1s)}
@keyframes K_up{0%{transform:translateY(110%)}20%,100%{transform:none}}
@keyframes K_dash{0%,8%{transform:scaleX(0)}22%,100%{transform:none}}
@keyframes K_out{0%,82%{transform:none;opacity:1}96%,100%{transform:translateX(-20cqw);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [n, t] = pick(w, 2, ["02", "\u901A\u52E4\u5BE6\u6E2C"]);
      return `<div class="g"><div class="num"><span>${esc(n)}</span></div><div class="r"><div class="dash"></div><div class="m lb"><span style="--i:0">CHAPTER</span></div><div class="m ti"><span style="--i:1">${esc(t)}</span></div></div></div>`;
    }, "html")
  },
  {
    id: "big-number",
    cat: "card",
    zh: "\u6578\u5B57\u5927\u5B57\u5831",
    en: "Big Number",
    desc: "\u8D85\u5927\u6578\u5B57\u5FEB\u901F\u8DF3\u5230\u76EE\u6A19\u503C",
    tags: ["\u6578\u64DA", "\u91CD\u9EDE"],
    tone: "accent",
    sample: ["3", "\u5206\u9418", "\u6B65\u884C\u5230\u6377\u904B\u7AD9"],
    hint: "\u6578\u5B57 / \u55AE\u4F4D / \u8AAA\u660E\uFF08\u6578\u5B57\u8ACB\u7528\u53EF\u67E5\u8B49\u7684\u8CC7\u6599\uFF09",
    motion: "\u756B\u9762\u4E2D\u592E\u4E00\u500B\u8D85\u5927\u6578\u5B57\u5F9E 0 \u5FEB\u901F\u8A08\u6578\u5230\u76EE\u6A19\u503C\uFF08\u7DE9\u51FA\uFF0C\u7D04 1.2 \u79D2\uFF09\uFF0C\u53F3\u4E0B\u89D2\u63A5\u55AE\u4F4D\u5C0F\u5B57\uFF0C\u4E0B\u65B9\u4E00\u884C\u8AAA\u660E\u6587\u5B57\u5728\u6578\u5B57\u505C\u4E0B\u5F8C\u6DE1\u5165\uFF1B\u6578\u5B57\u505C\u4E0B\u77AC\u9593\u8F15\u5FAE\u653E\u5927\u56DE\u5F48\u3002",
    motionEn: "A huge number counts up from 0 to its target at the center (ease-out, about 1.2s), the unit tucked at its lower right and a caption line fading in below once it settles; the number bumps slightly in scale as it lands.",
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;color:#111}
.S .row{display:flex;align-items:baseline;gap:1cqw}
.S .n{font-size:30cqw;line-height:.85;font-family:var(--mono);font-weight:700;letter-spacing:-.04em}
.S .n.land{animation:K_l .4s cubic-bezier(.3,1.8,.5,1)}
.S .u{font-size:6cqw}
.S .cap{font-size:3.6cqw;font-weight:500;margin-top:2cqw;opacity:0;transition:opacity .5s}
.S .cap.on{opacity:1}
@keyframes K_l{0%{transform:scale(1.12)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [n, u, c] = pick(w, 3, ["3", "\u5206\u9418", "\u6B65\u884C\u5230\u6377\u904B\u7AD9"]);
      return `<div class="g"><div class="row"><div class="n" data-to="${esc(n)}">0</div><div class="u">${esc(u)}</div></div><div class="cap">${esc(c)}</div></div>`;
    }, "html"),
    run: /* @__PURE__ */ __name((root) => {
      const el = root.querySelector(".n");
      const cap = root.querySelector(".cap");
      const raw = el.dataset.to || "0";
      const to = parseFloat(raw.replace(/,/g, "")) || 0;
      const dec = (raw.split(".")[1] || "").length;
      const comma = raw.includes(",");
      let raf = 0;
      let t = 0;
      let alive = true;
      const fmt = /* @__PURE__ */ __name((v) => {
        const s = v.toFixed(dec);
        return comma ? Number(s).toLocaleString("en-US", { minimumFractionDigits: dec }) : s;
      }, "fmt");
      const go = /* @__PURE__ */ __name(() => {
        if (!alive) return;
        cap.classList.remove("on");
        el.classList.remove("land");
        const start = performance.now();
        const f = /* @__PURE__ */ __name((now) => {
          if (!alive) return;
          const p = Math.min(1, (now - start) / 1200);
          el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(f);
          else {
            el.textContent = raw;
            el.classList.add("land");
            cap.classList.add("on");
            t = window.setTimeout(go, 2600);
          }
        }, "f");
        raf = requestAnimationFrame(f);
      }, "go");
      go();
      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }, "run")
  },
  {
    id: "quote-card",
    cat: "card",
    zh: "\u91D1\u53E5\u5361",
    en: "Quote Card",
    desc: "\u5927\u5F15\u865F\u52A0\u4E0A\u4E00\u884C\u884C\u6D6E\u73FE\u7684\u91D1\u53E5",
    tags: ["\u91D1\u53E5", "\u5206\u4EAB"],
    tone: "paper",
    sample: ["\u8CB7\u623F\u4E0D\u662F\u7D42\u9EDE", "\u662F\u751F\u6D3B\u7684\u8D77\u9EDE", "\u2014 \u6301\u5BB6\u7537\u5B50 KC"],
    hint: "2\u20133 \u884C\uFF0C\u6700\u5F8C\u4E00\u884C\u70BA\u51FA\u8655",
    motion: "\u5DE6\u4E0A\u89D2\u5DE8\u5927\u7684\u4E3B\u8272\u5F15\u865F\u5148\u65CB\u8F49\u5F48\u5165\uFF0C\u63A5\u8457\u91D1\u53E5\u4EE5\u660E\u9AD4\u9010\u884C\u7531\u4E0B\u6DE1\u5165\uFF08\u6BCF\u884C\u9593\u9694 0.3 \u79D2\uFF09\uFF0C\u6700\u5F8C\u51FA\u8655\u4EE5\u5C0F\u5B57\u5F9E\u53F3\u5074\u6ED1\u5165\uFF1B\u505C\u7559\u5F8C\u6574\u5F35\u5361\u6DE1\u51FA\u3002",
    motionEn: "A giant accent quotation mark spins and pops in at the top left; the quote then fades up line by line in a serif face (0.3s apart), and the attribution slides in small from the right; after a hold the whole card fades out.",
    css: `
.S .g{position:relative;padding:4cqw 6cqw;color:#111;animation:K_o 5s ease infinite}
.S .q{position:absolute;left:-1cqw;top:-8cqw;font-size:22cqw;color:var(--ac);font-family:var(--serif);line-height:1;animation:K_q 5s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .l{font-family:var(--serif);font-size:6.4cqw;line-height:1.35;animation:K_l 5s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(.3s + var(--i)*.3s)}
.S .by{font-size:2.8cqw;font-weight:500;opacity:.6;margin-top:2cqw;text-align:right;animation:K_b 5s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:1.1s}
@keyframes K_q{0%{transform:scale(0) rotate(-40deg)}10%,100%{transform:none}}
@keyframes K_l{0%{opacity:0;transform:translateY(40%)}14%,100%{opacity:1;transform:none}}
@keyframes K_b{0%{opacity:0;transform:translateX(10%)}14%,100%{opacity:.6;transform:none}}
@keyframes K_o{0%,85%{opacity:1}97%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const by = w.length > 1 && /^[—-]/.test(w[w.length - 1]) ? w[w.length - 1] : "";
      const lines = by ? w.slice(0, -1) : w;
      return `<div class="g"><div class="q">\u201C</div>${lines.slice(0, 3).map((t, i) => `<div class="l" style="--i:${i}">${esc(t)}</div>`).join("")}${by ? `<div class="by">${esc(by)}</div>` : ""}</div>`;
    }, "html")
  },
  {
    id: "versus",
    cat: "card",
    zh: "\u5C0D\u6C7A VS",
    en: "Versus Split",
    desc: "\u5DE6\u53F3\u5C0D\u6BD4\uFF0C\u4E2D\u9593 VS \u7838\u4E0B\u4F86",
    tags: ["\u6BD4\u8F03", "\u4E8C\u9078\u4E00"],
    tone: "ink",
    sample: ["\u65B0\u6210\u5C4B", "\u9810\u552E\u5C4B"],
    hint: "2 \u500B\u9078\u9805",
    motion: "\u756B\u9762\u4EE5\u659C\u7DDA\u5207\u6210\u5DE6\u53F3\u5169\u534A\uFF0C\u5DE6\u534A\u4E3B\u8272\u3001\u53F3\u534A\u767D\u8272\uFF0C\u5169\u500B\u9078\u9805\u5206\u5225\u5F9E\u5DE6\u53F3\u5169\u5074\u885D\u5165\uFF1B\u4E2D\u9593\u5713\u5F62\u300CVS\u300D\u5FBD\u7AE0\u5F9E 3 \u500D\u5927\u7838\u4E0B\u4E26\u8B93\u756B\u9762\u9707\u52D5\uFF0C\u659C\u5207\u7DDA\u9583\u4E00\u9053\u767D\u5149\u3002",
    motionEn: 'The frame splits diagonally: accent on the left, white on the right; the two options charge in from each side, then a round "VS" badge slams down from 3x scale with a screen shake while a white flash runs along the diagonal seam.',
    css: `
.S{animation:K_sh 4.4s infinite}
.S .L,.S .R{position:absolute;inset:0;display:grid;align-items:center;font-size:8cqw}
.S .L{background:var(--ac);color:#111;clip-path:polygon(0 0,56% 0,44% 100%,0 100%);padding-left:8cqw;justify-items:start}
.S .R{background:#f4f1e8;color:#111;clip-path:polygon(56% 0,100% 0,100% 100%,44% 100%);padding-right:8cqw;justify-items:end}
.S .L span{animation:K_l 4.4s cubic-bezier(.2,.9,.2,1) infinite both}
.S .R span{animation:K_r 4.4s cubic-bezier(.2,.9,.2,1) infinite both}
.S .vs{position:relative;z-index:2;width:16cqw;height:16cqw;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:6cqw;font-style:italic;border:.8cqw solid #fff;animation:K_vs 4.4s cubic-bezier(.5,0,.5,1.5) infinite both}
@keyframes K_l{0%{transform:translateX(-100cqw)}14%,88%{transform:none}100%{transform:translateX(-100cqw)}}
@keyframes K_r{0%{transform:translateX(100cqw)}14%,88%{transform:none}100%{transform:translateX(100cqw)}}
@keyframes K_vs{0%,16%{transform:scale(3);opacity:0}26%,86%{transform:none;opacity:1}96%,100%{transform:scale(0);opacity:0}}
@keyframes K_sh{0%,25%,33%,100%{transform:none}27%{transform:translate(1%,1%)}29%{transform:translate(-1%,-.6%)}31%{transform:translate(.5%,.3%)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u65B0\u6210\u5C4B", "\u9810\u552E\u5C4B"]);
      return `<div class="L"><span>${esc(a)}</span></div><div class="R"><span>${esc(b)}</span></div><div class="vs">VS</div>`;
    }, "html")
  },
  {
    id: "checklist",
    cat: "card",
    zh: "\u6E05\u55AE\u6253\u52FE",
    en: "Checklist",
    desc: "\u9805\u76EE\u4E00\u689D\u689D\u51FA\u73FE\u4E26\u6253\u52FE",
    tags: ["\u91CD\u9EDE\u6574\u7406", "\u61F6\u4EBA\u5305"],
    tone: "paper",
    sample: ["\u770B\u5C4B\u524D\u5FC5\u67E5", "\u5EFA\u5546\u904E\u5F80\u8A55\u50F9", "\u5468\u908A\u5ACC\u60E1\u8A2D\u65BD", "\u901A\u52E4\u5BE6\u969B\u6642\u9593"],
    hint: "\u6A19\u984C + 3\u20135 \u9805",
    motion: "\u767D\u8272\u6E05\u55AE\u5361\uFF1A\u6A19\u984C\u5148\u51FA\u73FE\uFF0C\u6BCF\u4E00\u9805\u4F9D\u5E8F\u5F9E\u5DE6\u6ED1\u5165\uFF0C\u9805\u76EE\u524D\u7684\u65B9\u6846\u63A5\u8457\u88AB\u4E3B\u8272\u52FE\u52FE\u300C\u756B\u300D\u4E0A\uFF08SVG \u63CF\u908A\u52D5\u756B\uFF09\uFF0C\u6253\u52FE\u5F8C\u6587\u5B57\u5FAE\u5FAE\u8B8A\u6DE1\uFF1B\u5168\u90E8\u5B8C\u6210\u5F8C\u505C\u7559\u518D\u91CD\u4F86\u3002",
    motionEn: "A white checklist card: the title appears, then each item slides in from the left and its checkbox gets an accent tick drawn in (SVG stroke animation), after which the item text dims slightly; once all are done it holds and restarts.",
    css: `
.S .cd{background:#fff;color:#111;border-radius:2cqw;padding:3.4cqw 4.6cqw;box-shadow:0 1.5cqw 4cqw #0002;min-width:50cqw}
.S h3{margin:0 0 2cqw;font-size:5cqw}
.S .it{display:flex;align-items:center;gap:1.8cqw;font-size:3.8cqw;font-weight:500;padding:.9cqw 0;animation:K_in 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.6s)}
.S .bx{width:3.6cqw;height:3.6cqw;border:.35cqw solid #111;border-radius:.6cqw;flex:none;position:relative}
.S .bx svg{position:absolute;inset:-30%;width:160%;height:160%;overflow:visible}
.S .bx path{fill:none;stroke:var(--ac);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:K_ck 6s ease-out infinite;animation-delay:calc(var(--i)*.6s + .3s)}
.S .it span{animation:K_dim 6s infinite;animation-delay:calc(var(--i)*.6s + .3s)}
@keyframes K_in{0%{opacity:0;transform:translateX(-6%)}6%,92%{opacity:1;transform:none}100%{opacity:0}}
@keyframes K_ck{0%,2%{stroke-dashoffset:40}8%,100%{stroke-dashoffset:0}}
@keyframes K_dim{0%,6%{opacity:1}10%,100%{opacity:.55}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [title, ...items] = w;
      return `<div class="cd"><h3>${esc(title)}</h3>${items.slice(0, 5).map(
        (t, i) => `<div class="it" style="--i:${i}"><div class="bx"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div><span>${esc(t)}</span></div>`
      ).join("")}</div>`;
    }, "html")
  },
  {
    id: "countdown",
    cat: "card",
    zh: "\u5012\u6578",
    en: "Countdown",
    desc: "3\u30012\u30011 \u642D\u914D\u5713\u74B0\u5012\u6578",
    tags: ["\u958B\u5834", "\u63ED\u66C9"],
    tone: "ink",
    sample: ["3", "GO!"],
    hint: "\u8D77\u59CB\u6578\u5B57 / \u7D50\u5C3E\u5B57",
    motion: "\u5927\u6578\u5B57\u5728\u4E3B\u8272\u5713\u74B0\u4E2D\u592E\uFF0C\u5713\u74B0\u6BCF\u79D2\u9806\u6642\u91DD\u6D88\u8017\u4E00\u5708\uFF0C\u6578\u5B57\u6BCF\u79D2\u4EE5\u7E2E\u653E\u5F48\u5165\u66FF\u63DB\uFF083\u21922\u21921\uFF09\uFF0C\u6700\u5F8C\u63DB\u6210\u7D50\u5C3E\u5B57\u4E26\u7206\u958B\u653E\u5927\u6DE1\u51FA\u3002",
    motionEn: "A large number sits inside an accent ring; the ring depletes clockwise once per second while the number pops in fresh each second (3\u21922\u21921), finally replaced by the closing word, which bursts larger and fades out.",
    css: `
.S .ring{position:absolute;width:44cqmin;height:44cqmin}
.S .ring circle{fill:none;stroke-width:3}
.S .ring .bg{stroke:color-mix(in srgb,var(--fg) 15%,transparent)}
.S .ring .fg{stroke:var(--ac);stroke-dasharray:283;stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%}
.S .ring .fg.go{animation:K_r 1s linear}
.S .n{font-size:26cqmin;font-family:var(--mono);font-weight:700}
.S .n.pop{animation:K_p .5s cubic-bezier(.3,1.7,.5,1)}
.S .n.end{color:var(--ac);font-family:var(--sans);font-size:18cqmin;animation:K_e 1.2s ease-out forwards}
@keyframes K_r{from{stroke-dashoffset:0}to{stroke-dashoffset:283}}
@keyframes K_p{from{transform:scale(1.6);opacity:0}}
@keyframes K_e{0%{transform:scale(.5)}30%{transform:scale(1.1)}70%{transform:scale(1.1);opacity:1}100%{transform:scale(2.4);opacity:0}}`,
    html: /* @__PURE__ */ __name(() => `<svg class="ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="45"/><circle class="fg" cx="50" cy="50" r="45"/></svg><div class="n"></div>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const n = root.querySelector(".n");
      const fg = root.querySelector(".fg");
      const from = Math.max(1, Math.min(9, parseInt(w[0], 10) || 3));
      const end = w[1] || "GO!";
      let k = from;
      let t = 0;
      const tick = /* @__PURE__ */ __name(() => {
        n.className = "n";
        fg.classList.remove("go");
        void n.offsetWidth;
        if (k > 0) {
          n.textContent = String(k);
          n.classList.add("pop");
          fg.classList.add("go");
          k--;
          t = window.setTimeout(tick, 1e3);
        } else {
          n.textContent = end;
          n.classList.add("end");
          k = from;
          t = window.setTimeout(tick, 1600);
        }
      }, "tick");
      tick();
      return () => clearTimeout(t);
    }, "run")
  },
  {
    id: "timeline",
    cat: "card",
    zh: "\u6642\u9593\u8EF8",
    en: "Timeline",
    desc: "\u7DDA\u689D\u5EF6\u4F38\uFF0C\u7BC0\u9EDE\u8207\u4E8B\u4EF6\u4F9D\u5E8F\u51FA\u73FE",
    tags: ["\u9032\u5EA6", "\u6B77\u7A0B"],
    tone: "paper",
    sample: ["2019\uFF5C\u571F\u5730\u53D6\u5F97", "2021\uFF5C\u958B\u5DE5", "2023\uFF5C\u7D50\u69CB\u5B8C\u6210", "2025\uFF5C\u4EA4\u5C4B"],
    hint: "\u300C\u5E74\u4EFD\uFF5C\u4E8B\u4EF6\u300D3\u20135 \u500B",
    motion: "\u4E00\u689D\u6C34\u5E73\u7DDA\u7531\u5DE6\u5F80\u53F3\u5EF6\u4F38\uFF0C\u6BCF\u5230\u4E00\u500B\u7BC0\u9EDE\uFF0C\u5713\u9EDE\u4EE5\u5F48\u6027\u653E\u5927\u51FA\u73FE\uFF0C\u5E74\u4EFD\u5728\u4E0A\u3001\u4E8B\u4EF6\u5728\u4E0B\u6DE1\u5165\uFF1B\u6700\u5F8C\u4E00\u500B\u7BC0\u9EDE\u7528\u4E3B\u8272\u4E26\u5E36\u8108\u52D5\u5149\u5708\u3002",
    motionEn: "A horizontal line extends left to right; at each node a dot pops in with a spring, the year fading in above and the event below; the final node uses the accent color with a pulsing halo.",
    css: `
.S .tl{position:relative;width:80cqw;display:flex;justify-content:space-between;color:#111}
.S .ln{position:absolute;left:0;right:0;top:50%;height:.4cqw;background:#111;transform-origin:0 50%;animation:K_ln 6s cubic-bezier(.6,0,.4,1) infinite both}
.S .nd{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.4cqw;width:0;animation:K_nd 6s infinite both;animation-delay:calc(var(--i)*var(--step))}
.S .yr{font-size:3.6cqw;font-family:var(--mono);font-weight:700;white-space:nowrap}
.S .dot{width:3cqw;height:3cqw;border-radius:50%;background:#111;border:.6cqw solid var(--bg);box-sizing:content-box}
.S .nd:last-child .dot{background:var(--ac);box-shadow:0 0 0 0 var(--ac);animation:K_pl 1.2s infinite}
.S .ev{font-size:3cqw;font-weight:500;white-space:nowrap}
@keyframes K_ln{0%{transform:scaleX(0)}55%,100%{transform:none}}
@keyframes K_nd{0%{opacity:0;transform:scale(.4)}6%,90%{opacity:1;transform:none}100%{opacity:0}}
@keyframes K_pl{70%{box-shadow:0 0 0 2cqw transparent}}`,
    html: /* @__PURE__ */ __name((w) => {
      const items = w.slice(0, 5);
      const step = (3.3 / Math.max(1, items.length - 1)).toFixed(2);
      return `<div class="tl"><div class="ln"></div>${items.map((t, i) => {
        const [y, e] = t.includes("\uFF5C") ? t.split("\uFF5C") : [t, ""];
        return `<div class="nd" style="--i:${i};--step:${step}s"><div class="yr">${esc(y)}</div><div class="dot"></div><div class="ev">${esc(e ?? "")}</div></div>`;
      }).join("")}</div>`;
    }, "html")
  },
  {
    id: "progress-bar",
    cat: "card",
    zh: "\u9032\u5EA6\u689D",
    en: "Progress Bar",
    desc: "\u9032\u5EA6\u689D\u586B\u6EFF\uFF0C\u767E\u5206\u6BD4\u540C\u6B65\u8DF3\u52D5",
    tags: ["\u6578\u64DA", "\u9032\u5EA6"],
    tone: "ink",
    sample: ["\u5DE5\u7A0B\u9032\u5EA6", "68%"],
    hint: "\u6A19\u984C / \u767E\u5206\u6BD4",
    motion: "\u6A19\u984C\u5728\u5DE6\u4E0A\u3001\u767E\u5206\u6BD4\u6578\u5B57\u5728\u53F3\u4E0A\uFF0C\u4E0B\u65B9\u7C97\u5713\u89D2\u9032\u5EA6\u689D\u7531 0 \u586B\u5230\u76EE\u6A19\u767E\u5206\u6BD4\uFF08\u4E3B\u8272\u3001\u5E36\u659C\u7D0B\u6D41\u52D5\uFF09\uFF0C\u767E\u5206\u6BD4\u6578\u5B57\u540C\u6B65\u8A08\u6578\uFF1B\u5230\u4F4D\u5F8C\u9032\u5EA6\u689D\u672B\u7AEF\u9583\u4E00\u4E0B\u5149\u3002",
    motionEn: "Title at top left, percentage at top right; below, a thick rounded progress bar fills from 0 to the target (accent color with moving diagonal stripes) while the number counts in sync; when it lands, the bar tip flashes.",
    css: `
.S .g{width:70cqw;display:flex;flex-direction:column;gap:2cqw}
.S .hd{display:flex;justify-content:space-between;align-items:baseline}
.S .ti{font-size:4.6cqw}.S .pc{font-size:8cqw;font-family:var(--mono);color:var(--ac);counter-reset:p var(--pv);--pv:0}
.S .pc::after{content:counter(p) '%'}
.S .pc{animation:K_c 4.5s cubic-bezier(.3,0,.2,1) infinite}
.S .tr{height:4cqw;border-radius:99px;background:color-mix(in srgb,var(--fg) 12%,transparent);overflow:hidden}
.S .fl{height:100%;width:var(--to);border-radius:99px;background:repeating-linear-gradient(-45deg,var(--ac) 0 1.5cqw,color-mix(in srgb,var(--ac) 75%,#fff) 1.5cqw 3cqw);background-size:4.24cqw 100%;transform-origin:0 50%;animation:K_f 4.5s cubic-bezier(.3,0,.2,1) infinite,K_s .6s linear infinite}
@property --pv{syntax:'<integer>';inherits:false;initial-value:0}
@keyframes K_c{0%{--pv:0}55%,90%{--pv:var(--target)}100%{--pv:0}}
@keyframes K_f{0%{transform:scaleX(0)}55%,90%{transform:none}100%{transform:scaleX(0)}}
@keyframes K_s{to{background-position:4.24cqw 0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [t, p] = pick(w, 2, ["\u5DE5\u7A0B\u9032\u5EA6", "68%"]);
      const v = Math.max(0, Math.min(100, parseInt(p, 10) || 0));
      return `<div class="g" style="--to:${v}%"><div class="hd"><div class="ti">${esc(t)}</div><div class="pc" style="--target:${v}"></div></div><div class="tr"><div class="fl"></div></div></div>`;
    }, "html")
  },
  {
    id: "ranking",
    cat: "card",
    zh: "\u6392\u884C\u699C",
    en: "Ranking Bars",
    desc: "\u9577\u689D\u4F9D\u5E8F\u9577\u51FA\u4F86\uFF0C\u7B2C\u4E00\u540D\u6700\u5F8C\u63ED\u66C9",
    tags: ["\u6BD4\u8F03", "TOP 3"],
    tone: "paper",
    sample: ["\u901A\u52E4\u6642\u9593\u6BD4\u8F03", "A \u793E\u5340\uFF5C35", "B \u793E\u5340\uFF5C28", "C \u793E\u5340\uFF5C18"],
    hint: "\u6A19\u984C + \u300C\u540D\u7A31\uFF5C\u6578\u503C\u300D3\u20135 \u500B",
    motion: "\u6A19\u984C\u5728\u4E0A\uFF0C\u6BCF\u5217\u5DE6\u5074\u540D\u7A31\u3001\u53F3\u5074\u6C34\u5E73\u9577\u689D\u7531 0 \u9577\u5230\u5C0D\u61C9\u6BD4\u4F8B\u4E26\u5728\u672B\u7AEF\u986F\u793A\u6578\u503C\uFF0C\u7531\u6700\u5F8C\u4E00\u540D\u5F80\u7B2C\u4E00\u540D\u4F9D\u5E8F\u63ED\u66C9\uFF0C\u7B2C\u4E00\u540D\u9577\u689D\u7528\u4E3B\u8272\u4E26\u5E36\u7687\u51A0\u5716\u793A\u5F48\u51FA\u3002",
    motionEn: "Title on top; each row has a name on the left and a horizontal bar growing from 0 to its proportional length with the value at its tip, revealed from last place up to first; the winner's bar is in the accent color and a crown icon pops in.",
    css: `
.S .g{width:76cqw;color:#111}
.S h3{margin:0 0 2.4cqw;font-size:4.6cqw}
.S .rw{display:grid;grid-template-columns:16cqw 1fr;align-items:center;gap:2cqw;margin:1.4cqw 0;font-size:3.4cqw;font-weight:700}
.S .br{height:5cqw;background:#111;border-radius:.8cqw;width:var(--w);transform-origin:0 50%;display:flex;align-items:center;justify-content:flex-end;padding-right:1.4cqw;color:#fff;font-family:var(--mono);animation:K_g 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--d)*.5s)}
.S .rw.top .br{background:var(--ac);color:#111}
.S .cr{margin-left:1cqw;animation:K_cr 6s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(var(--d)*.5s + .5s)}
@keyframes K_g{0%{transform:scaleX(0)}12%,90%{transform:none}100%{transform:scaleX(0)}}
@keyframes K_cr{0%{transform:scale(0) rotate(-30deg)}8%,88%{transform:none}96%,100%{transform:scale(0)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [title, ...rows] = w;
      const data = rows.slice(0, 5).map((r) => {
        const [n, v] = r.includes("\uFF5C") ? r.split("\uFF5C") : [r, "0"];
        return { n, v: parseFloat(v) || 0, raw: v };
      });
      const max = Math.max(...data.map((d) => d.v), 1);
      const order2 = [...data].sort((a, b) => a.v - b.v);
      return `<div class="g"><h3>${esc(title)}</h3>${data.map((d) => {
        const isTop = d === order2[order2.length - 1];
        return `<div class="rw${isTop ? " top" : ""}"><div>${esc(d.n)}</div><div style="display:flex;align-items:center"><div class="br" style="--w:${(d.v / max * 85).toFixed(1)}%;--d:${order2.indexOf(d)}">${esc(String(d.raw))}</div>${isTop ? `<span class="cr" style="--d:${order2.indexOf(d)}">\u{1F451}</span>` : ""}</div></div>`;
      }).join("")}</div>`;
    }, "html")
  },
  {
    id: "qa-card",
    cat: "card",
    zh: "\u554F\u7B54\u5361",
    en: "Q&A Card",
    desc: "Q \u5148\u4E1F\u51FA\u554F\u984C\uFF0C\u7FFB\u9762\u63ED\u66C9 A",
    tags: ["QA", "\u4E92\u52D5"],
    tone: "accent",
    sample: ["\u9810\u552E\u5C4B\u53EF\u4EE5\u6BBA\u50F9\u55CE\uFF1F", "\u53EF\u4EE5\uFF0C\u4F46\u8981\u770B\u6642\u6A5F"],
    hint: "\u554F\u984C / \u7B54\u6848",
    motion: "\u4E00\u5F35\u5927\u5361\u7247\u6B63\u9762\u662F\u9ED1\u8272\u5927\u5BEB\u300CQ\u300D\u8207\u554F\u984C\uFF0C\u505C\u7559 1.5 \u79D2\u5F8C\u5361\u7247\u7E5E Y \u8EF8 3D \u7FFB\u9762\uFF0C\u80CC\u9762\u662F\u767D\u5E95\u7684\u300CA\u300D\u8207\u7B54\u6848\uFF1B\u505C\u7559\u5F8C\u518D\u7FFB\u56DE\u4F86\u3002",
    motionEn: 'A large card shows a big black "Q" with the question on its front; after 1.5s it flips around the Y axis in 3D to reveal a white back with "A" and the answer; after a hold it flips back.',
    css: `
.S{perspective:120cqw}
.S .cd{position:relative;width:70cqw;height:34cqw;transform-style:preserve-3d;animation:K_f 6s cubic-bezier(.6,-0.2,.3,1.2) infinite}
.S .fc{position:absolute;inset:0;display:flex;align-items:center;gap:4cqw;padding:0 5cqw;border-radius:2.4cqw;background:#111;color:#fff;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 2cqw 5cqw #0004}
.S .fc+.fc{background:#fff;color:#111;transform:rotateY(180deg)}
.S .fc b{font-size:16cqw;font-family:var(--mono);color:var(--ac)}
.S .fc+.fc b{color:#111}
.S .fc span{font-size:5cqw;line-height:1.3}
@keyframes K_f{0%,30%{transform:rotateY(0)}42%,85%{transform:rotateY(180deg)}97%,100%{transform:rotateY(360deg)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [q, a] = pick(w, 2, ["\u9810\u552E\u5C4B\u53EF\u4EE5\u6BBA\u50F9\u55CE\uFF1F", "\u53EF\u4EE5\uFF0C\u4F46\u8981\u770B\u6642\u6A5F"]);
      return `<div class="cd"><div class="fc"><b>Q</b><span>${esc(q)}</span></div><div class="fc"><b>A</b><span>${esc(a)}</span></div></div>`;
    }, "html")
  }
];

// ../src/effects/kinetic.ts
var charsWithRandom = /* @__PURE__ */ __name((t) => Array.from(t).map(
  (ch, i) => `<span class="c" style="--i:${i};--rx:${((rand(i + 1) - 0.5) * 120).toFixed(1)}cqw;--ry:${((rand(i + 9) - 0.5) * 90).toFixed(1)}cqh;--rr:${((rand(i + 17) - 0.5) * 540).toFixed(0)}deg">${ch === " " ? "&nbsp;" : esc(ch)}</span>`
).join(""), "charsWithRandom");
var kinetic = [
  {
    id: "wave-text",
    cat: "kinetic",
    zh: "\u6CE2\u6D6A\u5B57",
    en: "Wave Text",
    desc: "\u6BCF\u500B\u5B57\u50CF\u6D77\u6D6A\u4E00\u6A23\u4E0A\u4E0B\u8D77\u4F0F",
    tags: ["\u8F15\u9B06", "\u590F\u5929"],
    tone: "accent",
    sample: ["\u4E00\u8D77\u53BB\u6D77\u908A"],
    hint: "3\u20138 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u4EE5\u6B63\u5F26\u6CE2\u7BC0\u594F\u4E0A\u4E0B\u8D77\u4F0F\uFF08\u4F4D\u79FB\u7D04\u5B57\u9AD8 25%\uFF09\uFF0C\u76F8\u9130\u5B57\u5EF6\u9072 0.1 \u79D2\u5F62\u6210\u9023\u7E8C\u6CE2\u6D6A\uFF0C\u6CE2\u5CF0\u7684\u5B57\u540C\u6642\u5FAE\u5FAE\u653E\u5927\u4E26\u8B8A\u6210\u767D\u8272\u3002",
    motionEn: "Each character bobs up and down on a sine rhythm (about 25% of glyph height), neighbors 0.1s apart forming a continuous wave; characters at the crest scale up slightly and turn white.",
    css: `
.S .t{font-size:11cqw;display:flex;color:#111}
.S .c{animation:K_w 1.6s ease-in-out infinite;animation-delay:calc(var(--i)*.1s)}
@keyframes K_w{0%,100%{transform:translateY(12%)}50%{transform:translateY(-12%) scale(1.08);color:#fff}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "bounce-in",
    cat: "kinetic",
    zh: "\u5F48\u8DF3\u5165\u5834",
    en: "Bounce In",
    desc: "\u5B57\u5F9E\u5929\u4E0A\u6389\u4E0B\u4F86\u5F48\u4E09\u4E0B",
    tags: ["\u53EF\u611B", "\u5152\u7AE5"],
    tone: "paper",
    sample: ["\u8E66\u8E66\u8DF3\u8DF3"],
    hint: "2\u20136 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u5F9E\u756B\u9762\u4E0A\u65B9\u6389\u843D\uFF0C\u843D\u5730\u5F8C\u4EE5\u7269\u7406\u611F\u7684\u5F48\u8DF3\uFF08\u7B2C\u4E00\u6B21\u5F48\u9AD8 30%\u3001\u7B2C\u4E8C\u6B21 10%\u3001\u7B2C\u4E09\u6B21 3%\uFF09\u505C\u4E0B\uFF0C\u5B57\u8207\u5B57\u9593\u9694 0.08 \u79D2\uFF1B\u505C\u7559\u5F8C\u4E00\u8D77\u5F80\u4E0A\u8DF3\u51FA\u756B\u9762\u3002",
    motionEn: "Each character falls from above and bounces with physical decay (30%, then 10%, then 3% height) before settling, 0.08s apart; after a hold they all leap up out of frame.",
    css: `
.S .t{font-size:13cqw;display:flex}
.S .c{animation:K_b 3.6s infinite both;animation-delay:calc(var(--i)*.08s)}
.S .c:nth-child(3n+1){color:var(--ac)}
@keyframes K_b{0%{transform:translateY(-60cqh);animation-timing-function:cubic-bezier(.5,0,1,.5)}12%{transform:none;animation-timing-function:cubic-bezier(0,.5,.5,1)}18%{transform:translateY(-30%);animation-timing-function:cubic-bezier(.5,0,1,.5)}24%{transform:none;animation-timing-function:cubic-bezier(0,.5,.5,1)}27%{transform:translateY(-10%);animation-timing-function:cubic-bezier(.5,0,1,.5)}30%{transform:none}32%{transform:translateY(-3%)}34%,82%{transform:none}92%,100%{transform:translateY(-60cqh)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "swing-sign",
    cat: "kinetic",
    zh: "\u540A\u724C\u6416\u64FA",
    en: "Hanging Swing",
    desc: "\u6BCF\u500B\u5B57\u50CF\u639B\u5728\u7DDA\u4E0A\u7684\u540A\u724C\u6643\u52D5",
    tags: ["\u5E97\u62DB", "\u53EF\u611B"],
    tone: "ink",
    sample: ["\u71DF\u696D\u4E2D"],
    hint: "2\u20135 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u653E\u5728\u4E00\u584A\u767D\u8272\u65B9\u5F62\u540A\u724C\u4E0A\uFF0C\u7528\u7D30\u7DDA\u639B\u5728\u756B\u9762\u4E0A\u65B9\u7684\u6A6B\u687F\uFF0C\u540A\u724C\u4EE5\u9802\u7AEF\u70BA\u8EF8\u5FC3\u5DE6\u53F3\u64FA\u76EA\u4E26\u9010\u6F38\u505C\u4E0B\uFF08\u963B\u5C3C\u64FA\u52D5\uFF09\uFF0C\u6BCF\u584A\u64FA\u52D5\u76F8\u4F4D\u4E0D\u540C\u3002",
    motionEn: "Each character sits on a white square tag hanging by a thin string from a top rail; tags swing from their top pivot and gradually settle (damped pendulum), each with a different phase.",
    css: `
.S{place-items:start center}
.S .rail{position:absolute;top:10%;left:15%;right:15%;height:.6cqw;background:var(--ac);border-radius:9px}
.S .row{display:flex;gap:3cqw;margin-top:calc(10cqh + .6cqw)}
.S .tag{display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;animation:K_s 4s ease-in-out infinite;animation-delay:calc(var(--i)*-.35s)}
.S .tag i{width:.25cqw;height:10cqh;background:#999}
.S .tag b{width:14cqw;height:14cqw;display:grid;place-items:center;background:#fff;color:#111;font-size:10cqw;border-radius:1.4cqw;box-shadow:0 1cqw 2cqw #0006}
@keyframes K_s{0%{transform:rotate(22deg)}12%{transform:rotate(-16deg)}24%{transform:rotate(11deg)}36%{transform:rotate(-7deg)}48%{transform:rotate(4deg)}60%{transform:rotate(-2deg)}72%,94%{transform:rotate(0)}100%{transform:rotate(22deg)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="rail"></div><div class="row">${Array.from(w[0]).map((ch, i) => `<div class="tag" style="--i:${i}"><i></i><b>${esc(ch)}</b></div>`).join("")}</div>`, "html")
  },
  {
    id: "gravity-fall",
    cat: "kinetic",
    zh: "\u91CD\u529B\u6389\u843D",
    en: "Gravity Drop",
    desc: "\u5B57\u7AD9\u4E0D\u7A69\uFF0C\u4E00\u500B\u500B\u7FFB\u5012\u6389\u4E0B\u53BB",
    tags: ["\u5D29\u6F70", "\u641E\u7B11"],
    tone: "paper",
    sample: ["\u5FC3\u614B\u5D29\u4E86"],
    hint: "2\u20136 \u5B57",
    motion: "\u6587\u5B57\u5148\u7AEF\u6B63\u7AD9\u597D\uFF0C\u63A5\u8457\u6BCF\u500B\u5B57\u96A8\u6A5F\u5EF6\u9072\u5F8C\u5931\u53BB\u652F\u6490\uFF0C\u5E36\u8457\u4E0D\u540C\u89D2\u5EA6\u7684\u65CB\u8F49\u52A0\u901F\u6389\u51FA\u756B\u9762\u4E0B\u65B9\uFF08\u91CD\u529B\u52A0\u901F\u5EA6\u66F2\u7DDA\uFF09\uFF1B\u5168\u90E8\u6389\u5149\u5F8C\u5F9E\u4E0A\u65B9\u91CD\u65B0\u843D\u4E0B\u6392\u597D\u3002",
    motionEn: "The text first stands neatly; then each character, after a random delay, loses support and accelerates down out of frame with a different spin (gravity easing); once all have fallen, they drop back in from above and line up again.",
    css: `
.S .t{font-size:13cqw;display:flex}
.S .c{animation:K_g 4s infinite both;animation-delay:calc(var(--i)*.13s)}
@keyframes K_g{0%{transform:translateY(-70cqh);animation-timing-function:cubic-bezier(.2,.8,.3,1.2)}12%,40%{transform:none;animation-timing-function:cubic-bezier(.6,0,1,.6)}45%{transform:rotate(calc(var(--rr)*.05))}75%,100%{transform:translateY(80cqh) rotate(var(--rr))}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${charsWithRandom(w[0])}</div>`, "html")
  },
  {
    id: "spin-in",
    cat: "kinetic",
    zh: "\u65CB\u8F49\u5165\u5834",
    en: "Spin In",
    desc: "\u5B57\u908A\u8F49\u908A\u653E\u5927\u9032\u5834",
    tags: ["\u6D3B\u6F51", "\u7247\u982D"],
    tone: "ink",
    sample: ["\u7CBE\u5F69\u56DE\u9867"],
    hint: "2\u20136 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u5F9E 0 \u500D\u3001\u65CB\u8F49 -180 \u5EA6\u7684\u72C0\u614B\uFF0C\u4EE5\u5E36\u56DE\u5F48\u7684\u66F2\u7DDA\u8F49\u6B63\u4E26\u653E\u5927\u5230 100%\uFF0C\u9593\u9694 0.07 \u79D2\uFF1B\u505C\u7559\u5F8C\u6BCF\u500B\u5B57\u53CD\u65B9\u5411\u65CB\u8F49\u7E2E\u5C0F\u6D88\u5931\u3002",
    motionEn: "Each character spins in from scale 0 at -180 degrees to upright 100% with an overshooting curve, 0.07s apart; after a hold each spins the other way and shrinks away.",
    css: `
.S .t{font-size:12cqw;display:flex}
.S .c{animation:K_s 3.4s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(var(--i)*.07s)}
.S .c:nth-child(2n){color:var(--ac)}
@keyframes K_s{0%{transform:scale(0) rotate(-180deg)}18%,80%{transform:none}95%,100%{transform:scale(0) rotate(180deg)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "jelly",
    cat: "kinetic",
    zh: "\u679C\u51CD\u6643\u52D5",
    en: "Jelly Wobble",
    desc: "\u6574\u6392\u5B57\u50CF\u679C\u51CD\u4E00\u6A23 Q \u5F48\u6643\u52D5",
    tags: ["\u53EF\u611B", "\u751C\u9EDE"],
    tone: "accent",
    sample: ["Q\u5F48"],
    hint: "1\u20134 \u5B57",
    motion: "\u6587\u5B57\u50CF\u679C\u51CD\u88AB\u6233\u4E00\u4E0B\uFF1A\u5FEB\u901F\u5730\u5728\u6C34\u5E73\u8207\u5782\u76F4\u65B9\u5411\u4EA4\u66FF\u4F38\u7E2E\uFF08scale 1.25/0.75 \u2192 0.85/1.15 \u2192 \u2026\uFF09\u9010\u6F38\u8870\u6E1B\u505C\u4E0B\uFF0C\u4F34\u96A8\u8F15\u5FAE\u50BE\u659C\uFF0C\u6BCF 2 \u79D2\u6233\u4E00\u6B21\u3002",
    motionEn: "The text wobbles like poked jelly: it alternately stretches horizontally and vertically (1.25/0.75 \u2192 0.85/1.15 \u2192 \u2026) with decaying amplitude and a slight skew, poked again every 2s.",
    css: `
.S .t{font-size:20cqw;color:#fff;-webkit-text-stroke:.5cqw #111;paint-order:stroke fill;animation:K_j 2s infinite;text-shadow:0 1cqw 0 #111}
@keyframes K_j{0%,60%,100%{transform:none}8%{transform:scale(1.25,.75)}16%{transform:scale(.85,1.15) skewX(-4deg)}24%{transform:scale(1.1,.9) skewX(3deg)}32%{transform:scale(.95,1.05)}40%{transform:scale(1.03,.97)}50%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "tracking-breathe",
    cat: "kinetic",
    zh: "\u5B57\u8DDD\u4F38\u5C55",
    en: "Tracking Expand",
    desc: "\u5B57\u8DDD\u6162\u6162\u62C9\u958B\uFF0C\u50CF\u5728\u6DF1\u547C\u5438",
    tags: ["\u6975\u7C21", "\u9AD8\u7D1A\u611F"],
    tone: "ink",
    sample: ["RESET"],
    hint: "\u82F1\u6587\u6548\u679C\u6700\u4F73",
    motion: "\u7D30\u9AD4\u6587\u5B57\u7684\u5B57\u8DDD\u5F9E\u7DCA\u5BC6\uFF08-0.05em\uFF09\u7DE9\u7DE9\u5C55\u958B\u5230\u5F88\u5BEC\uFF080.8em\uFF09\uFF0C\u540C\u6642\u900F\u660E\u5EA6\u7531 0 \u5230 1\u3001\u518D\u6536\u56DE\u4E26\u6DE1\u51FA\uFF0C\u7BC0\u594F\u7DE9\u6162\u512A\u96C5\uFF0C\u50CF\u54C1\u724C\u5F62\u8C61\u7247\u7684\u7247\u982D\u3002",
    motionEn: "Light-weight text slowly expands its tracking from tight (-0.05em) to very wide (0.8em) while fading from 0 to 1, then contracts and fades out; slow and elegant like a brand film opener.",
    css: `
.S .t{font-size:9cqw;font-weight:200;animation:K_t 5s cubic-bezier(.4,0,.2,1) infinite;white-space:nowrap}
@keyframes K_t{0%{letter-spacing:-.05em;opacity:0}45%{letter-spacing:.8em;opacity:1}75%{letter-spacing:.8em;opacity:1}100%{letter-spacing:1.2em;opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "scatter-gather",
    cat: "kinetic",
    zh: "\u6563\u958B\u805A\u5408",
    en: "Scatter & Gather",
    desc: "\u5B57\u5F9E\u56DB\u9762\u516B\u65B9\u98DB\u56DE\u4F86\u7D44\u597D",
    tags: ["\u96C6\u5408", "\u5718\u968A"],
    tone: "ink",
    sample: ["\u5718\u7D50\u529B\u91CF\u5927"],
    hint: "3\u20138 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u5F9E\u756B\u9762\u56DB\u5468\u7684\u96A8\u6A5F\u4F4D\u7F6E\u3001\u96A8\u6A5F\u65CB\u8F49\u89D2\u5EA6\u8207\u6A21\u7CCA\u72C0\u614B\uFF0C\u540C\u6642\u98DB\u5411\u4E2D\u592E\u6392\u6210\u4E00\u884C\uFF08\u5E36\u7DE9\u51FA\uFF09\uFF0C\u505C\u7559\u5F8C\u518D\u70B8\u958B\u56DE\u5230\u96A8\u6A5F\u4F4D\u7F6E\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Each character flies from a random off-center position, random rotation and blur into a single centered line (ease-out); after a hold they explode back out to random positions, looping.",
    css: `
.S .t{font-size:10cqw;display:flex}
.S .c{animation:K_s 4s cubic-bezier(.2,.8,.2,1) infinite both}
.S .c:nth-child(odd){color:var(--ac)}
@keyframes K_s{0%,8%{transform:translate(var(--rx),var(--ry)) rotate(var(--rr));filter:blur(.6cqw);opacity:0}40%,75%{transform:none;filter:none;opacity:1}100%{transform:translate(calc(var(--rx)*-1),calc(var(--ry)*-1)) rotate(var(--rr));opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${charsWithRandom(w[0])}</div>`, "html")
  },
  {
    id: "domino",
    cat: "kinetic",
    zh: "\u9AA8\u724C\u5012\u4E0B",
    en: "Domino Fall",
    desc: "\u5B57\u50CF\u9AA8\u724C\u4E00\u6A23\u4F9D\u5E8F\u5F80\u5F8C\u5012",
    tags: ["\u9023\u9396", "\u8F49\u5834"],
    tone: "paper",
    sample: ["\u9023\u9396\u53CD\u61C9"],
    hint: "3\u20136 \u5B57",
    motion: "\u6BCF\u500B\u5B57\u4EE5\u5E95\u90E8\u70BA\u8EF8\u5F80\u5F8C\uFF08\u6CBF X \u8EF8\uFF093D \u5012\u4E0B 90 \u5EA6\uFF0C\u5F9E\u7B2C\u4E00\u500B\u5B57\u958B\u59CB\u4F9D\u5E8F\u89F8\u767C\uFF0C\u50CF\u9AA8\u724C\u9023\u9396\uFF1B\u5168\u5012\u5F8C\u518D\u4F9D\u5E8F\u7AD9\u8D77\u4F86\u3002",
    motionEn: "Each character falls backward 90 degrees around its base (X axis, 3D), triggered in sequence from the first like toppling dominoes; once all are down they stand back up in order.",
    css: `
.S{perspective:60cqw}
.S .t{font-size:13cqw;display:flex;gap:.5cqw}
.S .c{transform-origin:50% 100%;animation:K_d 4s cubic-bezier(.6,0,.4,1) infinite;animation-delay:calc(var(--i)*.15s);background:var(--ac);color:#111;padding:0 1.2cqw;border-radius:.8cqw}
@keyframes K_d{0%,15%{transform:none}35%,60%{transform:rotateX(-88deg)}80%,100%{transform:none}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "heartbeat",
    cat: "kinetic",
    zh: "\u5FC3\u8DF3",
    en: "Heartbeat",
    desc: "\u64B2\u901A\u64B2\u901A\uFF0C\u8DF3\u5169\u4E0B\u505C\u4E00\u4E0B",
    tags: ["\u5FC3\u52D5", "\u544A\u767D"],
    tone: "accent",
    sample: ["\u5FC3\u52D5"],
    hint: "1\u20133 \u5B57",
    motion: "\u6587\u5B57\u50CF\u5FC3\u8DF3\u4E00\u6A23\u300C\u64B2\u901A\u3001\u64B2\u901A\u300D\u5FEB\u901F\u653E\u5927\u5169\u6B21\uFF081.2 \u500D\u30011.12 \u500D\uFF09\u5F8C\u4F11\u606F\uFF0C\u80CC\u5F8C\u540C\u6B65\u64F4\u6563\u4E00\u5708\u6DE1\u6DE1\u7684\u5149\u74B0\uFF0C\u7BC0\u594F\u7D04\u6BCF 1.3 \u79D2\u4E00\u6B21\u3002",
    motionEn: "The text beats like a heart, two quick swells (1.2x then 1.12x) followed by a rest, with a faint ring rippling out behind it in sync, about every 1.3s.",
    css: `
.S .ring{position:absolute;width:30cqw;height:30cqw;border-radius:50%;border:.6cqw solid #fff;animation:K_r 1.3s ease-out infinite}
.S .t{font-size:18cqw;color:#fff;animation:K_h 1.3s ease-in-out infinite}
@keyframes K_h{0%,40%,100%{transform:none}10%{transform:scale(1.2)}20%{transform:scale(1)}30%{transform:scale(1.12)}}
@keyframes K_r{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.2);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="ring"></div><div class="t">${esc(w[0])}</div>`, "html")
  }
];

// ../src/effects/texture.ts
var texture = [
  {
    id: "particle-form",
    cat: "texture",
    zh: "\u7C92\u5B50\u805A\u5408",
    en: "Particle Assemble",
    desc: "\u4E0A\u5343\u9846\u7C92\u5B50\u98DB\u4F86\u7D44\u6210\u6587\u5B57",
    tags: ["\u79D1\u6280", "\u7247\u982D"],
    tone: "ink",
    sample: ["\u5149\u5BD3"],
    hint: "1\u20134 \u5B57",
    motion: "\u756B\u9762\u4E2D\u6563\u843D\u4E0A\u5343\u9846\u4E3B\u8272\u8207\u767D\u8272\u5C0F\u7C92\u5B50\uFF0C\u5B83\u5011\u5F9E\u96A8\u6A5F\u4F4D\u7F6E\u4EE5\u7DE9\u51FA\u66F2\u7DDA\u98DB\u5411\u6587\u5B57\u8F2A\u5ED3\u7684\u53D6\u6A23\u9EDE\uFF0C\u805A\u5408\u6210\u6587\u5B57\uFF1B\u505C\u7559 1 \u79D2\u5F8C\u7C92\u5B50\u53D7\u5230\u7206\u70B8\u529B\u5411\u5916\u6563\u958B\uFF0C\u518D\u91CD\u65B0\u805A\u5408\uFF0C\u5FAA\u74B0\u3002",
    motionEn: "Thousands of small accent and white particles are scattered around the frame; they fly with ease-out from random positions to points sampled from the text shape, assembling the word; after a 1s hold an explosive force scatters them outward, then they reassemble, looping.",
    css: `.S canvas{width:100%;height:100%;display:block}`,
    html: /* @__PURE__ */ __name(() => `<canvas></canvas>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const cv = root.querySelector("canvas");
      const ctx = cv.getContext("2d");
      const ac = getComputedStyle(root).getPropertyValue("--ac").trim() || "#ff5a36";
      const dpr = Math.min(2, devicePixelRatio);
      const W2 = cv.width = Math.max(1, cv.clientWidth * dpr);
      const H2 = cv.height = Math.max(1, cv.clientHeight * dpr);
      const off = document.createElement("canvas");
      off.width = W2;
      off.height = H2;
      const oc = off.getContext("2d", { willReadFrequently: true });
      const len = Array.from(w[0]).length || 1;
      oc.font = `900 ${Math.min(H2 * 0.55, W2 * 0.8 / len)}px "Noto Sans TC", sans-serif`;
      oc.textAlign = "center";
      oc.textBaseline = "middle";
      oc.fillStyle = "#fff";
      oc.fillText(w[0], W2 / 2, H2 / 2);
      const d = oc.getImageData(0, 0, W2, H2).data;
      const gap = Math.max(3, Math.round(W2 / 260));
      const pts = [];
      for (let y = 0; y < H2; y += gap)
        for (let x = 0; x < W2; x += gap)
          if (d[(y * W2 + x) * 4 + 3] > 128)
            pts.push({ x, y, sx: Math.random() * W2, sy: Math.random() * H2, c: Math.random() > 0.35 ? ac : "#fff" });
      const r = gap * 0.42;
      let raf = 0;
      const t0 = performance.now();
      const ease = /* @__PURE__ */ __name((p) => 1 - Math.pow(1 - p, 4), "ease");
      const draw = /* @__PURE__ */ __name((now) => {
        raf = requestAnimationFrame(draw);
        const t = (now - t0) / 1e3 % 5;
        let p;
        if (t < 2) p = ease(t / 2);
        else if (t < 3.6) p = 1;
        else p = 1 - ease((t - 3.6) / 1.4);
        ctx.clearRect(0, 0, W2, H2);
        for (const q of pts) {
          const x = q.sx + (q.x - q.sx) * p;
          const y = q.sy + (q.y - q.sy) * p;
          ctx.fillStyle = q.c;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }, "draw");
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }, "run")
  },
  {
    id: "pixelate",
    cat: "texture",
    zh: "\u50CF\u7D20\u5316",
    en: "Pixelate Resolve",
    desc: "\u5F9E\u5927\u99AC\u8CFD\u514B\u6162\u6162\u8B8A\u6E05\u6670",
    tags: ["\u904A\u6232", "\u63ED\u66C9"],
    tone: "accent",
    sample: ["LEVEL UP"],
    hint: "\u82F1\u6587\u6216 2\u20136 \u5B57",
    motion: "\u6587\u5B57\u4E00\u958B\u59CB\u662F\u975E\u5E38\u7C97\u7684\u99AC\u8CFD\u514B\u65B9\u584A\uFF0C\u89E3\u6790\u5EA6\u4EE5\u968E\u68AF\u65B9\u5F0F\uFF0832\u219216\u21928\u21924\u21922\u21921 \u50CF\u7D20\uFF09\u9010\u6B65\u63D0\u9AD8\u5230\u5B8C\u5168\u6E05\u6670\uFF0C\u6BCF\u4E00\u968E\u7D04 0.25 \u79D2\uFF1B\u505C\u7559\u5F8C\u518D\u9010\u6B65\u99AC\u8CFD\u514B\u5316\u3002",
    motionEn: "The text starts as very coarse mosaic blocks and its resolution steps up (32\u219216\u21928\u21924\u21922\u21921 px) until fully sharp, about 0.25s per step; after a hold it steps back down into mosaic.",
    css: `.S canvas{width:100%;height:100%;display:block;image-rendering:pixelated}`,
    html: /* @__PURE__ */ __name(() => `<canvas></canvas>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const cv = root.querySelector("canvas");
      const ctx = cv.getContext("2d");
      const cs = getComputedStyle(root);
      const bg = cs.getPropertyValue("--bg").trim() || "#ff5a36";
      const W2 = cv.width = Math.max(1, cv.clientWidth);
      const H2 = cv.height = Math.max(1, cv.clientHeight);
      const src = document.createElement("canvas");
      src.width = W2;
      src.height = H2;
      const sc = src.getContext("2d");
      const len = Array.from(w[0]).length || 1;
      sc.fillStyle = bg;
      sc.fillRect(0, 0, W2, H2);
      sc.font = `900 ${Math.min(H2 * 0.4, W2 * 1.5 / len)}px "Noto Sans TC", sans-serif`;
      sc.textAlign = "center";
      sc.textBaseline = "middle";
      sc.fillStyle = "#111";
      sc.fillText(w[0], W2 / 2, H2 / 2);
      const steps = [48, 32, 20, 12, 8, 4, 2, 1, 1, 1, 1, 1, 2, 4, 8, 12, 20, 32, 48, 48];
      let k = 0;
      const small = document.createElement("canvas");
      const smc = small.getContext("2d");
      const tick = /* @__PURE__ */ __name(() => {
        const s = Math.max(1, Math.round(steps[k % steps.length] * W2 / 800));
        small.width = Math.max(1, Math.ceil(W2 / s));
        small.height = Math.max(1, Math.ceil(H2 / s));
        smc.drawImage(src, 0, 0, small.width, small.height);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W2, H2);
        ctx.drawImage(small, 0, 0, W2, H2);
        k++;
      }, "tick");
      tick();
      const t = window.setInterval(tick, 220);
      return () => clearInterval(t);
    }, "run")
  },
  {
    id: "shatter",
    cat: "texture",
    zh: "\u788E\u88C2",
    en: "Shatter",
    desc: "\u6587\u5B57\u50CF\u73BB\u7483\u788E\u6210\u597D\u5E7E\u7247\u98DB\u6563",
    tags: ["\u7834\u58DE", "\u8F49\u5834"],
    tone: "ink",
    sample: ["\u6253\u7834\u6846\u67B6"],
    hint: "2\u20136 \u5B57",
    motion: "\u5B8C\u6574\u7684\u6587\u5B57\u505C\u7559\u5F8C\u77AC\u9593\u788E\u6210 12 \u584A\u4E0D\u898F\u5247\u591A\u908A\u5F62\u788E\u7247\uFF0C\u6BCF\u7247\u671D\u4E0D\u540C\u65B9\u5411\u98DB\u6563\u4E26\u65CB\u8F49\u3001\u7E2E\u5C0F\u6DE1\u51FA\uFF08\u50CF\u73BB\u7483\u88AB\u64CA\u788E\uFF09\uFF1B\u63A5\u8457\u788E\u7247\u5012\u8F49\u98DB\u56DE\u62FC\u5408\u6210\u539F\u5B57\u3002",
    motionEn: "After holding, the text instantly shatters into 12 irregular polygonal shards that fly off in different directions, spinning, shrinking and fading like broken glass; then the shards rewind back together into the word.",
    css: `
.S .box{position:relative;font-size:13cqw}
.S .base{visibility:hidden}
.S .sh{position:absolute;inset:0;clip-path:var(--cp);animation:K_s 4s cubic-bezier(.2,.7,.3,1) infinite}
.S .sh:nth-child(3n){color:var(--ac)}
@keyframes K_s{0%,30%{transform:none;opacity:1;color:var(--fg)}31%{color:inherit}60%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(.7);opacity:0}70%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(.7);opacity:0;animation-timing-function:cubic-bezier(.6,0,.3,1)}95%,100%{transform:none;opacity:1}}`,
    html: /* @__PURE__ */ __name((w) => {
      const cols = 4;
      const rows = 3;
      const P = /* @__PURE__ */ __name((c, r) => {
        const edge = c === 0 || c === cols || r === 0 || r === rows;
        const jx = edge ? 0 : (rand(c * 7 + r * 13) - 0.5) * 14;
        const jy = edge ? 0 : (rand(c * 11 + r * 5) - 0.5) * 20;
        return [c / cols * 100 + jx, r / rows * 100 + jy];
      }, "P");
      let i = 0;
      const shards = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const pts = [P(c, r), P(c + 1, r), P(c + 1, r + 1), P(c, r + 1)].map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(",");
          const cx = (c + 0.5) / cols - 0.5;
          const cy = (r + 0.5) / rows - 0.5;
          shards.push(
            `<div class="sh" style="--cp:polygon(${pts});--dx:${(cx * 90 + (rand(i) - 0.5) * 20).toFixed(1)}cqw;--dy:${(cy * 90 + (rand(i + 5) - 0.5) * 20).toFixed(1)}cqh;--dr:${((rand(i + 9) - 0.5) * 300).toFixed(0)}deg">${esc(w[0])}</div>`
          );
          i++;
        }
      return `<div class="box"><div class="base">${esc(w[0])}</div>${shards.join("")}</div>`;
    }, "html")
  },
  {
    id: "smoke-away",
    cat: "texture",
    zh: "\u7159\u9727\u6D88\u6563",
    en: "Smoke Dissolve",
    desc: "\u6587\u5B57\u50CF\u7159\u4E00\u6A23\u4E00\u500B\u5B57\u4E00\u500B\u5B57\u98C4\u6563",
    tags: ["\u56DE\u61B6", "\u611F\u6027"],
    tone: "ink",
    sample: ["\u96A8\u98A8\u800C\u53BB"],
    hint: "2\u20136 \u5B57",
    motion: "\u6587\u5B57\u6E05\u695A\u505C\u7559\u5F8C\uFF0C\u5F9E\u7B2C\u4E00\u500B\u5B57\u958B\u59CB\u4F9D\u5E8F\u5316\u6210\u7159\u9727\uFF1A\u5F80\u53F3\u4E0A\u65B9\u98C4\u79FB\u3001\u653E\u5927\u3001\u5F37\u70C8\u6A21\u7CCA\u4E26\u6DE1\u51FA\uFF0C\u50CF\u88AB\u98A8\u5439\u6563\uFF1B\u5168\u90E8\u6D88\u6563\u5F8C\u518D\u5F9E\u6A21\u7CCA\u4E2D\u51DD\u805A\u56DE\u4F86\u3002",
    motionEn: "After a clear hold, characters turn to smoke one by one from the first: drifting up and to the right, enlarging, blurring heavily and fading as if blown away; once gone, they condense back out of the blur.",
    css: `
.S .t{font-size:11cqw;display:flex;font-family:var(--serif)}
.S .c{animation:K_s 5s ease-in-out infinite;animation-delay:calc(var(--i)*.15s)}
@keyframes K_s{0%{filter:blur(2cqw);opacity:0;transform:scale(1.4)}20%,45%{filter:none;opacity:1;transform:none}75%,100%{filter:blur(2.5cqw);opacity:0;transform:translate(8cqw,-10cqh) scale(1.8) rotate(12deg)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${chars(w[0])}</div>`, "html")
  },
  {
    id: "halftone",
    cat: "texture",
    zh: "\u7DB2\u9EDE",
    en: "Halftone Dots",
    desc: "\u6587\u5B57\u7531\u5927\u5C0F\u8B8A\u5316\u7684\u5370\u5237\u7DB2\u9EDE\u7D44\u6210",
    tags: ["\u666E\u666E\u98A8", "\u5370\u5237"],
    tone: "paper",
    sample: ["POP!"],
    hint: "\u82F1\u6587\u6216 1\u20134 \u5B57",
    motion: "\u6587\u5B57\u5167\u90E8\u7531\u4E3B\u8272\u5370\u5237\u7DB2\u9EDE\u586B\u6EFF\uFF08background-clip: text + radial-gradient \u7DB2\u9EDE\uFF09\uFF0C\u7DB2\u9EDE\u5927\u5C0F\u50CF\u547C\u5438\u4E00\u6A23\u653E\u5927\u7E2E\u5C0F\u4E26\u659C\u5411\u6D41\u52D5\uFF0C\u6587\u5B57\u5F8C\u65B9\u6709\u504F\u79FB\u7684\u9ED1\u8272\u786C\u9670\u5F71\uFF0C\u666E\u666E\u85DD\u8853\u98A8\u683C\u3002",
    motionEn: "The text is filled with accent-colored print halftone dots (background-clip text + radial-gradient dots); the dots breathe in size and drift diagonally, with an offset hard black shadow behind, in a pop-art style.",
    css: `
.S .w{position:relative;font-size:24cqw;isolation:isolate}
.S .w::before{content:attr(data-t);position:absolute;inset:0;color:#111;transform:translate(1.4cqw,1.4cqw);z-index:-1}
.S .w span{background:radial-gradient(circle,var(--ac) var(--hd),transparent calc(var(--hd) + .5px)) 0 0/1.6cqw 1.6cqw,#fff;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:.3cqw #111;animation:K_h 2.4s ease-in-out infinite}
@property --hd{syntax:'<percentage>';inherits:false;initial-value:30%}
@keyframes K_h{0%,100%{--hd:22%;background-position:0 0}50%{--hd:48%;background-position:1.6cqw 1.6cqw}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="w" data-t="${esc(w[0])}"><span>${esc(w[0])}</span></div>`, "html")
  },
  {
    id: "heat-distort",
    cat: "texture",
    zh: "\u6C34\u6CE2\u626D\u66F2",
    en: "Ripple Distortion",
    desc: "\u6587\u5B57\u50CF\u5728\u6C34\u9762\u6216\u71B1\u6C23\u5F8C\u9762\u626D\u52D5",
    tags: ["\u590F\u5929", "\u5922\u5883"],
    tone: "accent",
    sample: ["\u71B1\u6D6A\u4F86\u8972"],
    hint: "2\u20136 \u5B57",
    motion: "\u6587\u5B57\u88AB SVG \u4F4D\u79FB\u6FFE\u93E1\uFF08feTurbulence + feDisplacementMap\uFF09\u626D\u66F2\uFF0C\u566A\u8072\u983B\u7387\u6301\u7E8C\u7DE9\u6162\u8B8A\u5316\uFF0C\u8B93\u5B57\u50CF\u9694\u8457\u71B1\u6C23\u6216\u6C34\u9762\u822C\u6D41\u52D5\uFF1B\u626D\u66F2\u5F37\u5EA6\u9031\u671F\u6027\u589E\u5F37\u518D\u8DA8\u65BC\u5E73\u975C\u3002",
    motionEn: "The text is warped by an SVG displacement filter (feTurbulence + feDisplacementMap) whose noise frequency drifts continuously, making the letters ripple as if seen through heat haze or water; distortion strength periodically swells and calms.",
    css: `
.S .t{font-size:13cqw;color:#111;filter:url(#hdf)}`,
    html: /* @__PURE__ */ __name((w) => `<svg width="0" height="0" style="position:absolute"><filter id="hdf"><feTurbulence type="turbulence" baseFrequency="0.012 0.04" numOctaves="2" seed="3"><animate attributeName="baseFrequency" dur="6s" values="0.012 0.04;0.02 0.08;0.012 0.04" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="18"><animate attributeName="scale" dur="4s" values="4;28;4" repeatCount="indefinite"/></feDisplacementMap></filter></svg><div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "noise-dissolve",
    cat: "texture",
    zh: "\u9846\u7C92\u6EB6\u89E3",
    en: "Grain Dissolve",
    desc: "\u6587\u5B57\u88AB\u566A\u9EDE\u4FB5\u8755\u6210\u6C99\u7C92\u6D88\u5931",
    tags: ["\u8F49\u5834", "\u8CEA\u611F"],
    tone: "ink",
    sample: ["\u6D88\u5931"],
    hint: "1\u20134 \u5B57",
    motion: "\u6587\u5B57\u4EE5\u566A\u9EDE\u906E\u7F69\u9010\u6B65\u88AB\u4FB5\u8755\uFF1A\u7D30\u5C0F\u7684\u9846\u7C92\u5F9E\u908A\u7DE3\u958B\u59CB\u96A8\u6A5F\u6D88\u5931\uFF0C\u50CF\u6C99\u5B50\u88AB\u5439\u6563\uFF0C\u76F4\u5230\u5B8C\u5168\u6EB6\u89E3\uFF1B\u63A5\u8457\u53CD\u5411\uFF0C\u9846\u7C92\u91CD\u65B0\u805A\u5408\u56DE\u5B8C\u6574\u6587\u5B57\u3002",
    motionEn: "The text is eroded by a noise mask: fine grains vanish randomly starting at the edges like sand blowing away until fully dissolved; then it reverses and the grains reassemble into the full text.",
    css: `
.S .t{font-size:22cqw;color:var(--ac);filter:url(#ndf)}`,
    html: /* @__PURE__ */ __name((w) => `<svg width="0" height="0" style="position:absolute"><filter id="ndf" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1" result="a"/><feComponentTransfer in="a" result="m"><feFuncA type="linear" slope="8" intercept="-4"><animate attributeName="intercept" dur="4s" values="2;2;-8;-8;2" keyTimes="0;0.2;0.55;0.75;1" repeatCount="indefinite"/></feFuncA></feComponentTransfer><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></svg><div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "matrix-rain",
    cat: "texture",
    zh: "\u6578\u4F4D\u96E8",
    en: "Digital Rain",
    desc: "\u5B57\u5143\u5982\u96E8\u843D\u4E0B\uFF0C\u4E2D\u9593\u6D6E\u73FE\u95DC\u9375\u5B57",
    tags: ["\u99ED\u5BA2", "\u79D1\u6280"],
    tone: "ink",
    sample: ["\u7CFB\u7D71\u555F\u52D5"],
    hint: "2\u20136 \u5B57",
    motion: "\u6574\u500B\u756B\u9762\u6709\u591A\u6B04\u96A8\u6A5F\u5B57\u5143\uFF08\u7247\u5047\u540D\u3001\u6578\u5B57\u3001\u4E2D\u6587\uFF09\u4EE5\u4E0D\u540C\u901F\u5EA6\u5F80\u4E0B\u843D\uFF0C\u6BCF\u6B04\u6700\u524D\u7AEF\u6700\u4EAE\u3001\u5C3E\u5DF4\u6F38\u6697\uFF1B\u756B\u9762\u4E2D\u592E\u7684\u95DC\u9375\u5B57\u4EE5\u4E3B\u8272\u767C\u5149\u5927\u5B57\u6D6E\u73FE\u4E26\u4FDD\u6301\u3002",
    motionEn: "Columns of random glyphs (katakana, digits, CJK) rain down the frame at different speeds, each column brightest at its head and fading along its tail; the keyword glows large in the accent color at the center and stays.",
    css: `
.S canvas{position:absolute;inset:0;width:100%;height:100%}
.S .t{position:relative;font-size:11cqw;color:var(--ac);text-shadow:0 0 1.5cqw var(--ac),0 0 4cqw var(--ac);background:#000a;padding:1cqw 3cqw;animation:K_g 3s ease-in-out infinite}
@keyframes K_g{50%{text-shadow:0 0 .6cqw var(--ac),0 0 2cqw var(--ac)}}`,
    html: /* @__PURE__ */ __name((w) => `<canvas></canvas><div class="t">${esc(w[0])}</div>`, "html"),
    run: /* @__PURE__ */ __name((root) => {
      const cv = root.querySelector("canvas");
      const ctx = cv.getContext("2d");
      const ac = getComputedStyle(root).getPropertyValue("--ac").trim() || "#3f6";
      const W2 = cv.width = Math.max(1, cv.clientWidth);
      const H2 = cv.height = Math.max(1, cv.clientHeight);
      const fs = Math.max(8, Math.round(W2 / 40));
      const cols = Math.ceil(W2 / fs);
      const ys = Array.from({ length: cols }, () => Math.random() * -H2);
      const sp = Array.from({ length: cols }, () => 0.4 + Math.random() * 0.8);
      const glyphs = "\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD0123456789\u5149\u5BD3\u79D1\u6280\u52D5\u614B\u5B57\u5361";
      let raf = 0;
      let last = 0;
      const draw = /* @__PURE__ */ __name((ts) => {
        raf = requestAnimationFrame(draw);
        if (ts - last < 50) return;
        last = ts;
        ctx.fillStyle = "rgba(0,0,0,.12)";
        ctx.fillRect(0, 0, W2, H2);
        ctx.font = `${fs}px monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillStyle = "#fff";
          ctx.fillText(ch, i * fs, ys[i]);
          ctx.fillStyle = ac;
          ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fs, ys[i] - fs);
          ys[i] += fs * sp[i];
          if (ys[i] > H2 + fs * 4 && Math.random() > 0.95) ys[i] = 0;
        }
      }, "draw");
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }, "run")
  }
];

// ../src/effects/retro.ts
var retro = [
  {
    id: "vhs",
    cat: "retro",
    zh: "VHS \u9304\u5F71\u5E36",
    en: "VHS Tape",
    desc: "\u8272\u504F\u3001\u6383\u63CF\u7DDA\u548C\u8DF3\u52D5\u7684\u9304\u5F71\u5E36\u756B\u9762",
    tags: ["\u61F7\u820A", "\u56DE\u61B6"],
    tone: "ink",
    sample: ["1998 \u590F\u5929"],
    hint: "2\u20138 \u5B57",
    motion: "\u4EFF VHS \u9304\u5F71\u5E36\u756B\u9762\uFF1A\u6587\u5B57\u6709\u7D05\u85CD\u8272\u7248\u5206\u96E2\u3001\u5168\u756B\u9762\u6C34\u5E73\u6383\u63CF\u7DDA\u8207\u96DC\u8A0A\uFF0C\u5076\u723E\u6574\u500B\u756B\u9762\u4E0A\u4E0B\u8DF3\u52D5\u4E26\u51FA\u73FE\u4E00\u689D\u767D\u8272\u5E72\u64FE\u5E36\u7531\u4E0B\u5F80\u4E0A\u6383\u904E\uFF1B\u5DE6\u4E0A\u89D2\u986F\u793A\u300CPLAY \u25B6\u300D\uFF0C\u53F3\u4E0B\u89D2\u6709\u6642\u9593\u78BC\u3002",
    motionEn: 'A VHS tape look: text with red/blue channel separation, full-frame horizontal scanlines and noise; occasionally the picture jumps vertically and a white tracking band rolls up the screen; "PLAY \u25B6" at top left and a timecode at bottom right.',
    css: `
.S{background:#14121a}
.S .t{font-size:11cqw;color:#f4f1e8;text-shadow:-.5cqw 0 #ff2a6d,.5cqw 0 #05d9e8;animation:K_j 4s steps(1) infinite;letter-spacing:.04em}
.S .osd{position:absolute;font-family:var(--mono);font-size:3cqw;color:#fff;text-shadow:0 0 .4cqw #fff8;font-weight:700}
.S .p{left:5cqw;top:5cqh;animation:K_b 1.4s steps(1) infinite}.S .tc{right:5cqw;bottom:6cqh}
.S .sl{position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,#0005 2px 4px);pointer-events:none}
.S .bd{position:absolute;left:0;right:0;height:6cqh;background:linear-gradient(transparent,#fff3,#fff6,#fff3,transparent);filter:blur(1px);animation:K_bd 4s linear infinite}
@keyframes K_j{0%,30%,34%,70%,73%,100%{transform:none}31%{transform:translate(-1.5%,3%) skewX(8deg)}32%{transform:translate(1%,-2%)}71%{transform:translate(2%,0) skewX(-6deg)}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_bd{0%{top:110%}100%{top:-10%}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="t">${esc(w[0])}</div><div class="osd p">PLAY \u25B6</div><div class="osd tc">AM 12:00<br>SEP.14 1998</div><div class="sl"></div><div class="bd"></div>`, "html")
  },
  {
    id: "terminal",
    cat: "retro",
    zh: "\u7D42\u7AEF\u6A5F",
    en: "Terminal Boot",
    desc: "\u7DA0\u8272\u7B49\u5BEC\u5B57\u4E00\u884C\u884C\u8F38\u51FA",
    tags: ["\u5DE5\u7A0B\u5E2B", "\u79D1\u6280"],
    tone: "ink",
    sample: ["> init motion_atlas", "> loading effects... OK", "> \u6B61\u8FCE\u4F86\u5230\u5B57\u5361\u5716\u9451"],
    hint: "\u591A\u884C\u6307\u4EE4\u6216\u53E5\u5B50",
    motion: "\u9ED1\u5E95\u7DA0\u8272\uFF08\u6216\u4E3B\u8272\uFF09\u7B49\u5BEC\u5B57\u7684\u7D42\u7AEF\u6A5F\u756B\u9762\uFF0C\u6BCF\u884C\u4EE5\u6253\u5B57\u901F\u5EA6\u9010\u5B57\u8F38\u51FA\uFF0C\u884C\u9996\u6709\u300C>\u300D\u63D0\u793A\u7B26\uFF0C\u6700\u5F8C\u4E00\u884C\u5F8C\u65B9\u6709\u65B9\u584A\u6E38\u6A19\u9583\u720D\uFF1B\u756B\u9762\u5E36\u6709 CRT \u8F15\u5FAE\u5149\u6688\u8207\u6383\u63CF\u7DDA\u3002",
    motionEn: 'A terminal screen with green (or accent) monospace text on black; each line types out character by character after a ">" prompt, a block cursor blinking after the last line; subtle CRT glow and scanlines.',
    css: `
.S{place-items:center start;padding:0 7cqw;background:#050805}
.S .scr{font-family:var(--mono);font-size:3.6cqw;color:var(--ac);text-shadow:0 0 .6cqw var(--ac);line-height:1.6;font-weight:500;white-space:pre-wrap}
.S .cur{display:inline-block;width:.6em;height:1em;background:var(--ac);vertical-align:-.15em;animation:K_b 1s steps(1) infinite}
.S::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,#0004 2px 3px);pointer-events:none}
@keyframes K_b{50%{opacity:0}}`,
    html: /* @__PURE__ */ __name(() => `<div class="scr"><span class="out"></span><span class="cur"></span></div>`, "html"),
    run: /* @__PURE__ */ __name((root, w) => {
      const out = root.querySelector(".out");
      let alive = true;
      let t = 0;
      let line = 0;
      let i = 0;
      let text = "";
      const tick = /* @__PURE__ */ __name(() => {
        if (!alive) return;
        if (line >= w.length) {
          t = window.setTimeout(() => {
            text = "";
            line = 0;
            i = 0;
            out.textContent = "";
            tick();
          }, 1800);
          return;
        }
        const s = Array.from(w[line]);
        if (i < s.length) {
          text += s[i++];
          out.textContent = text;
          t = window.setTimeout(tick, 45 + Math.random() * 50);
        } else {
          text += "\n";
          line++;
          i = 0;
          t = window.setTimeout(tick, 350);
        }
      }, "tick");
      tick();
      return () => {
        alive = false;
        clearTimeout(t);
      };
    }, "run")
  },
  {
    id: "crt-power",
    cat: "retro",
    zh: "\u6620\u50CF\u7BA1\u958B\u95DC",
    en: "CRT Power",
    desc: "\u8001\u96FB\u8996\u958B\u6A5F\u4E00\u689D\u7DDA\u5C55\u958B\u3001\u95DC\u6A5F\u7E2E\u6210\u4E00\u9EDE",
    tags: ["\u61F7\u820A", "\u8F49\u5834"],
    tone: "ink",
    sample: ["\u983B\u9053\u958B\u64AD"],
    hint: "2\u20136 \u5B57",
    motion: "\u8001\u5F0F\u6620\u50CF\u7BA1\u96FB\u8996\u958B\u6A5F\uFF1A\u5148\u5728\u4E2D\u592E\u51FA\u73FE\u4E00\u689D\u767C\u4EAE\u7684\u6C34\u5E73\u7D30\u7DDA\uFF0C\u518D\u5782\u76F4\u5C55\u958B\u6210\u5B8C\u6574\u756B\u9762\uFF08\u6587\u5B57\u5E36\u5149\u6688\u8207\u6383\u63CF\u7DDA\uFF09\uFF1B\u505C\u7559\u5F8C\u95DC\u6A5F\uFF0C\u756B\u9762\u58D3\u6210\u4E00\u689D\u7DDA\u518D\u7E2E\u6210\u4E00\u500B\u4EAE\u9EDE\u6D88\u5931\u3002",
    motionEn: "An old CRT TV powering on: a bright horizontal line appears at the center, then expands vertically into the full picture (text with glow and scanlines); after a hold it powers off, collapsing to a line and then a fading dot.",
    css: `
.S{background:#000}
.S .scr{position:absolute;inset:6%;border-radius:4cqw/6cqw;background:radial-gradient(ellipse,#1b2b3a,#081018);display:grid;place-items:center;overflow:hidden;animation:K_p 5s infinite both}
.S .scr::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,#0006 2px 4px)}
.S .t{font-size:11cqw;color:#e8f6ff;text-shadow:0 0 1cqw #9df,0 0 3cqw #5af}
@keyframes K_p{0%{transform:scale(0,.004);filter:brightness(4)}6%{transform:scale(1,.004);filter:brightness(4)}14%{transform:none;filter:brightness(1.6)}20%,78%{transform:none;filter:none}86%{transform:scale(1,.004);filter:brightness(4)}92%{transform:scale(.004,.004);filter:brightness(6)}100%{transform:scale(0,0)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="scr"><div class="t">${esc(w[0])}</div></div>`, "html")
  },
  {
    id: "newspaper-spin",
    cat: "retro",
    zh: "\u5831\u7D19\u65CB\u8F49",
    en: "Newspaper Spin",
    desc: "\u8001\u96FB\u5F71\u7684\u5831\u7D19\u982D\u689D\u8F49\u8457\u98DB\u5230\u773C\u524D",
    tags: ["\u982D\u689D", "\u641E\u7B11"],
    tone: "ink",
    sample: ["\u865F\u5916\uFF01", "\u672C\u9031\u65B0\u6848\u958B\u7BB1"],
    hint: "\u982D\u689D / \u526F\u6A19",
    motion: "\u4E00\u5F35\u820A\u5831\u7D19\u5F9E\u756B\u9762\u4E2D\u5FC3\u4EE5\u5FEB\u901F\u65CB\u8F49\uFF08\u8F49 4 \u5708\uFF09\u7531\u6975\u5C0F\u653E\u5927\u5230\u586B\u6EFF\u756B\u9762\u4E2D\u592E\u5F8C\u7A81\u7136\u505C\u4F4F\uFF0C\u5831\u7D19\u4E0A\u6709\u7C97\u9AD4\u5927\u6A19\u8207\u526F\u6A19\u3001\u6B04\u4F4D\u7DDA\u8207\u6CDB\u9EC3\u7D19\u8CEA\uFF1B\u505C\u4F4F\u77AC\u9593\u756B\u9762\u5FAE\u9707\u3002",
    motionEn: "An old newspaper spins rapidly (4 turns) from a tiny point at the center up to fill the middle of the frame, then stops dead; it has a bold headline, subhead, column rules and yellowed paper; the frame jolts at the stop.",
    css: `
.S{background:radial-gradient(#333,#000)}
.S .np{width:64cqw;padding:3cqw 4cqw;background:#efe6d0;color:#1a1a1a;box-shadow:0 2cqw 6cqw #000a;font-family:var(--serif);animation:K_s 4.6s cubic-bezier(.3,0,.2,1) infinite both}
.S .mh{display:flex;justify-content:space-between;border-bottom:.5cqw double #1a1a1a;font-size:2cqw;padding-bottom:.6cqw;font-family:var(--mono)}
.S h2{font-size:10cqw;margin:1.4cqw 0;line-height:1}
.S h3{font-size:3.6cqw;margin:0 0 1.4cqw;font-weight:700}
.S .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:1.4cqw}
.S .cols i{height:1cqw;background:#1a1a1a33;display:block;margin:.6cqw 0}
@keyframes K_s{0%{transform:scale(0) rotate(0)}40%{transform:scale(1) rotate(1440deg)}42%{transform:scale(1.03) rotate(1442deg)}45%,85%{transform:scale(1) rotate(1440deg)}100%{transform:scale(0) rotate(1440deg);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="np"><div class="mh"><span>THE DAILY MOTION</span><span>No.40</span></div><h2>${esc(w[0])}</h2><h3>${esc(w[1] ?? "")}</h3><div class="cols">${"<div><i></i><i></i><i></i></div>".repeat(3)}</div></div>`, "html")
  },
  {
    id: "old-film",
    cat: "retro",
    zh: "\u8001\u96FB\u5F71",
    en: "Old Film",
    desc: "\u6CDB\u9EC3\u3001\u522E\u75D5\u3001\u9583\u720D\u7684\u9ED8\u7247\u5B57\u5361",
    tags: ["\u61F7\u820A", "\u9ED8\u7247"],
    tone: "ink",
    sample: ["\u7B2C\u4E00\u5E55", "\u7537\u5B50\u8E0F\u4E0A\u770B\u5C4B\u4E4B\u8DEF"],
    hint: "\u6A19\u984C / \u8AAA\u660E",
    motion: "\u9ED8\u7247\u5B57\u5361\uFF1A\u6DF1\u8910\u8272\u80CC\u666F\u3001\u88DD\u98FE\u908A\u6846\u5167\u7F6E\u4E2D\u767D\u8272\u896F\u7DDA\u5B57\uFF0C\u6574\u500B\u756B\u9762\u6301\u7E8C\u4EAE\u5EA6\u9583\u720D\u3001\u96A8\u6A5F\u51FA\u73FE\u5782\u76F4\u522E\u75D5\u8207\u9846\u7C92\uFF0C\u756B\u9762\u5076\u723E\u8F15\u5FAE\u4E0A\u4E0B\u8DF3\u683C\u3002",
    motionEn: "A silent-film title card: dark sepia background, centered white serif text inside an ornamental border; the whole frame flickers in brightness, random vertical scratches and grain appear, and the picture occasionally jitters vertically.",
    css: `
.S{background:radial-gradient(ellipse,#4a3a2a,#1a120a);animation:K_f .15s steps(2) infinite,K_j 3s steps(1) infinite;filter:sepia(.6)}
.S .fr{border:.4cqw double #e8dcc4;outline:.2cqw solid #e8dcc4;outline-offset:1.2cqw;padding:4cqw 7cqw;text-align:center;color:#f2e8d2;font-family:var(--serif)}
.S h2{font-size:8cqw;margin:0 0 1.6cqw;letter-spacing:.2em}
.S p{font-size:3.6cqw;margin:0;font-weight:500}
.S .sc{position:absolute;top:0;bottom:0;width:1px;background:#fff9;animation:K_sc .9s steps(1) infinite}
.S .gr{position:absolute;inset:-50%;background:radial-gradient(circle,#fff2 .5px,transparent 1px) 0 0/6px 6px;animation:K_g .3s steps(3) infinite;mix-blend-mode:overlay}
@keyframes K_f{50%{filter:sepia(.6) brightness(1.15)}}
@keyframes K_j{0%,48%,52%,100%{transform:none}50%{transform:translateY(1.2%)}}
@keyframes K_sc{0%{left:22%;opacity:1}30%{left:71%;opacity:.5}60%{left:40%;opacity:0}80%{left:84%;opacity:.8}}
@keyframes K_g{33%{transform:translate(3px,-5px)}66%{transform:translate(-4px,2px)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="fr"><h2>${esc(w[0])}</h2><p>${esc(w[1] ?? "")}</p></div><i class="sc"></i><i class="gr"></i>`, "html")
  },
  {
    id: "synthwave",
    cat: "retro",
    zh: "80 \u5E74\u4EE3\u9713\u8679",
    en: "Synthwave",
    desc: "\u5915\u967D\u3001\u7DB2\u683C\u5730\u677F\u8207\u934D\u927B\u5B57",
    tags: ["80s", "\u96FB\u5B50"],
    tone: "ink",
    sample: ["NEON CITY"],
    hint: "\u82F1\u6587\u6548\u679C\u6700\u4F73",
    motion: "80 \u5E74\u4EE3\u5408\u6210\u6CE2\u98A8\u683C\uFF1A\u7D2B\u8272\u6F38\u5C64\u5929\u7A7A\u8207\u689D\u7D0B\u5915\u967D\uFF0C\u5730\u9762\u662F\u5411\u9060\u65B9\u5EF6\u4F38\u4E26\u6301\u7E8C\u5F80\u524D\u6EFE\u52D5\u7684\u6D0B\u7D05\u8272\u900F\u8996\u7DB2\u683C\uFF0C\u6587\u5B57\u70BA\u4E0A\u85CD\u4E0B\u6A58\u7684\u934D\u927B\u6F38\u5C64\u4E26\u5E36\u767D\u8272\u9AD8\u5149\u908A\uFF0C\u8F15\u5FAE\u4E0A\u4E0B\u6F02\u6D6E\u3002",
    motionEn: "80s synthwave: a purple gradient sky with a striped sunset, a magenta perspective grid floor scrolling toward the viewer, and chrome text with a blue-to-orange gradient and white highlight edge, gently floating.",
    css: `
.S{background:linear-gradient(#12002b,#3b0a5c 45%,#ff2e88 60%,#12002b 60.2%)}
.S .sun{position:absolute;width:34cqw;height:34cqw;border-radius:50%;top:calc(60% - 30cqw);background:linear-gradient(#ffe259,#ff2e88);-webkit-mask:linear-gradient(#000 55%,transparent 55% 60%,#000 60% 68%,transparent 68% 72%,#000 72% 79%,transparent 79% 84%,#000 84%);mask:linear-gradient(#000 55%,transparent 55% 60%,#000 60% 68%,transparent 68% 72%,#000 72% 79%,transparent 79% 84%,#000 84%)}
.S .floor{position:absolute;left:-50%;right:-50%;top:60%;height:80%;transform:perspective(20cqh) rotateX(60deg);transform-origin:50% 0;background:linear-gradient(90deg,#ff2e88 2px,transparent 2px) 0 0/6cqw 6cqw,linear-gradient(#ff2e88 2px,transparent 2px) 0 0/6cqw 6cqw;animation:K_f 1s linear infinite}
.S .t{position:relative;top:-6%;font-size:11cqw;font-style:italic;background:linear-gradient(#a8f0ff,#3b8dff 50%,#1a0f40 51%,#ff9a3c 75%,#fff2a8);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:.15cqw #fff;filter:drop-shadow(0 0 1.5cqw #ff2e88);animation:K_fl 3s ease-in-out infinite}
@keyframes K_f{to{background-position:0 6cqw}}
@keyframes K_fl{50%{transform:translateY(-3%)}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="sun"></div><div class="floor"></div><div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "pixel-game",
    cat: "retro",
    zh: "\u50CF\u7D20\u904A\u6232",
    en: "8-bit Game",
    desc: "\u7D05\u767D\u6A5F\u98A8\u683C\u7684\u50CF\u7D20\u5B57\u8207\u9583\u720D\u63D0\u793A",
    tags: ["\u904A\u6232", "\u53EF\u611B"],
    tone: "ink",
    sample: ["GAME START", "PRESS ANY KEY"],
    hint: "\u82F1\u6587\u6548\u679C\u6700\u4F73",
    motion: "8-bit \u904A\u6232\u6A19\u984C\u756B\u9762\uFF1A\u4E3B\u6A19\u984C\u4EE5\u968E\u68AF\u52D5\u756B\uFF08steps\uFF09\u5F9E\u4E0A\u65B9\u4E00\u683C\u4E00\u683C\u6389\u4E0B\u4E26\u5F48\u8DF3\uFF0C\u5B57\u5E36\u50CF\u7D20\u5316\u786C\u9670\u5F71\uFF1B\u4E0B\u65B9\u63D0\u793A\u6587\u5B57\u4EE5 0.5 \u79D2\u9593\u9694\u9583\u720D\uFF0C\u80CC\u666F\u6709\u50CF\u7D20\u661F\u661F\u9583\u52D5\u3002",
    motionEn: "8-bit game title screen: the main title drops from above in stepped (steps()) motion and bounces, with a hard pixel drop shadow; the prompt below blinks at 0.5s intervals, and pixel stars twinkle in the background.",
    css: `
.S{background:#10102a}
.S .g{display:flex;flex-direction:column;align-items:center;gap:6cqh}
.S .t{font-family:var(--mono);font-size:8cqw;font-weight:700;color:var(--ac);text-shadow:.6cqw .6cqw 0 #e0315b,1.2cqw 1.2cqw 0 #000;animation:K_d 3s steps(8) infinite both;letter-spacing:.06em}
.S .p{font-family:var(--mono);font-size:3cqw;color:#fff;animation:K_b 1s steps(1) infinite}
.S .st{position:absolute;width:.8cqw;height:.8cqw;background:#fff;animation:K_tw 1.2s steps(1) infinite}
@keyframes K_d{0%{transform:translateY(-60cqh)}30%{transform:none}36%{transform:translateY(-6%)}42%,100%{transform:none}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_tw{50%{opacity:.2}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="g"><div class="t">${esc(w[0])}</div><div class="p">${esc(w[1] ?? "PRESS ANY KEY")}</div></div>${[
      [8, 12],
      [86, 18],
      [20, 80],
      [74, 72],
      [52, 8],
      [92, 88]
    ].map(([x, y], i) => `<i class="st" style="left:${x}%;top:${y}%;animation-delay:${i * 0.2}s"></i>`).join("")}`, "html")
  }
];

// ../src/engine.ts
var FONT_LINK = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+TC:wght@200;300;400;500;700;900&family=Noto+Serif+TC:wght@500;900&display=swap";
var BASE_FX_CSS = `.fx{position:absolute;inset:0;overflow:hidden;display:grid;place-items:center;background:var(--bg);color:var(--fg);font-family:var(--sans);font-weight:900;line-height:1;--u:min(1cqw,1.7778cqh);-webkit-font-smoothing:antialiased}
.fx .c{display:inline-block;white-space:pre}
.fx *{box-sizing:border-box}`;
var scopeCss = /* @__PURE__ */ __name((fx) => fx.css.replace(/\.S\b/g, `.fx-${fx.id}`).replace(/\bK_/g, `k_${fx.id.replace(/-/g, "_")}_`), "scopeCss");
var toneVars = /* @__PURE__ */ __name((p, tone) => {
  if (tone === "ink") return { bg: p.ink, fg: p.paper, ac: p.accent, ac2: p.accent2 };
  if (tone === "paper") return { bg: p.paper, fg: p.ink, ac: p.accent, ac2: p.accent2 };
  return { bg: p.accent, fg: p.ink, ac: p.paper, ac2: p.accent2 };
}, "toneVars");
var varsCss = /* @__PURE__ */ __name((v) => `--bg:${v.bg};--fg:${v.fg};--ac:${v.ac};--ac2:${v.ac2};--hl:${v.ac2};--mu:color-mix(in srgb,${v.fg} 30%,transparent);--sans:"Noto Sans TC",system-ui,sans-serif;--serif:"Noto Serif TC",serif;--mono:"JetBrains Mono",ui-monospace,monospace`, "varsCss");
var loopSeconds = /* @__PURE__ */ __name((fx) => {
  const m = fx.css.match(/animation:[^;]*?(\d+(?:\.\d+)?)s/);
  return m ? parseFloat(m[1]) : fx.run ? 4 : 4;
}, "loopSeconds");
var fnSource = /* @__PURE__ */ __name((f) => {
  const s = f.toString();
  const names = [...new Set(s.match(/\b__name\d*\b/g) ?? [])];
  return names.length ? `(()=>{const ${names.map((n) => `${n}=(f)=>f`).join(",")};return (${s})})()` : `(${s})`;
}, "fnSource");

// ../src/mapkit.ts
var RATIO_PX = { "9:16": [1080, 1920], "16:9": [1920, 1080], "1:1": [1080, 1080] };
var TYPE_NAME = {
  tag: "\u6A19\u984C\u7C64",
  road: "\u9053\u8DEF\u6A19\u7C64",
  site: "\u57FA\u5730\u6846",
  label: "\u57FA\u5730\u6A19\u7C64",
  pin: "\u5B9A\u4F4D\u91DD",
  info: "\u8CC7\u8A0A\u5361",
  stat: "\u6578\u64DA\u5361",
  compass: "\u6307\u5317\u91DD",
  text: "\u6587\u5B57"
};
var YELLOW = "#f2c14e";
var uid = 0;
var newId = /* @__PURE__ */ __name(() => `e${Date.now().toString(36)}${(uid++).toString(36)}`, "newId");
var makeEl = /* @__PURE__ */ __name((type, at = {}) => {
  const base2 = {
    tag: { x: 0.06, y: 0.07, size: 1, text: "\u5340\u57DF\uFF5C\u6848\u540D", color: "#1c1c1c", fg: "#ffffff", alpha: 0.88 },
    road: { x: 0.5, y: 0.3, size: 1, text: "\u67D0\u67D0\u8DEF", variant: "dark" },
    site: { x: 0.5, y: 0.42, size: 1, color: YELLOW, alpha: 0.28, pts: [[0.3, 0.37], [0.7, 0.37], [0.7, 0.49], [0.3, 0.49]] },
    label: { x: 0.5, y: 0.43, size: 1, text: "\u67D0\u67D0 \u57FA\u5730", color: YELLOW, fg: "#1c1c1c" },
    pin: { x: 0.58, y: 0.45, size: 1, color: "#f07a3f" },
    info: { x: 0.5, y: 0.66, size: 1, color: YELLOW, alpha: 0.8, lines: ["*\u5730\u4E0A 30 \u5C64", "A\u3001B \u5169\u68DF \u96D9\u5854", "*SRC \u92FC\u9AA8\u7D50\u69CB"] },
    stat: { x: 0.5, y: 0.67, size: 1, color: YELLOW, alpha: 0.95, text: "\u6848\u540D", fg: "\u8DEF\u540D \xD7 \u8DEF\u540D", lines: ["\u5730\u4E0A|27|\u5C64|", "\u5168\u6848|283|\u6236|", "\u6BCF\u5C64|11\u201312|\u6236|4 \u90E8\u96FB\u68AF"] },
    compass: { x: 0.9, y: 0.12, size: 1 },
    text: { x: 0.5, y: 0.84, size: 1, text: "\u5B57\u5E55\u6587\u5B57", color: "#ffffff", fg: "#111111", vertical: true }
  };
  return { id: newId(), type, x: 0.5, y: 0.5, size: 1, delay: 0, ...base2[type], ...at };
}, "makeEl");
var mapRenderer = /* @__PURE__ */ __name(() => {
  const FONT = '"Noto Sans TC", "PingFang TC", sans-serif';
  const YELLOW2 = "#f2c14e";
  const clamp = /* @__PURE__ */ __name((p) => Math.max(0, Math.min(1, p)), "clamp");
  const ease = /* @__PURE__ */ __name((p) => 1 - Math.pow(1 - clamp(p), 3), "ease");
  const back = /* @__PURE__ */ __name((p) => {
    const q = clamp(p) - 1;
    return 1 + 2.6 * q * q * q + 1.6 * q * q;
  }, "back");
  const pill = /* @__PURE__ */ __name((ctx, cx, cy, text, fs, bg, fg, bgAlpha = 1, padX = 0.6, dot) => {
    ctx.font = `900 ${fs}px ${FONT}`;
    const tw = ctx.measureText(text).width;
    const dotW = dot ? fs * 0.95 : 0;
    const w = tw + fs * padX * 2 + dotW;
    const h = fs * 1.62;
    ctx.save();
    ctx.globalAlpha *= bgAlpha;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.restore();
    if (dot) {
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(cx - w / 2 + fs * padX + fs * 0.3, cy, fs * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx + dotW / 2, cy + fs * 0.04);
    return [w, h];
  }, "pill");
  const countText = /* @__PURE__ */ __name((target, p) => {
    const m = target.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!m || p >= 1) return target;
    const n = parseFloat(m[2]);
    const dec = (m[2].split(".")[1] || "").length;
    return m[1] + (n * ease(p)).toFixed(dec) + m[3];
  }, "countText");
  const drawEl = /* @__PURE__ */ __name((ctx, W2, H2, el, t) => {
    const u = Math.min(W2, H2) / 1080 * el.size;
    const lt = t - el.delay;
    const X = el.x * W2;
    const Y = el.y * H2;
    const p = clamp(lt / 0.5);
    let box = [X - 10, Y - 10, X + 10, Y + 10];
    if (lt < 0) {
      ctx.save();
      ctx.globalAlpha = 0;
    } else ctx.save();
    switch (el.type) {
      case "tag": {
        ctx.globalAlpha *= ease(p);
        ctx.translate((1 - ease(p)) * -40 * u, 0);
        const fs = 46 * u;
        ctx.font = `900 ${fs}px ${FONT}`;
        const w = ctx.measureText(el.text ?? "").width + fs * 2.15;
        const [, h] = pill(ctx, X + w / 2, Y, el.text ?? "", fs, el.color ?? "#1c1c1c", el.fg ?? "#fff", el.alpha ?? 0.88, 0.6, YELLOW2);
        box = [X, Y - h / 2, X + w, Y + h / 2];
        break;
      }
      case "road": {
        const s = back(p);
        ctx.globalAlpha *= clamp(lt / 0.15);
        ctx.translate(X, Y);
        if (el.vertical) ctx.rotate(Math.PI / 2);
        ctx.scale(s, s);
        const dark = el.variant !== "light";
        const [w, h] = pill(ctx, 0, 0, el.text ?? "", 40 * u, dark ? "#1c1c1c" : "#ffffff", dark ? "#ffffff" : "#1c1c1c", dark ? 0.86 : 0.95, 0.55);
        box = el.vertical ? [X - h / 2, Y - w / 2, X + h / 2, Y + w / 2] : [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
        break;
      }
      case "site": {
        const pts = (el.pts ?? []).map(([a, b]) => [a * W2, b * H2]);
        if (pts.length < 3) break;
        const path = new Path2D();
        pts.forEach(([a, b], i) => i ? path.lineTo(a, b) : path.moveTo(a, b));
        path.closePath();
        let len = 0;
        pts.forEach((q, i) => {
          const r = pts[(i + 1) % pts.length];
          len += Math.hypot(r[0] - q[0], r[1] - q[1]);
        });
        const draw = clamp(lt / 0.9);
        ctx.save();
        ctx.globalAlpha *= (el.alpha ?? 0.28) * ease((lt - 0.7) / 0.4);
        ctx.fillStyle = el.color ?? YELLOW2;
        ctx.fill(path);
        ctx.restore();
        ctx.strokeStyle = el.color ?? YELLOW2;
        ctx.lineWidth = 9 * u;
        ctx.lineJoin = "round";
        ctx.setLineDash([len * ease(draw), len + 1]);
        ctx.stroke(path);
        ctx.setLineDash([]);
        const xs = pts.map((q) => q[0]);
        const ys = pts.map((q) => q[1]);
        box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        break;
      }
      case "label": {
        const s = back(p);
        ctx.globalAlpha *= clamp(lt / 0.15);
        ctx.translate(X, Y);
        ctx.scale(s, s);
        const [w, h] = pill(ctx, 0, 0, el.text ?? "", 50 * u, el.color ?? YELLOW2, el.fg ?? "#1c1c1c", 1, 0.75);
        box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
        break;
      }
      case "pin": {
        const fall = clamp(lt / 0.55);
        const dy = (1 - back(fall)) * -260 * u;
        ctx.globalAlpha *= clamp(lt / 0.12);
        const r = 34 * u;
        ctx.fillStyle = "#00000040";
        ctx.beginPath();
        ctx.ellipse(X, Y, r * 0.55 * ease(fall), r * 0.18 * ease(fall), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(X, Y + dy);
        ctx.fillStyle = el.color ?? "#f07a3f";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-r * 0.35, -r * 0.6, -r, -r * 1.05, -r, -r * 1.75);
        ctx.arc(0, -r * 1.75, r, Math.PI, 0);
        ctx.bezierCurveTo(r, -r * 1.05, r * 0.35, -r * 0.6, 0, 0);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, -r * 1.75, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        box = [X - r, Y - r * 2.8, X + r, Y + 6];
        break;
      }
      case "info": {
        const lines = el.lines ?? [];
        const fs = 64 * u;
        ctx.font = `900 ${fs}px ${FONT}`;
        const tw = Math.max(...lines.map((l) => ctx.measureText(l.replace(/^\*/, "")).width), 100);
        const w = tw + fs * 1.6;
        const h = lines.length * fs * 1.32 + fs * 0.9;
        const e = ease(p);
        ctx.globalAlpha *= e;
        ctx.translate(0, (1 - e) * 50 * u);
        ctx.save();
        ctx.globalAlpha *= el.alpha ?? 0.8;
        ctx.fillStyle = "#1b1c20";
        ctx.beginPath();
        ctx.roundRect(X - w / 2, Y - h / 2, w, h, 22 * u);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = el.color ?? YELLOW2;
        ctx.fillRect(X - w / 2 + fs * 0.32, Y - h / 2 + fs * 0.4, 9 * u, h - fs * 0.8);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        lines.forEach((l, i) => {
          const le = ease((lt - 0.2 - i * 0.15) / 0.4);
          ctx.save();
          ctx.globalAlpha *= le;
          ctx.fillStyle = l.startsWith("*") ? el.color ?? YELLOW2 : "#ffffff";
          ctx.fillText(l.replace(/^\*/, ""), X + fs * 0.1, Y - h / 2 + fs * 0.45 + fs * 1.32 * (i + 0.5) + (1 - le) * 12 * u);
          ctx.restore();
        });
        box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
        break;
      }
      case "stat": {
        const items = (el.lines ?? []).map((l) => l.split("|"));
        const n = Math.max(1, items.length);
        const w = Math.min(W2 * 0.94, 980 * u);
        const h = 380 * u;
        const e = ease(p);
        ctx.globalAlpha *= e;
        ctx.translate(0, (1 - e) * 60 * u);
        ctx.save();
        ctx.globalAlpha *= el.alpha ?? 0.95;
        ctx.fillStyle = "#16263d";
        ctx.beginPath();
        ctx.roundRect(X - w / 2, Y - h / 2, w, h, 30 * u);
        ctx.fill();
        ctx.restore();
        const left = X - w / 2 + 48 * u;
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.font = `900 ${76 * u}px ${FONT}`;
        ctx.fillStyle = "#ffffff";
        const title = el.text ?? "";
        ctx.fillText(title, left, Y - h / 2 + 108 * u);
        const ttw = ctx.measureText(title).width;
        ctx.fillStyle = el.color ?? YELLOW2;
        ctx.fillRect(left, Y - h / 2 + 122 * u, ttw * ease((lt - 0.3) / 0.5), 7 * u);
        ctx.font = `700 ${40 * u}px ${FONT}`;
        ctx.fillStyle = "#8fa7c4";
        ctx.fillText(el.fg ?? "", left + ttw + 36 * u, Y - h / 2 + 104 * u);
        const colW = (w - 96 * u) / n;
        items.forEach(([label, value, unit, note], i) => {
          const cx = left + colW * i;
          const ip = clamp((lt - 0.35 - i * 0.12) / 1);
          ctx.font = `700 ${38 * u}px ${FONT}`;
          ctx.fillStyle = "#8fa7c4";
          ctx.fillText(label ?? "", cx, Y - h / 2 + 205 * u);
          ctx.font = `900 ${100 * u}px ${FONT}`;
          ctx.fillStyle = el.color ?? YELLOW2;
          const v = countText(value ?? "", ip);
          ctx.fillText(v, cx, Y - h / 2 + 310 * u);
          const vw = ctx.measureText(v).width;
          ctx.font = `700 ${40 * u}px ${FONT}`;
          ctx.fillStyle = "#ffffff";
          ctx.fillText(unit ?? "", cx + vw + 8 * u, Y - h / 2 + 310 * u);
          if (note) {
            ctx.font = `700 ${34 * u}px ${FONT}`;
            ctx.fillStyle = "#8fa7c4";
            ctx.fillText(note, cx, Y - h / 2 + 352 * u);
          }
        });
        box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
        break;
      }
      case "compass": {
        const r = 44 * u;
        ctx.globalAlpha *= ease(p);
        ctx.translate(X, Y);
        ctx.rotate((1 - ease(p)) * -1.2);
        ctx.fillStyle = "#1c1c1cdd";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(0.6);
        ctx.fillStyle = "#e5484d";
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.78);
        ctx.lineTo(r * 0.24, 0);
        ctx.lineTo(-r * 0.24, 0);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, r * 0.78);
        ctx.lineTo(r * 0.24, 0);
        ctx.lineTo(-r * 0.24, 0);
        ctx.fill();
        ctx.rotate(-0.6);
        ctx.font = `900 ${30 * u}px ${FONT}`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("N", r * 0.95, -r * 0.95);
        box = [X - r, Y - r * 1.4, X + r * 1.4, Y + r];
        break;
      }
      case "text": {
        const fs = 56 * u;
        ctx.globalAlpha *= ease(p);
        ctx.font = `900 ${fs}px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = (el.text ?? "").split("\n");
        const lh = fs * 1.25;
        let tw = 0;
        lines.forEach((l, i) => {
          const yy = Y + (i - (lines.length - 1) / 2) * lh;
          if (el.vertical) {
            ctx.lineJoin = "round";
            ctx.lineWidth = fs * 0.22;
            ctx.strokeStyle = el.fg ?? "#111";
            ctx.strokeText(l, X, yy);
          }
          ctx.fillStyle = el.color ?? "#fff";
          ctx.fillText(l, X, yy);
          tw = Math.max(tw, ctx.measureText(l).width);
        });
        box = [X - tw / 2, Y - lines.length * lh / 2, X + tw / 2, Y + lines.length * lh / 2];
        break;
      }
    }
    ctx.restore();
    return box;
  }, "drawEl");
  const drawScene2 = /* @__PURE__ */ __name((ctx, W2, H2, sc, t, bg) => {
    ctx.clearRect(0, 0, W2, H2);
    if (bg) {
      const s = Math.max(W2 / bg.width, H2 / bg.height) * sc.bgZoom;
      const dw = bg.width * s;
      const dh = bg.height * s;
      ctx.drawImage(bg, (W2 - dw) * sc.bgX, (H2 - dh) * sc.bgY, dw, dh);
      if (sc.bgDim > 0) {
        ctx.fillStyle = `rgba(0,0,0,${sc.bgDim})`;
        ctx.fillRect(0, 0, W2, H2);
      }
    }
    const boxes = /* @__PURE__ */ new Map();
    for (const el of sc.els) boxes.set(el.id, drawEl(ctx, W2, H2, el, t));
    return boxes;
  }, "drawScene");
  return { drawScene: drawScene2 };
}, "mapRenderer");
var { drawScene } = mapRenderer();
globalThis.MA_MAP = { drawScene };
var TEMPLATES = [
  {
    name: "\u9CE5\u77B0\u57FA\u5730",
    scene: /* @__PURE__ */ __name(() => ({
      ratio: "9:16",
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0.1,
      els: [
        makeEl("tag", { role: "tag", x: 0.04, y: 0.075, text: "\u5340\u57DF\uFF5C\u6848\u540D", delay: 0 }),
        makeEl("text", { role: "legend", x: 0.27, y: 0.135, text: "\u7D05\u7DDA\uFF1A\u5730\u7C4D\u754C\u7DDA", vertical: true, delay: 0.2, size: 0.62 }),
        makeEl("compass", { role: "compass", x: 0.9, y: 0.12, delay: 0.2 }),
        makeEl("site", { role: "site", pts: [[0.29, 0.38], [0.71, 0.39], [0.69, 0.5], [0.29, 0.49]], delay: 0.4 }),
        makeEl("label", { role: "siteLabel", x: 0.5, y: 0.44, text: "\u67D0\u67D0 \u57FA\u5730", delay: 1.2 }),
        makeEl("road", { role: "road", x: 0.5, y: 0.375, text: "\u67D0\u67D0\u8857", delay: 1.4 }),
        makeEl("road", { role: "road", x: 0.5, y: 0.51, text: "\u67D0\u67D0\u8DEF", delay: 1.5 }),
        makeEl("road", { role: "road", x: 0.2, y: 0.44, text: "\u67D0\u67D0\u4E00\u8DEF", vertical: true, delay: 1.6 }),
        makeEl("road", { role: "road", x: 0.75, y: 0.45, text: "\u67D0\u67D0\u4E8C\u8DEF", vertical: true, delay: 1.7 }),
        makeEl("info", { role: "info", y: 0.67, delay: 2 }),
        makeEl("text", { role: "subtitle", x: 0.5, y: 0.82, text: "\u5B57\u5E55\u653E\u9019\u88E1", vertical: true, delay: 2.4 }),
        makeEl("text", { role: "credit", x: 0.5, y: 0.88, text: "\u5E95\u5716\uFF1A\u5167\u653F\u90E8\u570B\u571F\u6E2C\u7E6A\u4E2D\u5FC3 \u6B63\u5C04\u5F71\u50CF", color: "#ffffffcc", vertical: false, size: 0.42, delay: 0 }),
        makeEl("text", { role: "handle", x: 0.5, y: 0.92, text: "\u6301\u5BB6\u7537\u5B50KC / @kch0263", vertical: true, size: 0.62, delay: 0 })
      ]
    }), "scene")
  },
  {
    name: "\u8857\u9053\u5716\u57FA\u5730",
    scene: /* @__PURE__ */ __name(() => ({
      ratio: "9:16",
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0,
      els: [
        makeEl("tag", { role: "tag", x: 0.03, y: 0.08, text: "\u6848\u540D\uFF5C\u5340\u57DF \u8DEF\u540D", delay: 0 }),
        makeEl("road", { role: "road", x: 0.2, y: 0.26, text: "\u67D0\u67D0\u6771\u8DEF", variant: "light", delay: 0.3 }),
        makeEl("road", { role: "road", x: 0.73, y: 0.44, text: "\u67D0\u67D0\u8DEF", variant: "light", delay: 0.4 }),
        makeEl("site", { role: "site", pts: [[0.5, 0.38], [0.69, 0.37], [0.63, 0.42], [0.5, 0.42]], color: "#f07a3f", alpha: 0.25, delay: 0.6 }),
        makeEl("pin", { role: "pin", x: 0.58, y: 0.4, delay: 1.2 }),
        makeEl("label", { role: "siteLabel", x: 0.35, y: 0.395, text: "\u57FA\u5730\u7BC4\u570D\u793A\u610F", color: "#f07a3f", fg: "#ffffff", size: 0.8, delay: 1.5 }),
        makeEl("stat", { role: "stat", y: 0.6, delay: 1.9 }),
        makeEl("text", { role: "subtitle", x: 0.5, y: 0.74, text: "\u5B57\u5E55\u653E\u9019\u88E1", vertical: true, delay: 2.4 }),
        makeEl("text", { role: "credit", x: 0.5, y: 0.8, text: "\u5E95\u5716\uFF1A\u5167\u653F\u90E8\u570B\u571F\u6E2C\u7E6A\u4E2D\u5FC3 \u96FB\u5B50\u5730\u5716", color: "#333333", vertical: false, size: 0.42, delay: 0 })
      ]
    }), "scene")
  },
  { name: "\u7A7A\u767D", scene: /* @__PURE__ */ __name(() => ({ ratio: "9:16", loop: 6, bgZoom: 1, bgX: 0.5, bgY: 0.5, bgDim: 0, els: [] }), "scene") }
];
var buildMapScene = /* @__PURE__ */ __name((a) => {
  const tpl = a.template === "street" ? TEMPLATES[1] : a.template === "blank" ? TEMPLATES[2] : TEMPLATES[0];
  const sc = tpl.scene();
  if (a.ratio && a.ratio in RATIO_PX) sc.ratio = a.ratio;
  if (a.duration) sc.loop = Math.max(2, Math.min(20, a.duration));
  if (a.bg_url) sc.bgUrl = String(a.bg_url).slice(0, 2e3);
  if (typeof a.bg_dim === "number") sc.bgDim = Math.max(0, Math.min(0.7, a.bg_dim));
  const byRole = /* @__PURE__ */ __name((r) => sc.els.filter((e) => e.role === r), "byRole");
  const setText = /* @__PURE__ */ __name((r, v) => {
    if (v === void 0) return;
    if (!v) sc.els = sc.els.filter((e) => e.role !== r);
    else byRole(r).forEach((e) => e.text = v);
  }, "setText");
  setText("tag", a.tag);
  setText("legend", a.legend);
  setText("siteLabel", a.site_label);
  setText("subtitle", a.subtitle);
  setText("credit", a.credit);
  setText("handle", a.handle);
  if (a.site_color) byRole("site").concat(byRole("siteLabel")).forEach((e) => e.color = a.site_color);
  if (a.info_lines) {
    const info = byRole("info")[0] ?? (sc.els.push(makeEl("info", { role: "info", delay: 2 })), byRole("info")[0]);
    info.lines = a.info_lines.slice(0, 6);
  }
  if (a.stat) {
    const st = byRole("stat")[0] ?? (sc.els.push(makeEl("stat", { role: "stat", delay: 2 })), byRole("stat")[0]);
    if (a.stat.title !== void 0) st.text = a.stat.title;
    if (a.stat.subtitle !== void 0) st.fg = a.stat.subtitle;
    if (a.stat.items) st.lines = a.stat.items.slice(0, 4);
  }
  if (a.roads) {
    const old = byRole("road");
    const firstIdx = sc.els.findIndex((e) => e.role === "road");
    sc.els = sc.els.filter((e) => e.role !== "road");
    const site = byRole("site")[0]?.pts ?? [[0.3, 0.38], [0.7, 0.38], [0.7, 0.5], [0.3, 0.5]];
    const xs = site.map((p) => p[0]);
    const ys = site.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const auto = [
      { x: (x0 + x1) / 2, y: y0 - 0.012, vertical: false },
      { x: (x0 + x1) / 2, y: y1 + 0.012, vertical: false },
      { x: x0 - 0.07, y: (y0 + y1) / 2, vertical: true },
      { x: x1 + 0.07, y: (y0 + y1) / 2, vertical: true }
    ];
    const made = a.roads.slice(0, 8).map((r, i) => {
      const pos2 = auto[i % 4];
      return makeEl("road", {
        role: "road",
        text: r.text,
        x: r.x ?? pos2.x,
        y: r.y ?? pos2.y,
        vertical: r.vertical ?? pos2.vertical,
        variant: r.light ?? old[0]?.variant === "light" ? "light" : "dark",
        delay: 1.4 + i * 0.1
      });
    });
    sc.els.splice(firstIdx >= 0 ? firstIdx : sc.els.length, 0, ...made);
  }
  for (const e of a.elements ?? []) {
    if (!e.type || !(e.type in TYPE_NAME)) continue;
    sc.els.push(makeEl(e.type, { ...e, id: void 0 }));
    sc.els[sc.els.length - 1].id = newId();
  }
  return sc;
}, "buildMapScene");

// ../src/effects/map.ts
var MAP_GLOBALS = `window.MA_MAP=${fnSource(mapRenderer)}();`;
var sceneFromWords = /* @__PURE__ */ __name((w) => {
  const j = w.find((x) => String(x).trim().startsWith("{"));
  if (j) {
    try {
      return JSON.parse(j);
    } catch {
    }
  }
  return buildMapScene({ tag: w[0] && !w[0].startsWith("{") ? w[0] : void 0 });
}, "sceneFromWords");
var W = 1600;
var H = 900;
var MAP_CSS = `
.S{--land:color-mix(in srgb,var(--bg) 93%,var(--fg));--rd:color-mix(in srgb,var(--bg) 84%,var(--fg));--rd2:color-mix(in srgb,var(--bg) 72%,var(--fg));--water:color-mix(in srgb,#4f9fe0 38%,var(--bg));--park:color-mix(in srgb,#5fbf6a 24%,var(--bg));--chip:var(--fg);--chipT:var(--bg)}
.S svg.map{position:absolute;inset:0;width:100%;height:100%;font-family:var(--sans);font-weight:900}
.S .land{fill:var(--land)}.S .pk{fill:var(--park)}.S .rv{fill:none;stroke:var(--water);stroke-width:64;stroke-linecap:round}
.S .rd{stroke:var(--rd);stroke-width:5}.S .rd2{fill:none;stroke:var(--rd2);stroke-width:16;stroke-linecap:round}
.S .chip rect{fill:var(--chip)}.S .chip text{fill:var(--chipT);dominant-baseline:central;text-anchor:middle}
.S .chip.ac rect{fill:var(--ac)}.S .chip.ac text{fill:#111}
.S .pin path{fill:var(--ac)}.S .pin circle{fill:#fff}
.S .fb{transform-box:fill-box;transform-origin:center}`;
var base = /* @__PURE__ */ __name((dim = false) => {
  const grid = [
    ...range(26).map((i) => `<line class="rd" x1="${-500 + i * 100}" y1="-500" x2="${-500 + i * 100}" y2="1400"/>`),
    ...range(20).map((i) => `<line class="rd" x1="-500" y1="${-500 + i * 100}" x2="2100" y2="${-500 + i * 100}"/>`)
  ].join("");
  const parks = [
    [180, 140, 220, 150],
    [1120, 600, 260, 170],
    [620, 90, 150, 120],
    [1380, 90, 170, 200]
  ].map(([x, y, w, h]) => `<rect class="pk" x="${x}" y="${y}" width="${w}" height="${h}" rx="26"/>`).join("");
  return `<g${dim ? ' opacity=".55"' : ""}><rect class="land" width="${W}" height="${H}"/>${parks}<g transform="rotate(-12 800 450)">${grid}</g>
<path class="rv" d="M-60 660 C 300 560, 520 790, 840 720 S 1320 520, 1700 610"/>
<path class="rd2" d="M-40 420 L1640 300"/><path class="rd2" d="M520 -40 L640 940"/><path class="rd2" d="M1080 -40 C 1020 300, 1180 600, 1130 940"/><path class="rd2" d="M-40 860 L760 120"/></g>`;
}, "base");
var textW = /* @__PURE__ */ __name((s, fs) => Array.from(s).reduce((a, ch) => a + (/[⺀-￿]/.test(ch) ? fs : fs * 0.6), 0), "textW");
var chip = /* @__PURE__ */ __name((x, y, text, size = 34, cls = "", extra = "") => {
  const fs = Math.round(size * 1.3);
  const w = textW(text, fs) + fs * 1.1;
  const h = fs * 1.7;
  return `<g transform="translate(${x} ${y})"><g class="chip fb ${cls}"${extra}><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}"/><text font-size="${fs}">${esc(text)}</text></g></g>`;
}, "chip");
var PIN = `<g transform="scale(1.6)"><path d="M0 0 C-12-20-36-36-36-62 A36 36 0 1 1 36-62 C36-36 12-20 0 0Z"/><circle cy="-62" r="14"/></g>`;
var svg = /* @__PURE__ */ __name((inner) => `<svg class="map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`, "svg");
var EMOJI = [
  [/學|校|幼/, "\u{1F3EB}"],
  [/公園|綠|河濱/, "\u{1F333}"],
  [/超市|量販|賣場|市場/, "\u{1F6D2}"],
  [/捷運|車站|火車|高鐵|機場捷運/, "\u{1F687}"],
  [/醫|診/, "\u{1F3E5}"],
  [/餐|食|美食/, "\u{1F35C}"],
  [/銀行|郵局/, "\u{1F3E6}"],
  [/公車|轉運/, "\u{1F68C}"],
  [/商場|百貨|商圈/, "\u{1F6CD}\uFE0F"],
  [/運動|球場|健身/, "\u{1F3C0}"]
];
var emojiFor = /* @__PURE__ */ __name((s) => EMOJI.find(([r]) => r.test(s))?.[1] ?? "\u{1F4CD}", "emojiFor");
var split = /* @__PURE__ */ __name((s) => s.includes("\uFF5C") ? s.split("\uFF5C") : s.includes("|") ? s.split("|") : [s, ""], "split");
var map = [
  {
    id: "map-overlay",
    cat: "map",
    zh: "\u5730\u5716\u758A\u52A0\u5834\u666F",
    en: "Map Overlay Scene",
    desc: "\u57FA\u5730\u6846\u3001\u8DEF\u540D\u3001\u8CC7\u8A0A\u5361\u4F9D\u5E8F\u9032\u5834\uFF0C\u53EF\u63DB\u6210\u81EA\u5DF1\u7684\u5E95\u5716",
    tags: ["\u5EFA\u6848", "\u5340\u4F4D", "Shorts"],
    tone: "paper",
    sample: [],
    hint: "\u5728\u5730\u5716\u5DE5\u4F5C\u5BA4\u7DE8\u8F2F\u5F8C\u52A0\u5165 Combo\uFF1B\u6216\u7531 AI \u900F\u904E MCP \u7684 build_map_scene \u7522\u751F",
    motion: "\u5728\u5730\u5716\u5E95\u5716\u4E0A\u4F9D\u5E8F\u9032\u5834\uFF1A\u5DE6\u4E0A\u6DF1\u8272\u81A0\u56CA\u6A19\u984C\u7C64\uFF08\u542B\u9EC3\u9EDE\uFF09\u6ED1\u5165\u3001\u6307\u5317\u91DD\u65CB\u8F49\u51FA\u73FE\u3001\u9EC3\u8272\u7C97\u6846\u6CBF\u57FA\u5730\u908A\u754C\u63CF\u7E6A\u5F8C\u586B\u5165\u534A\u900F\u660E\u9EC3\u8272\u3001\u9EC3\u5E95\u9ED1\u5B57\u57FA\u5730\u6A19\u7C64\u5F48\u51FA\u3001\u6DF1\u8272\u81A0\u56CA\u9053\u8DEF\u540D\u4F9D\u5E8F\u5F48\u51FA\uFF08\u5357\u5317\u5411\u9053\u8DEF\u76F4\u6392\uFF09\u3001\u4E0B\u65B9\u6DF1\u8272\u534A\u900F\u660E\u8CC7\u8A0A\u5361\u5E36\u5DE6\u5074\u9EC3\u689D\u7531\u4E0B\u6ED1\u5165\u3001\u6587\u5B57\u9EC3\u767D\u4EA4\u932F\u9010\u884C\u51FA\u73FE\uFF1B\u5168\u90E8\u786C\u908A\uFF0C\u4E0D\u4F7F\u7528\u9670\u5F71\u6216\u6A21\u7CCA\u3002",
    motionEn: "Elements enter over a map base in sequence: a dark pill title tag with a yellow dot slides in at top left, a compass spins in, a thick yellow outline traces the site boundary then fills with translucent yellow, a yellow site label pops, dark pill street names pop one by one (north\u2013south streets set vertically), and a translucent dark info card with a yellow side bar slides up as alternating yellow and white lines appear; all hard-edged, with no shadows or blur.",
    css: `${MAP_CSS}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: /* @__PURE__ */ __name((w) => `${svg(base(true))}<canvas data-scene="${esc(JSON.stringify(sceneFromWords(w)))}"></canvas>`, "html"),
    globals: MAP_GLOBALS,
    run: /* @__PURE__ */ __name((root) => {
      const R = globalThis.MA_MAP;
      const cv = root.querySelector("canvas");
      const ctx = cv.getContext("2d");
      let sc;
      try {
        sc = JSON.parse(cv.dataset.scene || "{}");
      } catch {
        return;
      }
      let img;
      if (sc.bgUrl) {
        const im = new Image();
        im.onload = () => img = im;
        im.src = sc.bgUrl;
      }
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W2 = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
      const H2 = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
      const t0 = performance.now();
      const loop2 = Math.max(2, sc.loop || 6) + 1.5;
      let raf = 0;
      const f = /* @__PURE__ */ __name((now) => {
        raf = requestAnimationFrame(f);
        R.drawScene(ctx, W2, H2, sc, (now - t0) / 1e3 % loop2, img);
      }, "f");
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    }, "run")
  },
  {
    id: "map-pin-drop",
    cat: "map",
    zh: "\u5730\u5716\u5B9A\u4F4D",
    en: "Map Pin Drop",
    desc: "\u5B9A\u4F4D\u91DD\u843D\u5728\u5730\u5716\u4E0A\uFF0C\u5F48\u51FA\u5730\u9EDE\u8CC7\u8A0A\u5361",
    tags: ["\u5730\u9EDE", "\u5EFA\u6848"],
    tone: "paper",
    sample: ["\u5EFA\u6848\u57FA\u5730", "\u6377\u904B\u7AD9\u65C1 \xB7 \u6B65\u884C 3 \u5206\u9418"],
    hint: "\u5730\u9EDE\u540D\u7A31 / \u88DC\u5145\u8AAA\u660E",
    motion: "\u98A8\u683C\u5316\u5E73\u9762\u5730\u5716\uFF08\u9053\u8DEF\u7DB2\u3001\u6CB3\u6D41\u3001\u7DA0\u5730\uFF09\u4E0A\uFF0C\u4E00\u652F\u4E3B\u8272\u5B9A\u4F4D\u91DD\u5F9E\u4E0A\u65B9\u843D\u4E0B\u4E26\u56DE\u5F48\uFF0C\u843D\u5730\u8655\u64F4\u6563\u5169\u5708\u6F23\u6F2A\uFF1B\u63A5\u8457\u53F3\u5074\u8CC7\u8A0A\u5361\u7531\u5DE6\u5411\u53F3\u5C55\u958B\uFF0C\u5927\u5B57\u5730\u9EDE\u540D\u7A31\u3001\u4E0B\u65B9\u4E00\u884C\u5C0F\u5B57\u8AAA\u660E\uFF1B\u505C\u7559\u5F8C\u4F9D\u5E8F\u6536\u56DE\u3002",
    motionEn: "On a stylized flat map (road grid, river, parks), an accent location pin drops from above with a bounce, sending two ripples outward on landing; an info card then unfolds to its right with the place name in large type and a small note beneath; after a hold everything retracts in order.",
    css: `${MAP_CSS}
.S .pin{animation:K_drop 5s cubic-bezier(.5,0,.5,1.5) infinite both}
.S .rip{fill:none;stroke:var(--ac);stroke-width:5;animation:K_rip 5s ease-out infinite both}
.S .rip+.rip{animation-delay:.25s}
.S .card{transform-origin:left center;animation:K_card 5s cubic-bezier(.2,.9,.2,1) infinite both}
.S .card rect{fill:var(--fg)}.S .card .t1{fill:var(--bg);font-size:54px}.S .card .t2{fill:color-mix(in srgb,var(--bg) 70%,var(--fg));font-size:28px;font-weight:500}
.S .stem{stroke:var(--fg);stroke-width:4;stroke-dasharray:6 8;animation:K_card 5s cubic-bezier(.2,.9,.2,1) infinite both}
@keyframes K_drop{0%{transform:translateY(-760px);opacity:1}16%,86%{transform:none;opacity:1}96%,100%{transform:translateY(-40px);opacity:0}}
@keyframes K_rip{0%,15%{transform:scale(.1);opacity:0}18%{opacity:1}42%,100%{transform:scale(2.6);opacity:0}}
@keyframes K_card{0%,22%{transform:scaleX(0);opacity:0}32%,82%{transform:none;opacity:1}92%,100%{transform:scaleX(0);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u5EFA\u6848\u57FA\u5730", "\u6377\u904B\u7AD9\u65C1 \xB7 \u6B65\u884C 3 \u5206\u9418"]);
      const cw = Math.max(textW(a, 54), textW(b, 28)) + 80;
      return svg(
        `${base()}<g transform="translate(720 540)"><ellipse class="rip fb" rx="70" ry="22"/><ellipse class="rip fb" rx="70" ry="22"/><g class="pin">${PIN}</g></g>
<line class="stem fb" x1="760" y1="470" x2="820" y2="400"/>
<g transform="translate(820 330)"><g class="card fb"><rect width="${cw}" height="150" rx="22"/><text class="t1" x="40" y="70">${esc(a)}</text><text class="t2" x="40" y="118">${esc(b)}</text></g></g>`
      );
    }, "html")
  },
  {
    id: "map-route",
    cat: "map",
    zh: "\u8DEF\u7DDA\u7E6A\u88FD",
    en: "Route Draw",
    desc: "\u8DEF\u7DDA\u5F9E\u8D77\u9EDE\u756B\u5230\u7D42\u9EDE\uFF0C\u5C0F\u5713\u9EDE\u6CBF\u8DEF\u524D\u9032",
    tags: ["\u901A\u52E4", "\u8DEF\u7DDA"],
    tone: "paper",
    sample: ["\u5BB6", "\u516C\u53F8", "\u901A\u52E4 25 \u5206\u9418"],
    hint: "\u8D77\u9EDE / \u7D42\u9EDE / \u6642\u9593\u6216\u8DDD\u96E2",
    motion: "\u5E73\u9762\u5730\u5716\u4E0A\uFF0C\u4E3B\u8272\u7C97\u7DDA\u6CBF\u8457\u9053\u8DEF\u8F49\u6298\u5F9E\u8D77\u9EDE\u4E00\u8DEF\u756B\u5230\u7D42\u9EDE\uFF08\u5E36\u767D\u8272\u5916\u6846\uFF09\uFF0C\u4E00\u9846\u5C0F\u5713\u9EDE\u540C\u6B65\u6CBF\u8DEF\u524D\u9032\uFF1B\u5230\u9054\u5F8C\u7D42\u9EDE\u5B9A\u4F4D\u91DD\u5F48\u51FA\u3001\u8D77\u7D42\u9EDE\u6A19\u7C64\u51FA\u73FE\uFF0C\u8DEF\u7DDA\u4E2D\u6BB5\u6D6E\u51FA\u6642\u9593\u6A19\u7C64\uFF1B\u505C\u7559\u5F8C\u6574\u689D\u8DEF\u7DDA\u6DE1\u51FA\u91CD\u4F86\u3002",
    motionEn: "On a flat map, a thick accent line with a white casing draws along the roads from start to destination while a small dot travels with it; on arrival a pin pops at the destination, start and end labels appear, and a travel-time tag floats up mid-route; after a hold the route fades and restarts.",
    css: `${MAP_CSS}
.S .casing{fill:none;stroke:#fff;stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 5s linear infinite}
.S .route{fill:none;stroke:var(--ac);stroke-width:16;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 5s linear infinite}
.S .dot{fill:#fff;stroke:var(--ac);stroke-width:7}
.S .o{fill:var(--fg)}.S .o2{fill:#fff}
.S .endpin{animation:K_pop 5s cubic-bezier(.3,1.7,.5,1) infinite both}
.S .lab{animation:K_pop 5s cubic-bezier(.3,1.7,.5,1) infinite both}
.S .lab.s{animation-name:K_pop0}
@keyframes K_d{0%{stroke-dashoffset:1;opacity:1}55%{stroke-dashoffset:0}88%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_pop{0%,54%{transform:scale(0)}62%,88%{transform:none;opacity:1}98%,100%{transform:none;opacity:0}}
@keyframes K_pop0{0%{transform:scale(0)}8%,88%{transform:none;opacity:1}98%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b, t] = pick(w, 3, ["\u5BB6", "\u516C\u53F8", "\u901A\u52E4 25 \u5206\u9418"]);
      const d = "M240 720 L240 590 Q240 545 285 545 L640 545 Q690 545 715 505 L905 300 Q935 268 980 268 L1300 268 Q1345 268 1345 223 L1345 190";
      return svg(
        `${base()}<path class="casing" pathLength="1" d="${d}"/><path class="route" pathLength="1" d="${d}"/>
<circle class="dot" r="15"><animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.55;1" calcMode="linear" path="${d}"/></circle>
<circle class="o" cx="240" cy="720" r="20"/><circle class="o2" cx="240" cy="720" r="8"/>
<g transform="translate(1345 200)"><g class="endpin fb">${PIN}</g></g>
${chip(240, 790, a, 34, "lab s")}${chip(1345, 50, b, 34, "lab")}${chip(810, 420, t, 40, "ac lab")}`
      );
    }, "html")
  },
  {
    id: "map-radius",
    cat: "map",
    zh: "\u751F\u6D3B\u5708\u534A\u5F91",
    en: "Radius Rings",
    desc: "\u4EE5\u57FA\u5730\u70BA\u5713\u5FC3\uFF0C\u4E00\u5708\u5708\u756B\u51FA\u751F\u6D3B\u5708\u7BC4\u570D",
    tags: ["\u751F\u6D3B\u5708", "\u5EFA\u6848"],
    tone: "ink",
    sample: ["\u57FA\u5730", "500m", "1km", "2km"],
    hint: "\u4E2D\u5FC3\u540D\u7A31 / \u4E09\u500B\u534A\u5F91\u6A19\u7C64",
    motion: "\u6697\u8272\u5730\u5716\u4E2D\u592E\u662F\u4E3B\u8272\u5B9A\u4F4D\u9EDE\uFF0C\u4E09\u500B\u540C\u5FC3\u5713\u7531\u5167\u800C\u5916\u4F9D\u5E8F\u5C55\u958B\uFF08\u534A\u900F\u660E\u4E3B\u8272\u586B\u8272\uFF0B\u865B\u7DDA\u5916\u6846\uFF09\uFF0C\u6BCF\u5708\u9802\u7AEF\u5F48\u51FA\u8DDD\u96E2\u6A19\u7C64\uFF1B\u7BC4\u570D\u5167\u7684\u751F\u6D3B\u6A5F\u80FD\u5C0F\u9EDE\u96A8\u6A5F\u4EAE\u8D77\uFF1B\u4E2D\u5FC3\u9EDE\u6301\u7E8C\u8108\u52D5\uFF0C\u505C\u7559\u5F8C\u5168\u90E8\u6536\u56DE\u3002",
    motionEn: "At the center of a dark map sits an accent location dot; three concentric circles expand outward in sequence (translucent accent fill with dashed outline), each popping a distance label at its top; small amenity dots light up within range; the center keeps pulsing, then everything retracts after a hold.",
    css: `${MAP_CSS}
.S .ring{fill:color-mix(in srgb,var(--ac) 9%,transparent);stroke:var(--ac);stroke-width:4;stroke-dasharray:14 12;animation:K_r 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.35s)}
.S .rl{animation:K_l 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.35s + .4s)}
.S .core{fill:var(--ac)}.S .pulse{fill:var(--ac);animation:K_p 1.6s ease-out infinite}
.S .poi{fill:var(--fg);animation:K_l 6s ease infinite both;animation-delay:calc(1.2s + var(--i)*.06s)}
.S .cl{animation:K_l 6s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_r{0%{transform:scale(0);opacity:0}14%,84%{transform:none;opacity:1}96%,100%{transform:scale(.6);opacity:0}}
@keyframes K_l{0%{transform:scale(0)}10%,84%{transform:none;opacity:1}94%,100%{transform:scale(0);opacity:0}}
@keyframes K_p{0%{transform:scale(1);opacity:.6}100%{transform:scale(4);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [c, r1, r2, r3] = pick(w, 4, ["\u57FA\u5730", "500m", "1km", "2km"]);
      const R = [150, 270, 390];
      const pois = rep(26, (i) => {
        const a = rand(i + 3) * Math.PI * 2;
        const d = 60 + rand(i + 9) * 340;
        return `<circle class="poi fb" style="--i:${i}" cx="${(800 + Math.cos(a) * d).toFixed(0)}" cy="${(450 + Math.sin(a) * d * 0.98).toFixed(0)}" r="7"/>`;
      });
      return svg(
        `${base(true)}${R.map((r, i) => `<circle class="ring fb" style="--i:${i}" cx="800" cy="450" r="${r}"/>`).reverse().join("")}${pois}
<circle class="pulse fb" cx="800" cy="450" r="18"/><circle class="core" cx="800" cy="450" r="18"/>
${[r1, r2, r3].map((t, i) => chip(800, 450 - R[i], t, 30, "ac rl", ` style="--i:${i}"`)).join("")}${chip(800, 520, c, 34, "cl")}`
      );
    }, "html")
  },
  {
    id: "map-zoom",
    cat: "map",
    zh: "\u5730\u5716\u63A8\u9032",
    en: "Map Zoom In",
    desc: "\u5F9E\u6574\u500B\u57CE\u5E02\u4E00\u8DEF\u63A8\u8FD1\u5230\u76EE\u6A19\u5340\u57DF",
    tags: ["\u958B\u5834", "\u5340\u4F4D"],
    tone: "paper",
    sample: ["\u65B0\u5317\u5E02", "\u67D0\u67D0\u5340", "\u91CD\u5283\u5340"],
    hint: "\u4E09\u5C64\u5730\u540D\uFF0C\u7531\u5927\u5230\u5C0F",
    motion: "\u5730\u5716\u5F9E\u57CE\u5E02\u5168\u666F\u958B\u59CB\uFF0C\u76EE\u6A19\u4F4D\u7F6E\u6709\u4E3B\u8272\u65B9\u6846\u6A19\u793A\uFF1B\u93E1\u982D\u5206\u5169\u6BB5\u63A8\u8FD1\uFF08\u7D04 2.2 \u500D\u3001\u518D\u5230 5 \u500D\uFF09\uFF0C\u6BCF\u4E00\u6BB5\u5DE6\u4E0A\u89D2\u7684\u5730\u540D\u6A19\u7C64\u8DDF\u8457\u5207\u63DB\uFF08\u57CE\u5E02 \u2192 \u884C\u653F\u5340 \u2192 \u91CD\u5283\u5340\uFF09\uFF0C\u65B9\u6846\u8207\u5B9A\u4F4D\u9EDE\u4FDD\u6301\u56FA\u5B9A\u7DDA\u5BEC\uFF1B\u6700\u5F8C\u62C9\u56DE\u5168\u666F\u5FAA\u74B0\u3002",
    motionEn: "The map starts at a city-wide view with an accent box marking the target; the camera zooms in two stages (about 2.2x, then 5x), and the place-name tag at top left switches with each stage (city \u2192 district \u2192 neighborhood) while the box and pin keep a constant stroke width; finally it pulls back to the wide view and loops.",
    css: `${MAP_CSS}
.S .world{animation:K_z 7s cubic-bezier(.65,0,.35,1) infinite}
.S .box{fill:color-mix(in srgb,var(--ac) 14%,transparent);stroke:var(--ac);stroke-width:4;vector-effect:non-scaling-stroke}
.S .tgt{fill:var(--ac);stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke}
.S .lv{position:absolute;left:5cqw;top:6cqh;display:grid}
.S .lv span{grid-area:1/1;font-size:min(5cqw,8cqh);background:var(--fg);color:var(--bg);padding:.25em .6em;border-radius:.5em;opacity:0;animation:7s infinite both}
.S .lv span:nth-child(1){animation-name:K_t1}.S .lv span:nth-child(2){animation-name:K_t2}.S .lv span:nth-child(3){animation-name:K_t3;background:var(--ac);color:#111}
@keyframes K_z{0%,18%{transform:none}38%,52%{transform:translate(-1400px,-386px) scale(2.2)}72%,88%{transform:translate(-4200px,-1450px) scale(5)}100%{transform:none}}
@keyframes K_t1{0%,24%{opacity:1}30%,96%{opacity:0}100%{opacity:1}}
@keyframes K_t2{0%,28%{opacity:0}34%,56%{opacity:1}62%,100%{opacity:0}}
@keyframes K_t3{0%,62%{opacity:0}68%,90%{opacity:1}96%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b, c] = pick(w, 3, ["\u65B0\u5317\u5E02", "\u67D0\u67D0\u5340", "\u91CD\u5283\u5340"]);
      return `${svg(`<g class="world">${base()}<rect class="box" x="900" y="320" width="200" height="120" rx="8"/><rect class="box" x="975" y="360" width="50" height="40" rx="4"/><circle class="tgt" cx="1000" cy="380" r="6"/></g>`)}<div class="lv"><span>${esc(a)}</span><span>${esc(b)}</span><span>${esc(c)}</span></div>`;
    }, "html")
  },
  {
    id: "map-district",
    cat: "map",
    zh: "\u5340\u57DF\u6846\u9078",
    en: "District Highlight",
    desc: "\u756B\u51FA\u5340\u57DF\u908A\u754C\uFF0C\u7BC4\u570D\u5916\u8B8A\u6697\u3001\u7BC4\u570D\u5167\u586B\u4E0A\u659C\u7DDA",
    tags: ["\u91CD\u5283\u5340", "\u7BC4\u570D"],
    tone: "paper",
    sample: ["\u91CD\u5283\u5340\u7BC4\u570D", "\u7D04 100 \u516C\u9803\u3010\u7BC4\u4F8B\u3011"],
    hint: "\u5340\u57DF\u540D\u7A31 / \u88DC\u5145\u8AAA\u660E",
    motion: "\u5730\u5716\u4E0A\u4E00\u689D\u4E3B\u8272\u7C97\u7DDA\u6CBF\u8457\u4E0D\u898F\u5247\u908A\u754C\u63CF\u7E6A\u51FA\u5340\u57DF\u7BC4\u570D\uFF08\u7D04 1.5 \u79D2\uFF09\uFF0C\u63A5\u8457\u7BC4\u570D\u5916\u7684\u5730\u5716\u8B8A\u6697\u3001\u7BC4\u570D\u5167\u586B\u4E0A\u4E3B\u8272\u659C\u7DDA\u7DB2\u7D0B\uFF0C\u5340\u57DF\u4E2D\u5FC3\u5F48\u51FA\u540D\u7A31\u6A19\u7C64\u8207\u4E00\u884C\u88DC\u5145\u8AAA\u660E\uFF1B\u505C\u7559\u5F8C\u53CD\u5411\u6536\u56DE\u3002",
    motionEn: "A thick accent line traces an irregular district boundary on the map (about 1.5s); then everything outside dims, the inside fills with an accent hatch pattern, and a name tag with a one-line note pops at the district center; after a hold it reverses.",
    css: `${MAP_CSS}
.S .edge{fill:none;stroke:var(--ac);stroke-width:9;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_e 6s ease-in-out infinite}
.S .fill{fill:url(#mdh);animation:K_f 6s ease infinite}
.S .dim{fill:#000;fill-rule:evenodd;animation:K_dm 6s ease infinite}
.S .hl{stroke:var(--ac);stroke-width:5;opacity:.45}
.S .hb{fill:color-mix(in srgb,var(--ac) 12%,transparent)}
.S .lab{animation:K_l 6s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_e{0%{stroke-dashoffset:1}28%,86%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_f{0%,26%{opacity:0}38%,86%{opacity:1}98%,100%{opacity:0}}
@keyframes K_dm{0%,26%{opacity:0}38%,86%{opacity:.32}98%,100%{opacity:0}}
@keyframes K_l{0%,34%{transform:scale(0)}44%,86%{transform:none;opacity:1}96%,100%{transform:scale(.6);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u91CD\u5283\u5340\u7BC4\u570D", "\u7D04 100 \u516C\u9803\u3010\u7BC4\u4F8B\u3011"]);
      const poly = "M560 250 L780 200 L1010 260 L1120 380 L1080 560 L900 640 L700 610 L560 520 L500 380 Z";
      return svg(
        `<defs><pattern id="mdh" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="hb" width="22" height="22"/><line class="hl" x1="0" y1="0" x2="0" y2="22"/></pattern></defs>
${base()}<path class="dim" d="M0 0H${W}V${H}H0Z ${poly}"/><path class="fill" d="${poly}"/><path class="edge" pathLength="1" d="${poly}"/>
<g transform="translate(810 420)"><g class="lab fb">${chip(0, 0, a, 46, "ac")}${chip(0, 74, b, 26)}</g></g>`
      );
    }, "html")
  },
  {
    id: "map-metro",
    cat: "map",
    zh: "\u6377\u904B\u8DEF\u7DDA",
    en: "Metro Line",
    desc: "\u6377\u904B\u7DDA\u4E00\u7AD9\u7AD9\u4EAE\u8D77\uFF0C\u6700\u5F8C\u505C\u5728\u76EE\u7684\u7AD9",
    tags: ["\u6377\u904B", "\u901A\u52E4"],
    tone: "ink",
    sample: ["\u8D77\u9EDE\u7AD9", "\u8F49\u4E58\u7AD9", "\u5E02\u4E2D\u5FC3\u7AD9", "\u76EE\u7684\u5730\u7AD9"],
    hint: "2\u20136 \u500B\u7AD9\u540D\uFF0C\u4F9D\u5E8F",
    motion: "\u6697\u8272\u6DE1\u5316\u5730\u5716\u4E0A\uFF0C\u4E00\u689D\u4E3B\u8272\u7C97\u7DDA\u4EE5\u6377\u904B\u8DEF\u7DDA\u5716\u7684 45 \u5EA6\u8F49\u6298\u7531\u5DE6\u4E0B\u756B\u5230\u53F3\u4E0A\uFF0C\u6CBF\u7DDA\u7684\u8ECA\u7AD9\u767D\u8272\u5713\u9EDE\u4F9D\u5E8F\u5F48\u51FA\u4E26\u986F\u793A\u7AD9\u540D\uFF08\u4E0A\u4E0B\u4EA4\u932F\uFF09\uFF0C\u6700\u5F8C\u4E00\u7AD9\u653E\u5927\u6210\u4E3B\u8272\u4E26\u5E36\u8108\u52D5\u5149\u5708\uFF1B\u505C\u7559\u5F8C\u6574\u689D\u7DDA\u6DE1\u51FA\u3002",
    motionEn: "Over a dimmed dark map, a thick accent line draws from lower left to upper right with 45-degree transit-map bends; white station dots pop in one by one along it with names staggered above and below; the final station grows into an accent dot with a pulsing halo; after a hold the line fades.",
    css: `${MAP_CSS}
.S .ln{fill:none;stroke:var(--ac);stroke-width:22;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 6s cubic-bezier(.5,0,.5,1) infinite}
.S .st{fill:#fff;stroke:var(--bg);stroke-width:8;animation:K_s 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d)}
.S .st.end{fill:var(--ac);stroke:#fff}
.S .halo{fill:none;stroke:var(--ac);stroke-width:5;animation:K_h 1.4s ease-out infinite}
.S .nm{animation:K_s 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d)}
@keyframes K_d{0%{stroke-dashoffset:1}45%,86%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_s{0%{transform:scale(0)}6%,80%{transform:none;opacity:1}92%,100%{transform:none;opacity:0}}
@keyframes K_h{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.6);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const names = w.slice(0, 6).length >= 2 ? w.slice(0, 6) : ["\u8D77\u9EDE\u7AD9", "\u76EE\u7684\u5730\u7AD9"];
      const P = [
        [220, 700],
        [520, 700],
        [760, 460],
        [1080, 460],
        [1380, 160]
      ];
      const segs = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]));
      const total = segs.reduce((a, b) => a + b, 0);
      const at = /* @__PURE__ */ __name((t) => {
        let d = t * total;
        for (let i = 0; i < segs.length; i++) {
          if (d <= segs[i] || i === segs.length - 1) {
            const k = Math.min(1, d / segs[i]);
            return [P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + (P[i + 1][1] - P[i][1]) * k];
          }
          d -= segs[i];
        }
        return P[P.length - 1];
      }, "at");
      const n = names.length;
      const stations = names.map((nm, i) => {
        const t = i / (n - 1);
        const [x, y] = at(t);
        const d = `${(t * 2.7).toFixed(2)}s`;
        const end = i === n - 1;
        const ly = i % 2 ? y + 70 : y - 70;
        return `${end ? `<circle class="halo fb" cx="${x}" cy="${y}" r="26"/>` : ""}<circle class="st fb${end ? " end" : ""}" style="--d:${d}" cx="${x}" cy="${y}" r="${end ? 26 : 18}"/>${chip(x, ly, nm, end ? 38 : 30, `nm${end ? " ac" : ""}`, ` style="--d:${d}"`)}`;
      }).join("");
      return svg(`${base(true)}<path class="ln" pathLength="1" d="M${P.map((p) => p.join(" ")).join(" L")}"/>${stations}`);
    }, "html")
  },
  {
    id: "map-poi",
    cat: "map",
    zh: "\u751F\u6D3B\u6A5F\u80FD",
    en: "Nearby Amenities",
    desc: "\u5468\u908A\u5B78\u6821\u3001\u516C\u5712\u3001\u8D85\u5E02\u4E00\u500B\u500B\u5F48\u51FA\u4F86",
    tags: ["\u751F\u6D3B\u5708", "\u6A5F\u80FD"],
    tone: "paper",
    sample: ["\u5B78\u6821\uFF5C300m", "\u516C\u5712\uFF5C150m", "\u8D85\u5E02\uFF5C450m", "\u6377\u904B\uFF5C600m", "\u91AB\u9662\uFF5C1.2km"],
    hint: "\u300C\u540D\u7A31\uFF5C\u8DDD\u96E2\u300D3\u20136 \u500B\uFF08\u8DDD\u96E2\u8ACB\u7528\u5BE6\u969B\u6E2C\u91CF\u503C\uFF09",
    motion: "\u5730\u5716\u4E2D\u592E\u662F\u4E3B\u8272\u5B9A\u4F4D\u91DD\uFF0C\u5468\u908A\u7684\u751F\u6D3B\u6A5F\u80FD\u4EE5\u767D\u8272\u5713\u5F62\u5716\u793A\u4F9D\u5E8F\u5F48\u51FA\uFF08\u5B78\u6821\u3001\u516C\u5712\u3001\u8D85\u5E02\u3001\u6377\u904B\u2026\uFF09\uFF0C\u6BCF\u500B\u5716\u793A\u7528\u865B\u7DDA\u9023\u56DE\u4E2D\u5FC3\uFF0C\u65C1\u908A\u9644\u4E0A\u540D\u7A31\u8207\u8DDD\u96E2\u6A19\u7C64\uFF1B\u5168\u90E8\u5230\u4F4D\u5F8C\u505C\u7559\uFF0C\u518D\u4F9D\u5E8F\u7E2E\u56DE\u3002",
    motionEn: "An accent pin sits at the map center; nearby amenities pop in one by one as white circular icons (school, park, supermarket, metro\u2026), each linked back to the center by a dashed line and tagged with its name and distance; after all are in place it holds, then they shrink away in order.",
    css: `${MAP_CSS}
.S .lk{stroke:var(--fg);stroke-width:3;stroke-dasharray:8 10;opacity:.5;animation:K_p 6s ease infinite both;animation-delay:var(--d)}
.S .ic circle{fill:#fff;stroke:var(--ac);stroke-width:5}.S .ic text{font-size:44px;text-anchor:middle;dominant-baseline:central}
.S .ic,.S .tg{animation:K_p 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d)}
.S .cp{animation:K_c 6s cubic-bezier(.5,0,.5,1.5) infinite both}
@keyframes K_p{0%{transform:scale(0);opacity:0}7%,84%{transform:none;opacity:1}94%,100%{transform:scale(0);opacity:0}}
@keyframes K_c{0%{transform:translateY(-600px)}10%,90%{transform:none}100%{transform:translateY(-600px)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const items = w.slice(0, 6);
      const n = items.length;
      const parts = items.map((it, i) => {
        const [name, dist] = split(it);
        const a = -Math.PI / 2 + i / n * Math.PI * 2 + 0.3;
        const x = 800 + Math.cos(a) * 470;
        const y = 470 + Math.sin(a) * 300;
        const d = `${(0.5 + i * 0.3).toFixed(1)}s`;
        const label = dist ? `${name} ${dist}` : name;
        return `<line class="lk fb" style="--d:${d}" x1="800" y1="440" x2="${x.toFixed(0)}" y2="${y.toFixed(0)}"/><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="ic fb" style="--d:${d}"><circle r="48"/><text>${emojiFor(name)}</text></g></g>${chip(x, y + 84, label, 28, "tg", ` style="--d:${d}"`)}`;
      }).join("");
      return svg(`${base()}${parts}<g transform="translate(800 470)"><g class="pin cp">${PIN}</g></g>`);
    }, "html")
  },
  {
    id: "map-flyover",
    cat: "map",
    zh: "3D \u9CE5\u77B0",
    en: "3D Flyover",
    desc: "\u5730\u5716\u50BE\u659C\u6210 3D\uFF0C\u5EFA\u7BC9\u9577\u51FA\u4F86\uFF0C\u4E3B\u89D2\u5EFA\u6848\u4EAE\u8D77",
    tags: ["\u5EFA\u6848", "\u958B\u5834"],
    tone: "ink",
    sample: ["\u672C\u6848\u4F4D\u7F6E", "\u4E3B\u8981\u5E79\u9053\u65C1"],
    hint: "\u6A19\u7C64 / \u88DC\u5145\u8AAA\u660E",
    motion: "\u5E73\u9762\u5730\u5716\u50BE\u659C\u6210\u7D04 55 \u5EA6\u7684 3D \u9CE5\u77B0\u8996\u89D2\u4E26\u7DE9\u6162\u65CB\u8F49\uFF0C\u5468\u570D\u5EFA\u7BC9\u91CF\u9AD4\u4F9D\u5E8F\u5F9E\u5730\u9762\u9577\u9AD8\uFF0C\u6B63\u4E2D\u592E\u7684\u4E3B\u89D2\u5EFA\u7BC9\u4EE5\u4E3B\u8272\u9577\u5F97\u6700\u9AD8\uFF0C\u4E0A\u65B9\u6D6E\u51FA\u6A19\u7C64\u8207\u4E00\u689D\u6307\u793A\u7DDA\uFF1B\u505C\u7559\u6642\u93E1\u982D\u6301\u7E8C\u7DE9\u6162\u74B0\u7E5E\u3002",
    motionEn: "The flat map tilts into a roughly 55-degree 3D bird's-eye view and slowly rotates; surrounding building volumes grow up from the ground in sequence while the hero building at the center rises tallest in the accent color, with a floating label and leader line above it; the camera keeps orbiting slowly during the hold.",
    css: `${MAP_CSS}
.S{perspective:90cqw;perspective-origin:50% 30%}
.S .plane{position:absolute;width:110cqw;height:62cqw;left:-5cqw;top:calc(50% - 31cqw);transform-style:preserve-3d;animation:K_cam 9s ease-in-out infinite}
.S .plane svg.map{position:absolute}
.S .bd{position:absolute;transform-style:preserve-3d;left:var(--x);top:var(--y);width:var(--w);height:var(--h)}
.S .bd i{position:absolute;inset:0;background:color-mix(in srgb,var(--bg) calc(80% - var(--k)*4%),var(--fg));border:1px solid color-mix(in srgb,var(--bg) 60%,var(--fg));transform:translateZ(calc(var(--k)*var(--z)*1cqw));animation:K_up 9s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:var(--dl)}
.S .bd.hero i{background:color-mix(in srgb,var(--ac) calc(100% - var(--k)*3%),#000);border-color:color-mix(in srgb,var(--ac) 60%,#fff)}
.S .tag{position:absolute;left:50%;top:9%;translate:-50% 0;display:flex;flex-direction:column;align-items:center;animation:K_tag 9s ease infinite both}
.S .tag b{font-size:min(4.4cqw,7cqh);background:var(--ac);color:#111;padding:.25em .7em;border-radius:99px}
.S .tag small{font-size:min(2.2cqw,3.6cqh);color:var(--fg);font-weight:500;margin-top:.5em}
.S .tag i{width:2px;height:12cqh;background:linear-gradient(var(--ac),transparent);margin-top:.6em}
@keyframes K_cam{0%,100%{transform:rotateX(56deg) rotateZ(-28deg)}50%{transform:rotateX(52deg) rotateZ(-14deg)}}
@keyframes K_up{0%{transform:translateZ(0);opacity:0}4%{opacity:1}22%,90%{transform:translateZ(calc(var(--k)*var(--z)*1cqw));opacity:1}100%{transform:translateZ(0);opacity:0}}
@keyframes K_tag{0%,22%{opacity:0;transform:translateY(20%)}30%,88%{opacity:1;transform:none}98%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b] = pick(w, 2, ["\u672C\u6848\u4F4D\u7F6E", "\u4E3B\u8981\u5E79\u9053\u65C1"]);
      const blocks = [];
      let k = 0;
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 7; c++) {
          const hero = r === 2 && c === 3;
          if (!hero && rand(r * 7 + c + 2) < 0.28) continue;
          const x = 8 + c * 12.4 + rand(k + 5) * 2;
          const y = 10 + r * 17 + rand(k + 8) * 2;
          const z = hero ? 1.6 : 0.4 + rand(k + 11) * 0.9;
          const dl = `${(hero ? 0.9 : rand(k + 13) * 0.8).toFixed(2)}s`;
          blocks.push(`<div class="bd${hero ? " hero" : ""}" style="--x:${x}%;--y:${y}%;--w:${hero ? 9 : 6 + rand(k) * 3}%;--h:${hero ? 12 : 8 + rand(k + 1) * 4}%;--z:${z.toFixed(2)}">${rep(8, (i) => `<i style="--k:${i};--dl:${dl}"></i>`)}</div>`);
          k++;
        }
      return `<div class="plane">${svg(base())}${blocks.join("")}</div><div class="tag"><b>${esc(a)}</b><small>${esc(b)}</small><i></i></div>`;
    }, "html")
  },
  {
    id: "map-distance",
    cat: "map",
    zh: "\u8DDD\u96E2\u91CF\u6E2C",
    en: "Distance Measure",
    desc: "\u5169\u9EDE\u4E4B\u9593\u62C9\u51FA\u91CF\u5C3A\uFF0C\u8DDD\u96E2\u6578\u5B57\u8DDF\u8457\u8DF3",
    tags: ["\u8DDD\u96E2", "\u6578\u64DA"],
    tone: "paper",
    sample: ["\u672C\u6848", "\u6377\u904B\u7AD9", "850", "m"],
    hint: "\u8D77\u9EDE / \u7D42\u9EDE / \u6578\u5B57 / \u55AE\u4F4D\uFF08\u8ACB\u7528\u5BE6\u6E2C\u8DDD\u96E2\uFF09",
    motion: "\u5730\u5716\u4E0A\u5169\u500B\u7AEF\u9EDE\u5148\u5F8C\u51FA\u73FE\uFF0C\u4E00\u689D\u5E36\u523B\u5EA6\u7684\u865B\u7DDA\u91CF\u5C3A\u5F9E\u8D77\u9EDE\u5EF6\u4F38\u5230\u7D42\u9EDE\uFF0C\u91CF\u5C3A\u4E2D\u6BB5\u7684\u6A19\u7C64\u6578\u5B57\u540C\u6B65\u5F9E 0 \u8A08\u6578\u5230\u5BE6\u969B\u8DDD\u96E2\uFF08\u5982 850 m\uFF09\uFF1B\u505C\u7559\u5F8C\u91CF\u5C3A\u6536\u56DE\u3002",
    motionEn: "Two endpoints appear on the map in turn; a dashed ruler with tick marks extends from start to end while the label at its midpoint counts from 0 up to the real distance (e.g. 850 m) in sync; after a hold the ruler retracts.",
    css: `${MAP_CSS}
.S .ru{stroke:var(--ac);stroke-width:8;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 5s cubic-bezier(.6,0,.3,1) infinite}
.S .ru2{stroke:#fff;stroke-width:3;stroke-dasharray:14 14;opacity:.9}
.S .pt{fill:var(--fg);stroke:#fff;stroke-width:6;animation:K_p 5s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d,0s)}
.S .num{animation:K_p 5s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:.3s}
.S .num text{font-size:48px;font-family:var(--mono);fill:#111}.S .nb{fill:var(--ac)}
@keyframes K_d{0%,8%{stroke-dashoffset:1}48%,86%{stroke-dashoffset:0;opacity:1}96%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_p{0%{transform:scale(0)}8%,86%{transform:none;opacity:1}96%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b, n, u] = pick(w, 4, ["\u672C\u6848", "\u6377\u904B\u7AD9", "850", "m"]);
      const to = Math.max(0, Math.round(parseFloat(n) || 0));
      return svg(
        `${base()}<line class="ru" pathLength="1" x1="380" y1="600" x2="1220" y2="300"/><line class="ru2" x1="380" y1="600" x2="1220" y2="300"/>
<circle class="pt fb" cx="380" cy="600" r="22"/><circle class="pt fb" style="--d:.2s" cx="1220" cy="300" r="22"/>
${chip(380, 680, a, 32)}${chip(1220, 220, b, 32)}
<g transform="translate(800 450) rotate(-19.6)"><g class="num fb"><rect class="nb" x="-150" y="-50" width="300" height="100" rx="50"/><text text-anchor="middle" dominant-baseline="central"><tspan class="cnt">${to}</tspan> ${esc(u)}</text></g></g>`
      );
    }, "html"),
    run: /* @__PURE__ */ __name((root) => {
      const t = root.querySelector(".cnt");
      if (!t) return;
      const to = parseInt(t.textContent || "0", 10) || 0;
      let raf = 0;
      const t0 = performance.now();
      const ease = /* @__PURE__ */ __name((p) => 1 - Math.pow(1 - p, 3), "ease");
      const f = /* @__PURE__ */ __name((now) => {
        raf = requestAnimationFrame(f);
        const s = (now - t0) / 1e3 % 5;
        const p = s < 0.4 ? 0 : s < 2.4 ? ease((s - 0.4) / 2) : s < 4.5 ? 1 : 0;
        t.textContent = String(Math.round(to * p));
      }, "f");
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    }, "run")
  },
  {
    id: "map-isochrone",
    cat: "map",
    zh: "\u7B49\u6642\u5708",
    en: "Isochrone Zones",
    desc: "\u4F9D\u4EA4\u901A\u6642\u9593\u756B\u51FA\u4E0D\u898F\u5247\u7684\u53EF\u9054\u7BC4\u570D",
    tags: ["\u901A\u52E4", "\u751F\u6D3B\u5708"],
    tone: "ink",
    sample: ["\u57FA\u5730", "5 \u5206\u9418", "10 \u5206\u9418", "15 \u5206\u9418"],
    hint: "\u4E2D\u5FC3\u540D\u7A31 / \u4E09\u500B\u6642\u9593\u6A19\u7C64",
    motion: "\u6697\u8272\u5730\u5716\u4E2D\u592E\u7684\u5B9A\u4F4D\u9EDE\u5411\u5916\u9577\u51FA\u4E09\u5C64\u4E0D\u898F\u5247\u7684\u534A\u900F\u660E\u4E3B\u8272\u5340\u584A\uFF08\u50CF\u4EA4\u901A\u53EF\u9054\u7BC4\u570D\u7684\u7B49\u6642\u5708\uFF09\uFF0C\u7531\u5C0F\u5230\u5927\u4F9D\u5E8F\u64F4\u5F35\uFF0C\u908A\u7DE3\u6301\u7E8C\u8F15\u5FAE\u8815\u52D5\uFF1B\u6BCF\u4E00\u5C64\u908A\u7DE3\u5F48\u51FA\u6642\u9593\u6A19\u7C64\uFF1B\u505C\u7559\u5F8C\u7531\u5916\u800C\u5167\u6536\u56DE\u3002",
    motionEn: "From a central point on a dark map, three layers of irregular translucent accent zones grow outward in sequence like travel-time isochrones, their edges gently undulating; a time tag pops at each layer's edge; after a hold they retract from the outside in.",
    css: `${MAP_CSS}
.S .zn{fill:color-mix(in srgb,var(--ac) calc(26% - var(--i)*7%),transparent);stroke:var(--ac);stroke-width:4;stroke-opacity:calc(1 - var(--i)*.25);animation:K_z 6.5s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.45s)}
.S .zl{animation:K_l 6.5s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.45s + .5s)}
.S .core{fill:#fff;stroke:var(--ac);stroke-width:8}
.S .cl{animation:K_l 6.5s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_z{0%{transform:scale(0);opacity:0}16%,84%{transform:none;opacity:1}96%,100%{transform:scale(.4);opacity:0}}
@keyframes K_l{0%{transform:scale(0)}10%,84%{transform:none;opacity:1}94%,100%{transform:scale(0);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [c, t1, t2, t3] = pick(w, 4, ["\u57FA\u5730", "5 \u5206\u9418", "10 \u5206\u9418", "15 \u5206\u9418"]);
      const R = [120, 230, 350];
      const zones = R.map((r, i) => {
        const s1 = blobPath(800, 450, lobes(14, r, 3, 0.16, i, 0.3, i + 1));
        const s2 = blobPath(800, 450, lobes(14, r, 3, 0.2, i + 0.9, 0.3, i + 7));
        return `<path class="zn fb" style="--i:${i}" d="${s1}"><animate attributeName="d" dur="${4 + i}s" repeatCount="indefinite" values="${s1};${s2};${s1}"/></path>`;
      }).reverse().join("");
      return svg(
        `${base(true)}${zones}<circle class="core" cx="800" cy="450" r="16"/>${[t1, t2, t3].map((t, i) => chip(800 + R[i] * 0.72, 450 - R[i] * 0.72, t, 28, "ac zl", ` style="--i:${i}"`)).join("")}${chip(800, 512, c, 32, "cl")}`
      );
    }, "html")
  }
];

// ../src/drop.ts
var drawDrop = /* @__PURE__ */ __name((ctx, W2, H2, o, lines, t) => {
  const S = Math.min(W2, H2);
  const u = S / 1080;
  const rnd = /* @__PURE__ */ __name((n) => {
    const x = Math.sin(n * 9301 + o.seed * 49297.31) * 233280;
    return x - Math.floor(x);
  }, "rnd");
  const clamp = /* @__PURE__ */ __name((p) => Math.max(0, Math.min(1, p)), "clamp");
  const ease = /* @__PURE__ */ __name((p) => 1 - Math.pow(1 - clamp(p), 3), "ease");
  const back = /* @__PURE__ */ __name((p) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  }, "back");
  const T = o.loop > 0 ? t % o.loop : t;
  let out = 1;
  if (o.loop > 0 && o.loop - T < 0.45) out = clamp((o.loop - T) / 0.45);
  const appear = /* @__PURE__ */ __name((delay) => o.entrance === "none" ? 1 : o.entrance === "fade" ? ease((T - delay) / 0.6) : back((T - delay) / 0.55), "appear");
  const appearA = /* @__PURE__ */ __name((delay) => o.entrance === "none" ? 1 : clamp((T - delay) / 0.22), "appearA");
  ctx.clearRect(0, 0, W2, H2);
  if (o.bg && o.bg !== "transparent") {
    const c = o.bg.split(",");
    if (c.length > 1) {
      const g = ctx.createLinearGradient(0, 0, 0, H2);
      g.addColorStop(0, c[0].trim());
      g.addColorStop(1, c[1].trim());
      ctx.fillStyle = g;
    } else ctx.fillStyle = c[0];
    ctx.fillRect(0, 0, W2, H2);
  }
  const shapeOf = /* @__PURE__ */ __name((shape, seed) => {
    if (shape === "circle") return { k: 0, amp: 0, irr: 0 };
    if (shape === "flower") return { k: Math.max(3, o.lobes), amp: Math.max(0.16, o.amp), irr: o.irregular * 0.5 };
    if (shape === "pebble") return { k: 2, amp: 0.08, irr: 0.6 + o.irregular * 0.4 };
    if (shape === "random") return { k: 2 + Math.floor(rnd(seed + 1) * 5), amp: 0.05 + rnd(seed + 2) * 0.17, irr: 0.3 + rnd(seed + 3) * 0.7 };
    return { k: Math.max(2, o.lobes), amp: o.amp, irr: o.irregular };
  }, "shapeOf");
  const blob = /* @__PURE__ */ __name((cx, cy, R2, shape, seed, phase) => {
    const sh = shapeOf(shape, seed);
    const n = 32;
    const br = o.breathe * Math.sin(T / Math.max(0.5, o.speed) * Math.PI * 2 + phase);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const wob = sh.k ? o.breathe * 0.06 * Math.sin(T / Math.max(0.5, o.speed) * Math.PI * 2 + i * 0.9 + phase) : 0;
      const noise = sh.irr * 0.3 * (Math.sin(a * 2 + rnd(seed + 7) * 6) * 0.5 + Math.sin(a * 3 + rnd(seed + 8) * 6) * 0.35);
      const r = R2 * (1 + br * 0.035 + sh.amp * Math.cos(sh.k * a + rnd(seed + 5) * 6.28) + noise + wob);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const p = new Path2D();
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    p.closePath();
    return p;
  }, "blob");
  const paintDrop = /* @__PURE__ */ __name((cx, cy, R2, shape, seed, phase, small) => {
    if (R2 <= 0.5) return;
    const path = blob(cx, cy, R2, shape, seed, phase);
    const g = ctx.createLinearGradient(cx, cy - R2, cx, cy + R2);
    g.addColorStop(0, o.color);
    g.addColorStop(1, o.color2);
    ctx.save();
    ctx.globalAlpha = o.alpha * out;
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.restore();
    ctx.save();
    ctx.clip(path);
    if (o.depth > 0) {
      ctx.globalAlpha = o.depth * 0.45 * out;
      ctx.fillStyle = o.color2;
      ctx.beginPath();
      ctx.ellipse(cx + R2 * 0.35, cy + R2 * 0.42, R2 * 0.95, R2 * 0.7, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (o.gloss > 0 && o.glossStyle !== "none") {
      ctx.fillStyle = "#ffffff";
      if (o.glossStyle === "crescent" || o.glossStyle === "both") {
        ctx.globalAlpha = o.gloss * 0.85 * out;
        const m = new Path2D();
        m.ellipse(cx - R2 * 0.12, cy - R2 * 0.08, R2 * 0.72, R2 * 0.72, 0, Math.PI * 1.05, Math.PI * 1.62);
        m.ellipse(cx - R2 * 0.02, cy + R2 * 0.02, R2 * 0.66, R2 * 0.66, 0, Math.PI * 1.62, Math.PI * 1.05, true);
        m.closePath();
        ctx.fill(m);
        if (!small) {
          ctx.globalAlpha = o.gloss * 0.35 * out;
          const b = new Path2D();
          b.ellipse(cx + R2 * 0.05, cy + R2 * 0.05, R2 * 0.74, R2 * 0.74, 0, Math.PI * 0.12, Math.PI * 0.58);
          b.ellipse(cx - R2 * 0.02, cy - R2 * 0.02, R2 * 0.7, R2 * 0.7, 0, Math.PI * 0.58, Math.PI * 0.12, true);
          b.closePath();
          ctx.fill(b);
        }
      }
      if (o.glossStyle === "dot" || o.glossStyle === "both") {
        ctx.globalAlpha = o.gloss * out;
        ctx.beginPath();
        ctx.ellipse(cx - R2 * 0.42, cy - R2 * 0.44, R2 * 0.11, R2 * 0.075, -0.7, 0, Math.PI * 2);
        ctx.fill();
        if (!small) {
          ctx.beginPath();
          ctx.arc(cx - R2 * 0.24, cy - R2 * 0.56, R2 * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
    if (o.rimWidth > 0) {
      ctx.save();
      ctx.globalAlpha = out;
      ctx.strokeStyle = o.rim;
      ctx.lineWidth = o.rimWidth * u * (small ? 0.6 : 1);
      ctx.stroke(path);
      ctx.restore();
    }
  }, "paintDrop");
  const fs = o.textSize * u;
  const lineInfo = lines.map((l) => {
    const sub = l.startsWith("~");
    return { text: sub ? l.slice(1).trim() : l, size: sub ? fs * 0.3 : fs, sub };
  });
  ctx.save();
  let tw = 0;
  let th = 0;
  for (const li of lineInfo) {
    ctx.font = `${o.weight} ${li.size}px "Noto Sans TC", "PingFang TC", sans-serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = li.sub ? `${li.size * 0.5}px` : `${li.size * 0.06}px`;
    tw = Math.max(tw, ctx.measureText(li.text).width);
    th += li.size * (li.sub ? 1.9 : 1.12);
  }
  ctx.restore();
  const tx = o.tx * W2;
  const ty = o.ty * H2;
  const R = o.size * S / 2;
  if (o.size > 0) {
    const s = appear(0);
    ctx.save();
    ctx.globalAlpha = appearA(0);
    paintDrop(o.x * W2, o.y * H2, R * s, o.shape, 0, 0, false);
    ctx.restore();
  }
  const ax = o.layout === "beside" ? tx : o.x * W2;
  const ay = o.layout === "beside" ? ty : o.y * H2;
  const rx = o.layout === "beside" ? tw / 2 + fs * 0.35 : R;
  const ry = o.layout === "beside" ? th / 2 + fs * 0.3 : R;
  for (let i = 0; i < o.sats; i++) {
    const a = rnd(i * 5 + 11) * Math.PI * 2;
    const d = 1.08 + rnd(i * 5 + 12) * o.satSpread;
    const sx = ax + Math.cos(a) * rx * d;
    const sy = ay + Math.sin(a) * ry * d + Math.sin(T * 1.6 + i) * o.breathe * 6 * u;
    const sr = o.satSize * S * 0.5 * (0.45 + rnd(i * 5 + 13) * 0.55);
    const s = appear(0.35 + i * 0.07);
    ctx.save();
    ctx.globalAlpha = appearA(0.35 + i * 0.07);
    paintDrop(sx, sy, sr * s, o.shape === "random" ? "random" : "circle", i + 20, i, true);
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let y = ty - th / 2;
  lineInfo.forEach((li, i) => {
    const h = li.size * (li.sub ? 1.9 : 1.12);
    const p = ease((T - 0.45 - i * 0.28) / 0.5);
    const e = o.entrance === "none" ? 1 : p;
    ctx.font = `${li.sub ? Math.min(o.weight, 500) : o.weight} ${li.size}px "Noto Sans TC", "PingFang TC", sans-serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = li.sub ? `${li.size * 0.5}px` : `${li.size * 0.06}px`;
    ctx.globalAlpha = e * out;
    const yy = y + h / 2 + (1 - e) * li.size * 0.25;
    if (o.strokeWidth > 0) {
      ctx.lineJoin = "round";
      ctx.lineWidth = o.strokeWidth * u * (li.sub ? 0.5 : 1);
      ctx.strokeStyle = o.stroke;
      ctx.strokeText(li.text, tx, yy);
    }
    ctx.fillStyle = o.textColor;
    ctx.fillText(li.text, tx, yy);
    y += h;
  });
  ctx.restore();
}, "drawDrop");
var parseDrop = /* @__PURE__ */ __name((words) => {
  const o = {
    ratio: "9:16",
    bg: "transparent",
    shape: "cloud",
    lobes: 4,
    amp: 0.11,
    irregular: 0.2,
    seed: 7,
    size: 0.62,
    x: 0.5,
    y: 0.5,
    color: "#a6d4f2",
    color2: "#5b9bd5",
    alpha: 0.8,
    depth: 0.35,
    gloss: 0.85,
    glossStyle: "both",
    rim: "#ffffff",
    rimWidth: 4,
    breathe: 0.6,
    speed: 4,
    layout: "inside",
    tx: 0.5,
    ty: 0.5,
    textColor: "#ffffff",
    textSize: 150,
    weight: 700,
    stroke: "#3f7fbf",
    strokeWidth: 0,
    sats: 0,
    satSize: 0.07,
    satSpread: 0.6,
    entrance: "pop",
    loop: 6
  };
  const presets = {
    inside: { layout: "inside", size: 0.62, sats: 3, satSize: 0.06, satSpread: 0.25 },
    beside: { layout: "beside", size: 0, sats: 7, satSize: 0.09, satSpread: 0.45, textColor: "#3f7fbf", strokeWidth: 0 },
    above: { layout: "above", size: 0.32, y: 0.36, ty: 0.6, textColor: "#3f7fbf", sats: 2 },
    below: { layout: "below", size: 0.32, y: 0.64, ty: 0.4, textColor: "#3f7fbf", sats: 2 }
  };
  const lines = [];
  const num = /* @__PURE__ */ __name((v) => Number.isFinite(parseFloat(v)) ? parseFloat(v) : void 0, "num");
  const rec = o;
  for (const raw of words) {
    const w = String(raw).trim();
    if (!w.startsWith("@")) {
      if (w) lines.push(w);
      continue;
    }
    for (const part of w.slice(1).split(/[;\s]+/)) {
      const [k, ...rest] = part.split("=");
      const v = rest.join("=").trim();
      if (!k) continue;
      if (k === "pos" || k === "layout") Object.assign(o, presets[v] ?? {});
      else if (k === "rim" && v.includes("/")) {
        const [c, wd] = v.split("/");
        o.rim = c;
        o.rimWidth = num(wd) ?? o.rimWidth;
      } else if (k in o) {
        const cur = rec[k];
        if (typeof cur === "number") {
          const n = num(v);
          if (n !== void 0) rec[k] = n;
        } else rec[k] = v;
      }
    }
  }
  return { o, lines: lines.length ? lines : ["\u6C34\u6EF4"] };
}, "parseDrop");
var dropToWords = /* @__PURE__ */ __name((o, lines) => {
  const d = parseDrop([]).o;
  const cur = o;
  const diff = Object.keys(d).filter((k) => cur[k] !== d[k]).map((k) => `${k}=${cur[k]}`);
  return [...lines, ...diff.length ? ["@" + diff.join(";")] : []];
}, "dropToWords");
var DROP_GLOBALS = `window.MA_DROP={draw:${fnSource(drawDrop)},parse:${fnSource(parseDrop)}};`;
globalThis.MA_DROP = { draw: drawDrop, parse: parseDrop };

// ../src/effects/liquid.ts
var AQ = `.S{--aq:color-mix(in srgb,#6fb3e4 90%,var(--ac));--aq2:color-mix(in srgb,#3f7fbf 92%,var(--ac))}`;
var GLASS = `.S .gb{border-radius:50%;background:radial-gradient(circle at 32% 28%,#fffe 0 5%,#fff6 11%,transparent 34%),radial-gradient(circle at 68% 80%,#fff8,transparent 30%),radial-gradient(circle,transparent 58%,#ffffff55 74%,#ffffffcc 99%),color-mix(in srgb,var(--aq) 22%,transparent);box-shadow:inset 0 -.6cqw 1.4cqw #ffffff55,0 1cqw 2.4cqw #0a3a6a26}`;
var liquid = [
  {
    id: "crisp-drop",
    cat: "liquid",
    zh: "\u92B3\u5229\u6C34\u6EF4",
    en: "Crisp Drop",
    desc: "\u908A\u7DE3\u96F6\u6A21\u7CCA\u7684\u6C34\u6EF4\u6A19\u984C\uFF0C\u53EF\u8ABF\u5F62\u72C0\u3001\u984F\u8272\u3001\u5149\u6FA4\u8207\u6587\u5B57\u4F4D\u7F6E",
    tags: ["\u54C1\u724C", "Shorts", "\u53EF\u758A\u5F71\u7247"],
    tone: "paper",
    sample: ["\u597D\u597D", "~just savor", "\u751F\u6D3B", "@sats=3"],
    hint: "\u4E00\u884C\u4E00\u53E5\uFF1B~ \u958B\u982D\u70BA\u82F1\u6587\u5C0F\u5B57\uFF1B@ \u958B\u982D\u70BA\u8A2D\u5B9A\uFF0C\u4F8B\u5982 @shape=circle;color=#bfe3f7;pos=beside",
    motion: "\u4E00\u9846\u534A\u900F\u660E\u6C34\u6EF4\u4EE5\u5F48\u6027\u653E\u5927\u767B\u5834\u4E26\u7DE9\u6162\u547C\u5438\u8B8A\u5F62\uFF0C\u6C34\u6EF4\u7531\u4E0A\u6DFA\u4E0B\u6DF1\u7684\u5169\u8272\u586B\u8272\u3001\u53F3\u4E0B\u786C\u908A\u6697\u9762\u3001\u5DE6\u4E0A\u786C\u908A\u6708\u7259\u9AD8\u5149\u8207\u5C0F\u5713\u9EDE\u9AD8\u5149\u3001\u767D\u8272\u5BE6\u7DDA\u5916\u6846\u7D44\u6210\uFF0C\u5168\u7A0B\u4E0D\u4F7F\u7528\u4EFB\u4F55\u6A21\u7CCA\u3001\u9670\u5F71\u6216\u5149\u6688\uFF0C\u908A\u7DE3\u4FDD\u6301\u92B3\u5229\uFF1B\u6587\u5B57\u9010\u884C\u7531\u4E0B\u6DE1\u5165\uFF0C\u53EF\u653E\u5728\u6C34\u6EF4\u5167\u3001\u4E0A\u4E0B\u65B9\uFF0C\u6216\u5728\u6587\u5B57\u5468\u570D\u9EDE\u7DB4\u5C0F\u6C34\u6EF4\u3002",
    motionEn: "A translucent droplet springs in and slowly breathes, built from a two-tone light-to-deep fill, a hard-edged darker lower-right shade, a hard-edged crescent highlight and small dot highlights at top left, and a solid white outline \u2014 with no blur, shadow or glow anywhere so every edge stays crisp; text fades up line by line and can sit inside the drop, above or below it, or be decorated with small droplets around it.",
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: /* @__PURE__ */ __name(() => `<canvas></canvas>`, "html"),
    globals: DROP_GLOBALS,
    run: /* @__PURE__ */ __name((root, w) => {
      const D = globalThis.MA_DROP;
      const cv = root.querySelector("canvas");
      const ctx = cv.getContext("2d");
      const { o, lines } = D.parse(w);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W2 = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
      const H2 = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
      const t0 = performance.now();
      let raf = 0;
      const f = /* @__PURE__ */ __name((now) => {
        raf = requestAnimationFrame(f);
        D.draw(ctx, W2, H2, o, lines, (now - t0) / 1e3);
      }, "f");
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    }, "run")
  },
  {
    id: "glass-blob-title",
    cat: "liquid",
    zh: "\u679C\u51CD\u6CE1\u6CE1\u6A19\u984C",
    en: "Glass Blob Title",
    desc: "\u534A\u900F\u660E\u679C\u51CD\u6C34\u6EF4\u7DE9\u6162\u547C\u5438\uFF0C\u767D\u5B57\u4E00\u884C\u884C\u6D6E\u73FE",
    tags: ["\u54C1\u724C", "\u7247\u982D"],
    tone: "paper",
    sample: ["\u597D\u597D", "just savor", "\u751F\u6D3B"],
    hint: "\u4E3B\u6A19 / \u82F1\u6587\u5C0F\u5B57 / \u4E3B\u6A19\uFF08\u4E09\u884C\uFF09",
    motion: "\u6DFA\u85CD\u8272\u4E0A\u6DFA\u4E0B\u6DF1\u7684\u6F38\u5C64\u80CC\u666F\u4E2D\u592E\uFF0C\u4E00\u9846\u56DB\u74E3\u96F2\u6735\u72C0\u7684\u534A\u900F\u660E\u679C\u51CD\u6C34\u6EF4\u7DE9\u6162\u547C\u5438\u8B8A\u5F62\uFF08\u5916\u5F62\u6301\u7E8C\u67D4\u548C\u8815\u52D5\u3001\u6574\u9AD4\u5FAE\u5FAE\u653E\u5927\u7E2E\u5C0F\uFF09\uFF0C\u6C34\u6EF4\u6709\u5DE6\u4E0A\u65B9\u767D\u8272\u9AD8\u5149\u3001\u5167\u7DE3\u67D4\u5149\u3001\u908A\u7DE3\u7D30\u767D\u5149\u3001\u4E0B\u65B9\u6DE1\u85CD\u6295\u5F71\u8207\u7D30\u5FAE\u9846\u7C92\u8CEA\u611F\uFF1B\u6C34\u6EF4\u5148\u6DE1\u5165\uFF0C\u767D\u8272\u6587\u5B57\u518D\u4F9D\u5E8F\u7531\u6A21\u7CCA\u6D6E\u73FE\uFF1A\u7B2C\u4E00\u884C\u4E3B\u6A19\u3001\u7B2C\u4E8C\u884C\u5B57\u8DDD\u5F88\u5BEC\u7684\u82F1\u6587\u5C0F\u5B57\u3001\u7B2C\u4E09\u884C\u4E3B\u6A19\uFF0C\u4E4B\u5F8C\u6301\u7E8C\u505C\u7559\u547C\u5438\u3002",
    motionEn: "Centered on a light-blue vertical gradient, a four-lobed cloud-shaped translucent jelly blob slowly breathes, its outline morphing softly while gently scaling; it has a white specular highlight at top left, a soft inner rim glow, a thin white edge, a pale blue drop shadow below, and fine grain; the blob fades in first, then white text resolves from blur line by line: a main title, a widely tracked small English line, and a second main title, then it holds and keeps breathing.",
    css: `
.S{--sky1:#b9ddf1;--sky2:#97c8e6;--sky3:#5f96cc;background:linear-gradient(var(--sky1),var(--sky2) 52%,var(--sky3))}
.S svg{position:absolute;inset:0;width:100%;height:100%}
.S .blob{animation:K_in 9s ease infinite both;transform-box:view-box;transform-origin:800px 450px}
.S .sh{fill:var(--sky3);opacity:.28}
.S .body{fill:url(#gbBody)}
.S .rim{fill:none;stroke:#fff;stroke-width:2.5;opacity:.38}
.S .ig{fill:none;stroke:#fff;stroke-width:80;opacity:.26}
.S .hi{fill:#fff;opacity:.75}
.S .ca{fill:#fff;opacity:.35}
.S .gr{opacity:.16;mix-blend-mode:overlay}
.S .tx{position:relative;display:flex;flex-direction:column;align-items:center;color:#fff;text-shadow:0 .2cqw .8cqw #0a3a6a33;font-weight:500}
.S .tx span{opacity:0;animation:K_t 9s ease infinite both;animation-delay:calc(1s + var(--i)*.55s)}
.S .t1{font-size:min(11cqw,19cqh);line-height:1.05;letter-spacing:.08em}
.S .t2{font-size:min(2.2cqw,3.8cqh);letter-spacing:.6em;margin:.4em 0 .5em .6em;font-weight:400}
@keyframes K_in{0%{opacity:0;transform:scale(.9)}10%{opacity:1}50%{transform:scale(1.03)}90%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.96)}}
@keyframes K_t{0%{opacity:0;filter:blur(1.2cqw);transform:translateY(25%)}14%,88%{opacity:1;filter:none;transform:none}97%,100%{opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => {
      const [a, b, c] = pick(w, 3, ["\u597D\u597D", "just savor", "\u751F\u6D3B"]);
      const shapes = [0, 0.5, 1.1, 1.6, 0.3].map((ph, i) => blobPath(800, 450, lobes(16, 330, 4, 0.11 + i % 2 * 0.03, 0.4 + ph * 0.25, 0.08, i + 2), -0.2 + i * 0.05));
      const vals = [...shapes, shapes[0]].join(";");
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
<defs>
<path id="gbP" d="${shapes[0]}"><animate attributeName="d" dur="8s" repeatCount="indefinite" values="${vals}" calcMode="spline" keySplines="${rep(5, () => ".45 0 .55 1;").slice(0, -1)}"/></path>
<radialGradient id="gbBody" cx="30%" cy="70%" r="90%"><stop offset="0" stop-color="#f4fbff" stop-opacity=".4"/><stop offset=".5" stop-color="#dff1ff" stop-opacity=".2"/><stop offset="1" stop-color="#cfe8fb" stop-opacity=".14"/></radialGradient>
<clipPath id="gbClip"><use href="#gbP"/></clipPath>
<filter id="gbB30" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="gbB14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="gbB2"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="gbN"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter>
</defs>
<g class="blob"><g transform="translate(800 450) scale(1.3 .92) translate(-800 -450)">
<use class="sh" href="#gbP" transform="translate(0 46)" filter="url(#gbB30)"/>
<use class="body" href="#gbP"/>
<g clip-path="url(#gbClip)"><use class="ig" href="#gbP" filter="url(#gbB14)"/><ellipse class="hi" cx="640" cy="250" rx="170" ry="70" transform="rotate(-18 640 250)" filter="url(#gbB30)"/><ellipse class="ca" cx="960" cy="690" rx="200" ry="60" filter="url(#gbB30)"/><rect class="gr" width="1600" height="900" filter="url(#gbN)"/></g>
<use class="rim" href="#gbP" filter="url(#gbB2)"/>
</g></g></svg>
<div class="tx"><span class="t1" style="--i:0">${esc(a)}</span><span class="t2" style="--i:1">${esc(b)}</span><span class="t1" style="--i:2">${esc(c)}</span></div>`;
    }, "html")
  },
  {
    id: "drop-splash",
    cat: "liquid",
    zh: "\u6C34\u6EF4\u843D\u4E0B",
    en: "Drop Splash",
    desc: "\u4E00\u6EF4\u6C34\u843D\u5165\u6C34\u9762\uFF0C\u6F23\u6F2A\u64F4\u6563\u5F8C\u6D6E\u51FA\u6587\u5B57",
    tags: ["\u958B\u5834", "\u6E05\u723D"],
    tone: "paper",
    sample: ["\u4E00\u6EF4\u5165\u9B42"],
    hint: "2\u20136 \u5B57",
    motion: "\u756B\u9762\u4E0B\u65B9\u662F\u6DE1\u85CD\u6C34\u9762\u3001\u4E0A\u65B9\u662F\u6DFA\u8272\u5929\u7A7A\uFF1B\u4E00\u9846\u6DDA\u6EF4\u5F62\u6C34\u6EF4\u5F9E\u4E0A\u65B9\u52A0\u901F\u843D\u4E0B\uFF0C\u89F8\u6C34\u77AC\u9593\u6FFA\u8D77\u5E7E\u9846\u5C0F\u6C34\u73E0\u5448\u62CB\u7269\u7DDA\u5F48\u8D77\u843D\u56DE\uFF0C\u6C34\u9762\u540C\u6642\u64F4\u6563\u4E09\u5708\u6A62\u5713\u6F23\u6F2A\uFF1B\u63A5\u8457\u6587\u5B57\u5F9E\u6C34\u9762\u4E0B\u6D6E\u4E0A\u4F86\uFF08\u5E36\u8F15\u5FAE\u6643\u52D5\u8207\u6A21\u7CCA\u8F49\u6E05\u6670\uFF09\uFF0C\u505C\u7559\u5F8C\u6C89\u56DE\u6C34\u9762\u3002",
    motionEn: "A pale blue water surface fills the lower frame under a light sky; a teardrop accelerates down from above, and on impact a few small droplets arc up and fall back while three elliptical ripples spread across the surface; the text then rises out of the water with a slight wobble, going from blurred to sharp, holds, and sinks back.",
    css: `${AQ}
.S{background:linear-gradient(color-mix(in srgb,var(--aq) 18%,#fff) 0 62%,color-mix(in srgb,var(--aq) 60%,#fff) 62%,var(--aq) 100%)}
.S .surf{position:absolute;left:0;right:0;top:62%;height:.25cqw;background:#fff9}
.S .drop{position:absolute;left:50%;top:62%;width:3.2cqw;height:4.5cqw;margin:-4.5cqw 0 0 -1.6cqw;animation:K_f 5s cubic-bezier(.55,0,1,.45) infinite both}
.S .drop svg{width:100%;height:100%;display:block;overflow:visible}.S .drop path{fill:var(--aq2)}.S .drop ellipse{fill:#fff;opacity:.8}
.S .rp{position:absolute;left:50%;top:62%;width:16cqw;height:3.4cqw;margin:-1.7cqw 0 0 -8cqw;border:.35cqw solid #fff;border-radius:50%;opacity:0;animation:K_r 5s ease-out infinite;animation-delay:calc(var(--i)*.22s)}
.S .sp{position:absolute;left:50%;top:62%;width:1cqw;height:1cqw;margin:-.5cqw;border-radius:50%;background:var(--aq2);opacity:0;animation:K_sx 5s linear infinite}
.S .sp i{position:absolute;inset:0;border-radius:50%;background:inherit;animation:K_sy 5s infinite}
.S .t{position:absolute;top:28%;font-size:min(10cqw,18cqh);color:var(--aq2);animation:K_t 5s cubic-bezier(.2,.8,.2,1) infinite both;text-shadow:0 .3cqw 0 #fff}
@keyframes K_f{0%{transform:translateY(-62cqh);opacity:1}24%{transform:none;opacity:1}25%,100%{transform:none;opacity:0}}
@keyframes K_r{0%,24%{transform:scale(.1);opacity:0}26%{opacity:1}60%,100%{transform:scale(1.8);opacity:0}}
@keyframes K_sx{0%,24%{transform:none;opacity:0}25%{opacity:1}42%{transform:translateX(var(--x));opacity:1}43%,100%{opacity:0;transform:translateX(var(--x))}}
@keyframes K_sy{0%,24%{transform:none}33%{transform:translateY(var(--y));animation-timing-function:ease-in}42%,100%{transform:none}}
@keyframes K_t{0%,30%{transform:translateY(60%);opacity:0;filter:blur(1cqw)}44%{transform:translateY(-6%);opacity:1;filter:none}50%,82%{transform:none;opacity:1}94%,100%{transform:translateY(60%);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<div class="surf"></div><div class="t">${esc(w[0])}</div>${rep(3, (i) => `<i class="rp" style="--i:${i}"></i>`)}${rep(7, (i) => `<i class="sp" style="--x:${((i - 3) * 2.6 + (rand(i) - 0.5) * 2).toFixed(1)}cqw"><i style="--y:${(-6 - rand(i + 4) * 8).toFixed(1)}cqh"></i></i>`)}<div class="drop"><svg viewBox="0 0 40 56"><path d="M20 0C20 0 40 27 40 37A20 19 0 0 1 0 37C0 27 20 0 20 0Z"/><ellipse cx="13" cy="38" rx="4" ry="7"/></svg></div>`, "html")
  },
  {
    id: "bubbles-rise",
    cat: "liquid",
    zh: "\u6CE1\u6CE1\u4E0A\u5347",
    en: "Rising Bubbles",
    desc: "\u5927\u5927\u5C0F\u5C0F\u7684\u6CE1\u6CE1\u5F80\u4E0A\u98C4\uFF0C\u4E2D\u592E\u5927\u6CE1\u6CE1\u88DD\u8457\u6A19\u984C",
    tags: ["\u7642\u7652", "\u54C1\u724C"],
    tone: "paper",
    sample: ["\u6CE1\u6CE1\u6642\u5149"],
    hint: "2\u20136 \u5B57",
    motion: "\u85CD\u8272\u6F38\u5C64\u80CC\u666F\u4E2D\uFF0C\u5927\u5C0F\u4E0D\u4E00\u7684\u900F\u660E\u73BB\u7483\u6CE1\u6CE1\u5F9E\u4E0B\u65B9\u4EE5\u4E0D\u540C\u901F\u5EA6\u5F80\u4E0A\u98C4\uFF0C\u4E26\u5DE6\u53F3\u8F15\u5FAE\u64FA\u52D5\uFF1B\u756B\u9762\u4E2D\u592E\u4E00\u9846\u5927\u6CE1\u6CE1\u5305\u8457\u6A19\u984C\uFF0C\u7DE9\u6162\u547C\u5438\u4E26\u4E0A\u4E0B\u6D6E\u52D5\uFF0C\u6CE1\u6CE1\u8868\u9762\u6709\u767D\u8272\u9AD8\u5149\u8207\u5F69\u8679\u908A\u7DE3\u53CD\u5149\u3002",
    motionEn: "Against a blue gradient, transparent glass bubbles of various sizes drift up from below at different speeds with a gentle side-to-side sway; a large central bubble holds the title, slowly breathing and bobbing, its surface showing white highlights and an iridescent rim.",
    css: `${AQ}${GLASS}
.S{background:linear-gradient(color-mix(in srgb,var(--aq) 40%,#fff),var(--aq2))}
.S .b{position:absolute;bottom:-12%;left:var(--x);width:var(--s);aspect-ratio:1;animation:K_up var(--d) linear infinite;animation-delay:var(--dl)}
.S .b i{display:block;width:100%;height:100%;animation:K_sw calc(var(--d)/3) ease-in-out infinite alternate}
.S .big{position:relative;width:min(44cqw,78cqh);aspect-ratio:1;display:grid;place-items:center;animation:K_br 4s ease-in-out infinite;box-shadow:inset 0 0 0 .3cqw #ffffff66,inset .6cqw -.6cqw 2cqw #ff9ecf44,inset -.6cqw .6cqw 2cqw #8ef0ff55,0 1cqw 3cqw #0a3a6a33}
.S .big b{font-size:min(7cqw,12cqh);color:#fff;text-shadow:0 .2cqw .8cqw #0a3a6a55;font-weight:700}
@keyframes K_up{from{transform:translateY(0)}to{transform:translateY(-130cqh)}}
@keyframes K_sw{from{transform:translateX(-1.4cqw)}to{transform:translateX(1.4cqw)}}
@keyframes K_br{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3%) scale(1.04,.98)}}`,
    html: /* @__PURE__ */ __name((w) => `${rep(22, (i) => `<span class="b" style="--x:${(rand(i) * 96).toFixed(1)}%;--s:${(1.2 + rand(i + 2) * 6).toFixed(1)}cqw;--d:${(5 + rand(i + 5) * 7).toFixed(1)}s;--dl:${(-rand(i + 9) * 12).toFixed(1)}s"><i class="gb"></i></span>`)}<div class="big gb"><b>${esc(w[0])}</b></div>`, "html")
  },
  {
    id: "gooey-merge",
    cat: "liquid",
    zh: "\u6DB2\u614B\u878D\u5408",
    en: "Gooey Merge",
    desc: "\u5E7E\u9846\u6DB2\u6EF4\u4E92\u76F8\u5438\u5F15\u3001\u9ECF\u5728\u4E00\u8D77\u8B8A\u6210\u6A19\u984C\u5E95",
    tags: ["\u8F49\u5834", "\u6709\u6A5F"],
    tone: "ink",
    sample: ["\u5408\u800C\u70BA\u4E00"],
    hint: "2\u20136 \u5B57",
    motion: "\u6697\u8272\u80CC\u666F\u4E2D\uFF0C\u4E94\u9846\u5927\u5C0F\u4E0D\u540C\u7684\u4E3B\u8272\u6DB2\u6EF4\u5F9E\u756B\u9762\u5404\u8655\u6F02\u6D6E\u9760\u8FD1\uFF0C\u5F7C\u6B64\u63A5\u89F8\u6642\u50CF\u6DB2\u9AD4\u4E00\u6A23\u9ECF\u9023\u878D\u5408\uFF08SVG \u9ECF\u6DB2\u6FFE\u93E1\uFF09\uFF0C\u6700\u5F8C\u805A\u6210\u4E00\u500B\u5E36\u6709\u6A5F\u908A\u7DE3\u7684\u5927\u8272\u584A\uFF0C\u6587\u5B57\u5728\u8272\u584A\u4E0A\u6D6E\u73FE\uFF1B\u505C\u7559\u5F8C\u6DB2\u6EF4\u518D\u5206\u96E2\u6563\u958B\u3002",
    motionEn: "On a dark background, five accent-colored droplets of different sizes drift in from around the frame; where they touch they stick and merge like liquid (SVG goo filter), finally pooling into one large organic-edged blob on which the text appears; after a hold the droplets separate and drift apart.",
    css: `.S svg{position:absolute;inset:0;width:100%;height:100%}
.S .goo{filter:url(#gmF)}
.S .dp{fill:var(--ac);transform-box:fill-box;transform-origin:center;animation:K_m 6s cubic-bezier(.6,0,.3,1) infinite}
.S .t{position:relative;font-size:min(8cqw,14cqh);color:#111;animation:K_t 6s ease infinite both}
@keyframes K_m{0%,8%{transform:translate(var(--x),var(--y)) scale(.8)}45%,72%{transform:none}92%,100%{transform:translate(var(--x),var(--y)) scale(.8)}}
@keyframes K_t{0%,42%{opacity:0;transform:scale(.8)}52%,72%{opacity:1;transform:none}80%,100%{opacity:0;transform:scale(1.1)}}`,
    html: /* @__PURE__ */ __name((w) => {
      const drops = [
        [800, 450, 170, -520, -260],
        [700, 430, 110, -760, 300],
        [910, 470, 120, 640, -300],
        [760, 520, 90, 300, 380],
        [880, 400, 80, 720, 260]
      ];
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><filter id="gmF"><feGaussianBlur stdDeviation="22"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs><g class="goo">${drops.map(([x, y, r, dx, dy]) => `<circle class="dp" style="--x:${dx}px;--y:${dy}px" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g></svg><div class="t">${esc(w[0])}</div>`;
    }, "html")
  },
  {
    id: "water-ripple",
    cat: "liquid",
    zh: "\u6C34\u6CE2\u6F23\u6F2A",
    en: "Water Ripple",
    desc: "\u6587\u5B57\u6D6E\u5728\u6C34\u9762\uFF0C\u4E00\u5708\u5708\u6F23\u6F2A\u5F9E\u4E2D\u5FC3\u64F4\u6563",
    tags: ["\u7642\u7652", "\u6C1B\u570D"],
    tone: "paper",
    sample: ["\u975C\u5FC3"],
    hint: "1\u20134 \u5B57",
    motion: "\u4FEF\u8996\u7684\u85CD\u8272\u6C34\u9762\uFF0C\u6C34\u5E95\u6709\u7DE9\u6162\u6D41\u52D5\u7684\u5149\u7D0B\uFF1B\u6587\u5B57\u4F4D\u65BC\u4E2D\u592E\uFF0C\u88AB\u6C34\u6CE2\u8F15\u5FAE\u626D\u66F2\uFF1B\u6BCF\u9694 0.8 \u79D2\u5F9E\u4E2D\u5FC3\u64F4\u6563\u51FA\u4E00\u5708\u767D\u8272\u7D30\u6F23\u6F2A\uFF0C\u6F23\u6F2A\u8D8A\u5F80\u5916\u8D8A\u6DE1\u3002",
    motionEn: "A top-down blue water surface with slowly drifting caustic light below; the text sits at the center, gently warped by the water; every 0.8s a thin white ripple expands from the center, fading as it travels outward.",
    css: `${AQ}
.S{background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--aq) 55%,#fff),var(--aq2))}
.S .ca{position:absolute;inset:-20%;background:repeating-radial-gradient(circle at 30% 40%,#ffffff1a 0 1.2cqw,transparent 1.2cqw 4cqw),repeating-radial-gradient(circle at 70% 60%,#ffffff14 0 1cqw,transparent 1cqw 3.4cqw);filter:url(#wrF) blur(.3cqw);animation:K_c 12s linear infinite}
.S .rg{position:absolute;width:20cqmin;aspect-ratio:1;border-radius:50%;border:.3cqmin solid #fff;animation:K_r 4s ease-out infinite;animation-delay:calc(var(--i)*-.8s)}
.S .t{position:relative;font-size:min(14cqw,24cqh);color:#fff;filter:url(#wrT);text-shadow:0 .4cqw 1.4cqw #0a3a6a44;font-family:var(--serif)}
@keyframes K_c{to{transform:translate(6%,4%) rotate(8deg)}}
@keyframes K_r{0%{transform:scale(.4);opacity:.9}100%{transform:scale(6);opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => `<svg width="0" height="0" style="position:absolute"><filter id="wrF"><feTurbulence type="turbulence" baseFrequency=".008 .012" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="9s" values=".008 .012;.012 .008;.008 .012" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="60"/></filter><filter id="wrT"><feTurbulence type="turbulence" baseFrequency=".02 .05" numOctaves="1" seed="2"><animate attributeName="baseFrequency" dur="5s" values=".02 .05;.03 .03;.02 .05" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="8"/></filter></svg><div class="ca"></div>${rep(5, (i) => `<i class="rg" style="--i:${i}"></i>`)}<div class="t">${esc(w[0])}</div>`, "html")
  },
  {
    id: "bubble-pop",
    cat: "liquid",
    zh: "\u6CE1\u6CE1\u7834\u6389\u63DB\u5B57",
    en: "Bubble Pop Swap",
    desc: "\u6CE1\u6CE1\u5439\u5927\u5F8C\u556A\u4E00\u8072\u7834\u6389\uFF0C\u6C34\u73E0\u56DB\u6563\u3001\u63DB\u6210\u4E0B\u4E00\u500B\u8A5E",
    tags: ["\u5207\u63DB", "\u4FCF\u76AE"],
    tone: "paper",
    sample: ["\u5439\u6CE1\u6CE1", "\u556A\uFF01"],
    hint: "2 \u500B\u8A5E",
    motion: "\u73BB\u7483\u6CE1\u6CE1\u5305\u8457\u7B2C\u4E00\u500B\u8A5E\u5F9E\u5C0F\u5439\u5927\u4E26\u8F15\u5FAE\u6643\u52D5\uFF0C\u5230\u6700\u5927\u6642\u300C\u556A\u300D\u5730\u7834\u6389\uFF1A\u6CE1\u6CE1\u77AC\u9593\u653E\u5927\u6D88\u5931\u3001\u5341\u9846\u5C0F\u6C34\u73E0\u5411\u56DB\u5468\u5674\u6563\uFF0C\u7B2C\u4E8C\u500B\u8A5E\u5728\u539F\u4F4D\u5F48\u51FA\uFF1B\u63A5\u8457\u65B0\u7684\u6CE1\u6CE1\u5439\u8D77\u5305\u4F4F\u7B2C\u4E8C\u500B\u8A5E\uFF0C\u5169\u500B\u8A5E\u4EA4\u66FF\u5FAA\u74B0\u3002",
    motionEn: "A glass bubble wrapping the first word inflates from small to large with a slight wobble; at full size it pops \u2014 the bubble flashes larger and vanishes while ten small droplets spray outward \u2014 and the second word springs up in place; a new bubble then inflates around it, and the two words alternate in a loop.",
    css: `${AQ}${GLASS}
.S{background:linear-gradient(color-mix(in srgb,var(--aq) 22%,#fff),color-mix(in srgb,var(--aq) 50%,#fff))}
.S .u{position:absolute;display:grid;place-items:center;width:min(40cqw,70cqh);aspect-ratio:1;animation-delay:calc(var(--i)*-3s)}
.S .u .gb{position:absolute;inset:0;animation:K_b 6s cubic-bezier(.3,1.3,.5,1) infinite;animation-delay:inherit}
.S .u b{position:relative;font-size:min(7cqw,12cqh);color:var(--aq2);animation:K_w 6s cubic-bezier(.3,1.7,.5,1) infinite;animation-delay:inherit}
.S .u .dr{position:absolute;width:1.6cqmin;height:1.6cqmin;border-radius:50%;background:var(--aq);opacity:0;animation:K_d 6s ease-out infinite;animation-delay:inherit}
@keyframes K_b{0%{transform:scale(.2);opacity:0}6%{opacity:1}36%{transform:scale(1)}40%{transform:scale(1.04,.96)}44%{transform:scale(1)}47%{transform:scale(1.18);opacity:.6}48%,100%{transform:scale(1.2);opacity:0}}
@keyframes K_w{0%,2%{transform:scale(0);opacity:0}10%,46%{transform:none;opacity:1}48%,100%{transform:scale(1.3);opacity:0}}
@keyframes K_d{0%,46%{transform:none;opacity:0}47%{opacity:1}60%,100%{transform:translate(var(--x),var(--y));opacity:0}}`,
    html: /* @__PURE__ */ __name((w) => pick(w, 2, ["\u5439\u6CE1\u6CE1", "\u556A\uFF01"]).map(
      (t, i) => `<div class="u" style="--i:${i}"><i class="gb"></i><b>${esc(t)}</b>${rep(10, (k) => {
        const a = k / 10 * Math.PI * 2;
        return `<i class="dr" style="--x:${(Math.cos(a) * 28).toFixed(1)}cqmin;--y:${(Math.sin(a) * 28).toFixed(1)}cqmin"></i>`;
      })}</div>`
    ).join(""), "html")
  }
];

// ../src/photokit.ts
var MODULE_INFO = {
  kenburns: { zh: "\u63A8\u62C9\u904B\u93E1", en: "Ken Burns", desc: "\u5F9E\u8D77\u59CB\u756B\u9762\u6162\u6162\u63A8\u8FD1\u6216\u62C9\u9060\u3001\u5E73\u79FB\u5230\u7D50\u675F\u756B\u9762", slots: 1 },
  swing: { zh: "\u65CB\u8F49\u7529\u5165", en: "Swing In", desc: "\u7167\u7247\u5E36\u767D\u6846\u65CB\u8F49\u7529\u9032\u756B\u9762\uFF0C\u505C\u5728\u5FAE\u659C\u89D2\u5EA6", slots: 1 },
  tilt: { zh: "3D \u50BE\u659C\u5361\u7247", en: "3D Tilt Card", desc: "\u7167\u7247\u8B8A\u6210\u6709\u539A\u5EA6\u7684\u5361\u7247\uFF0C\u4EE5\u900F\u8996\u89D2\u5EA6\u8F49\u5165\u4E26\u8F15\u5FAE\u64FA\u52D5", slots: 1 },
  compare: { zh: "\u524D\u5F8C\u6ED1\u687F\u5C0D\u6BD4", en: "Before / After", desc: "\u5206\u9694\u7DDA\u6383\u904E\u756B\u9762\uFF0C\u524D\u5F8C\u5169\u5F35\u7167\u7247\u5C0D\u7167", slots: 2 },
  magnify: { zh: "\u5C40\u90E8\u653E\u5927\u93E1", en: "Magnifier", desc: "\u5708\u51FA\u7D30\u7BC0\uFF0C\u653E\u5927\u5230\u65C1\u908A\u7684\u5713\u5F62\u93E1\u982D\u4E26\u52A0\u4E0A\u6A19\u8A3B", slots: 1 }
};
var MODULE_DEFAULTS = {
  kenburns: { fz: 1, fx: 0.5, fy: 0.5, tz: 1.35, tx: 0.62, ty: 0.42, ease: "inout" },
  swing: { size: 0.78, px: 0.5, py: 0.46, aspect: 0.75, angle: -28, rest: -4, scale: 1.6, from: "left", border: 18, radius: 10, frame: "#ffffff", float: 1 },
  tilt: { size: 0.78, px: 0.5, py: 0.47, aspect: 0.75, ry0: -55, ry: -14, rx: 8, sway: 6, period: 4, depth: 18, border: 0, radius: 18, frame: "#ffffff", edge: "#e8e2d6" },
  compare: { dir: "h", from: 0.85, to: 0.15, hold: 0.8, sweep: 1.6, labelA: "BEFORE", labelB: "AFTER", line: "#ffffff", knob: "#ff5a36" },
  magnify: { ax: 0.38, ay: 0.58, ar: 0.07, lx: 0.66, ly: 0.3, lr: 0.2, ring: "#ffd23f", push: 1.06 }
};
var pos = /* @__PURE__ */ __name((k, label) => ({ k, label, type: "range", min: 0, max: 1, step: 0.01 }), "pos");
var PARAMS = {
  kenburns: [
    { k: "fz", label: "\u8D77\u59CB\u7E2E\u653E", type: "range", min: 1, max: 3, step: 0.01 },
    pos("fx", "\u8D77\u59CB\u4E2D\u5FC3 X"),
    pos("fy", "\u8D77\u59CB\u4E2D\u5FC3 Y"),
    { k: "tz", label: "\u7D50\u675F\u7E2E\u653E", type: "range", min: 1, max: 3, step: 0.01 },
    pos("tx", "\u7D50\u675F\u4E2D\u5FC3 X"),
    pos("ty", "\u7D50\u675F\u4E2D\u5FC3 Y"),
    { k: "ease", label: "\u901F\u5EA6\u66F2\u7DDA", type: "seg", opts: [["inout", "\u6162-\u5FEB-\u6162"], ["linear", "\u7B49\u901F"]] }
  ],
  swing: [
    { k: "from", label: "\u7529\u5165\u65B9\u5411", type: "seg", opts: [["left", "\u5DE6"], ["right", "\u53F3"], ["top", "\u4E0A"], ["bottom", "\u4E0B"], ["none", "\u539F\u5730"]] },
    { k: "size", label: "\u7167\u7247\u5BEC\u5EA6", type: "range", min: 0.3, max: 1, step: 0.01 },
    { k: "aspect", label: "\u5BEC\u9AD8\u6BD4\uFF080\uFF1D\u539F\u5716\uFF09", type: "range", min: 0, max: 2, step: 0.01 },
    { k: "angle", label: "\u8D77\u59CB\u89D2\u5EA6", type: "range", min: -90, max: 90, step: 1 },
    { k: "rest", label: "\u505C\u7559\u89D2\u5EA6", type: "range", min: -20, max: 20, step: 0.5 },
    { k: "scale", label: "\u8D77\u59CB\u653E\u5927", type: "range", min: 1, max: 3, step: 0.05 },
    { k: "border", label: "\u767D\u6846\u7C97\u7D30", type: "range", min: 0, max: 60, step: 1 },
    { k: "radius", label: "\u5713\u89D2", type: "range", min: 0, max: 60, step: 1 },
    { k: "frame", label: "\u6846\u8272", type: "color" },
    { k: "float", label: "\u505C\u7559\u6642\u6F02\u6D6E", type: "seg", opts: [["1", "\u958B"], ["0", "\u95DC"]] }
  ],
  tilt: [
    { k: "size", label: "\u5361\u7247\u5BEC\u5EA6", type: "range", min: 0.3, max: 1, step: 0.01 },
    { k: "aspect", label: "\u5BEC\u9AD8\u6BD4\uFF080\uFF1D\u539F\u5716\uFF09", type: "range", min: 0, max: 2, step: 0.01 },
    { k: "ry0", label: "\u8D77\u59CB\u8F49\u89D2", type: "range", min: -89, max: 89, step: 1 },
    { k: "ry", label: "\u505C\u7559\u8F49\u89D2\uFF08\u5DE6\u53F3\uFF09", type: "range", min: -60, max: 60, step: 1 },
    { k: "rx", label: "\u4FEF\u4EF0\u89D2", type: "range", min: -40, max: 40, step: 1 },
    { k: "sway", label: "\u64FA\u52D5\u5E45\u5EA6", type: "range", min: 0, max: 20, step: 0.5 },
    { k: "period", label: "\u64FA\u52D5\u9031\u671F\uFF08\u79D2\uFF09", type: "range", min: 1, max: 10, step: 0.5 },
    { k: "depth", label: "\u5361\u7247\u539A\u5EA6", type: "range", min: 0, max: 80, step: 1 },
    { k: "border", label: "\u767D\u6846\u7C97\u7D30", type: "range", min: 0, max: 60, step: 1 },
    { k: "radius", label: "\u5713\u89D2", type: "range", min: 0, max: 60, step: 1 },
    { k: "frame", label: "\u6846\u8272", type: "color" },
    { k: "edge", label: "\u5074\u908A\u984F\u8272", type: "color" }
  ],
  compare: [
    { k: "dir", label: "\u5206\u9694\u65B9\u5411", type: "seg", opts: [["h", "\u5DE6\u53F3"], ["v", "\u4E0A\u4E0B"]] },
    pos("from", "\u5206\u9694\u7DDA\u8D77\u9EDE"),
    pos("to", "\u5206\u9694\u7DDA\u7D42\u9EDE"),
    { k: "hold", label: "\u958B\u59CB\u524D\u505C\u7559\uFF08\u79D2\uFF09", type: "range", min: 0, max: 4, step: 0.1 },
    { k: "sweep", label: "\u6383\u904E\u6642\u9593\uFF08\u79D2\uFF09", type: "range", min: 0.3, max: 6, step: 0.1 },
    { k: "labelA", label: "\u5716\u7247 1 \u6A19\u7C64", type: "text" },
    { k: "labelB", label: "\u5716\u7247 2 \u6A19\u7C64", type: "text" },
    { k: "line", label: "\u5206\u9694\u7DDA\u8272", type: "color" },
    { k: "knob", label: "\u628A\u624B\u984F\u8272", type: "color" }
  ],
  magnify: [
    pos("ax", "\u7D30\u7BC0\u4F4D\u7F6E X"),
    pos("ay", "\u7D30\u7BC0\u4F4D\u7F6E Y"),
    { k: "ar", label: "\u5708\u9078\u534A\u5F91", type: "range", min: 0.02, max: 0.3, step: 5e-3 },
    pos("lx", "\u93E1\u982D\u4F4D\u7F6E X"),
    pos("ly", "\u93E1\u982D\u4F4D\u7F6E Y"),
    { k: "lr", label: "\u93E1\u982D\u534A\u5F91", type: "range", min: 0.08, max: 0.45, step: 5e-3 },
    { k: "ring", label: "\u5708\u7DDA\u984F\u8272", type: "color" },
    { k: "push", label: "\u80CC\u666F\u6162\u63A8", type: "range", min: 1, max: 1.4, step: 0.01 }
  ]
};
var PHOTO_MODULES = Object.keys(MODULE_INFO);
var photoFxId = /* @__PURE__ */ __name((m) => `photo-${m}`, "photoFxId");
var isPhotoFx = /* @__PURE__ */ __name((id) => id.startsWith("photo-"), "isPhotoFx");
var normalizePhotoScene = /* @__PURE__ */ __name((raw, fallback = "kenburns") => {
  const module = PHOTO_MODULES.includes(raw.module) ? raw.module : fallback;
  const base2 = defaultPhotoScene(module);
  const ratio = ["9:16", "16:9", "1:1"].includes(raw.ratio) ? raw.ratio : base2.ratio;
  const loop2 = Math.max(1.5, Math.min(20, Number(raw.loop) || base2.loop));
  const params = { ...base2.params };
  for (const f of PARAMS[module]) {
    const v = raw.params?.[f.k];
    if (v === void 0 || v === null || v === "") continue;
    if (f.type === "range") {
      const n = Number(v);
      if (Number.isFinite(n)) params[f.k] = Math.max(f.min, Math.min(f.max, n));
    } else if (f.type === "seg") {
      if (f.opts.some(([o]) => o === String(v))) params[f.k] = f.k === "float" ? Number(v) : String(v);
    } else params[f.k] = String(v).slice(0, 40);
  }
  const images = Array.isArray(raw.images) ? raw.images.map((x) => typeof x === "string" ? x : "").slice(0, MODULE_INFO[module].slots) : [];
  const c = raw.caption;
  const caption2 = c ? {
    text: String(c.text ?? "").slice(0, 120),
    x: Math.max(0, Math.min(1, Number(c.x ?? 0.5))),
    y: Math.max(0, Math.min(1, Number(c.y ?? 0.86))),
    size: Math.max(0.4, Math.min(3, Number(c.size ?? 1))),
    style: ["pill", "plain", "bar"].includes(c.style) ? c.style : "pill",
    color: /^#[0-9a-f]{6}$/i.test(String(c.color)) ? String(c.color) : "#ffd23f",
    delay: Math.max(0, Math.min(20, Number(c.delay ?? 1)))
  } : base2.caption;
  const bg = typeof raw.bg === "string" && /^(transparent|#[0-9a-f]{3,8}(,\s*#[0-9a-f]{3,8})?)$/i.test(raw.bg.trim()) ? raw.bg.trim() : base2.bg;
  return { ratio, loop: loop2, module, bg, images, params, caption: caption2 };
}, "normalizePhotoScene");
var photoSceneFromWords = /* @__PURE__ */ __name((w, module) => {
  const j = w.find((x) => String(x).trim().startsWith("{"));
  if (j) {
    try {
      return normalizePhotoScene(JSON.parse(j), module);
    } catch {
    }
  }
  const sc = defaultPhotoScene(module);
  if (sc.caption) sc.caption.text = w.filter((x) => x && !x.startsWith("{")).join("\n");
  return sc;
}, "photoSceneFromWords");
var defaultPhotoScene = /* @__PURE__ */ __name((module = "kenburns") => ({
  ratio: "9:16",
  loop: 6,
  module,
  bg: "#151515",
  images: [],
  params: { ...MODULE_DEFAULTS[module] },
  caption: { text: "", x: 0.5, y: 0.86, size: 1, style: "pill", color: "#ffd23f", delay: 1 }
}), "defaultPhotoScene");
var photoRenderer = /* @__PURE__ */ __name(() => {
  const clamp = /* @__PURE__ */ __name((p) => Math.max(0, Math.min(1, p)), "clamp");
  const ease = /* @__PURE__ */ __name((p) => 1 - Math.pow(1 - clamp(p), 3), "ease");
  const inout = /* @__PURE__ */ __name((p) => {
    const q = clamp(p);
    return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
  }, "inout");
  const back = /* @__PURE__ */ __name((p) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  }, "back");
  const lerp = /* @__PURE__ */ __name((a, b, p) => a + (b - a) * p, "lerp");
  const num = /* @__PURE__ */ __name((v, d) => typeof v === "number" && Number.isFinite(v) ? v : Number.isFinite(parseFloat(String(v))) ? parseFloat(String(v)) : d, "num");
  const FONT = '"Noto Sans TC", "PingFang TC", sans-serif';
  const holders = /* @__PURE__ */ new Map();
  const placeholder2 = /* @__PURE__ */ __name((i, after = i % 2 === 0) => {
    const key = `${i}|${after}`;
    let c = holders.get(key);
    if (!c) {
      c = document.createElement("canvas");
      c.width = 1600;
      c.height = 1200;
      const x = c.getContext("2d");
      const sky = x.createLinearGradient(0, 0, 0, 760);
      sky.addColorStop(0, after ? "#7fb8e6" : "#b9c3cc");
      sky.addColorStop(1, after ? "#f3d9b0" : "#e2ddd3");
      x.fillStyle = sky;
      x.fillRect(0, 0, 1600, 1200);
      x.fillStyle = after ? "#ffe7a8" : "#f4f1ea";
      x.beginPath();
      x.arc(1250, 230, 90, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = after ? "#8fb3a0" : "#a9b2ad";
      x.beginPath();
      x.moveTo(0, 700);
      for (let k = 0; k <= 16; k++) x.lineTo(k * 100, 610 + Math.sin(k * 1.3) * 50 + Math.cos(k * 0.7) * 30);
      x.lineTo(1600, 760);
      x.lineTo(0, 760);
      x.fill();
      if (after) {
        const towers = [[120, 300, 190], [360, 200, 230], [640, 120, 260], [950, 230, 210], [1210, 330, 240]];
        towers.forEach(([tx, ty, tw], n) => {
          x.fillStyle = ["#e9e4da", "#d8d2c6", "#f2eee6", "#ded8cc", "#ece7dd"][n];
          x.fillRect(tx, ty, tw, 860 - ty);
          x.fillStyle = "#5d7f9e";
          for (let r = ty + 40; r < 800; r += 56) for (let q = tx + 24; q < tx + tw - 30; q += 46) x.fillRect(q, r, 28, 30);
        });
        x.fillStyle = "#6aa36f";
        for (let k = 0; k < 14; k++) {
          x.beginPath();
          x.arc(60 + k * 115, 860, 46 + k % 3 * 10, 0, Math.PI * 2);
          x.fill();
        }
      } else {
        x.strokeStyle = "#6b6258";
        x.lineWidth = 14;
        x.beginPath();
        x.moveTo(980, 840);
        x.lineTo(980, 220);
        x.lineTo(700, 220);
        x.moveTo(980, 220);
        x.lineTo(1380, 220);
        x.moveTo(1240, 220);
        x.lineTo(1240, 420);
        x.stroke();
        x.fillStyle = "#e8c04a";
        x.fillRect(1205, 420, 70, 50);
      }
      x.fillStyle = after ? "#9a9187" : "#b49a78";
      x.fillRect(0, 860, 1600, 340);
      x.fillStyle = after ? "#5b5650" : "#9b7f5c";
      x.fillRect(0, 960, 1600, 120);
      x.fillStyle = after ? "#f4f1ea" : "#c9b48f";
      for (let k = 0; k < 16; k++) x.fillRect(k * 110 + 20, 1012, 60, 14);
      if (!after) {
        x.fillStyle = "#4f7d5a";
        x.fillRect(0, 800, 1600, 70);
        x.fillStyle = "#f4f1ea";
        x.font = `900 44px ${FONT}`;
        x.fillText("\u65BD\u5DE5\u4E2D \xB7 \u570D\u7C6C", 640, 845);
      }
      x.fillStyle = "#111111cc";
      x.beginPath();
      x.roundRect(36, 36, 300, 96, 48);
      x.fill();
      x.fillStyle = "#ffffff";
      x.font = `900 52px ${FONT}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(`\u5716\u7247 ${i + 1}`, 186, 86);
      holders.set(key, c);
    }
    return c;
  }, "placeholder");
  const coverParams2 = /* @__PURE__ */ __name((img, W2, H2, z, cx, cy) => {
    const k = Math.max(W2 / img.width, H2 / img.height) * Math.max(1, z);
    const vw = W2 / k;
    const vh = H2 / k;
    const sx = Math.max(0, Math.min(img.width - vw, cx * img.width - vw / 2));
    const sy = Math.max(0, Math.min(img.height - vh, cy * img.height - vh / 2));
    return { k, sx, sy, vw, vh };
  }, "coverParams");
  const drawCover = /* @__PURE__ */ __name((ctx, img, W2, H2, z, cx, cy) => {
    const p = coverParams2(img, W2, H2, z, cx, cy);
    ctx.drawImage(img, p.sx, p.sy, p.vw, p.vh, 0, 0, W2, H2);
    return p;
  }, "drawCover");
  const framed = /* @__PURE__ */ new Map();
  const frameTex = /* @__PURE__ */ __name((img, w, h, border, radius, color) => {
    const key = `${img.src ?? "c"}|${img.width}x${img.height}|${w}x${h}|${border}|${radius}|${color}`;
    let c = framed.get(key);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = Math.max(2, Math.round(w));
    c.height = Math.max(2, Math.round(h));
    const x = c.getContext("2d");
    x.beginPath();
    x.roundRect(0, 0, c.width, c.height, radius);
    x.clip();
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    const iw = c.width - border * 2;
    const ih = c.height - border * 2;
    if (iw > 2 && ih > 2) {
      const k = Math.max(iw / img.width, ih / img.height);
      const vw = iw / k;
      const vh = ih / k;
      x.save();
      x.beginPath();
      x.roundRect(border, border, iw, ih, Math.max(0, radius - border));
      x.clip();
      x.drawImage(img, (img.width - vw) / 2, (img.height - vh) / 2, vw, vh, border, border, iw, ih);
      x.restore();
    }
    if (framed.size > 40) framed.clear();
    framed.set(key, c);
    return c;
  }, "frameTex");
  let gl = null;
  let glc = null;
  let prog = null;
  let tex = null;
  let texKey = "";
  const glInit = /* @__PURE__ */ __name(() => {
    glc = document.createElement("canvas");
    gl = glc.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return;
    const vs = `attribute vec3 p;attribute vec2 uv;attribute float sh;uniform mat4 m;varying vec2 v;varying float s;void main(){v=uv;s=sh;gl_Position=m*vec4(p,1.0);}`;
    const fs = `precision mediump float;varying vec2 v;varying float s;uniform sampler2D t;uniform vec3 c;void main(){if(s<0.0){vec4 col=texture2D(t,v);gl_FragColor=vec4(col.rgb*col.a,col.a);}else{gl_FragColor=vec4(c*s,1.0);}}`;
    const sh = /* @__PURE__ */ __name((type, src) => {
      const o = gl.createShader(type);
      gl.shaderSource(o, src);
      gl.compileShader(o);
      return o;
    }, "sh");
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    tex = gl.createTexture();
  }, "glInit");
  const mul = /* @__PURE__ */ __name((a, b) => {
    const o = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
    return o;
  }, "mul");
  const drawCard3D = /* @__PURE__ */ __name((ctx, W2, H2, img, cx, cy, cw, ch, depth2, rx, ry, edge, alpha) => {
    if (!gl) glInit();
    if (!gl || !glc || !prog) {
      ctx.drawImage(img, cx - cw / 2, cy - ch / 2, cw, ch);
      return;
    }
    if (glc.width !== W2 || glc.height !== H2) {
      glc.width = W2;
      glc.height = H2;
    }
    gl.viewport(0, 0, W2, H2);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(prog);
    const f = H2 * 2.2;
    const a = W2 / H2;
    const near = 10;
    const far = f * 4;
    const fy = 1 / Math.tan(Math.atan(H2 / 2 / f));
    const P = [fy / a, 0, 0, 0, 0, fy, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0];
    const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx - W2 / 2, -(cy - H2 / 2), -f, 1];
    const sx = Math.sin(rx);
    const cxr = Math.cos(rx);
    const sy = Math.sin(ry);
    const cyr = Math.cos(ry);
    const RX = [1, 0, 0, 0, 0, cxr, sx, 0, 0, -sx, cxr, 0, 0, 0, 0, 1];
    const RY = [cyr, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cyr, 0, 0, 0, 0, 1];
    const M = mul(P, mul(T, mul(RX, RY)));
    const w = cw / 2;
    const h = ch / 2;
    const d = depth2 / 2;
    const q = /* @__PURE__ */ __name((pts, s) => [pts[0], pts[1], pts[2], pts[0], pts[2], pts[3]].flatMap((v) => [...v, s]), "q");
    const data = new Float32Array([
      ...q([[-w, h, d, 0, 0], [w, h, d, 1, 0], [w, -h, d, 1, 1], [-w, -h, d, 0, 1]], -1),
      ...q([[w, h, d, 0, 0], [w, h, -d, 0, 0], [w, -h, -d, 0, 0], [w, -h, d, 0, 0]], 0.82),
      ...q([[-w, h, -d, 0, 0], [-w, h, d, 0, 0], [-w, -h, d, 0, 0], [-w, -h, -d, 0, 0]], 0.82),
      ...q([[-w, h, -d, 0, 0], [w, h, -d, 0, 0], [w, h, d, 0, 0], [-w, h, d, 0, 0]], 0.95),
      ...q([[-w, -h, d, 0, 0], [w, -h, d, 0, 0], [w, -h, -d, 0, 0], [-w, -h, -d, 0, 0]], 0.7),
      ...q([[w, h, -d, 0, 0], [-w, h, -d, 0, 0], [-w, -h, -d, 0, 0], [w, -h, -d, 0, 0]], 0.6)
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    const loc = /* @__PURE__ */ __name((n) => gl.getAttribLocation(prog, n), "loc");
    gl.enableVertexAttribArray(loc("p"));
    gl.vertexAttribPointer(loc("p"), 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(loc("uv"));
    gl.vertexAttribPointer(loc("uv"), 2, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(loc("sh"));
    gl.vertexAttribPointer(loc("sh"), 1, gl.FLOAT, false, 24, 20);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "m"), false, new Float32Array(M));
    const e = edge.replace("#", "");
    gl.uniform3f(gl.getUniformLocation(prog, "c"), parseInt(e.slice(0, 2), 16) / 255, parseInt(e.slice(2, 4), 16) / 255, parseInt(e.slice(4, 6), 16) / 255);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const key = `${img.width}x${img.height}|${frameKey.get(img) ?? ""}`;
    if (key !== texKey) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texKey = key;
    }
    gl.uniform1i(gl.getUniformLocation(prog, "t"), 0);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
    gl.deleteBuffer(buf);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(glc, 0, 0);
    ctx.restore();
  }, "drawCard3D");
  const frameKey = /* @__PURE__ */ new WeakMap();
  const drawCaption = /* @__PURE__ */ __name((ctx, W2, H2, c, t, u) => {
    if (!c || !c.text) return;
    const p = clamp((t - c.delay) / 0.45);
    if (p <= 0) return;
    const fs = 54 * u * (c.size || 1);
    const x = c.x * W2;
    const y = c.y * H2 + (1 - ease(p)) * 30 * u;
    ctx.save();
    ctx.globalAlpha *= ease(p);
    ctx.font = `900 ${fs}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = c.text.split("\n");
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const lh = fs * 1.25;
    const th = lh * lines.length;
    if (c.style === "pill" || c.style === "bar") {
      ctx.fillStyle = "#1c1c1cdd";
      ctx.beginPath();
      const pw = tw + fs * 1.4;
      const ph = th + fs * 0.6;
      ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, c.style === "pill" ? Math.min(ph / 2, fs) : 12 * u);
      ctx.fill();
      if (c.style === "bar") {
        ctx.fillStyle = c.color;
        ctx.fillRect(x - pw / 2 + fs * 0.3, y - ph / 2 + fs * 0.25, 8 * u, ph - fs * 0.5);
      }
      ctx.fillStyle = c.color;
    } else {
      ctx.lineJoin = "round";
      ctx.lineWidth = fs * 0.22;
      ctx.strokeStyle = "#111111";
      lines.forEach((l, i) => ctx.strokeText(l, x, y - th / 2 + lh * (i + 0.5)));
      ctx.fillStyle = c.color;
    }
    lines.forEach((l, i) => ctx.fillText(l, x, y - th / 2 + lh * (i + 0.5)));
    ctx.restore();
  }, "drawCaption");
  const drawPhoto2 = /* @__PURE__ */ __name((ctx, W2, H2, sc, t, imgs) => {
    const S = Math.min(W2, H2);
    const u = S / 1080;
    const P = sc.params || {};
    const g = /* @__PURE__ */ __name((k, d) => num(P[k], d), "g");
    const img = /* @__PURE__ */ __name((i) => imgs[i] ?? placeholder2(i), "img");
    const handles = {};
    ctx.clearRect(0, 0, W2, H2);
    if (sc.bg && sc.bg !== "transparent") {
      const c = sc.bg.split(",");
      if (c.length > 1) {
        const gr = ctx.createLinearGradient(0, 0, 0, H2);
        gr.addColorStop(0, c[0].trim());
        gr.addColorStop(1, c[1].trim());
        ctx.fillStyle = gr;
      } else ctx.fillStyle = c[0];
      ctx.fillRect(0, 0, W2, H2);
    }
    const L = Math.max(1, sc.loop || 6);
    if (sc.module === "kenburns") {
      const p = P.ease === "linear" ? clamp(t / L) : inout(t / L);
      drawCover(ctx, img(0), W2, H2, lerp(g("fz", 1), g("tz", 1.35), p), lerp(g("fx", 0.5), g("tx", 0.6), p), lerp(g("fy", 0.5), g("ty", 0.45), p));
    }
    if (sc.module === "swing") {
      const im = img(0);
      const aspect = g("aspect", 0) || im.width / im.height;
      let cw = W2 * g("size", 0.78);
      let ch = cw / aspect;
      if (ch > H2 * 0.8) {
        ch = H2 * 0.8;
        cw = ch * aspect;
      }
      const e = back(t / 0.8);
      const from = String(P.from ?? "left");
      const dist = Math.max(W2, H2) * 0.9;
      const ox = from === "left" ? -dist : from === "right" ? dist : 0;
      const oy = from === "top" ? -dist : from === "bottom" ? dist : 0;
      const float = g("float", 1) ? Math.sin(t * 1.4) * 6 * u : 0;
      const cx = g("px", 0.5) * W2 + ox * (1 - e);
      const cy = g("py", 0.46) * H2 + oy * (1 - e) + float;
      const tx = frameTex(im, cw, ch, g("border", 18) * u, g("radius", 10) * u, String(P.frame ?? "#ffffff"));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(lerp(g("angle", -28), g("rest", -4), e) * Math.PI / 180);
      const s = lerp(g("scale", 1.6), 1, clamp(e));
      ctx.scale(s, s);
      ctx.globalAlpha *= clamp(t / 0.15);
      ctx.drawImage(tx, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
      handles.card = [g("px", 0.5) * W2, g("py", 0.46) * H2];
    }
    if (sc.module === "tilt") {
      const im = img(0);
      const aspect = g("aspect", 0) || im.width / im.height;
      let cw = W2 * g("size", 0.78);
      let ch = cw / aspect;
      if (ch > H2 * 0.75) {
        ch = H2 * 0.75;
        cw = ch * aspect;
      }
      const tx = frameTex(im, cw, ch, g("border", 0) * u, g("radius", 18) * u, String(P.frame ?? "#ffffff"));
      frameKey.set(tx, `${im.src ?? ""}|${cw}|${g("border", 0)}|${g("radius", 18)}`);
      const e = ease(t / 1.1);
      const sway = Math.sin(t / Math.max(0.5, g("period", 4)) * Math.PI * 2) * g("sway", 6) * clamp((t - 0.9) / 0.6);
      const ry = (lerp(g("ry0", -55), g("ry", -14), e) + sway) * Math.PI / 180;
      const rx = (g("rx", 8) + sway * 0.3) * Math.PI / 180;
      drawCard3D(ctx, W2, H2, tx, g("px", 0.5) * W2, g("py", 0.47) * H2, cw, ch, g("depth", 18) * u, rx, ry, String(P.edge ?? "#e8e2d6"), clamp(t / 0.2));
      handles.card = [g("px", 0.5) * W2, g("py", 0.47) * H2];
    }
    if (sc.module === "compare") {
      const A = imgs[0] ?? placeholder2(0, false);
      const B = imgs[1] ?? placeholder2(1, true);
      const vert = P.dir === "v";
      const hold = g("hold", 0.8);
      const sweep = Math.max(0.3, g("sweep", 1.6));
      const pos2 = lerp(g("from", 0.85), g("to", 0.15), inout((t - hold) / sweep));
      drawCover(ctx, B, W2, H2, 1, 0.5, 0.5);
      ctx.save();
      ctx.beginPath();
      if (vert) ctx.rect(0, 0, W2, H2 * pos2);
      else ctx.rect(0, 0, W2 * pos2, H2);
      ctx.clip();
      drawCover(ctx, A, W2, H2, 1, 0.5, 0.5);
      ctx.restore();
      const lw = 6 * u;
      ctx.fillStyle = String(P.line ?? "#ffffff");
      if (vert) ctx.fillRect(0, H2 * pos2 - lw / 2, W2, lw);
      else ctx.fillRect(W2 * pos2 - lw / 2, 0, lw, H2);
      const kx = vert ? W2 / 2 : W2 * pos2;
      const ky = vert ? H2 * pos2 : H2 / 2;
      const kr = 44 * u;
      ctx.fillStyle = String(P.knob ?? "#ff5a36");
      ctx.beginPath();
      ctx.arc(kx, ky, kr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        if (vert) {
          ctx.moveTo(kx - kr * 0.32, ky + sgn * kr * 0.2);
          ctx.lineTo(kx + kr * 0.32, ky + sgn * kr * 0.2);
          ctx.lineTo(kx, ky + sgn * kr * 0.55);
        } else {
          ctx.moveTo(kx + sgn * kr * 0.2, ky - kr * 0.32);
          ctx.lineTo(kx + sgn * kr * 0.2, ky + kr * 0.32);
          ctx.lineTo(kx + sgn * kr * 0.55, ky);
        }
        ctx.fill();
      }
      const tag = /* @__PURE__ */ __name((text, x, y, align) => {
        if (!text) return;
        const fs = 36 * u;
        ctx.font = `900 ${fs}px ${FONT}`;
        const w = ctx.measureText(text).width + fs * 1.2;
        const h = fs * 1.6;
        const x0 = align === "left" ? x : x - w;
        ctx.fillStyle = "#1c1c1cdd";
        ctx.beginPath();
        ctx.roundRect(x0, y, w, h, h / 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x0 + w / 2, y + h / 2);
      }, "tag");
      const m = 36 * u;
      tag(String(P.labelA ?? ""), m, vert ? m : H2 * 0.08, "left");
      tag(String(P.labelB ?? ""), vert ? m : W2 - m, vert ? H2 - m - 58 * u : H2 * 0.08, vert ? "left" : "right");
      handles.divider = [kx, ky];
    }
    if (sc.module === "magnify") {
      const im = img(0);
      const z = lerp(1, g("push", 1.06), clamp(t / L));
      const cp = drawCover(ctx, im, W2, H2, z, 0.5, 0.5);
      const ax = g("ax", 0.38) * W2;
      const ay = g("ay", 0.58) * H2;
      const ar = g("ar", 0.07) * S;
      const lx = g("lx", 0.66) * W2;
      const ly = g("ly", 0.3) * H2;
      const lr = g("lr", 0.2) * S;
      const ring = String(P.ring ?? "#ffd23f");
      const lw = 7 * u;
      const p1 = ease((t - 0.3) / 0.5);
      if (p1 > 0) {
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(ax, ay, ar, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p1);
        ctx.stroke();
      }
      const p2 = ease((t - 0.75) / 0.4);
      if (p2 > 0) {
        const ang = Math.atan2(ly - ay, lx - ax);
        const x1 = ax + Math.cos(ang) * ar;
        const y1 = ay + Math.sin(ang) * ar;
        const x2 = lx - Math.cos(ang) * lr;
        const y2 = ly - Math.sin(ang) * lr;
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw * 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(lerp(x1, x2, p2), lerp(y1, y2, p2));
        ctx.stroke();
      }
      const p3 = back((t - 1.05) / 0.5);
      if (t > 1.05) {
        const r = lr * Math.max(0.01, p3);
        const mag = lr / ar;
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#111";
        ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
        ctx.translate(lx, ly);
        ctx.scale(mag, mag);
        ctx.translate(-ax, -ay);
        ctx.drawImage(im, cp.sx, cp.sy, cp.vw, cp.vh, 0, 0, W2, H2);
        ctx.restore();
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw * 1.2;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      handles.target = [ax, ay];
      handles.lens = [lx, ly];
    }
    drawCaption(ctx, W2, H2, sc.caption, t, u);
    if (sc.caption?.text) handles.caption = [sc.caption.x * W2, sc.caption.y * H2];
    return handles;
  }, "drawPhoto");
  return { drawPhoto: drawPhoto2, coverParams: coverParams2, placeholder: placeholder2 };
}, "photoRenderer");
var { drawPhoto, coverParams, placeholder } = photoRenderer();
globalThis.MA_PHOTO = { drawPhoto };

// ../src/effects/photo.ts
var PHOTO_GLOBALS = `window.MA_PHOTO=${fnSource(photoRenderer)}();`;
var CSS = `.S{background:#151515}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;
var run = /* @__PURE__ */ __name((root) => {
  const R = globalThis.MA_PHOTO;
  const cv = root.querySelector("canvas");
  const ctx = cv.getContext("2d");
  let sc;
  try {
    sc = JSON.parse(cv.dataset.scene || "{}");
  } catch {
    return;
  }
  const imgs = [];
  (sc.images || []).forEach((src, i) => {
    if (!src) return;
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => imgs[i] = im;
    im.src = src;
  });
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W2 = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
  const H2 = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  const t0 = performance.now();
  const loop2 = Math.max(1.5, sc.loop || 6) + 1;
  let raf = 0;
  const f = /* @__PURE__ */ __name((now) => {
    raf = requestAnimationFrame(f);
    R.drawPhoto(ctx, W2, H2, sc, (now - t0) / 1e3 % loop2, imgs);
  }, "f");
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
}, "run");
var make = /* @__PURE__ */ __name((module, o) => ({
  id: `photo-${module}`,
  cat: "photo",
  tone: "ink",
  hint: "\u5728\u5716\u7247\u5DE5\u4F5C\u5BA4\u653E\u5165\u7167\u7247\u3001\u8ABF\u6574\u5F8C\u52A0\u5165 Combo\uFF1B\u6216\u7531 AI \u900F\u904E MCP \u7684 build_photo_scene \u7522\u751F\u3002\u6587\u5B57\u6703\u7576\u6210\u5B57\u5E55",
  css: CSS,
  html: /* @__PURE__ */ __name((w) => `<canvas data-scene="${esc(JSON.stringify(photoSceneFromWords(w, module)))}"></canvas>`, "html"),
  globals: PHOTO_GLOBALS,
  run,
  ...o
}), "make");
var photo = [
  make("kenburns", {
    zh: "\u63A8\u62C9\u904B\u93E1",
    en: "Ken Burns",
    desc: "\u7167\u7247\u5F9E\u8D77\u59CB\u53D6\u666F\u6162\u6162\u63A8\u8FD1\u3001\u5E73\u79FB\u5230\u7D50\u675F\u53D6\u666F\uFF0C\u8B93\u975C\u614B\u7167\u7247\u8B8A\u6210\u904B\u93E1",
    tags: ["\u5EFA\u6848", "\u5916\u89C0", "\u53EF\u758A\u5F71\u7247"],
    sample: ["\u5916\u89C0\u6162\u63A8"],
    motion: "\u4E00\u5F35\u7167\u7247\u586B\u6EFF\u756B\u9762\uFF0C\u93E1\u982D\u5F9E\u8D77\u59CB\u53D6\u666F\uFF08\u7E2E\u653E\u8207\u4E2D\u5FC3\u9EDE\uFF09\u4EE5\u6162-\u5FEB-\u6162\u7684\u901F\u5EA6\u5E73\u6ED1\u63A8\u8FD1\u4E26\u5E73\u79FB\u5230\u7D50\u675F\u53D6\u666F\uFF1B\u4E0B\u65B9\u6DF1\u8272\u81A0\u56CA\u5B57\u5E55\u5EF6\u9072\u6DE1\u5165\u4E0A\u79FB\u3002\u5168\u7A0B\u786C\u908A\uFF0C\u7121\u6A21\u7CCA\u3002",
    motionEn: "A full-frame photo where the virtual camera glides from a start framing (zoom and center) to an end framing with an ease-in-out push and pan; a dark pill caption fades up after a short delay. Hard edges throughout, no blur."
  }),
  make("swing", {
    zh: "\u65CB\u8F49\u7529\u5165",
    en: "Swing In",
    desc: "\u7167\u7247\u5E36\u767D\u6846\u5F9E\u5074\u908A\u65CB\u8F49\u7529\u9032\u756B\u9762\uFF0C\u56DE\u5F48\u5F8C\u505C\u5728\u5FAE\u659C\u89D2\u5EA6\u4E26\u8F15\u8F15\u6F02\u6D6E",
    tags: ["\u958B\u7BB1", "\u793E\u7FA4", "Shorts"],
    sample: ["\u9019\u9593\u63A1\u5149\u8D85\u597D"],
    motion: "\u4E00\u5F35\u5E36\u767D\u8272\u908A\u6846\u8207\u5713\u89D2\u7684\u7167\u7247\u5F9E\u756B\u9762\u5916\u5074\u4EE5\u5927\u89D2\u5EA6\u3001\u653E\u5927\u72C0\u614B\u7529\u5165\uFF0C\u5E36\u56DE\u5F48\u6E1B\u901F\u505C\u5728\u756B\u9762\u4E2D\u592E\u3001\u7565\u5FAE\u50BE\u659C\u7684\u89D2\u5EA6\uFF0C\u4E4B\u5F8C\u4E0A\u4E0B\u8F15\u5FAE\u6F02\u6D6E\uFF1B\u5B57\u5E55\u5728\u7167\u7247\u4E0B\u65B9\u6DE1\u5165\u3002\u7121\u9670\u5F71\u3001\u7121\u6A21\u7CCA\u3002",
    motionEn: "A photo with a white border and rounded corners swings in from off-screen at a steep angle and oversized scale, decelerating with an overshoot to rest at a slight tilt in the center, then floats gently; a caption fades in below. No shadows or blur."
  }),
  make("tilt", {
    zh: "3D \u50BE\u659C\u5361\u7247",
    en: "3D Tilt Card",
    desc: "\u7167\u7247\u8B8A\u6210\u6709\u539A\u5EA6\u7684\u5361\u7247\uFF0C\u4EE5\u900F\u8996\u89D2\u5EA6\u8F49\u5165\u5F8C\u8F15\u5FAE\u64FA\u52D5",
    tags: ["\u5EFA\u6848", "2D \u8F49 3D", "\u8CEA\u611F"],
    sample: ["\u6A23\u54C1\u5C4B\u5BA2\u5EF3"],
    motion: "\u7167\u7247\u6210\u70BA\u6709\u539A\u5EA6\u7684\u5BE6\u9AD4\u5361\u7247\uFF0C\u5728\u900F\u8996\u7A7A\u9593\u4E2D\u5F9E\u5927\u89D2\u5EA6\u5074\u8F49\u9032\u4F86\uFF0C\u505C\u5728\u7565\u659C\u7684\u89D2\u5EA6\u5F8C\u5DE6\u53F3\u7DE9\u6162\u64FA\u52D5\uFF0C\u5074\u908A\u4EE5\u55AE\u4E00\u5BE6\u8272\u5448\u73FE\u539A\u5EA6\uFF1B\u5B57\u5E55\u6DE1\u5165\u3002\u4EE5 3D \u900F\u8996\u7E6A\u88FD\uFF0C\u7121\u9670\u5F71\u8207\u6A21\u7CCA\u3002",
    motionEn: "The photo becomes a thick physical card that rotates in from a steep side angle in perspective, settles at a slight angle and then sways slowly; its edges show thickness in a flat solid color; a caption fades in. Rendered in 3D perspective with no shadows or blur."
  }),
  make("compare", {
    zh: "\u524D\u5F8C\u6ED1\u687F\u5C0D\u6BD4",
    en: "Before / After",
    desc: "\u5206\u9694\u7DDA\u5E36\u8457\u5713\u5F62\u628A\u624B\u6383\u904E\u756B\u9762\uFF0C\u524D\u5F8C\u5169\u5F35\u7167\u7247\u5C0D\u7167",
    tags: ["\u91CD\u5283\u5340", "\u65BD\u5DE5\u524D\u5F8C", "\u5C0D\u6BD4"],
    sample: ["\u4E09\u5E74\u524D vs \u73FE\u5728"],
    motion: "\u5169\u5F35\u7167\u7247\u758A\u5728\u4E00\u8D77\uFF0C\u767D\u8272\u5206\u9694\u7DDA\u8207\u5713\u5F62\u628A\u624B\uFF08\u542B\u5DE6\u53F3\u7BAD\u982D\uFF09\u5F9E\u4E00\u5074\u505C\u7559\u5F8C\u5E73\u6ED1\u6383\u5230\u53E6\u4E00\u5074\uFF0C\u63ED\u9732\u7B2C\u4E8C\u5F35\u7167\u7247\uFF1B\u5DE6\u4E0A\u8207\u53F3\u4E0A\u5404\u6709\u6DF1\u8272\u81A0\u56CA\u6A19\u7C64\uFF08BEFORE / AFTER\uFF09\uFF0C\u5B57\u5E55\u6DE1\u5165\u3002\u786C\u908A\u3001\u7121\u6A21\u7CCA\u3002",
    motionEn: "Two photos stacked; after a short hold, a white divider with a round arrow knob sweeps smoothly across to reveal the second photo; dark pill labels (BEFORE / AFTER) sit in the top corners and a caption fades in. Hard edges, no blur."
  }),
  make("magnify", {
    zh: "\u5C40\u90E8\u653E\u5927\u93E1",
    en: "Magnifier",
    desc: "\u5708\u51FA\u7167\u7247\u4E2D\u7684\u7D30\u7BC0\uFF0C\u9023\u7DDA\u653E\u5927\u5230\u65C1\u908A\u7684\u5713\u5F62\u93E1\u982D",
    tags: ["\u7D30\u7BC0", "\u5EFA\u6750", "\u6A19\u8A3B"],
    sample: ["\u9019\u88E1\u662F\u9632\u6C34\u5C64"],
    motion: "\u7167\u7247\u7DE9\u6162\u63A8\u8FD1\uFF0C\u9EC3\u8272\u5713\u5708\u756B\u51FA\u8981\u5F37\u8ABF\u7684\u7D30\u7BC0\uFF0C\u63A5\u8457\u4E00\u689D\u9EC3\u7DDA\u5EF6\u4F38\u5230\u65C1\u908A\uFF0C\u5713\u5F62\u653E\u5927\u93E1\u982D\u5E36\u56DE\u5F48\u5C55\u958B\uFF0C\u93E1\u982D\u5167\u662F\u8A72\u7D30\u7BC0\u7684\u653E\u5927\u756B\u9762\uFF0C\u5916\u5708\u9EC3\u8272\u5BE6\u7DDA\uFF1B\u5B57\u5E55\u6DE1\u5165\u3002\u7121\u9670\u5F71\u3001\u7121\u6A21\u7CCA\u3002",
    motionEn: "The photo pushes in slowly; a yellow circle draws around a detail, a yellow line extends to the side, and a round magnifier lens springs open showing the detail enlarged inside a solid yellow ring; a caption fades in. No shadows or blur."
  })
];

// ../src/data.ts
var CATEGORIES = [
  { id: "impact", code: "IMPACT", zh: "\u885D\u64CA\u767B\u5834", tagline: "\u4E00\u500B\u5B57\u5C31\u80FD\u6539\u8B8A\u6C23\u6C1B" },
  { id: "reveal", code: "REVEAL", zh: "\u63ED\u9732\u6D6E\u73FE", tagline: "\u8B93\u6587\u5B57\u512A\u96C5\u5730\u51FA\u5834" },
  { id: "kinetic", code: "KINETIC", zh: "\u52D5\u614B\u6392\u7248", tagline: "\u8B93\u6BCF\u500B\u5B57\u90FD\u6709\u500B\u6027" },
  { id: "switch", code: "SWITCH", zh: "\u5207\u63DB\u8F2A\u64AD", tagline: "\u628A\u4E00\u500B\u8A5E\u63DB\u6210\u53E6\u4E00\u500B" },
  { id: "flow", code: "FLOW", zh: "\u6D41\u52D5\u8DD1\u99AC", tagline: "\u6587\u5B57\u4E00\u76F4\u6D41\u52D5\u4E0D\u505C" },
  { id: "depth", code: "DEPTH", zh: "\u7ACB\u9AD4\u7A7A\u9593", tagline: "\u947D\u9032\u6587\u5B57\u88E1\u9762" },
  { id: "style", code: "STYLE", zh: "\u5B57\u9AD4\u98A8\u683C", tagline: "\u63DB\u500B\u5448\u73FE\u65B9\u5F0F\u5C31\u5347\u7D1A" },
  { id: "light", code: "LIGHT", zh: "\u5149\u5F71\u767C\u5149", tagline: "\u7528\u5149\u66FF\u6587\u5B57\u52A0\u6232" },
  { id: "texture", code: "TEXTURE", zh: "\u7C92\u5B50\u8CEA\u611F", tagline: "\u5F9E\u50CF\u7D20\u5230\u7C92\u5B50" },
  { id: "liquid", code: "LIQUID", zh: "\u6C34\u6EF4\u6CE1\u6CE1", tagline: "\u67D4\u8EDF\u3001\u900F\u660E\u3001\u6703\u547C\u5438" },
  { id: "caption", code: "CAPTION", zh: "\u5B57\u5E55\u8CC7\u8A0A\u689D", tagline: "\u5F71\u7247\u6700\u5E38\u7528\u7684\u90A3\u5E7E\u689D" },
  { id: "card", code: "CARD", zh: "\u5B57\u5361\u7248\u578B", tagline: "\u76F4\u63A5\u62FF\u4F86\u7576\u6BB5\u843D\u5B57\u5361" },
  { id: "photo", code: "PHOTO", zh: "\u5716\u7247\u904B\u93E1", tagline: "\u7167\u7247\u653E\u9032\u4F86\u5C31\u6703\u52D5" },
  { id: "map", code: "MAP", zh: "\u5730\u5716\u5340\u4F4D", tagline: "\u628A\u4F4D\u7F6E\u3001\u8DDD\u96E2\u3001\u901A\u52E4\u8B1B\u6E05\u695A" },
  { id: "retro", code: "RETRO", zh: "\u5FA9\u53E4\u61F7\u820A", tagline: "\u4E00\u79D2\u56DE\u5230\u90A3\u500B\u5E74\u4EE3" }
];
var order = CATEGORIES.map((c) => c.id);
var EFFECTS = [
  ...impact,
  ...reveal,
  ...kinetic,
  ...switching,
  ...flow,
  ...depth,
  ...style,
  ...light,
  ...texture,
  ...caption,
  ...card,
  ...retro,
  ...map,
  ...liquid,
  ...photo
].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
var NUM = new Map(EFFECTS.map((f, i) => [f.id, i + 1]));
var PALETTES = [
  { id: "leicht", name: "\u5149\u5BD3\u6A58", ink: "#151515", paper: "#f5f1e8", accent: "#ff5a36", accent2: "#ffd23f" },
  { id: "sakura", name: "\u6AFB\u82B1\u7C89", ink: "#232323", paper: "#faf7f5", accent: "#f472b6", accent2: "#fde047" },
  { id: "lime", name: "\u87A2\u5149\u7DA0", ink: "#171717", paper: "#f7f7f2", accent: "#d4ff3a", accent2: "#ff4d8d" },
  { id: "terra", name: "\u8D64\u9676", ink: "#1f1a17", paper: "#f4efe6", accent: "#e2673f", accent2: "#f2c14e" },
  { id: "electric", name: "\u96FB\u5149\u85CD", ink: "#0f1220", paper: "#eef2ff", accent: "#3b82f6", accent2: "#22d3ee" },
  { id: "forest", name: "\u8584\u8377\u7DA0", ink: "#10201a", paper: "#f1f5ef", accent: "#34d399", accent2: "#fbbf24" },
  { id: "violet", name: "\u591C\u7D2B", ink: "#160f24", paper: "#f6f3fb", accent: "#a78bfa", accent2: "#f472b6" }
];
var ALL_TAGS = (() => {
  const m = /* @__PURE__ */ new Map();
  EFFECTS.forEach((f) => f.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
})();

// ../src/combo.ts
var TRANSITIONS = ["cut", "fade", "slide", "zoom"];
var RATIOS = ["16:9", "9:16", "1:1"];
var TONES = ["ink", "paper", "accent"];
var byId = new Map(EFFECTS.map((f) => [f.id, f]));
var findEffect = /* @__PURE__ */ __name((id) => byId.get(id) ?? EFFECTS.find((f) => String(NUM.get(f.id)) === String(id).replace(/^#/, "").replace(/^0+/, "")), "findEffect");
var isHex = /* @__PURE__ */ __name((s) => typeof s === "string" && /^#[0-9a-f]{6}$/i.test(s), "isHex");
var str = /* @__PURE__ */ __name((v, max) => typeof v === "string" ? v.trim().slice(0, max) : "", "str");
var normalizeCombo = /* @__PURE__ */ __name((input) => {
  const errors = [];
  const o = input && typeof input === "object" ? input : {};
  const title = str(o.title, 80);
  if (!title) errors.push("title \u5FC5\u586B\uFF08Combo \u540D\u7A31\uFF09");
  const rawScenes = Array.isArray(o.scenes) ? o.scenes : [];
  if (!rawScenes.length) errors.push("scenes \u81F3\u5C11\u8981\u6709\u4E00\u500B\u6BB5\u843D");
  if (rawScenes.length > 20) errors.push("scenes \u6700\u591A 20 \u6BB5");
  const scenes = rawScenes.slice(0, 20).map((s, i) => {
    const r = s && typeof s === "object" ? s : {};
    const fx = findEffect(str(r.effect, 40));
    if (!fx) errors.push(`scenes[${i}].effect\u300C${String(r.effect)}\u300D\u4E0D\u5B58\u5728\uFF0C\u8ACB\u5148\u7528 search_effects \u67E5 id`);
    const long = fx?.id === "map-overlay" || fx?.id === "crisp-drop" || isPhotoFx(fx?.id ?? "");
    const max = long ? 9e5 : 60;
    const words = Array.isArray(r.words) ? r.words.map((w) => str(w, max)).filter(Boolean).slice(0, 12) : typeof r.words === "string" ? long ? [str(r.words, max)] : str(r.words, 200).split(/\s*\/\s*|\n/).filter(Boolean) : void 0;
    const sec = Number(r.seconds);
    const tone = TONES.includes(r.tone) ? r.tone : void 0;
    return {
      effect: fx?.id ?? str(r.effect, 40),
      ...words?.length ? { words } : {},
      ...Number.isFinite(sec) && sec > 0 ? { seconds: Math.min(20, Math.max(0.8, Math.round(sec * 10) / 10)) } : {},
      ...tone ? { tone } : {},
      ...str(r.note, 200) ? { note: str(r.note, 200) } : {}
    };
  });
  const palette = PALETTES.some((p) => p.id === o.palette) ? o.palette : "leicht";
  const combo = {
    title,
    scenes,
    palette,
    ratio: RATIOS.includes(o.ratio) ? o.ratio : "16:9",
    transition: TRANSITIONS.includes(o.transition) ? o.transition : "fade"
  };
  if (str(o.brief, 1e3)) combo.brief = str(o.brief, 1e3);
  if (str(o.notes, 2e3)) combo.notes = str(o.notes, 2e3);
  if (isHex(o.accent)) combo.accent = o.accent.toLowerCase();
  if (Array.isArray(o.tags)) combo.tags = o.tags.map((t) => str(t, 20).replace(/^#/, "")).filter(Boolean).slice(0, 10);
  if (str(o.source, 40)) combo.source = str(o.source, 40);
  return { combo, errors };
}, "normalizeCombo");
var comboPalette = /* @__PURE__ */ __name((c) => {
  const base2 = PALETTES.find((p) => p.id === c.palette) ?? PALETTES[0];
  return c.accent ? { ...base2, accent: c.accent } : base2;
}, "comboPalette");
var sceneSummary = /* @__PURE__ */ __name((effect, words, quote = false) => {
  const q = /* @__PURE__ */ __name((x) => quote ? `\u300C${x}\u300D` : x, "q");
  if (effect === "map-overlay") {
    const j = words.find((x) => x.trim().startsWith("{"));
    try {
      const sc = JSON.parse(j ?? "");
      const name = { tag: "\u6A19\u984C", label: "\u57FA\u5730\u6A19\u7C64", road: "\u9053\u8DEF", info: "\u8CC7\u8A0A\u5361", stat: "\u6578\u64DA\u5361", text: "\u6587\u5B57" };
      const parts = (sc.els ?? []).filter((e) => name[e.type]).map((e) => `${name[e.type]}${q(e.type === "info" || e.type === "stat" ? [e.text, ...e.lines ?? []].filter(Boolean).join(" ").replace(/[*|]/g, " ").replace(/\s+/g, " ").trim() : e.text ?? "")}`);
      return `\u5730\u5716\u5834\u666F\uFF08${sc.els?.length ?? 0} \u500B\u5143\u4EF6${sc.bgUrl ? "\u3001\u542B\u5E95\u5716" : "\u3001\u7121\u5E95\u5716"}\uFF09\uFF1A${parts.join("\u3001")}`;
    } catch {
      return "\u5730\u5716\u5834\u666F\uFF08\u9810\u8A2D\u7BC4\u672C\uFF09";
    }
  }
  if (isPhotoFx(effect)) {
    const j = words.find((x) => x.trim().startsWith("{"));
    try {
      const sc = JSON.parse(j ?? "");
      const n = (sc.images ?? []).filter(Boolean).length;
      return `\u5716\u7247\u904B\u93E1\u300C${MODULE_INFO[sc.module]?.zh ?? sc.module}\u300D\uFF08${n ? `${n} \u5F35\u5716` : "\u672A\u653E\u5716"}\uFF09${sc.caption?.text ? `\uFF1A\u5B57\u5E55${q(sc.caption.text)}` : ""}`;
    } catch {
      return "\u5716\u7247\u904B\u93E1\uFF08\u9810\u8A2D\uFF09";
    }
  }
  if (effect === "crisp-drop") {
    const lines = words.filter((x) => !x.startsWith("@")).map((x) => x.replace(/^~/, ""));
    const opts = words.filter((x) => x.startsWith("@")).join(" ");
    return `${lines.map(q).join(quote ? "\u3001" : " / ")}${opts ? `\uFF08\u6C34\u6EF4\u8A2D\u5B9A ${opts}\uFF09` : ""}`;
  }
  return quote ? words.map(q).join("\u3001") : words.join(" / ");
}, "sceneSummary");
var sceneSeconds = /* @__PURE__ */ __name((s) => {
  if (s.seconds) return s.seconds;
  const fx = findEffect(s.effect);
  return fx ? Math.min(6, Math.max(2.4, loopSeconds(fx))) : 3;
}, "sceneSeconds");
var totalSeconds = /* @__PURE__ */ __name((c) => Math.round(c.scenes.reduce((a, s) => a + sceneSeconds(s), 0) * 10) / 10, "totalSeconds");
var comboOutline = /* @__PURE__ */ __name((c) => c.scenes.map((s, i) => {
  const fx = findEffect(s.effect);
  const w = sceneSummary(s.effect, s.words ?? fx?.sample ?? []);
  return `${i + 1}. ${fx ? `#${String(NUM.get(fx.id)).padStart(2, "0")} ${fx.zh}\uFF08${fx.id}\uFF09` : s.effect}\uFF5C${sceneSeconds(s)} \u79D2\uFF5C${w}${s.note ? `\uFF5C${s.note}` : ""}`;
}).join("\n"), "comboOutline");
var ratioCss = {
  "16:9": "width:min(100vw,177.78vh);aspect-ratio:16/9",
  "9:16": "height:min(100vh,177.78vw);aspect-ratio:9/16",
  "1:1": "width:min(100vw,100vh);aspect-ratio:1"
};
var comboHtml = /* @__PURE__ */ __name((c, opts = {}) => {
  const pal = comboPalette(c);
  const used = [...new Set(c.scenes.map((s) => s.effect))].map((id) => findEffect(id)).filter((f) => !!f);
  const css = used.map((f) => scopeCss(f).trim()).join("\n");
  const runs = used.filter((f) => f.run).map((f) => `${JSON.stringify(f.id)}:${fnSource(f.run)}`).join(",\n");
  const scenes = c.scenes.map((s) => {
    const fx = findEffect(s.effect);
    if (!fx) return null;
    const words = s.words?.length ? s.words : fx.sample;
    return { fx, words, ms: Math.round(sceneSeconds(s) * 1e3), vars: varsCss(toneVars(pal, s.tone ?? fx.tone)) };
  }).filter((s) => !!s);
  const templates = scenes.map((s, i) => `<template id="t${i}">${s.fx.html(s.words)}</template>`).join("\n");
  const data = JSON.stringify(scenes.map((s) => ({ id: s.fx.id, words: s.words, ms: s.ms, vars: s.vars, name: s.fx.zh })));
  const t = c.transition ?? "fade";
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)} \u2014 Motion Atlas Combo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_LINK}" rel="stylesheet">
<style>
/* Motion Atlas Combo\uFF1A${esc(c.title)}\uFF5C${scenes.length} \u6BB5\uFF5C\u7D04 ${totalSeconds(c)} \u79D2 */
html,body{margin:0;height:100%;background:#0b0b0b;display:grid;place-items:center;overflow:hidden;font-family:"Noto Sans TC",system-ui,sans-serif}
.stage{position:relative;${ratioCss[c.ratio ?? "16:9"]};container-type:size;overflow:hidden;background:${pal.ink}}
.stage>.fx{will-change:opacity,transform}
.in-fade{animation:cIn .45s ease both}.out-fade{animation:cOut .45s ease both}
.in-slide{animation:cSlideIn .55s cubic-bezier(.7,0,.2,1) both}.out-slide{animation:cSlideOut .55s cubic-bezier(.7,0,.2,1) both}
.in-zoom{animation:cZoomIn .5s cubic-bezier(.2,.8,.2,1) both}.out-zoom{animation:cZoomOut .5s ease-in both}
@keyframes cIn{from{opacity:0}}@keyframes cOut{to{opacity:0}}
@keyframes cSlideIn{from{transform:translateX(100%)}}@keyframes cSlideOut{to{transform:translateX(-100%)}}
@keyframes cZoomIn{from{transform:scale(.6);opacity:0}}@keyframes cZoomOut{to{transform:scale(1.6);opacity:0}}
.hud{position:absolute;left:0;right:0;bottom:0;z-index:99;display:flex;gap:4px;padding:8px;pointer-events:none}
.hud i{flex:1;height:3px;border-radius:3px;background:#fff4;overflow:hidden}.hud i b{display:block;height:100%;width:0;background:#fff}
.hud i.done b{width:100%}
@media (prefers-reduced-motion:reduce){.fx *{animation-play-state:paused!important}}
${BASE_FX_CSS}
${css}
</style>
</head>
<body>
<div class="stage"${opts.hud === false ? "" : " data-hud"}></div>
${templates}
<script>
const SCENES=${data.replace(/</g, "\\u003c")};
${[...new Set(used.map((f) => f.globals).filter(Boolean))].join("\n")}
const RUNS={${runs}};
const TRANSITION=${JSON.stringify(t)};
const LOOP=${opts.loop === false ? "false" : "true"};
const stage=document.querySelector('.stage');
let i=0,cur=null,curClean=null,timer=0;
let hud=null;
if(stage.hasAttribute('data-hud')){hud=document.createElement('div');hud.className='hud';hud.innerHTML=SCENES.map(()=>'<i><b></b></i>').join('');stage.appendChild(hud);}
function show(){
  const sc=SCENES[i];
  const el=document.createElement('div');
  el.className='fx fx-'+sc.id;
  el.setAttribute('style',sc.vars);
  el.innerHTML=document.getElementById('t'+i).innerHTML;
  if(cur&&TRANSITION!=='cut')el.classList.add('in-'+TRANSITION);
  const prev=cur,prevClean=curClean;
  stage.insertBefore(el,hud);
  cur=el;curClean=null;
  requestAnimationFrame(()=>{const r=RUNS[sc.id];if(r&&el.isConnected){try{curClean=r(el,sc.words)||null}catch(e){console.error(e)}}});
  if(prev){
    if(TRANSITION==='cut'){prevClean&&prevClean();prev.remove();}
    else{prev.classList.add('out-'+TRANSITION);setTimeout(()=>{prevClean&&prevClean();prev.remove();},600);}
  }
  if(hud){[...hud.children].forEach((b,k)=>{b.className=k<i?'done':'';const bar=b.firstChild;bar.getAnimations().forEach(a=>a.cancel());if(k===i)bar.animate([{width:'0%'},{width:'100%'}],{duration:sc.ms,easing:'linear',fill:'forwards'});});}
  timer=setTimeout(()=>{i++;if(i>=SCENES.length){if(!LOOP)return;i=0;}show();},sc.ms);
}
const go=()=>show();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);else go();
<\/script>
</body>
</html>
`;
}, "comboHtml");
var comboPrompt = /* @__PURE__ */ __name((c) => {
  const pal = comboPalette(c);
  const parts = c.scenes.map((s, i) => {
    const fx = findEffect(s.effect);
    if (!fx) return "";
    const w = sceneSummary(fx.id, s.words?.length ? s.words : fx.sample, true);
    return `${i + 1}.\u3010${fx.zh} ${fx.en}\u3011\u7D04 ${sceneSeconds(s)} \u79D2\uFF5C\u6587\u5B57\uFF1A${w}
   \u52D5\u614B\uFF1A${fx.motion}${s.note ? `
   \u5099\u8A3B\uFF1A${s.note}` : ""}`;
  });
  return `\u8ACB\u7528 HTML + CSS\uFF08\u5FC5\u8981\u6642\u52A0\u5C11\u91CF\u539F\u751F JavaScript\uFF09\u505A\u4E00\u6BB5\u9023\u7E8C\u64AD\u653E\u7684\u6587\u5B57\u52D5\u614B\u5F71\u7247\u300C${c.title}\u300D\uFF0C\u6BD4\u4F8B ${c.ratio ?? "16:9"}\uFF0C\u7E3D\u9577\u7D04 ${totalSeconds(c)} \u79D2\uFF0C\u64AD\u5B8C\u5F8C\u5FAA\u74B0\u3002
${c.brief ? `
\u3010\u9700\u6C42\u3011${c.brief}
` : ""}
\u3010\u914D\u8272\u3011\u6DF1\u8272 ${pal.ink}\u3001\u6DFA\u8272 ${pal.paper}\u3001\u4E3B\u8272 ${pal.accent}\u3001\u8F14\u8272 ${pal.accent2}\uFF1B\u5B57\u9AD4 Noto Sans TC 900
\u3010\u6BB5\u843D\u8F49\u5834\u3011${{ cut: "\u76F4\u63A5\u786C\u5207", fade: "0.45 \u79D2\u4EA4\u53C9\u6DE1\u5165\u6DE1\u51FA", slide: "0.55 \u79D2\u7531\u53F3\u5F80\u5DE6\u63A8\u79FB", zoom: "0.5 \u79D2\u653E\u5927\u7A7F\u8D8A" }[c.transition ?? "fade"]}

\u3010\u5206\u93E1\u3011
${parts.join("\n")}

\u3010\u898F\u683C\u3011\u55AE\u4E00 HTML \u6A94\u3001\u7121\u5916\u90E8\u51FD\u5F0F\u5EAB\uFF08\u5B57\u9AD4\u9664\u5916\uFF09\uFF1B\u52D5\u756B\u4EE5 transform\uFF0Fopacity \u70BA\u4E3B\u78BA\u4FDD 60fps\uFF1B\u5B57\u7D1A\u7528 vw/vh \u6216 container query \u55AE\u4F4D\uFF1B\u9802\u90E8\u7528 CSS \u8B8A\u6578\u96C6\u4E2D\u7BA1\u7406\u6587\u5B57\u3001\u984F\u8272\u8207\u6BCF\u6BB5\u79D2\u6578\u3002`;
}, "comboPrompt");
var encodeCombo = /* @__PURE__ */ __name((c) => {
  const json2 = JSON.stringify({ ...c, id: void 0, created_at: void 0, updated_at: void 0 });
  const bytes = new TextEncoder().encode(json2);
  let bin = "";
  bytes.forEach((b) => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}, "encodeCombo");

// _lib/env.ts
var CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization,x-motion-key,mcp-session-id,mcp-protocol-version",
  "access-control-expose-headers": "mcp-session-id"
};
var json = /* @__PURE__ */ __name((data, status = 200, extra = {}) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...CORS, ...extra }
}), "json");
var preflight = /* @__PURE__ */ __name(() => new Response(null, { status: 204, headers: CORS }), "preflight");
var keyOf = /* @__PURE__ */ __name((req) => {
  const auth = req.headers.get("authorization") ?? "";
  if (/^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, "").trim();
  return req.headers.get("x-motion-key") ?? new URL(req.url).searchParams.get("key") ?? "";
}, "keyOf");
var safeEqual = /* @__PURE__ */ __name((a, b) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}, "safeEqual");
var canWrite = /* @__PURE__ */ __name((req, env) => {
  if (!env.MOTION_KEY) return { ok: false, reason: "\u7DB2\u7AD9\u5C1A\u672A\u8A2D\u5B9A MOTION_KEY\uFF0C\u5BEB\u5165\u529F\u80FD\u505C\u7528\u3002\u8ACB\u5728 Cloudflare Pages \u5C08\u6848\u7684\u74B0\u5883\u8B8A\u6578\u52A0\u4E0A MOTION_KEY\uFF08\u52A0\u5BC6\uFF09\u3002" };
  const k = keyOf(req);
  if (!k) return { ok: false, reason: "\u5BEB\u5165\u9700\u8981\u91D1\u9470\uFF1A\u9023\u7DDA\u7DB2\u5740\u52A0\u4E0A ?key=\u4F60\u7684\u91D1\u9470\uFF0C\u6216\u4F7F\u7528 Authorization: Bearer \u6A19\u982D\u3002" };
  if (!safeEqual(k, env.MOTION_KEY)) return { ok: false, reason: "\u91D1\u9470\u4E0D\u6B63\u78BA\u3002" };
  return { ok: true };
}, "canWrite");

// _lib/store.ts
var SCHEMA = `CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brief TEXT,
  tags TEXT,
  data TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
var SCHEMA_PRESETS = `CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  data TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
var ready = null;
var StoreError = class extends Error {
  static {
    __name(this, "StoreError");
  }
};
var db = /* @__PURE__ */ __name(async (env) => {
  if (!env.DB)
    throw new StoreError("Combo \u8CC7\u6599\u5EAB\u5C1A\u672A\u7D81\u5B9A\uFF1A\u8ACB\u5728 Cloudflare Pages \u5C08\u6848 \u2192 \u8A2D\u5B9A \u2192 \u7E6B\u7D50\uFF0C\u65B0\u589E D1 \u8CC7\u6599\u5EAB\uFF0C\u8B8A\u6578\u540D\u7A31\u586B DB\u3002");
  const d1 = env.DB;
  ready ??= d1.prepare(SCHEMA).run().then(() => d1.prepare(SCHEMA_PRESETS).run()).catch((e) => {
    ready = null;
    throw e;
  });
  await ready;
  return env.DB;
}, "db");
var newId2 = /* @__PURE__ */ __name(() => {
  const a = crypto.getRandomValues(new Uint8Array(6));
  return "c" + Array.from(a, (b) => (b % 36).toString(36)).join("");
}, "newId");
var hydrate = /* @__PURE__ */ __name((r) => ({ ...JSON.parse(r.data), id: r.id, created_at: r.created_at, updated_at: r.updated_at }), "hydrate");
var listCombos = /* @__PURE__ */ __name(async (env, q = "", tag = "", limit = 50) => {
  const d = await db(env);
  const where = [];
  const args = [];
  if (q) {
    where.push("(title LIKE ?1 OR brief LIKE ?1 OR tags LIKE ?1 OR data LIKE ?1)");
    args.push(`%${q}%`);
  }
  if (tag) {
    where.push(`tags LIKE ?${args.length + 1}`);
    args.push(`%"${tag}"%`);
  }
  const sql = `SELECT id,data,created_at,updated_at FROM combos ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY updated_at DESC LIMIT ${Math.min(200, Math.max(1, limit))}`;
  const res = await d.prepare(sql).bind(...args).all();
  return res.results.map(hydrate);
}, "listCombos");
var getCombo = /* @__PURE__ */ __name(async (env, id) => {
  const d = await db(env);
  const r = await d.prepare("SELECT id,data,created_at,updated_at FROM combos WHERE id = ?1").bind(id).first();
  return r ? hydrate(r) : null;
}, "getCombo");
var saveCombo = /* @__PURE__ */ __name(async (env, c, id) => {
  const d = await db(env);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const body = { ...c, id: void 0, created_at: void 0, updated_at: void 0 };
  const data = JSON.stringify(body);
  if (id) {
    const existing = await getCombo(env, id);
    if (!existing) throw new StoreError(`\u627E\u4E0D\u5230 Combo ${id}`);
    await d.prepare("UPDATE combos SET title=?2, brief=?3, tags=?4, data=?5, source=?6, updated_at=?7 WHERE id=?1").bind(id, c.title, c.brief ?? null, JSON.stringify(c.tags ?? []), data, c.source ?? null, now).run();
    return { ...c, id, created_at: existing.created_at, updated_at: now };
  }
  const nid = newId2();
  await d.prepare("INSERT INTO combos (id,title,brief,tags,data,source,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?7)").bind(nid, c.title, c.brief ?? null, JSON.stringify(c.tags ?? []), data, c.source ?? null, now).run();
  return { ...c, id: nid, created_at: now, updated_at: now };
}, "saveCombo");
var deleteCombo = /* @__PURE__ */ __name(async (env, id) => {
  const d = await db(env);
  const r = await d.prepare("DELETE FROM combos WHERE id = ?1").bind(id).run();
  return (r.meta?.changes ?? 0) > 0;
}, "deleteCombo");
var newPresetId = /* @__PURE__ */ __name(() => {
  const a = crypto.getRandomValues(new Uint8Array(5));
  return "p" + Array.from(a, (b) => (b % 36).toString(36)).join("");
}, "newPresetId");
var toPreset = /* @__PURE__ */ __name((r, withData = true) => ({
  id: r.id,
  kind: r.kind,
  name: r.name,
  note: r.note ?? void 0,
  data: withData ? JSON.parse(r.data) : {},
  source: r.source ?? void 0,
  created_at: r.created_at,
  updated_at: r.updated_at
}), "toPreset");
var listPresets = /* @__PURE__ */ __name(async (env, kind = "", q = "", limit = 100) => {
  const d = await db(env);
  const where = [];
  const args = [];
  if (kind) {
    args.push(kind);
    where.push(`kind = ?${args.length}`);
  }
  if (q) {
    args.push(`%${q}%`);
    where.push(`(name LIKE ?${args.length} OR note LIKE ?${args.length} OR id = ?${args.length + 1})`);
    args.push(q);
  }
  const sql = `SELECT id,kind,name,note,data,source,created_at,updated_at FROM presets ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY updated_at DESC LIMIT ${Math.min(200, Math.max(1, limit))}`;
  const res = await d.prepare(sql).bind(...args).all();
  return res.results.map((r) => toPreset(r));
}, "listPresets");
var getPreset = /* @__PURE__ */ __name(async (env, id) => {
  const d = await db(env);
  const r = await d.prepare("SELECT id,kind,name,note,data,source,created_at,updated_at FROM presets WHERE id = ?1").bind(id).first();
  return r ? toPreset(r) : null;
}, "getPreset");
var savePreset = /* @__PURE__ */ __name(async (env, p, id) => {
  const d = await db(env);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const data = JSON.stringify(p.data);
  if (id) {
    const ex = await getPreset(env, id);
    if (!ex) throw new StoreError(`\u627E\u4E0D\u5230\u9810\u8A2D ${id}`);
    await d.prepare("UPDATE presets SET kind=?2, name=?3, note=?4, data=?5, source=?6, updated_at=?7 WHERE id=?1").bind(id, p.kind, p.name, p.note ?? null, data, p.source ?? null, now).run();
    return { ...p, id, created_at: ex.created_at, updated_at: now };
  }
  const nid = newPresetId();
  await d.prepare("INSERT INTO presets (id,kind,name,note,data,source,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?7)").bind(nid, p.kind, p.name, p.note ?? null, data, p.source ?? null, now).run();
  return { ...p, id: nid, created_at: now, updated_at: now };
}, "savePreset");
var deletePreset = /* @__PURE__ */ __name(async (env, id) => {
  const d = await db(env);
  const r = await d.prepare("DELETE FROM presets WHERE id = ?1").bind(id).run();
  return (r.meta?.changes ?? 0) > 0;
}, "deletePreset");

// api/combos/[id].ts
var err = /* @__PURE__ */ __name((e) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500), "err");
var idOf = /* @__PURE__ */ __name((p) => String(Array.isArray(p.id) ? p.id[0] : p.id), "idOf");
var onRequestGet = /* @__PURE__ */ __name(async ({ env, params }) => {
  try {
    const c = await getCombo(env, idOf(params));
    return c ? json({ ok: true, combo: c }) : json({ ok: false, error: "\u627E\u4E0D\u5230\u9019\u500B Combo" }, 404);
  } catch (e) {
    return err(e);
  }
}, "onRequestGet");
var onRequestPut = /* @__PURE__ */ __name(async ({ request, env, params }) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const { combo, errors } = normalizeCombo(await request.json());
    if (errors.length) return json({ ok: false, errors }, 400);
    return json({ ok: true, combo: await saveCombo(env, combo, idOf(params)) });
  } catch (e) {
    return err(e);
  }
}, "onRequestPut");
var onRequestDelete = /* @__PURE__ */ __name(async ({ request, env, params }) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    return await deleteCombo(env, idOf(params)) ? json({ ok: true }) : json({ ok: false, error: "\u627E\u4E0D\u5230\u9019\u500B Combo" }, 404);
  } catch (e) {
    return err(e);
  }
}, "onRequestDelete");
var onRequestOptions = preflight;

// ../src/presets.ts
var PRESET_KINDS = ["map", "drop", "photo"];
var KIND_NAME = { map: "\u5730\u5716\u5834\u666F", drop: "\u92B3\u5229\u6C34\u6EF4", photo: "\u5716\u7247\u904B\u93E1" };
var presetToScene = /* @__PURE__ */ __name((p, o = {}) => {
  const note = p.id ? `\u9810\u8A2D ${p.id}${p.name ? `\u300C${p.name}\u300D` : ""}` : void 0;
  if (p.kind === "map") {
    const sc = p.data;
    return { effect: "map-overlay", words: [JSON.stringify(sc)], seconds: (sc.loop || 6) + 1, note };
  }
  if (p.kind === "photo") {
    const sc = normalizePhotoScene({ ...p.data, ...o.images ? { images: o.images } : {} });
    return { effect: photoFxId(sc.module), words: [JSON.stringify(sc)], seconds: sc.loop + 1, note };
  }
  const words = p.data.words ?? [];
  return { effect: "crisp-drop", words, seconds: parseDrop(words).o.loop, note };
}, "presetToScene");
var sceneToPresetData = /* @__PURE__ */ __name((effect, words) => {
  if (effect === "map-overlay") {
    const j = words.find((w) => w.trim().startsWith("{"));
    try {
      return j ? { kind: "map", data: JSON.parse(j) } : null;
    } catch {
      return null;
    }
  }
  if (effect === "crisp-drop") return { kind: "drop", data: { words } };
  if (isPhotoFx(effect)) {
    const j = words.find((w) => w.trim().startsWith("{"));
    try {
      return j ? { kind: "photo", data: normalizePhotoScene(JSON.parse(j)) } : null;
    } catch {
      return null;
    }
  }
  return null;
}, "sceneToPresetData");
var checkPresetData = /* @__PURE__ */ __name((kind, data) => {
  if (!PRESET_KINDS.includes(kind)) return `kind \u5FC5\u9808\u662F ${PRESET_KINDS.join("\uFF5C")}`;
  if (!data || typeof data !== "object") return "data \u5FC5\u9808\u662F\u7269\u4EF6";
  if (kind === "map") {
    const d = data;
    if (!Array.isArray(d.els)) return "\u5730\u5716\u5834\u666F\u7F3A\u5C11 els\uFF08\u5143\u4EF6\u6E05\u55AE\uFF09";
    if (!d.ratio) return "\u5730\u5716\u5834\u666F\u7F3A\u5C11 ratio";
  }
  if (kind === "photo" && !data.module) return "\u5716\u7247\u904B\u93E1\u7F3A\u5C11 module";
  if (kind === "drop" && !Array.isArray(data.words)) return "\u6C34\u6EF4\u8A2D\u5B9A\u7F3A\u5C11 words\uFF08\u6587\u5B57\u884C\u8207 @\u8A2D\u5B9A\u884C\uFF09";
  const size = JSON.stringify(data).length;
  if (size > 9e5) return `\u8CC7\u6599\u592A\u5927\uFF08${Math.round(size / 1024)}KB\uFF09\uFF0C\u5E95\u5716\u6216\u5716\u7247\u8ACB\u7E2E\u5C0F\u5F8C\u518D\u5B58`;
  return "";
}, "checkPresetData");
var encodeJson = /* @__PURE__ */ __name((v) => {
  const bytes = new TextEncoder().encode(JSON.stringify(v));
  let bin = "";
  bytes.forEach((b) => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}, "encodeJson");
var editUrl = /* @__PURE__ */ __name((origin, p) => {
  if (p.id) return `${origin}/?edit=${p.id}`;
  const data = p.kind === "map" ? { ...p.data, bgUrl: p.data.bgUrl?.startsWith("data:") ? void 0 : p.data.bgUrl } : p.kind === "photo" ? { ...p.data, images: p.data.images.map((u) => u.startsWith("data:") ? "" : u) } : p.data;
  return `${origin}/?edit=${p.kind}&d=${encodeJson(data)}`;
}, "editUrl");

// api/presets/[id].ts
var err2 = /* @__PURE__ */ __name((e) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500), "err");
var idOf2 = /* @__PURE__ */ __name((p) => String(Array.isArray(p.id) ? p.id[0] : p.id), "idOf");
var onRequestGet2 = /* @__PURE__ */ __name(async ({ env, params }) => {
  try {
    const p = await getPreset(env, idOf2(params));
    return p ? json({ ok: true, preset: p }) : json({ ok: false, error: "\u627E\u4E0D\u5230\u9019\u500B\u9810\u8A2D" }, 404);
  } catch (e) {
    return err2(e);
  }
}, "onRequestGet");
var onRequestPut2 = /* @__PURE__ */ __name(async ({ request, env, params }) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const b = await request.json();
    const bad = checkPresetData(b.kind, b.data);
    if (bad) return json({ ok: false, error: bad }, 400);
    const name = String(b.name ?? "").trim().slice(0, 60) || "\u672A\u547D\u540D";
    return json({ ok: true, preset: await savePreset(env, { kind: b.kind, name, note: b.note ? String(b.note).slice(0, 500) : void 0, data: b.data, source: String(b.source ?? "web").slice(0, 20) }, idOf2(params)) });
  } catch (e) {
    return err2(e);
  }
}, "onRequestPut");
var onRequestDelete2 = /* @__PURE__ */ __name(async ({ request, env, params }) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    return await deletePreset(env, idOf2(params)) ? json({ ok: true }) : json({ ok: false, error: "\u627E\u4E0D\u5230\u9019\u500B\u9810\u8A2D" }, 404);
  } catch (e) {
    return err2(e);
  }
}, "onRequestDelete");
var onRequestOptions2 = preflight;

// api/combos/index.ts
var err3 = /* @__PURE__ */ __name((e) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500), "err");
var onRequestGet3 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const u = new URL(request.url);
  try {
    const combos = await listCombos(env, u.searchParams.get("q") ?? "", u.searchParams.get("tag") ?? "", Number(u.searchParams.get("limit")) || 60);
    return json({ ok: true, count: combos.length, combos });
  } catch (e) {
    return err3(e);
  }
}, "onRequestGet");
var onRequestPost = /* @__PURE__ */ __name(async ({ request, env }) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const { combo, errors } = normalizeCombo({ source: "web", ...await request.json() });
    if (errors.length) return json({ ok: false, errors }, 400);
    return json({ ok: true, combo: await saveCombo(env, combo) }, 201);
  } catch (e) {
    return err3(e);
  }
}, "onRequestPost");
var onRequestOptions3 = preflight;

// api/effects.ts
var onRequestGet4 = /* @__PURE__ */ __name(async () => json(
  {
    total: EFFECTS.length,
    categories: CATEGORIES,
    palettes: PALETTES,
    effects: EFFECTS.map((f) => ({
      id: f.id,
      number: NUM.get(f.id),
      zh: f.zh,
      en: f.en,
      category: f.cat,
      description: f.desc,
      tags: f.tags,
      sample_words: f.sample,
      word_hint: f.hint ?? null,
      tone: f.tone,
      loop_seconds: loopSeconds(f),
      needs_js: !!f.run,
      motion_zh: f.motion,
      motion_en: f.motionEn
    }))
  },
  200,
  { "cache-control": "public, max-age=300" }
), "onRequestGet");
var onRequestOptions4 = preflight;

// api/presets/index.ts
var err4 = /* @__PURE__ */ __name((e) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500), "err");
var onRequestGet5 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const u = new URL(request.url);
  try {
    const presets = await listPresets(env, u.searchParams.get("kind") ?? "", u.searchParams.get("q") ?? "", Number(u.searchParams.get("limit")) || 100);
    return json({ ok: true, count: presets.length, presets: presets.map(({ data: _d, ...p }) => p) });
  } catch (e) {
    return err4(e);
  }
}, "onRequestGet");
var onRequestPost2 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const b = await request.json();
    const bad = checkPresetData(b.kind, b.data);
    if (bad) return json({ ok: false, error: bad }, 400);
    const name = String(b.name ?? "").trim().slice(0, 60) || "\u672A\u547D\u540D";
    return json({ ok: true, preset: await savePreset(env, { kind: b.kind, name, note: b.note ? String(b.note).slice(0, 500) : void 0, data: b.data, source: String(b.source ?? "web").slice(0, 20) }) }, 201);
  } catch (e) {
    return err4(e);
  }
}, "onRequestPost");
var onRequestOptions5 = preflight;

// c/[id].ts
var page = /* @__PURE__ */ __name((msg, status) => new Response(`<!doctype html><meta charset="utf-8"><title>Motion Atlas</title><body style="font-family:system-ui;background:#151515;color:#f5f1e8;display:grid;place-items:center;height:100vh;margin:0"><p>${msg}\u3000<a style="color:#ff5a36" href="/?view=combos">\u56DE Combo \u5EAB</a></p>`, {
  status,
  headers: { "content-type": "text/html; charset=utf-8" }
}), "page");
var onRequestGet6 = /* @__PURE__ */ __name(async ({ env, params, request }) => {
  try {
    const c = await getCombo(env, String(params.id));
    if (!c) return page("\u627E\u4E0D\u5230\u9019\u500B Combo", 404);
    const hud = new URL(request.url).searchParams.get("hud") !== "0";
    return new Response(comboHtml(c, { hud }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" } });
  } catch (e) {
    return page(e instanceof Error ? e.message : "\u8B80\u53D6\u5931\u6557", 503);
  }
}, "onRequestGet");

// r/[name].ts
var ENGINES = {
  "photo.js": {
    usage: "MA_PHOTO.drawPhoto(ctx, W, H, scene, tSeconds, images) \u2014 scene \u70BA build_photo_scene / get_preset \u7684\u5834\u666F\uFF1Bimages \u70BA\u5DF2\u8F09\u5165\u7684 <img>\uFF0C\u7F3A\u5716\u6642\u756B\u793A\u610F\u5716",
    code: PHOTO_GLOBALS
  },
  "map.js": { usage: "MA_MAP.drawScene(ctx, W, H, scene, tSeconds, bgImage?)", code: MAP_GLOBALS },
  "drop.js": { usage: "const { o, lines } = MA_DROP.parse(words); MA_DROP.draw(ctx, W, H, o, lines, tSeconds)", code: DROP_GLOBALS }
};
var onRequestGet7 = /* @__PURE__ */ __name(async ({ params }) => {
  const e = ENGINES[String(params.name)];
  if (!e) return new Response("// \u53EF\u7528\uFF1Aphoto.js\u3001map.js\u3001drop.js", { status: 404, headers: { "content-type": "text/javascript; charset=utf-8" } });
  return new Response(`// Motion Atlas \u7E6A\u88FD\u5F15\u64CE
// \u7528\u6CD5\uFF1A${e.usage}
// \u9010\u683C\u6E32\u67D3\uFF1At \u5F9E 0 \u958B\u59CB\uFF0C\u6BCF\u683C\u52A0 1/fps\uFF1B\u756B\u5E03\u5C3A\u5BF8\u5EFA\u8B70 1080\xD71920\uFF089:16\uFF09
${e.code}
`, {
    headers: { "content-type": "text/javascript; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "public, max-age=300" }
  });
}, "onRequestGet");

// ../src/prompts.ts
var ratioZh = { "16:9": "16:9 \u6A6B\u5F0F\uFF08YouTube\uFF09", "9:16": "9:16 \u76F4\u5F0F\uFF08Shorts\uFF0FReels\uFF09", "1:1": "1:1 \u65B9\u5F62\uFF08\u8CBC\u6587\uFF09" };
var ratioEn = { "16:9": "16:9 landscape", "9:16": "9:16 vertical", "1:1": "1:1 square" };
var quoteWords = /* @__PURE__ */ __name((w) => w.map((t) => `\u300C${t}\u300D`).join("\u3001"), "quoteWords");
var quoteWordsEn = /* @__PURE__ */ __name((w) => w.map((t) => `"${t}"`).join(", "), "quoteWordsEn");
var buildPrompt = /* @__PURE__ */ __name((fx, mode, words, v, ratio) => {
  const dur = loopSeconds(fx);
  if (mode === "web")
    return `\u8ACB\u5E6B\u6211\u7528 HTML + CSS\uFF08\u5FC5\u8981\u6642\u52A0\u5C11\u91CF\u539F\u751F JavaScript\uFF09\u505A\u4E00\u5F35\u300C${fx.zh}\uFF08${fx.en}\uFF09\u300D\u6587\u5B57\u52D5\u614B\u5B57\u5361\u3002

\u3010\u756B\u9762\u3011
- \u6BD4\u4F8B\uFF1A${ratioZh[ratio]}\uFF0C\u756B\u9762\u7F6E\u4E2D\u3001\u6EFF\u7248\uFF0C\u53EF\u4EE5\u76F4\u63A5\u87A2\u5E55\u9304\u5F71\u4F7F\u7528
- \u6587\u5B57\u5167\u5BB9\uFF1A${quoteWords(words)}
- \u5B57\u9AD4\uFF1ANoto Sans TC \u7C97\u9AD4 900\uFF08Google Fonts\uFF09
- \u914D\u8272\uFF1A\u80CC\u666F ${v.bg}\u3001\u6587\u5B57 ${v.fg}\u3001\u5F37\u8ABF\u8272 ${v.ac}

\u3010\u52D5\u614B\u3011
${fx.motion}

\u3010\u898F\u683C\u3011
- \u52D5\u756B\u7121\u7E2B\u5FAA\u74B0\uFF0C\u4E00\u500B\u5FAA\u74B0\u7D04 ${dur} \u79D2
- \u76E1\u91CF\u53EA\u52D5 transform\u3001opacity\u3001filter\uFF0C\u78BA\u4FDD 60fps \u4E0D\u6389\u683C
- \u5B57\u7D1A\u7528 vw/vh \u6216 container query \u55AE\u4F4D\uFF0C\u63DB\u6BD4\u4F8B\u4E5F\u4E0D\u6703\u8DD1\u7248
- \u505A\u6210\u55AE\u4E00 HTML \u6A94\uFF0C\u4E0D\u4F9D\u8CF4\u5916\u90E8\u51FD\u5F0F\u5EAB\uFF08\u5B57\u9AD4\u9664\u5916\uFF09
- \u652F\u63F4 prefers-reduced-motion\uFF1A\u4F7F\u7528\u8005\u958B\u555F\u6E1B\u5C11\u52D5\u614B\u6642\uFF0C\u76F4\u63A5\u986F\u793A\u5B8C\u6210\u756B\u9762
- \u5728\u6A94\u6848\u6700\u4E0A\u65B9\u7528 CSS \u8B8A\u6578\u96C6\u4E2D\u7BA1\u7406\u6587\u5B57\u3001\u984F\u8272\u3001\u79D2\u6578\uFF0C\u65B9\u4FBF\u6211\u4E4B\u5F8C\u6539`;
  if (mode === "en")
    return `Build a "${fx.en}" kinetic typography title card using HTML + CSS (plus a little vanilla JavaScript only if needed).

SCENE
- Aspect ratio: ${ratioEn[ratio]}, full-bleed and centered, ready for screen recording
- Text: ${quoteWordsEn(words)}
- Typeface: Noto Sans TC, weight 900 (Google Fonts) \u2014 the text may be Traditional Chinese
- Colors: background ${v.bg}, text ${v.fg}, accent ${v.ac}

MOTION
${fx.motionEn}

REQUIREMENTS
- Seamless loop, roughly ${dur}s per cycle
- Animate only transform / opacity / filter where possible for a smooth 60fps
- Size type with vw/vh or container query units so it survives ratio changes
- Single self-contained HTML file, no libraries (fonts excepted)
- Respect prefers-reduced-motion by showing the final resolved frame
- Expose text, colors and timing as CSS custom properties at the top of the file`;
  if (mode === "video")
    return `${ratioEn[ratio]} motion graphics title card, kinetic typography. ${fx.motionEn} The on-screen text reads ${quoteWordsEn(words)} in a heavy geometric sans-serif, perfectly legible and correctly spelled. Flat solid ${v.bg} background, ${v.fg} lettering with ${v.ac} accents. Clean vector design, no people, no extra objects, no camera shake unless described, crisp edges, smooth 60fps, seamless ${dur}-second loop.

---
\u63D0\u9192\uFF1A\u76EE\u524D AI \u5F71\u7247\u6A21\u578B\u5E38\u628A\u4E2D\u6587\u5B57\u5BEB\u932F\u6216\u8B8A\u5F62\u3002\u4E2D\u6587\u5B57\u5361\u5EFA\u8B70\u7528\u300C\u7DB2\u9801\u5BE6\u4F5C\u300D\u7248\u672C\u7522\u751F\u5F8C\u87A2\u5E55\u9304\u5F71\uFF0C\u6216\u5148\u7528\u82F1\u6587\uFF0F\u6578\u5B57\u751F\u6210\u52D5\u614B\uFF0C\u518D\u5230\u526A\u8F2F\u8EDF\u9AD4\u758A\u4E0A\u6B63\u78BA\u7684\u4E2D\u6587\u5B57\u3002`;
  return exportHtml(fx, words, v, ratio);
}, "buildPrompt");
var ratioCss2 = {
  "16:9": "width:min(100vw,177.78vh);aspect-ratio:16/9",
  "9:16": "height:min(100vh,177.78vw);aspect-ratio:9/16",
  "1:1": "width:min(100vw,100vh);aspect-ratio:1"
};
var exportHtml = /* @__PURE__ */ __name((fx, words, v, ratio) => {
  const css = scopeCss(fx).trim();
  const script = fx.run ? `
<script>
${fx.globals ?? ""}
${fnSource(fx.run)}(document.querySelector('.fx'), ${JSON.stringify(words)});
<\/script>` : "";
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fx.zh} ${fx.en} \u2014 Motion Atlas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_LINK}" rel="stylesheet">
<style>
/* \u5F9E motion.leichthub.com \u532F\u51FA\uFF1A${fx.zh}\uFF08${fx.en}\uFF09 */
:root{${varsCss(v)}}
html,body{margin:0;height:100%;background:var(--bg);display:grid;place-items:center;overflow:hidden}
.stage{position:relative;${ratioCss2[ratio]};container-type:size;overflow:hidden}
@media (prefers-reduced-motion:reduce){.fx *{animation-play-state:paused!important}}
${BASE_FX_CSS}
${css}
</style>
</head>
<body>
<div class="stage"><div class="fx fx-${fx.id}">${fx.html(words)}</div></div>${script}
</body>
</html>
`;
}, "exportHtml");

// _lib/tools.ts
var summary = /* @__PURE__ */ __name((f) => ({
  id: f.id,
  number: NUM.get(f.id),
  zh: f.zh,
  en: f.en,
  category: f.cat,
  description: f.desc,
  tags: f.tags,
  sample_words: f.sample,
  word_hint: f.hint ?? null,
  default_tone: f.tone,
  loop_seconds: loopSeconds(f),
  needs_js: !!f.run
}), "summary");
var norm = /* @__PURE__ */ __name((s) => s.toLowerCase().trim(), "norm");
var score = /* @__PURE__ */ __name((f, terms) => {
  const cat = CATEGORIES.find((c) => c.id === f.cat);
  const fields = [
    [f.zh, 6],
    [f.en, 5],
    [f.id, 5],
    [f.tags.join(" "), 4],
    [f.desc, 3],
    [`${cat.zh} ${cat.code} ${cat.tagline}`, 2],
    [f.motion, 1],
    [f.motionEn, 1]
  ];
  let s = 0;
  for (const t of terms) {
    let hit = 0;
    for (const [txt, w] of fields) if (norm(txt).includes(t)) hit = Math.max(hit, w);
    if (!hit && /[一-鿿]{3,}/.test(t)) {
      for (let i = 0; i < t.length - 1; i++) for (const [txt, w] of fields) if (norm(txt).includes(t.slice(i, i + 2))) hit = Math.max(hit, w / 3);
    }
    s += hit;
  }
  return s;
}, "score");
var linkFor = /* @__PURE__ */ __name((origin, c) => c.id ? `${origin}/c/${c.id}` : `${origin}/?combo=${encodeCombo(c)}`, "linkFor");
var comboView = /* @__PURE__ */ __name((c, origin, withHtml = false) => ({
  id: c.id ?? null,
  title: c.title,
  brief: c.brief ?? null,
  tags: c.tags ?? [],
  ratio: c.ratio,
  palette: c.palette,
  accent: c.accent ?? null,
  transition: c.transition,
  total_seconds: totalSeconds(c),
  scenes: c.scenes,
  outline: comboOutline(c),
  scene_edit_urls: c.scenes.map((sc, i) => {
    const pd = sceneToPresetData(sc.effect, sc.words ?? []);
    const pid = sc.note?.match(/預設 (p[0-9a-z]+)/)?.[1];
    return pd ? { scene: i + 1, effect: sc.effect, preset: pid ?? null, edit_url: pid ? `${origin}/?edit=${pid}` : editUrl(origin, pd) } : null;
  }).filter(Boolean),
  notes: c.notes ?? null,
  play_url: linkFor(origin, c),
  created_at: c.created_at ?? null,
  updated_at: c.updated_at ?? null,
  ...withHtml ? { html: comboHtml(c) } : {}
}), "comboView");
var comboInput = {
  title: { type: "string", description: "Combo \u540D\u7A31\uFF0C\u4F8B\u5982\u300C\u5EFA\u6848\u958B\u7BB1\u7247\u982D\u300D" },
  brief: { type: "string", description: "\u539F\u59CB\u9700\u6C42\u6216\u7528\u9014\u8AAA\u660E\uFF08\u4E4B\u5F8C\u641C\u5C0B\u7528\uFF09" },
  scenes: {
    type: "array",
    minItems: 1,
    maxItems: 20,
    description: "\u4F9D\u64AD\u653E\u9806\u5E8F\u6392\u5217\u7684\u6BB5\u843D",
    items: {
      type: "object",
      properties: {
        preset: { type: "string", description: "\u9810\u8A2D\u4EE3\u78BC\uFF08\u4F8B\u5982 p7k2x\uFF09\uFF1B\u7D66\u4E86\u5C31\u4E0D\u5FC5\u518D\u7D66 effect \u8207 words\uFF0C\u6703\u4F7F\u7528\u4F7F\u7528\u8005\u5728\u7DB2\u7AD9\u4E0A\u8ABF\u597D\u7684\u7248\u672C" },
        images: { type: "array", items: { type: "string" }, description: "\u642D\u914D\u5716\u7247\u904B\u93E1\u9810\u8A2D\uFF1A\u63DB\u6210\u9019\u6B21\u8981\u7528\u7684\u5716\u7247\u7DB2\u5740" },
        effect: { type: "string", description: "\u7279\u6548 id\uFF08\u7528 search_effects \u67E5\uFF09\uFF0C\u4E5F\u63A5\u53D7\u7DE8\u865F\uFF1B\u8207 preset \u4E8C\u9078\u4E00" },
        words: { type: "array", items: { type: "string" }, description: "\u9019\u6BB5\u7684\u6587\u5B57\uFF1B\u591A\u500B\u8A5E\u4EE3\u8868\u8F2A\u64AD\u6216\u5206\u884C\uFF0C\u683C\u5F0F\u4F9D\u7279\u6548\u7684 word_hint" },
        seconds: { type: "number", description: "\u9019\u6BB5\u64AD\u653E\u79D2\u6578\uFF0C\u9810\u8A2D\u4F9D\u7279\u6548\u5FAA\u74B0\u9577\u5EA6\uFF082.4\u20136 \u79D2\uFF09" },
        tone: { type: "string", enum: ["ink", "paper", "accent"], description: "\u5E95\u8272\uFF1A\u6DF1\u3001\u6DFA\u3001\u4E3B\u8272\uFF1B\u7701\u7565\u7528\u7279\u6548\u9810\u8A2D" },
        note: { type: "string", description: "\u9019\u6BB5\u7684\u7528\u610F\u6216\u526A\u8F2F\u5099\u8A3B" }
      }
    }
  },
  palette: { type: "string", enum: PALETTES.map((p) => p.id), description: "\u914D\u8272\u7D44\uFF0C\u9810\u8A2D leicht\uFF08\u5149\u5BD3\u6A58\uFF09" },
  accent: { type: "string", description: "\u81EA\u8A02\u4E3B\u8272 #RRGGBB\uFF0C\u6703\u8986\u84CB\u914D\u8272\u7D44\u7684\u4E3B\u8272" },
  ratio: { type: "string", enum: ["16:9", "9:16", "1:1"], description: "\u5F71\u7247\u6BD4\u4F8B\uFF0CShorts \u7528 9:16" },
  transition: { type: "string", enum: ["cut", "fade", "slide", "zoom"], description: "\u6BB5\u843D\u8F49\u5834\uFF0C\u9810\u8A2D fade" },
  tags: { type: "array", items: { type: "string" }, description: "\u5206\u985E\u6A19\u7C64\uFF0C\u4F8B\u5982 \u7247\u982D\u3001\u5EFA\u6848\u3001Shorts" },
  notes: { type: "string", description: "\u7D66\u672A\u4F86\u53C3\u8003\u7684\u5099\u8A3B" }
};
var resolvePresets = /* @__PURE__ */ __name(async (a, env) => {
  if (!Array.isArray(a.scenes)) return [];
  const errors = [];
  a.scenes = await Promise.all(
    a.scenes.map(async (sc, i) => {
      if (!sc || typeof sc !== "object" || !sc.preset) return sc;
      const p = await getPreset(env, String(sc.preset));
      if (!p) {
        errors.push(`scenes[${i}].preset\u300C${String(sc.preset)}\u300D\u4E0D\u5B58\u5728\uFF0C\u8ACB\u7528 list_presets \u67E5`);
        return sc;
      }
      const base2 = presetToScene(p, Array.isArray(sc.images) ? { images: sc.images.map(String) } : {});
      return { ...base2, ...sc.seconds ? { seconds: sc.seconds } : {}, ...sc.note ? { note: sc.note } : { note: base2.note } };
    })
  );
  return errors;
}, "resolvePresets");
var TOOLS = [
  {
    name: "list_categories",
    title: "\u5217\u51FA\u5206\u985E\u8207\u914D\u8272",
    description: `\u5217\u51FA Motion Atlas \u7684 ${CATEGORIES.length} \u500B\u7279\u6548\u5206\u985E\uFF08\u5171 ${EFFECTS.length} \u62DB\uFF09\u3001\u5E38\u7528\u60C5\u5883\u6A19\u7C64\u8207\u53EF\u7528\u914D\u8272\u3002\u7B2C\u4E00\u6B21\u4F7F\u7528\u6642\u5148\u547C\u53EB\uFF0C\u4E86\u89E3\u6709\u54EA\u4E9B\u9078\u64C7\u3002`,
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async () => ({
      total_effects: EFFECTS.length,
      categories: CATEGORIES.map((c) => ({ ...c, count: EFFECTS.filter((f) => f.cat === c.id).length })),
      tags: ALL_TAGS,
      palettes: PALETTES,
      tones: { ink: "\u6DF1\u8272\u5E95", paper: "\u6DFA\u8272\u5E95", accent: "\u4E3B\u8272\u5E95" }
    }), "run")
  },
  {
    name: "search_effects",
    title: "\u641C\u5C0B\u6587\u5B57\u7279\u6548",
    description: "\u4F9D\u95DC\u9375\u5B57\u3001\u5206\u985E\u6216\u60C5\u5883\u6A19\u7C64\u641C\u5C0B\u6587\u5B57\u52D5\u614B\u7279\u6548\uFF0C\u56DE\u50B3 id\u3001\u8AAA\u660E\u3001\u5EFA\u8B70\u5B57\u6578\u8207\u9810\u8A2D\u6587\u5B57\u3002\u95DC\u9375\u5B57\u53EF\u7528\u4E2D\u6587\u6216\u82F1\u6587\uFF0C\u4F8B\u5982\u300C\u8F49\u5834\u300D\u300C\u6578\u5B57\u300D\u300C\u9713\u8679\u300D\u300CShorts \u5B57\u5E55\u300D\u3002\u7D44 Combo \u524D\u7528\u5B83\u6311\u9078\u6BCF\u4E00\u6BB5\u7684\u7279\u6548\u3002",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "\u95DC\u9375\u5B57\uFF0C\u7A7A\u767D\u5206\u9694\u591A\u500B\u8A5E" },
        category: { type: "string", enum: CATEGORIES.map((c) => c.id) },
        tag: { type: "string", description: "\u60C5\u5883\u6A19\u7C64\uFF0C\u4F8B\u5982 \u8F49\u5834\u3001\u7247\u982D\u3001\u6578\u64DA" },
        limit: { type: "number", description: "\u6700\u591A\u56DE\u50B3\u5E7E\u7B46\uFF0C\u9810\u8A2D 20" }
      }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a) => {
      const terms = norm(String(a.query ?? "")).split(/\s+/).filter(Boolean);
      let list = EFFECTS.filter((f) => (!a.category || f.cat === a.category) && (!a.tag || f.tags.includes(String(a.tag).replace(/^#/, ""))));
      if (terms.length)
        list = list.map((f) => ({ f, s: score(f, terms) })).filter((x) => x.s > 0).sort((x, y) => y.s - x.s).map((x) => x.f);
      const limit = Math.min(113, Math.max(1, Number(a.limit) || 20));
      return { count: list.length, effects: list.slice(0, limit).map(summary) };
    }, "run")
  },
  {
    name: "get_effect",
    title: "\u53D6\u5F97\u7279\u6548\u7D30\u7BC0\u8207\u63D0\u793A\u8A5E",
    description: "\u53D6\u5F97\u55AE\u4E00\u7279\u6548\u7684\u5B8C\u6574\u8CC7\u8A0A\uFF1A\u52D5\u614B\u62C6\u89E3\u3001\u53EF\u76F4\u63A5\u8CBC\u7D66 AI \u7684\u63D0\u793A\u8A5E\uFF0C\u6216\u53EF\u7368\u7ACB\u64AD\u653E\u7684 HTML \u539F\u59CB\u78BC\u3002\u53EF\u4EE5\u5E36\u5165\u81EA\u8A02\u6587\u5B57\u3001\u914D\u8272\u8207\u6BD4\u4F8B\u3002",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "\u7279\u6548 id \u6216\u7DE8\u865F" },
        words: { type: "array", items: { type: "string" } },
        palette: { type: "string", enum: PALETTES.map((p) => p.id) },
        accent: { type: "string", description: "#RRGGBB" },
        tone: { type: "string", enum: ["ink", "paper", "accent"] },
        ratio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
        format: { type: "string", enum: ["web", "en", "video", "code"], description: "web \u4E2D\u6587\u7DB2\u9801\u63D0\u793A\u8A5E\u3001en \u82F1\u6587\u3001video AI \u5F71\u7247\u63D0\u793A\u8A5E\u3001code HTML \u539F\u59CB\u78BC\uFF1B\u9810\u8A2D web" }
      }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const fx = findEffect(String(a.id ?? ""));
      if (!fx) throw new Error(`\u627E\u4E0D\u5230\u7279\u6548\u300C${String(a.id)}\u300D\uFF0C\u8ACB\u7528 search_effects \u67E5\u8A62`);
      const base2 = PALETTES.find((p) => p.id === a.palette) ?? PALETTES[0];
      const pal = typeof a.accent === "string" && /^#[0-9a-f]{6}$/i.test(a.accent) ? { ...base2, accent: a.accent } : base2;
      const words = Array.isArray(a.words) && a.words.length ? a.words.map(String) : fx.sample;
      const tone = ["ink", "paper", "accent"].includes(String(a.tone)) ? a.tone : fx.tone;
      const ratio = ["16:9", "9:16", "1:1"].includes(String(a.ratio)) ? a.ratio : "16:9";
      const format = ["web", "en", "video", "code"].includes(String(a.format)) ? a.format : "web";
      return {
        ...summary(fx),
        motion_zh: fx.motion,
        motion_en: fx.motionEn,
        page_url: `${ctx.origin}/?fx=${fx.id}`,
        format,
        output: buildPrompt(fx, format, words, toneVars(pal, tone), ratio)
      };
    }, "run")
  },
  {
    name: "build_map_scene",
    title: "\u7D44\u5730\u5716\u5834\u666F",
    description: "\u4F9D\u983B\u9053\u65E2\u6709\u7684\u5730\u5716\u7247\u6BB5\u6A23\u5F0F\u7D44\u51FA\u300C\u5730\u5716\u758A\u52A0\u5834\u666F\u300D\uFF08\u6A19\u984C\u7C64\u3001\u57FA\u5730\u6846\u3001\u57FA\u5730\u6A19\u7C64\u3001\u9053\u8DEF\u540D\u3001\u8CC7\u8A0A\u5361\u6216\u6578\u64DA\u5361\u3001\u5B57\u5E55\u3001\u5E95\u5716\u51FA\u8655\uFF09\uFF0C\u56DE\u50B3\u53EF\u653E\u9032 Combo \u7684 combo_scene \u8207\u9810\u89BD\u9023\u7D50\u3002aerial \u7BC4\u672C\uFF1D\u9CE5\u77B0\u6B63\u5C04\u5F71\u50CF\u98A8\uFF08\u9EC3\u8272\u57FA\u5730\u6846\uFF0B\u8CC7\u8A0A\u5361\uFF09\uFF1Bstreet \u7BC4\u672C\uFF1D\u8857\u9053\u5716\u98A8\uFF08\u6A58\u8272\u57FA\u5730\u7BC4\u570D\uFF0B\u5B9A\u4F4D\u91DD\uFF0B\u4E09\u6B04\u6578\u64DA\u5361\uFF09\u3002\u5EA7\u6A19\u7686\u70BA 0\u20131 \u7684\u756B\u9762\u6BD4\u4F8B\u3002\u6578\u5B57\u8207\u9762\u7A4D\u8ACB\u7528\u4F7F\u7528\u8005\u63D0\u4F9B\u3001\u53EF\u67E5\u8B49\u7684\u8CC7\u6599\u3002",
    inputSchema: {
      type: "object",
      properties: {
        template: { type: "string", enum: ["aerial", "street", "blank"], description: "\u9810\u8A2D aerial" },
        ratio: { type: "string", enum: ["9:16", "16:9", "1:1"], description: "\u9810\u8A2D 9:16" },
        duration: { type: "number", description: "\u6574\u6BB5\u79D2\u6578\uFF0C\u9810\u8A2D 6" },
        tag: { type: "string", description: "\u5DE6\u4E0A\u6A19\u984C\u7C64\uFF0C\u4F8B\u5982\u300C\u5340\u57DF\uFF5C\u6848\u540D\u300D\uFF1B\u7A7A\u5B57\u4E32\uFF1D\u79FB\u9664" },
        legend: { type: "string", description: "\u5716\u4F8B\u6587\u5B57\uFF08aerial\uFF09\uFF0C\u4F8B\u5982\u300C\u7D05\u7DDA\uFF1A\u516C\u6709\u571F\u5730\u5730\u7C4D\u754C\u7DDA\u300D" },
        site_label: { type: "string", description: "\u57FA\u5730\u6A19\u7C64\u6587\u5B57" },
        site_color: { type: "string", description: "\u57FA\u5730\u6846\u8207\u6A19\u7C64\u984F\u8272 #RRGGBB" },
        roads: {
          type: "array",
          description: "\u9053\u8DEF\u540D\uFF1B\u6C92\u7D66 x/y \u6642\u4F9D\u5E8F\u653E\u5728\u57FA\u5730\u7684\u4E0A\u3001\u4E0B\u3001\u5DE6\u3001\u53F3\uFF08\u5DE6\u53F3\u6703\u76F4\u6392\uFF09",
          items: { type: "object", required: ["text"], properties: { text: { type: "string" }, x: { type: "number" }, y: { type: "number" }, vertical: { type: "boolean" }, light: { type: "boolean", description: "true\uFF1D\u767D\u5E95\u9ED1\u5B57" } } }
        },
        info_lines: { type: "array", items: { type: "string" }, description: "\u8CC7\u8A0A\u5361\u6BCF\u884C\u4E00\u53E5\uFF0C* \u958B\u982D\u7528\u5F37\u8ABF\u8272\uFF08\u9EC3\uFF09" },
        stat: {
          type: "object",
          description: "\u6578\u64DA\u5361\uFF08street \u7BC4\u672C\u9810\u8A2D\u6709\uFF09",
          properties: { title: { type: "string" }, subtitle: { type: "string" }, items: { type: "array", items: { type: "string" }, description: "\u300C\u6A19\u7C64|\u6578\u5B57|\u55AE\u4F4D|\u9644\u8A3B\u300D\uFF0C\u6700\u591A 4 \u6B04" } }
        },
        subtitle: { type: "string", description: "\u5B57\u5E55\uFF1B\u7A7A\u5B57\u4E32\uFF1D\u79FB\u9664" },
        credit: { type: "string", description: "\u5E95\u5716\u51FA\u8655" },
        handle: { type: "string", description: "\u983B\u9053\u7F72\u540D\uFF1B\u7A7A\u5B57\u4E32\uFF1D\u79FB\u9664" },
        bg_url: { type: "string", description: "\u5E95\u5716\u5716\u7247\u7DB2\u5740\uFF08\u9078\u586B\uFF09\uFF1B\u6C92\u6709\u6642\u9810\u89BD\u6703\u7528\u98A8\u683C\u5316\u5E95\u5716\uFF0C\u6B63\u5F0F\u4F7F\u7528\u5EFA\u8B70\u5728\u7DB2\u7AD9\u5730\u5716\u5DE5\u4F5C\u5BA4\u4E0A\u50B3\u81EA\u5DF1\u7684\u5E95\u5716" },
        bg_dim: { type: "number", description: "\u5E95\u5716\u8ABF\u6697 0\u20130.7" },
        elements: { type: "array", items: { type: "object" }, description: "\u9032\u968E\uFF1A\u984D\u5916\u5143\u4EF6 {type: tag|road|site|label|pin|info|stat|compass|text, x, y, text, lines, color, fg, size, delay, pts}" },
        title: { type: "string", description: "\u9810\u89BD\u7528\u540D\u7A31" }
      }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const sc = buildMapScene(a);
      const scene = { effect: "map-overlay", words: [JSON.stringify(sc)], seconds: sc.loop + 1 };
      const { combo } = normalizeCombo({ title: String(a.title ?? "\u5730\u5716\u5834\u666F\u9810\u89BD"), ratio: sc.ratio, transition: "cut", scenes: [scene] });
      return {
        combo_scene: scene,
        elements: sc.els.map((e) => ({ type: e.type, role: e.role ?? null, text: e.text ?? null, lines: e.lines ?? null, x: +e.x.toFixed(3), y: +e.y.toFixed(3), delay: e.delay })),
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: "map", data: sc }),
        ratio: sc.ratio,
        next: `\u628A combo_scene \u539F\u5C01\u4E0D\u52D5\u653E\u9032 compose_combo \u6216 save_combo \u7684 scenes\uFF0C\u4E26\u628A ratio \u8A2D\u70BA ${sc.ratio}\uFF0C\u5426\u5247\u5143\u4EF6\u4F4D\u7F6E\u6703\u8DD1\u6389\uFF1B\u8981\u5FAE\u8ABF\u4F4D\u7F6E\u53EF\u8ACB\u4F7F\u7528\u8005\u5230\u7DB2\u7AD9\u7684\u5730\u5716\u5DE5\u4F5C\u5BA4\uFF08/?view=map\uFF09\u8ABF\u6574\u5F8C\u518D\u52A0\u5165 Combo\u3002`
      };
    }, "run")
  },
  {
    name: "build_drop_scene",
    title: "\u7D44\u6C34\u6EF4\u5834\u666F",
    description: "\u7522\u751F\u300C\u92B3\u5229\u6C34\u6EF4\u300D\u6BB5\u843D\uFF08\u908A\u7DE3\u96F6\u6A21\u7CCA\uFF0C\u9069\u5408\u758A\u9032\u5F71\u7247\uFF09\uFF1A\u53EF\u6307\u5B9A\u5F62\u72C0\u3001\u984F\u8272\u3001\u5149\u6FA4\u3001\u5916\u6846\u3001\u6587\u5B57\u7248\u578B\u8207\u4F4D\u7F6E\u3001\u9EDE\u7DB4\u5C0F\u6C34\u6EF4\u3002\u56DE\u50B3\u53EF\u653E\u9032 Combo \u7684 combo_scene \u8207\u9810\u89BD\u9023\u7D50\u3002",
    inputSchema: {
      type: "object",
      required: ["lines"],
      properties: {
        lines: { type: "array", items: { type: "string" }, description: "\u6587\u5B57\uFF0C\u4E00\u884C\u4E00\u53E5\uFF1B~ \u958B\u982D\u70BA\u5B57\u8DDD\u5BEC\u7684\u82F1\u6587\u5C0F\u5B57" },
        layout: { type: "string", enum: ["inside", "beside", "above", "below"], description: "\u5B57\u5728\u6C34\u6EF4\u88E1\uFF5C\u5B57\u65C1\u9EDE\u7DB4\u5C0F\u6C34\u6EF4\uFF5C\u6C34\u6EF4\u5728\u4E0A\uFF5C\u6C34\u6EF4\u5728\u4E0B" },
        shape: { type: "string", enum: ["circle", "cloud", "flower", "pebble", "random"] },
        seed: { type: "number", description: "\u96A8\u6A5F\u5F62\u72C0\u7684\u7A2E\u5B50\uFF0C\u540C\u4E00\u500B\u6578\u5B57\u5F62\u72C0\u76F8\u540C" },
        size: { type: "number", description: "\u4E3B\u6C34\u6EF4\u5927\u5C0F 0\u20130.95\uFF08\u4F54\u77ED\u908A\u6BD4\u4F8B\uFF09\uFF0C0\uFF1D\u4E0D\u756B\u4E3B\u6C34\u6EF4" },
        color: { type: "string", description: "\u6C34\u6EF4\u4E0A\u65B9\u984F\u8272 #RRGGBB" },
        color2: { type: "string", description: "\u6C34\u6EF4\u4E0B\u65B9\u984F\u8272 #RRGGBB" },
        alpha: { type: "number", description: "\u900F\u660E\u5EA6 0.1\u20131" },
        gloss: { type: "number", description: "\u5149\u6FA4 0\u20131" },
        gloss_style: { type: "string", enum: ["both", "crescent", "dot", "none"] },
        rim: { type: "string", description: "\u5916\u6846\u984F\u8272" },
        rim_width: { type: "number", description: "\u5916\u6846\u7C97\u7D30 0\u201316" },
        text_color: { type: "string" },
        text_size: { type: "number", description: "\u5B57\u7D1A\uFF08\u4EE5\u77ED\u908A 1080 \u70BA\u57FA\u6E96\uFF09\uFF0C\u9810\u8A2D 150" },
        stroke: { type: "string", description: "\u6587\u5B57\u63CF\u908A\u984F\u8272" },
        stroke_width: { type: "number" },
        x: { type: "number" },
        y: { type: "number" },
        tx: { type: "number", description: "\u6587\u5B57\u4E2D\u5FC3 0\u20131" },
        ty: { type: "number" },
        sats: { type: "number", description: "\u9EDE\u7DB4\u5C0F\u6C34\u6EF4\u6578\u91CF 0\u201316" },
        sat_size: { type: "number" },
        sat_spread: { type: "number" },
        bg: { type: "string", description: "transparent\uFF08\u9810\u8A2D\uFF09\u3001#hex\uFF0C\u6216 #hex,#hex \u6F38\u5C64" },
        duration: { type: "number", description: "\u79D2\u6578\uFF0C\u9810\u8A2D 6" },
        title: { type: "string" }
      }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const lines = Array.isArray(a.lines) ? a.lines.map(String).filter(Boolean).slice(0, 6) : ["\u6C34\u6EF4"];
      const { o } = parseDrop(a.layout ? [`@pos=${String(a.layout)}`] : []);
      const map2 = { shape: "shape", seed: "seed", size: "size", color: "color", color2: "color2", alpha: "alpha", gloss: "gloss", gloss_style: "glossStyle", rim: "rim", rim_width: "rimWidth", text_color: "textColor", text_size: "textSize", stroke: "stroke", stroke_width: "strokeWidth", x: "x", y: "y", tx: "tx", ty: "ty", sats: "sats", sat_size: "satSize", sat_spread: "satSpread", bg: "bg", duration: "loop" };
      const rec = o;
      for (const [k, key] of Object.entries(map2)) if (a[k] !== void 0 && a[k] !== null) rec[key] = typeof rec[key] === "number" ? Number(a[k]) : String(a[k]);
      const words = dropToWords(o, lines);
      const scene = { effect: "crisp-drop", words, seconds: o.loop };
      const { combo } = normalizeCombo({ title: String(a.title ?? "\u6C34\u6EF4\u9810\u89BD"), ratio: "9:16", transition: "cut", scenes: [scene] });
      return { combo_scene: scene, ratio: "9:16", preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`, edit_url: editUrl(ctx.origin, { kind: "drop", data: { words } }), next: "\u628A combo_scene \u653E\u9032 compose_combo \u6216 save_combo \u7684 scenes\uFF1B\u6C34\u6EF4\u4EE5\u77ED\u908A\u70BA\u57FA\u6E96\uFF0C9:16\u300116:9 \u90FD\u80FD\u7528\u3002" };
    }, "run")
  },
  {
    name: "build_photo_scene",
    title: "\u7D44\u5716\u7247\u904B\u93E1",
    description: `\u628A\u7167\u7247\u505A\u6210\u56FA\u5B9A\u7684\u904B\u93E1\u6A21\u7D44\uFF08\u53C3\u6578\u5316\uFF0C\u53EF\u5B58\u6210\u9810\u8A2D\u91CD\u8907\u4F7F\u7528\uFF09\u3002\u6A21\u7D44\uFF1A${PHOTO_MODULES.map((m) => `${m}\uFF1D${MODULE_INFO[m].zh}\uFF08${MODULE_INFO[m].desc}\uFF0C${MODULE_INFO[m].slots} \u5F35\u5716\uFF09`).join("\uFF1B")}\u3002\u56DE\u50B3 combo_scene\u3001\u9810\u89BD\u8207\u7DE8\u8F2F\u9023\u7D50\u3001\u5404\u53C3\u6578\u8AAA\u660E\uFF0C\u4EE5\u53CA\u5728\u672C\u6A5F\u9010\u683C\u6E32\u67D3\u7684\u65B9\u6CD5\u3002\u5716\u7247\u901A\u5E38\u5728\u4F7F\u7528\u8005\u96FB\u8166\u4E0A\uFF1A\u9810\u89BD\u6642\u53EF\u7559\u7A7A\uFF08\u986F\u793A\u793A\u610F\u5716\uFF09\uFF0C\u672C\u6A5F\u6E32\u67D3\u6642\u518D\u653E\u5165\u3002`,
    inputSchema: {
      type: "object",
      required: ["module"],
      properties: {
        module: { type: "string", enum: PHOTO_MODULES },
        ratio: { type: "string", enum: ["9:16", "16:9", "1:1"], description: "\u9810\u8A2D 9:16" },
        duration: { type: "number", description: "\u52D5\u756B\u79D2\u6578\uFF0C\u9810\u8A2D 6" },
        images: { type: "array", items: { type: "string" }, description: "\u5716\u7247\u7DB2\u5740\u6216\u672C\u6A5F\u76F8\u5C0D\u8DEF\u5F91\uFF08compare \u9700 2 \u5F35\uFF1A\u524D\u3001\u5F8C\uFF09\uFF1B\u7559\u7A7A\uFF1D\u793A\u610F\u5716" },
        params: { type: "object", description: "\u6A21\u7D44\u53C3\u6578\uFF0C\u898B\u56DE\u50B3\u7684 params_doc\uFF1B\u4F4D\u7F6E\u985E\u53C3\u6578\u7686\u70BA 0\u20131 \u7684\u756B\u9762\u6BD4\u4F8B" },
        caption: {
          type: "object",
          properties: {
            text: { type: "string", description: "\u5B57\u5E55\uFF0C\u53EF\u7528 \\n \u63DB\u884C\uFF1B\u7A7A\u5B57\u4E32\uFF1D\u4E0D\u986F\u793A" },
            x: { type: "number" },
            y: { type: "number", description: "0\u20131\uFF0C\u9810\u8A2D 0.86" },
            size: { type: "number", description: "0.4\u20133\uFF0C\u9810\u8A2D 1" },
            style: { type: "string", enum: ["pill", "bar", "plain"], description: "\u6DF1\u8272\u81A0\u56CA\uFF5C\u5DE6\u5074\u8272\u689D\uFF5C\u9ED1\u8272\u63CF\u908A\u5B57" },
            color: { type: "string", description: "\u6587\u5B57\u8272 #RRGGBB\uFF0C\u9810\u8A2D\u9EC3 #ffd23f" },
            delay: { type: "number", description: "\u51FA\u73FE\u6642\u9593\uFF08\u79D2\uFF09" }
          }
        },
        bg: { type: "string", description: "transparent\u3001#hex \u6216 #hex,#hex \u6F38\u5C64\uFF1B\u9810\u8A2D #151515" },
        title: { type: "string" }
      }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const module = String(a.module);
      if (!PHOTO_MODULES.includes(module)) return { ok: false, error: `module \u5FC5\u9808\u662F ${PHOTO_MODULES.join("\uFF5C")}` };
      const sc = normalizePhotoScene({
        module,
        ratio: a.ratio,
        loop: a.duration,
        images: Array.isArray(a.images) ? a.images.map(String) : [],
        params: a.params ?? {},
        caption: a.caption,
        bg: a.bg
      });
      const scene = { effect: photoFxId(module), words: [JSON.stringify(sc)], seconds: sc.loop + 1 };
      const { combo } = normalizeCombo({ title: String(a.title ?? `${MODULE_INFO[module].zh}\u9810\u89BD`), ratio: sc.ratio, transition: "cut", scenes: [scene] });
      return {
        combo_scene: scene,
        scene: sc,
        params_doc: PARAMS[module].map((f) => ({ key: f.k, label: f.label, ...f.type === "range" ? { min: f.min, max: f.max } : f.type === "seg" ? { options: f.opts.map(([v, l]) => `${v}\uFF1D${l}`) } : { type: f.type }, value: sc.params[f.k] })),
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: "photo", data: sc }),
        local_render: `\u672C\u6A5F\u9010\u683C\u6E32\u67D3\uFF08\u756B\u9762\u8207\u7DB2\u7AD9\u4E00\u81F4\uFF09\uFF1A\u5728 HTML \u8F09\u5165 ${ctx.origin}/r/photo.js\uFF0C\u7528 <img> \u8F09\u5165\u672C\u6A5F\u7167\u7247\uFF0C\u5EFA\u7ACB ${sc.ratio === "16:9" ? "1920\xD71080" : sc.ratio === "1:1" ? "1080\xD71080" : "1080\xD71920"} \u7684 canvas\uFF0C\u5C0D\u6BCF\u4E00\u683C\u547C\u53EB MA_PHOTO.drawPhoto(ctx, W, H, scene, i / fps, [img1, img2])\uFF0C\u518D\u7528 Playwright \u622A\u5716\u6216 canvas.toBlob \u5B58\u6210 PNG \u5E8F\u5217\u3001ffmpeg \u5408\u6210\u3002scene \u7528\u9019\u88E1\u56DE\u50B3\u7684 scene\uFF08\u6216 get_preset \u7684 data\uFF09\uFF0Cimages \u6B04\u4F4D\u53EF\u5FFD\u7565\u3002`,
        next: `\u628A combo_scene \u653E\u9032 compose_combo / save_combo\uFF08ratio \u8A2D ${sc.ratio}\uFF09\u3002\u8981\u8B93\u4F7F\u7528\u8005\u624B\u52D5\u8ABF\u6574\uFF0C\u7D66 edit_url\uFF1B\u4F7F\u7528\u8005\u5B58\u6210\u9810\u8A2D\u5F8C\uFF0C\u4E4B\u5F8C\u5728 scenes \u5BEB { "preset": \u4EE3\u78BC, "images": [...] } \u5373\u53EF\u63DB\u5716\u6CBF\u7528\u540C\u4E00\u5957\u904B\u93E1\u3002`
      };
    }, "run")
  },
  {
    name: "list_presets",
    title: "\u5217\u51FA\u9810\u8A2D",
    description: "\u5217\u51FA\u4F7F\u7528\u8005\u5728\u7DB2\u7AD9\u5DE5\u4F5C\u5BA4\u8ABF\u597D\u4E26\u5B58\u8D77\u4F86\u7684\u9810\u8A2D\uFF08\u5730\u5716\u5834\u666F\u3001\u92B3\u5229\u6C34\u6EF4\u3001\u5716\u7247\u904B\u93E1\uFF09\u3002\u4F7F\u7528\u8005\u8AAA\u300C\u7528 p7k2x\u300D\u6216\u300C\u7528\u5916\u89C0\u6162\u63A8\u90A3\u500B\u300D\u6642\uFF0C\u7528\u9019\u500B\u67E5\u4EE3\u78BC\u3002",
    inputSchema: { type: "object", properties: { kind: { type: "string", enum: ["map", "drop", "photo"] }, query: { type: "string", description: "\u540D\u7A31\u95DC\u9375\u5B57\u6216\u4EE3\u78BC" }, limit: { type: "number" } } },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const list = await listPresets(ctx.env, String(a.kind ?? ""), String(a.query ?? ""), Number(a.limit) || 50);
      return { count: list.length, presets: list.map((p) => ({ id: p.id, kind: p.kind, kind_name: KIND_NAME[p.kind], name: p.name, note: p.note ?? null, updated_at: p.updated_at, edit_url: `${ctx.origin}/?edit=${p.id}` })) };
    }, "run")
  },
  {
    name: "get_preset",
    title: "\u53D6\u5F97\u9810\u8A2D",
    description: '\u53D6\u5F97\u4E00\u500B\u9810\u8A2D\u7684\u5B8C\u6574\u8A2D\u5B9A\u8207\u53EF\u76F4\u63A5\u653E\u9032 Combo \u7684 combo_scene\u3002\u4E5F\u53EF\u4EE5\u5728 compose_combo / save_combo \u7684 scenes \u76F4\u63A5\u5BEB { "preset": "\u4EE3\u78BC" }\u3002',
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const p = await getPreset(ctx.env, String(a.id));
      if (!p) throw new Error(`\u627E\u4E0D\u5230\u9810\u8A2D ${String(a.id)}`);
      return { id: p.id, kind: p.kind, name: p.name, note: p.note ?? null, data: p.data, combo_scene: presetToScene(p), edit_url: `${ctx.origin}/?edit=${p.id}`, updated_at: p.updated_at };
    }, "run")
  },
  {
    name: "save_preset",
    title: "\u5132\u5B58\u9810\u8A2D",
    description: "\u628A\u4E00\u4EFD\u5730\u5716\u5834\u666F\u3001\u6C34\u6EF4\u6216\u5716\u7247\u904B\u93E1\u8A2D\u5B9A\u5B58\u6210\u9810\u8A2D\uFF0C\u56DE\u50B3\u4EE3\u78BC\u8207\u7DE8\u8F2F\u9023\u7D50\uFF0C\u8B93\u4F7F\u7528\u8005\u80FD\u5728\u7DB2\u7AD9\u4E0A\u624B\u52D5\u5FAE\u8ABF\u5F8C\u5B58\u56DE\u540C\u4E00\u500B\u4EE3\u78BC\u3002\u53EF\u76F4\u63A5\u7D66 build_map_scene / build_drop_scene / build_photo_scene \u56DE\u50B3\u7684 combo_scene\u3002\u5E36 id \u4EE3\u8868\u66F4\u65B0\u3002\u9700\u8981\u5BEB\u5165\u91D1\u9470\u3002",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "string", description: "\u8981\u66F4\u65B0\u7684\u9810\u8A2D\u4EE3\u78BC\uFF1B\u7701\u7565\u5247\u65B0\u589E" },
        name: { type: "string", description: "\u597D\u8A18\u7684\u540D\u7A31\uFF0C\u4F8B\u5982\u300C\u5916\u89C0\u6162\u63A8_\u5DE6\u5230\u53F3\u300D" },
        note: { type: "string" },
        combo_scene: { type: "object", description: "build_map_scene / build_drop_scene / build_photo_scene \u56DE\u50B3\u7684 combo_scene\uFF08\u64C7\u4E00\uFF09" },
        kind: { type: "string", enum: ["map", "drop", "photo"] },
        data: { type: "object", description: "map\uFF1A\u5834\u666F\u7269\u4EF6\uFF1Bdrop\uFF1A{ words: [...] }\uFF1Bphoto\uFF1Abuild_photo_scene \u56DE\u50B3\u7684 scene\uFF08\u64C7\u4E00\uFF09" }
      }
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
    write: true,
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      let kind = a.kind;
      let data = a.data;
      const cs = a.combo_scene;
      if (cs?.effect) {
        const pd = sceneToPresetData(cs.effect, cs.words ?? []);
        if (!pd) return { ok: false, error: `combo_scene \u7684 effect\u300C${cs.effect}\u300D\u4E0D\u652F\u63F4\u5B58\u6210\u9810\u8A2D\uFF08\u76EE\u524D\u652F\u63F4 map-overlay\u3001crisp-drop\u3001photo-*\uFF09` };
        kind = pd.kind;
        data = pd.data;
      }
      const bad = checkPresetData(kind, data);
      if (bad) return { ok: false, error: bad };
      const saved = await savePreset(ctx.env, { kind, name: String(a.name).slice(0, 60), note: a.note ? String(a.note).slice(0, 500) : void 0, data, source: "mcp" }, typeof a.id === "string" && a.id ? a.id : void 0);
      return { ok: true, id: saved.id, kind: saved.kind, name: saved.name, edit_url: `${ctx.origin}/?edit=${saved.id}`, next: '\u628A edit_url \u7D66\u4F7F\u7528\u8005\u5FAE\u8ABF\uFF1B\u4F7F\u7528\u8005\u5B58\u56DE\u5F8C\u4EE3\u78BC\u4E0D\u8B8A\uFF0C\u4E4B\u5F8C\u7528 get_preset \u6216\u5728 scenes \u5BEB { "preset": \u4EE3\u78BC } \u53D6\u7528\u6700\u65B0\u7248\u672C\u3002' };
    }, "run")
  },
  {
    name: "compose_combo",
    title: "\u7D44\u5408 Combo\uFF08\u9810\u89BD\uFF0C\u4E0D\u5132\u5B58\uFF09",
    description: "\u628A\u591A\u500B\u7279\u6548\u4F9D\u5E8F\u7D44\u6210\u4E00\u6BB5 Combo \u52D5\u756B\u4E26\u9A57\u8B49\u3002\u56DE\u50B3\u5206\u93E1\u6458\u8981\u3001\u7E3D\u79D2\u6578\u3001\u53EF\u76F4\u63A5\u5728\u700F\u89BD\u5668\u64AD\u653E\u7684\u9810\u89BD\u9023\u7D50\u3002\u78BA\u8A8D\u4F7F\u7528\u8005\u6EFF\u610F\u5F8C\uFF0C\u518D\u7528 save_combo \u5B58\u9032 Combo \u5EAB\u3002\u5EFA\u8B70\u6D41\u7A0B\uFF1A\u7406\u89E3\u9700\u6C42 \u2192 search_effects \u6311\u9078 \u2192 compose_combo \u9810\u89BD \u2192 \u4F9D\u56DE\u994B\u8ABF\u6574 \u2192 save_combo\u3002",
    inputSchema: {
      type: "object",
      required: ["title", "scenes"],
      properties: { ...comboInput, include_html: { type: "boolean", description: "\u662F\u5426\u4E00\u4F75\u56DE\u50B3\u5B8C\u6574 HTML\uFF0C\u9810\u8A2D false" }, include_prompt: { type: "boolean", description: "\u662F\u5426\u56DE\u50B3\u53EF\u8CBC\u7D66 AI \u91CD\u505A\u7684\u63D0\u793A\u8A5E\uFF0C\u9810\u8A2D true" } }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const pe = await resolvePresets(a, ctx.env);
      if (pe.length) return { ok: false, errors: pe };
      const { combo, errors } = normalizeCombo(a);
      if (errors.length) return { ok: false, errors };
      return {
        ok: true,
        saved: false,
        ...comboView(combo, ctx.origin, a.include_html === true),
        ...a.include_prompt === false ? {} : { prompt: comboPrompt(combo) },
        next: "\u8ACB\u628A play_url \u7D66\u4F7F\u7528\u8005\u9810\u89BD\uFF1B\u6EFF\u610F\u5F8C\u547C\u53EB save_combo \u5132\u5B58\u3002"
      };
    }, "run")
  },
  {
    name: "save_combo",
    title: "\u5132\u5B58 Combo",
    description: "\u628A Combo \u5B58\u9032 Combo \u5EAB\uFF08Cloudflare D1\uFF09\uFF0C\u4E4B\u5F8C\u53EF\u5728\u7DB2\u7AD9\u7684 Combo \u5EAB\u700F\u89BD\u3001\u64AD\u653E\u8207\u8907\u88FD\u3002\u5E36 id \u4EE3\u8868\u66F4\u65B0\u65E2\u6709\u7684 Combo\u3002\u9700\u8981\u5BEB\u5165\u91D1\u9470\u3002",
    inputSchema: { type: "object", required: ["title", "scenes"], properties: { id: { type: "string", description: "\u8981\u66F4\u65B0\u7684 Combo id\uFF1B\u7701\u7565\u5247\u65B0\u589E" }, ...comboInput } },
    annotations: { readOnlyHint: false, destructiveHint: false },
    write: true,
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const pe = await resolvePresets(a, ctx.env);
      if (pe.length) return { ok: false, errors: pe };
      const { combo, errors } = normalizeCombo({ ...a, source: a.source ?? "mcp" });
      if (errors.length) return { ok: false, errors };
      const saved = await saveCombo(ctx.env, combo, typeof a.id === "string" && a.id ? a.id : void 0);
      return { ok: true, saved: true, ...comboView(saved, ctx.origin), library_url: `${ctx.origin}/?view=combos` };
    }, "run")
  },
  {
    name: "list_combos",
    title: "\u5217\u51FA Combo \u5EAB",
    description: "\u641C\u5C0B\u5DF2\u5132\u5B58\u7684 Combo\uFF0C\u7576\u4F5C\u65B0\u9700\u6C42\u7684\u53C3\u8003\u3002\u53EF\u4F9D\u95DC\u9375\u5B57\u6216\u6A19\u7C64\u7BE9\u9078\u3002",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, tag: { type: "string" }, limit: { type: "number", description: "\u9810\u8A2D 30" } }
    },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const list = await listCombos(ctx.env, String(a.query ?? ""), String(a.tag ?? "").replace(/^#/, ""), Number(a.limit) || 30);
      return {
        count: list.length,
        combos: list.map((c) => ({ id: c.id, title: c.title, brief: c.brief ?? null, tags: c.tags ?? [], scenes: c.scenes.length, total_seconds: totalSeconds(c), play_url: linkFor(ctx.origin, c), updated_at: c.updated_at }))
      };
    }, "run")
  },
  {
    name: "get_combo",
    title: "\u53D6\u5F97 Combo",
    description: "\u53D6\u5F97\u4E00\u500B\u5DF2\u5132\u5B58 Combo \u7684\u5B8C\u6574\u5206\u93E1\u3001\u63D0\u793A\u8A5E\uFF0C\u4EE5\u53CA\uFF08\u9078\u64C7\u6027\uFF09\u53EF\u7368\u7ACB\u64AD\u653E\u7684 HTML\u3002",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" }, include_html: { type: "boolean" } } },
    annotations: { readOnlyHint: true },
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const c = await getCombo(ctx.env, String(a.id));
      if (!c) throw new Error(`\u627E\u4E0D\u5230 Combo ${String(a.id)}`);
      return { ...comboView(c, ctx.origin, a.include_html === true), prompt: comboPrompt(c) };
    }, "run")
  },
  {
    name: "delete_combo",
    title: "\u522A\u9664 Combo",
    description: "\u5F9E Combo \u5EAB\u6C38\u4E45\u522A\u9664\u4E00\u500B Combo\u3002\u522A\u9664\u524D\u8ACB\u5148\u5411\u4F7F\u7528\u8005\u78BA\u8A8D\u3002\u9700\u8981\u5BEB\u5165\u91D1\u9470\u3002",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    annotations: { readOnlyHint: false, destructiveHint: true },
    write: true,
    run: /* @__PURE__ */ __name(async (a, ctx) => {
      const ok2 = await deleteCombo(ctx.env, String(a.id));
      return ok2 ? { ok: true, deleted: a.id } : { ok: false, error: `\u627E\u4E0D\u5230 Combo ${String(a.id)}` };
    }, "run")
  }
];
var INSTRUCTIONS = `Motion Atlas\uFF08motion.leichthub.com\uFF09\u662F ${EFFECTS.length} \u7A2E\u6587\u5B57\u52D5\u614B\u7279\u6548\u7684\u5716\u9451\uFF0C\u6240\u6709\u7279\u6548\u90FD\u662F\u539F\u751F HTML/CSS/JS\u3002
\u4F60\u53EF\u4EE5\uFF1A\u67E5\u7279\u6548\uFF08search_effects / get_effect\uFF09\u3001\u628A\u591A\u500B\u7279\u6548\u7D44\u6210 Combo \u52D5\u756B\uFF08compose_combo\uFF09\uFF0C\u4E26\u5B58\u9032 Combo \u5EAB\uFF08save_combo\uFF09\u7576\u4F5C\u65E5\u5F8C\u53C3\u8003\uFF08list_combos / get_combo\uFF09\u3002

\u7D44 Combo \u7684\u5EFA\u8B70\u6D41\u7A0B\uFF1A
1. \u5148\u91D0\u6E05\u7528\u9014\u3001\u6BD4\u4F8B\uFF08YouTube 16:9\u3001Shorts 9:16\uFF09\u3001\u7E3D\u9577\u5EA6\u8207\u8981\u51FA\u73FE\u7684\u6587\u5B57\u3002
2. \u7528 search_effects \u4F9D\u6BCF\u6BB5\u7684\u76EE\u7684\u6311\u7279\u6548\uFF0C\u7559\u610F word_hint \u7684\u6587\u5B57\u683C\u5F0F\u3002
3. \u7528 compose_combo \u9810\u89BD\uFF0C\u628A play_url \u7D66\u4F7F\u7528\u8005\u770B\u3002
4. \u4F9D\u56DE\u994B\u8ABF\u6574\u5F8C\uFF0C\u7528 save_combo \u5132\u5B58\uFF0C\u4E26\u9644\u4E0A tags \u8207 brief \u65B9\u4FBF\u65E5\u5F8C\u641C\u5C0B\u3002
\u5730\u5716\u7247\u6BB5\u8ACB\u7528 build_map_scene\u3001\u6C34\u6EF4\u8ACB\u7528 build_drop_scene\u3001\u7167\u7247\u904B\u93E1\uFF08\u63A8\u62C9\u3001\u7529\u5165\u30013D \u5361\u7247\u3001\u524D\u5F8C\u5C0D\u6BD4\u3001\u653E\u5927\u93E1\uFF09\u8ACB\u7528 build_photo_scene \u7522\u751F\u6BB5\u843D\uFF0C\u518D\u628A\u56DE\u50B3\u7684 combo_scene \u653E\u9032 compose_combo / save_combo\u3002
\u5716\u7247\u5728\u4F7F\u7528\u8005\u96FB\u8166\u4E0A\u6642\uFF0C\u7528 build_photo_scene \u56DE\u50B3\u7684 local_render \u65B9\u6CD5\u5728\u672C\u6A5F\u9010\u683C\u6E32\u67D3\uFF08\u5F15\u64CE /r/photo.js\uFF0C\u5730\u5716 /r/map.js\u3001\u6C34\u6EF4 /r/drop.js \u540C\u7406\uFF09\uFF0C\u4E0D\u8981\u81EA\u5DF1\u91CD\u5BEB\u52D5\u756B\u3002
\u92B3\u5229\u6C34\u6EF4\uFF08crisp-drop\uFF09\u4E5F\u53EF\u76F4\u63A5\u5728 words \u52A0\u5165\u8A2D\u5B9A\u884C\uFF0C\u4F8B\u5982 "@shape=circle;color=#a6d4f2;color2=#5b9bd5;pos=beside;sats=6"\uFF1Ashape\uFF1Dcircle\uFF5Ccloud\uFF5Cflower\uFF5Cpebble\uFF5Crandom\uFF0Cpos\uFF1Dinside\uFF5Cbeside\uFF5Cabove\uFF5Cbelow\uFF0Cseed \u6539\u8B8A\u96A8\u6A5F\u5F62\u72C0\uFF0Cx/y\u3001tx/ty \u70BA 0\u20131 \u7684\u6C34\u6EF4\u8207\u6587\u5B57\u4F4D\u7F6E\uFF1B~ \u958B\u982D\u7684\u884C\u662F\u82F1\u6587\u5C0F\u5B57\u3002\u6B64\u7279\u6548\u5B8C\u5168\u4E0D\u7528\u6A21\u7CCA\uFF0C\u9069\u5408\u758A\u9032\u5F71\u7247\u3002
\u624B\u52D5\u5FAE\u8ABF\u7684\u4F86\u56DE\u6D41\u7A0B\uFF1Abuild_* \u6216 get_combo \u6703\u56DE\u50B3 edit_url\uFF0C\u4F7F\u7528\u8005\u5728\u7DB2\u7AD9\u5DE5\u4F5C\u5BA4\u8ABF\u6574\u5F8C\u300C\u5B58\u56DE\u300D\u5F97\u5230\u9810\u8A2D\u4EE3\u78BC\uFF08\u4F8B\u5982 p7k2x\uFF09\uFF1B\u4E4B\u5F8C\u7528 get_preset \u8B80\u53D6\uFF0C\u6216\u5728 scenes \u76F4\u63A5\u5BEB { "preset": "p7k2x" }\u3002\u4F7F\u7528\u8005\u63D0\u5230\u4EE3\u78BC\u6642\uFF0C\u4E00\u5F8B\u4EE5\u9810\u8A2D\u5167\u5BB9\u70BA\u6E96\uFF0C\u4E0D\u8981\u81EA\u884C\u91CD\u505A\u3002
\u5BEB\u5165\u5DE5\u5177\u9700\u8981\u91D1\u9470\uFF1B\u6587\u5B57\u5167\u5BB9\u82E5\u6D89\u53CA\u50F9\u683C\u6216\u6578\u64DA\uFF0C\u8ACB\u4F7F\u7528\u4F7F\u7528\u8005\u63D0\u4F9B\u3001\u53EF\u67E5\u8B49\u7684\u8CC7\u6599\uFF0C\u4E0D\u8981\u81EA\u884C\u7DE8\u9020\u3002`;
var isWriteTool = /* @__PURE__ */ __name((name) => TOOLS.find((t) => t.name === name)?.write === true, "isWriteTool");

// mcp.ts
var VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
var ok = /* @__PURE__ */ __name((id, result) => ({ jsonrpc: "2.0", id: id ?? null, result }), "ok");
var fail = /* @__PURE__ */ __name((id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }), "fail");
var handle = /* @__PURE__ */ __name(async (m, ctx, origin) => {
  switch (m.method) {
    case "initialize": {
      const asked = String(m.params?.protocolVersion ?? "");
      return ok(m.id, {
        protocolVersion: VERSIONS.includes(asked) ? asked : VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "motion-atlas", title: "Motion Atlas \u5B57\u5361\u5716\u9451", version: "1.0.0" },
        instructions: INSTRUCTIONS
      });
    }
    case "ping":
      return ok(m.id, {});
    case "tools/list": {
      const writable = canWrite(ctx.request, ctx.env).ok;
      return ok(m.id, {
        tools: TOOLS.map((t) => ({
          name: t.name,
          title: t.title,
          description: t.write && !writable ? `${t.description}\uFF08\u76EE\u524D\u9023\u7DDA\u6C92\u6709\u91D1\u9470\uFF0C\u547C\u53EB\u6703\u88AB\u62D2\u7D55\uFF09` : t.description,
          inputSchema: t.inputSchema,
          ...t.annotations ? { annotations: { title: t.title, ...t.annotations } } : {}
        }))
      });
    }
    case "tools/call": {
      const name = String(m.params?.name ?? "");
      const tool = TOOLS.find((t) => t.name === name);
      if (!tool) return fail(m.id, -32602, `\u672A\u77E5\u7684\u5DE5\u5177\uFF1A${name}`);
      if (isWriteTool(name)) {
        const w = canWrite(ctx.request, ctx.env);
        if (!w.ok) return ok(m.id, { isError: true, content: [{ type: "text", text: w.reason }] });
      }
      try {
        const out = await tool.run(m.params?.arguments ?? {}, { env: ctx.env, request: ctx.request, origin });
        return ok(m.id, { content: [{ type: "text", text: JSON.stringify(out, null, 2) }], structuredContent: out });
      } catch (e) {
        const msg = e instanceof StoreError || e instanceof Error ? e.message : String(e);
        return ok(m.id, { isError: true, content: [{ type: "text", text: msg }] });
      }
    }
    case "resources/list":
      return ok(m.id, { resources: [] });
    case "prompts/list":
      return ok(m.id, { prompts: [] });
    default:
      return m.method.startsWith("notifications/") ? null : fail(m.id, -32601, `\u4E0D\u652F\u63F4\u7684\u65B9\u6CD5\uFF1A${m.method}`);
  }
}, "handle");
var onRequestPost3 = /* @__PURE__ */ __name(async (ctx) => {
  const origin = new URL(ctx.request.url).origin;
  let body;
  try {
    body = await ctx.request.json();
  } catch {
    return json(fail(null, -32700, "JSON \u89E3\u6790\u5931\u6557"), 400);
  }
  const batch = Array.isArray(body);
  const msgs = batch ? body : [body];
  const out = (await Promise.all(msgs.map((m) => handle(m, ctx, origin)))).filter((r) => r !== null);
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return json(batch ? out : out[0]);
}, "onRequestPost");
var onRequestGet8 = /* @__PURE__ */ __name(async (ctx) => {
  const accept = ctx.request.headers.get("accept") ?? "";
  if (accept.includes("text/event-stream")) return new Response("Method Not Allowed", { status: 405, headers: { ...CORS, allow: "POST" } });
  return json({
    name: "Motion Atlas MCP",
    transport: "streamable-http",
    endpoint: new URL(ctx.request.url).origin + "/mcp",
    tools: TOOLS.map((t) => t.name),
    write_access: canWrite(ctx.request, ctx.env).ok,
    docs: new URL(ctx.request.url).origin + "/?view=mcp"
  });
}, "onRequestGet");
var onRequestDelete3 = /* @__PURE__ */ __name(async () => new Response(null, { status: 405, headers: CORS }), "onRequestDelete");
var onRequestOptions6 = preflight;

// ../.wrangler/tmp/pages-auPN5O/functionsRoutes-0.9704059155733906.mjs
var routes = [
  {
    routePath: "/api/combos/:id",
    mountPath: "/api/combos",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/combos/:id",
    mountPath: "/api/combos",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/combos/:id",
    mountPath: "/api/combos",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/combos/:id",
    mountPath: "/api/combos",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/presets/:id",
    mountPath: "/api/presets",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/presets/:id",
    mountPath: "/api/presets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/presets/:id",
    mountPath: "/api/presets",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/presets/:id",
    mountPath: "/api/presets",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  },
  {
    routePath: "/api/combos",
    mountPath: "/api/combos",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/combos",
    mountPath: "/api/combos",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/combos",
    mountPath: "/api/combos",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/effects",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/effects",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/presets",
    mountPath: "/api/presets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/presets",
    mountPath: "/api/presets",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions5]
  },
  {
    routePath: "/api/presets",
    mountPath: "/api/presets",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/c/:id",
    mountPath: "/c",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/r/:name",
    mountPath: "/r",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/mcp",
    mountPath: "/",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete3]
  },
  {
    routePath: "/mcp",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/mcp",
    mountPath: "/",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions6]
  },
  {
    routePath: "/mcp",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  }
];

// ../../../../tmp/claude-0/-home-user/97774b7b-2bbc-589f-b7c9-3c0b143f15e5/scratchpad/pw/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str2) {
  var tokens = [];
  var i = 0;
  while (i < str2.length) {
    var char = str2[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str2[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str2[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str2[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str2[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str2.length) {
        var code = str2.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str2[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str2[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str2.length) {
        if (str2[j] === "\\") {
          pattern += str2[j++] + str2[j++];
          continue;
        }
        if (str2[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str2[j] === "(") {
          count++;
          if (str2[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str2[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str2[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str2, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str2);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str2, options) {
  var keys = [];
  var re = pathToRegexp(str2, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str2) {
  return str2.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../tmp/claude-0/-home-user/97774b7b-2bbc-589f-b7c9-3c0b143f15e5/scratchpad/pw/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../tmp/claude-0/-home-user/97774b7b-2bbc-589f-b7c9-3c0b143f15e5/scratchpad/pw/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../tmp/claude-0/-home-user/97774b7b-2bbc-589f-b7c9-3c0b143f15e5/scratchpad/pw/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-T8u3vf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../tmp/claude-0/-home-user/97774b7b-2bbc-589f-b7c9-3c0b143f15e5/scratchpad/pw/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-T8u3vf/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.4629301611886594.mjs.map
