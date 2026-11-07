import { test } from 'node:test';
import assert from 'node:assert/strict';
import { photoSceneFromWords } from '../src/photokit';
import {
  buildStillPreviewHtml,
  codecMessage,
  fontExportGate,
  framePlan,
  htmlExportDecision,
  matteMediaTime,
  mimeOf,
  mp4ExtensionProvesCodec,
  renderTextMatteStillHtml,
  stillNotice,
  titleLines,
} from '../src/textmatte';
import { pngSequenceAsync } from '../src/export-kit';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test('9:16 把這間3房拆成兩行，16:9 維持一行', () => {
  assert.deepEqual(titleLines('這間3房', '9:16'), ['這間', '3房']);
  assert.deepEqual(titleLines('這間3房', '16:9'), ['這間3房']);
  assert.deepEqual(titleLines('這間3房', '1:1'), ['這間3房']);
});

test('畫格時間含起始秒，超過片長就循環', () => {
  assert.equal(matteMediaTime(1.5, 0, 10), 1.5);
  assert.equal(matteMediaTime(0, 2, 10), 2);
  assert.equal(framePlan(1, 2, 0.5, 10)[1].mediaT, 1);
  const wrapped = framePlan(1, 2, 3.9, 4);
  assert.equal(wrapped[0].mediaT, 3.9);
  assert.ok(wrapped[1].mediaT < 4);
});

test('mp4 副檔名不是編碼保證', () => {
  const hit = mimeOf('clip.mp4', '');
  assert.equal(hit.kind, 'video');
  assert.equal(hit.mime, 'video/mp4');
  assert.equal(hit.extensionIsProof, false);
  assert.equal(mp4ExtensionProvesCodec, false);
  assert.match(codecMessage('video/mp4', 'clip.mp4'), /副檔名不能保證編碼/);
});

test('影片解不開就停止，不會改成示意或照片', () => {
  const blocked = htmlExportDecision({ hasVideo: true, videoReady: false, videoError: true, hasPhoto: true });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.kind, null);
  const still = htmlExportDecision({ hasVideo: false, videoReady: false, videoError: false, hasPhoto: true });
  assert.equal(still.kind, 'photo');
  const bare = htmlExportDecision({ hasVideo: false, videoReady: false, videoError: false, hasPhoto: false });
  assert.equal(bare.kind, 'placeholder');
  const video = htmlExportDecision({ hasVideo: true, videoReady: true, videoError: false, hasPhoto: false });
  assert.equal(video.kind, 'video-frame');
});

test('HTML 是靜態預覽，寫明沒有影片，不含播放器', () => {
  for (const kind of ['video-frame', 'photo', 'placeholder'] as const) {
    const html = buildStillPreviewHtml({ kind, pngDataUrl: PNG, width: 320, height: 180 });
    assert.match(html, new RegExp(stillNotice(kind).slice(0, 8)));
    assert.equal(html.includes('<video'), false);
    assert.equal(html.includes('<script'), false);
    assert.equal(html.includes('octet-stream'), false);
    assert.equal(html.includes('blob:'), false);
    assert.equal(html.includes('data:video'), false);
    assert.equal(/https?:\/\//.test(html), false);
    assert.match(html, /data-video="absent"/);
    assert.match(html, /data-export="still"/);
  }
  assert.throws(() => buildStillPreviewHtml({ kind: 'video-frame', pngDataUrl: 'data:video/mp4;base64,AAAA', width: 10, height: 10 }));
});

test('圖鑑原始碼也是靜態說明，不是內嵌影片', () => {
  const html = renderTextMatteStillHtml(['這間3房', '新店 · 客廳實拍', '@bg=none'], '16:9');
  assert.match(html, /不是實拍影片/);
  assert.equal(html.includes('<video'), false);
  assert.equal(html.includes('octet-stream'), false);
});

test('字型還沒好就不要匯出', () => {
  assert.equal(fontExportGate(false), 'wait');
  assert.equal(fontExportGate(true), 'go');
});

test('@ 參數與透明字外', () => {
  const sc = photoSceneFromWords(['客廳', '@fit=contain;bg=none;zoom=1.2;in=1.5'], 'textmatte');
  assert.equal(sc.params.text, '客廳');
  assert.equal(sc.params.fit, 'contain');
  assert.equal(sc.bg, 'transparent');
  assert.equal(sc.params.bg, 'none');
  assert.equal(sc.params.zoom, 1.2);
  assert.equal(sc.params.in, 1.5);
  assert.equal(sc.module, 'textmatte');
});

test('PNG 序列會等上一格的畫面準備好', async () => {
  const prev = (globalThis as { document?: unknown }).document;
  (globalThis as { document?: unknown }).document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({}),
      toBlob: (cb: (b: Blob) => void) => cb(new Blob([Uint8Array.of(1, 2, 3)])),
    }),
  };
  try {
    const order: string[] = [];
    await pngSequenceAsync(4, 4, 2 / 30, async (_ctx, _t, i) => {
      order.push(`s${i}`);
      await new Promise((r) => setTimeout(r, 8));
      order.push(`e${i}`);
    }, () => {}, 30);
    assert.deepEqual(order, ['s0', 'e0', 's1', 'e1']);
  } finally {
    if (prev === undefined) delete (globalThis as { document?: unknown }).document;
    else (globalThis as { document?: unknown }).document = prev;
  }
});
