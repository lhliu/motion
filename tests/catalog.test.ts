// 後台覆寫套用測試：npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
(globalThis as any).window = globalThis;
(globalThis as any).document = { createElement: () => ({ getContext: () => null, style: {} }), head: { insertAdjacentHTML() {} } };
const { ALL_EFFECTS, EFFECTS, CATALOG, NUM } = await import('../src/data');
const { PICKS } = await import('../src/uses');
const { findEffect } = await import('../src/combo');

const snapshot = () => JSON.stringify({ a: ALL_EFFECTS.map((f) => [f.id, f.cat, !!f.hidden, f.tags, f.redirectTo ?? null]), e: EFFECTS.map((f) => f.id), p: [...PICKS] });
const BASE = snapshot();
const pub = EFFECTS.find((f) => f.cat === 'xvlog')!;
const NUMS = JSON.stringify([...NUM]);

test('沒有覆寫或載入失敗＝程式預設', () => {
  CATALOG.apply(null);
  assert.equal(snapshot(), BASE);
  CATALOG.apply({ overrides: 'bad' as never });
  assert.equal(snapshot(), BASE);
});

test('PR #17 的 21 招仍存在、隱藏、編號不變；9 個情緒貼圖轉址到 585', () => {
  CATALOG.apply(null);
  const gone = [...Array.from({ length: 20 }, (_, i) => 586 + i), 609];
  for (const n of gone) {
    const f = ALL_EFFECTS.find((x) => NUM.get(x.id) === n)!;
    assert.ok(f, `#${n}`);
    assert.equal(f.hidden, true, `#${n} hidden`);
    assert.ok(!EFFECTS.includes(f));
  }
  const cry = findEffect('obj-xpack-em-cry')!;
  assert.equal(cry.redirectTo, 'obj-xpack-em-shock');
  assert.equal(CATALOG.resolve('obj-xpack-em-cry')!.fx.id, 'obj-xpack-em-shock');
  assert.equal(CATALOG.resolve('obj-xpack-em-cry')!.variant, 'em-cry');
  assert.equal(NUM.get('obj-xpack-em-shock'), 585);
  assert.equal(NUM.get('obj-xpack-vl-rec'), 606);
  assert.equal(NUM.get('obj-xpack-ic-no'), 677);
  assert.equal(EFFECTS.length, 605);
  assert.equal(ALL_EFFECTS.length, 661);
});

test('隱藏、顯示、改分類、標籤、精選', () => {
  const rep = CATALOG.apply({ overrides: [
    { id: pub.id, hidden: true },
    { id: 'obj-xpack-tw-boba', hidden: false },
    { id: 'obj-xpack-vl-rec', cat: 'party', tags: ['測試'] },
    { id: 'obj-xpack-ic-no', featured: true, featuredSort: 0 },
    { id: 'shorts-caption', featured: false },
    { id: 'no-such-id', hidden: true },
    { id: 'obj-xpack-ic-home', cat: 'nope' },
  ] });
  assert.ok(!EFFECTS.includes(pub));
  assert.ok(EFFECTS.some((f) => f.id === 'obj-xpack-tw-boba'));
  const rec = ALL_EFFECTS.find((f) => f.id === 'obj-xpack-vl-rec')!;
  assert.equal(rec.cat, 'party');
  assert.deepEqual(rec.tags, ['測試']);
  assert.equal(PICKS[0], 'obj-xpack-ic-no');
  assert.ok(!PICKS.includes('shorts-caption'));
  assert.deepEqual(rep.orphans, ['no-such-id']);
  assert.equal(rep.invalid.length, 1);
  assert.equal(ALL_EFFECTS.find((f) => f.id === 'obj-xpack-ic-home')!.cat, 'xicon');
  // 換到 party 後，跟其他 party 招式排在一起
  const idx = ALL_EFFECTS.findIndex((f) => f.id === 'obj-xpack-vl-rec');
  assert.ok(ALL_EFFECTS[idx - 1]?.cat === 'party' || ALL_EFFECTS[idx + 1]?.cat === 'party');
  assert.equal(JSON.stringify([...NUM]), NUMS, '編號永遠不變');
});

test('同子分類排序只改順序', () => {
  const ids = ALL_EFFECTS.filter((f) => f.cat === 'xicon').map((f) => f.id);
  const rev = [...ids].reverse();
  CATALOG.apply({ overrides: rev.map((id, i) => ({ id, sort: i })) });
  assert.deepEqual(ALL_EFFECTS.filter((f) => f.cat === 'xicon').map((f) => f.id), rev);
  assert.equal(JSON.stringify([...NUM]), NUMS);
});

test('合併轉址與防環', () => {
  const rep = CATALOG.apply({ overrides: [
    { id: 'obj-xpack-vl-todo', hidden: true, redirect: 'obj-xpack-vl-rec' },
    { id: 'obj-xpack-pt-coins', redirect: 'obj-xpack-pt-confetti' },
    { id: 'obj-xpack-pt-confetti', redirect: 'obj-xpack-pt-coins' },
    { id: 'obj-xpack-em-cry', redirect: '' },
  ] });
  assert.equal(CATALOG.resolve('obj-xpack-vl-todo')!.fx.id, 'obj-xpack-vl-rec');
  assert.ok(rep.invalid.some((s) => s.includes('成環')));
  assert.equal(CATALOG.resolve('obj-xpack-em-cry')!.fx.id, 'obj-xpack-em-cry');
});

test('重複套用可回到預設（冪等）', () => {
  CATALOG.apply({ overrides: [{ id: pub.id, hidden: true }] });
  CATALOG.apply({ overrides: [] });
  assert.equal(snapshot(), BASE);
});
