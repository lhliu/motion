// Combo 草稿的輔助工具：SRT 字幕轉段落、配樂抓拍點。只在瀏覽器使用。
import type { ComboScene } from './combo';

export interface Cue {
  start: number;
  end: number;
  text: string;
}

const ts = (s: string) => {
  const m = /(\d+):(\d{1,2}):(\d{1,2})[,.](\d{1,3})/.exec(s);
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4].padEnd(3, '0') / 1000 : NaN;
};

/** 解析 SRT：回傳每一句的起訖秒數與文字（多行合成一行） */
export const parseSrt = (src: string): Cue[] =>
  src
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const i = lines.findIndex((l) => l.includes('-->'));
      if (i < 0) return [];
      const [a, b] = lines[i].split('-->');
      const start = ts(a), end = ts(b);
      const text = lines.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').trim();
      return Number.isFinite(start) && Number.isFinite(end) && end > start && text ? [{ start, end, text }] : [];
    })
    .sort((x, y) => x.start - y.start);

/** 字幕句子切成字幕特效要的詞組：依空白與標點切，每組最多 8 個字 */
const chunks = (text: string) => {
  const parts = text.split(/[\s，。、！？!?,.；;：:]+/).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) for (let k = 0; k < [...p].length; k += 8) out.push([...p].slice(k, k + 8).join(''));
  return out.slice(0, 12);
};

/** 字幕轉段落：每句一段，秒數含到下一句開始前的空檔；名牌條用整句當第一行 */
export const srtScenes = (cues: Cue[], effect: string, max: number): ComboScene[] =>
  cues.slice(0, max).map((c, i) => {
    const next = cues[i + 1]?.start ?? c.end;
    const sec = Math.min(20, Math.max(0.8, Math.round((Math.max(c.end, Math.min(next, c.end + 1.5)) - c.start) * 10) / 10));
    const words = effect === 'lower-third' || effect === 'typewriter' ? [c.text.slice(0, 60)] : chunks(c.text);
    return { effect, words: words.length ? words : [c.text.slice(0, 60)], seconds: sec, note: `字幕 ${fmt(c.start)}–${fmt(c.end)}` };
  });

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export interface Beat {
  bpm: number;
  /** 一拍幾秒 */
  beat: number;
  /** 第一個強拍在音樂的第幾秒 */
  offset: number;
}

/** 抓拍點：能量包絡的上升量做自相關找出拍長，再找相位。只分析前 60 秒 */
export const detectBeat = async (file: File): Promise<Beat> => {
  const ctx = new AudioContext();
  try {
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const sr = buf.sampleRate;
    const n = Math.min(buf.length, sr * 60);
    const mono = new Float32Array(n);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let k = 0; k < n; k++) mono[k] += d[k] / buf.numberOfChannels;
    }
    const hop = 512, win = 1024;
    const frames = Math.floor((n - win) / hop);
    const env = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      let e = 0;
      for (let k = f * hop, end = k + win; k < end; k++) e += mono[k] * mono[k];
      env[f] = Math.log1p(e);
    }
    const on = new Float32Array(frames);
    for (let f = 1; f < frames; f++) on[f] = Math.max(0, env[f] - env[f - 1]);
    const fps = sr / hop;
    const lagMin = Math.floor((60 / 180) * fps), lagMax = Math.ceil((60 / 70) * fps);
    const ac = (lag: number) => {
      let v = 0;
      for (let f = lag; f < frames; f++) v += on[f] * on[f - lag];
      return v / (frames - lag);
    };
    let best = lagMin, bestV = -1;
    for (let lag = lagMin; lag <= lagMax; lag++) {
      const v = ac(lag);
      if (v > bestV) [bestV, best] = [v, lag];
    }
    // 拋物線內插，讓拍長不受整數格限制
    const l = ac(best - 1), r = ac(best + 1), den = l - 2 * bestV + r;
    let bpm = (60 * fps) / (best + (den < 0 ? (0.5 * (l - r)) / den : 0));
    while (bpm < 80) bpm *= 2;
    while (bpm > 160) bpm /= 2;
    const lag = (60 * fps) / bpm;
    let phase = 0, phaseV = -1;
    for (let p = 0; p < lag; p += 0.25) {
      let v = 0;
      for (let f = p; f < frames; f += lag) v += on[Math.round(f)] ?? 0;
      if (v > phaseV) [phaseV, phase] = [v, p];
    }
    return { bpm: Math.round(bpm * 10) / 10, beat: 60 / bpm, offset: Math.round(((phase + win / hop / 2) / fps) * 100) / 100 };
  } finally {
    void ctx.close();
  }
};

/** 每段秒數改成最接近的整數拍（至少 2 拍、0.8 秒以上） */
export const fitToBeat = (seconds: number[], beat: number) =>
  seconds.map((s) => {
    let k = Math.max(2, Math.round(s / beat));
    while (k * beat < 0.8) k++;
    return Math.min(20, Math.round(k * beat * 100) / 100);
  });
