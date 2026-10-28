-- Motion Atlas 後台（feat/admin-backend）。正式環境需 KC 同意後才執行：
--   npx wrangler d1 migrations apply <資料庫名稱> --remote
CREATE TABLE IF NOT EXISTS fx_overrides (
  id TEXT PRIMARY KEY,
  hidden INTEGER,
  cat TEXT,
  sort INTEGER,
  tags TEXT,
  featured INTEGER,
  featured_sort INTEGER,
  redirect TEXT,
  variant TEXT,
  note TEXT,
  fav INTEGER,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS fx_audit (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  actor TEXT,
  action TEXT NOT NULL,
  summary TEXT,
  before TEXT NOT NULL,
  after TEXT NOT NULL,
  undone INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS fx_thumbs (
  id TEXT NOT NULL,
  frame INTEGER NOT NULL,
  mime TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id, frame)
);
