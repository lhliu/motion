import { onRequestDelete as __api_combos__id__ts_onRequestDelete } from "/home/user/motion/functions/api/combos/[id].ts"
import { onRequestGet as __api_combos__id__ts_onRequestGet } from "/home/user/motion/functions/api/combos/[id].ts"
import { onRequestOptions as __api_combos__id__ts_onRequestOptions } from "/home/user/motion/functions/api/combos/[id].ts"
import { onRequestPut as __api_combos__id__ts_onRequestPut } from "/home/user/motion/functions/api/combos/[id].ts"
import { onRequestDelete as __api_presets__id__ts_onRequestDelete } from "/home/user/motion/functions/api/presets/[id].ts"
import { onRequestGet as __api_presets__id__ts_onRequestGet } from "/home/user/motion/functions/api/presets/[id].ts"
import { onRequestOptions as __api_presets__id__ts_onRequestOptions } from "/home/user/motion/functions/api/presets/[id].ts"
import { onRequestPut as __api_presets__id__ts_onRequestPut } from "/home/user/motion/functions/api/presets/[id].ts"
import { onRequestGet as __api_combos_index_ts_onRequestGet } from "/home/user/motion/functions/api/combos/index.ts"
import { onRequestOptions as __api_combos_index_ts_onRequestOptions } from "/home/user/motion/functions/api/combos/index.ts"
import { onRequestPost as __api_combos_index_ts_onRequestPost } from "/home/user/motion/functions/api/combos/index.ts"
import { onRequestGet as __api_effects_ts_onRequestGet } from "/home/user/motion/functions/api/effects.ts"
import { onRequestOptions as __api_effects_ts_onRequestOptions } from "/home/user/motion/functions/api/effects.ts"
import { onRequestGet as __api_presets_index_ts_onRequestGet } from "/home/user/motion/functions/api/presets/index.ts"
import { onRequestOptions as __api_presets_index_ts_onRequestOptions } from "/home/user/motion/functions/api/presets/index.ts"
import { onRequestPost as __api_presets_index_ts_onRequestPost } from "/home/user/motion/functions/api/presets/index.ts"
import { onRequestGet as __c__id__ts_onRequestGet } from "/home/user/motion/functions/c/[id].ts"
import { onRequestGet as __r__name__ts_onRequestGet } from "/home/user/motion/functions/r/[name].ts"
import { onRequestDelete as __mcp_ts_onRequestDelete } from "/home/user/motion/functions/mcp.ts"
import { onRequestGet as __mcp_ts_onRequestGet } from "/home/user/motion/functions/mcp.ts"
import { onRequestOptions as __mcp_ts_onRequestOptions } from "/home/user/motion/functions/mcp.ts"
import { onRequestPost as __mcp_ts_onRequestPost } from "/home/user/motion/functions/mcp.ts"

export const routes = [
    {
      routePath: "/api/combos/:id",
      mountPath: "/api/combos",
      method: "DELETE",
      middlewares: [],
      modules: [__api_combos__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/combos/:id",
      mountPath: "/api/combos",
      method: "GET",
      middlewares: [],
      modules: [__api_combos__id__ts_onRequestGet],
    },
  {
      routePath: "/api/combos/:id",
      mountPath: "/api/combos",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_combos__id__ts_onRequestOptions],
    },
  {
      routePath: "/api/combos/:id",
      mountPath: "/api/combos",
      method: "PUT",
      middlewares: [],
      modules: [__api_combos__id__ts_onRequestPut],
    },
  {
      routePath: "/api/presets/:id",
      mountPath: "/api/presets",
      method: "DELETE",
      middlewares: [],
      modules: [__api_presets__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/presets/:id",
      mountPath: "/api/presets",
      method: "GET",
      middlewares: [],
      modules: [__api_presets__id__ts_onRequestGet],
    },
  {
      routePath: "/api/presets/:id",
      mountPath: "/api/presets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_presets__id__ts_onRequestOptions],
    },
  {
      routePath: "/api/presets/:id",
      mountPath: "/api/presets",
      method: "PUT",
      middlewares: [],
      modules: [__api_presets__id__ts_onRequestPut],
    },
  {
      routePath: "/api/combos",
      mountPath: "/api/combos",
      method: "GET",
      middlewares: [],
      modules: [__api_combos_index_ts_onRequestGet],
    },
  {
      routePath: "/api/combos",
      mountPath: "/api/combos",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_combos_index_ts_onRequestOptions],
    },
  {
      routePath: "/api/combos",
      mountPath: "/api/combos",
      method: "POST",
      middlewares: [],
      modules: [__api_combos_index_ts_onRequestPost],
    },
  {
      routePath: "/api/effects",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_effects_ts_onRequestGet],
    },
  {
      routePath: "/api/effects",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_effects_ts_onRequestOptions],
    },
  {
      routePath: "/api/presets",
      mountPath: "/api/presets",
      method: "GET",
      middlewares: [],
      modules: [__api_presets_index_ts_onRequestGet],
    },
  {
      routePath: "/api/presets",
      mountPath: "/api/presets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_presets_index_ts_onRequestOptions],
    },
  {
      routePath: "/api/presets",
      mountPath: "/api/presets",
      method: "POST",
      middlewares: [],
      modules: [__api_presets_index_ts_onRequestPost],
    },
  {
      routePath: "/c/:id",
      mountPath: "/c",
      method: "GET",
      middlewares: [],
      modules: [__c__id__ts_onRequestGet],
    },
  {
      routePath: "/r/:name",
      mountPath: "/r",
      method: "GET",
      middlewares: [],
      modules: [__r__name__ts_onRequestGet],
    },
  {
      routePath: "/mcp",
      mountPath: "/",
      method: "DELETE",
      middlewares: [],
      modules: [__mcp_ts_onRequestDelete],
    },
  {
      routePath: "/mcp",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__mcp_ts_onRequestGet],
    },
  {
      routePath: "/mcp",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [],
      modules: [__mcp_ts_onRequestOptions],
    },
  {
      routePath: "/mcp",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__mcp_ts_onRequestPost],
    },
  ]