// 擴充包（2026-10-28）：31 包新招（Lottie 匯入器除外）共用一個物件模組 xpack，id 為 obj-xpack-<mode>。
import { fnSource } from '../../engine';
import { xkit } from './kit';
import { xpackCore } from './core';
import { XP_PACKS } from './packs';

export const XPACK_GLOBALS = `window.MA_XPACK=${fnSource(xpackCore)}(${fnSource(xkit)},[${XP_PACKS.map((p) => fnSource(p as never)).join(',')}]);`;
(globalThis as unknown as { MA_XPACK: unknown }).MA_XPACK = xpackCore(xkit, XP_PACKS);
