import type { XFx, XK } from './kit';
import { xp01 } from './p01';
import { xp02 } from './p02';
export const XP_PACKS: ((K: XK) => Record<string, XFx>)[] = [xp01, xp02];
