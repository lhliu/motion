import type { XFx, XK } from './kit';
import { xp01 } from './p01';
import { xp02 } from './p02';
import { xp03 } from './p03';
import { xp04 } from './p04';
export const XP_PACKS: ((K: XK) => Record<string, XFx>)[] = [xp01, xp02, xp03, xp04];
