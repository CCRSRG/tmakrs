ALTER TABLE newtab_grid_items ADD COLUMN browser_bookmark_id TEXT;
ALTER TABLE newtab_grid_items ADD COLUMN parent_id TEXT;
ALTER TABLE newtab_grid_items ADD COLUMN bookmark_folder_title TEXT;
CREATE INDEX IF NOT EXISTS idx_newtab_grid_items_browser_bookmark ON newtab_grid_items(user_id, browser_bookmark_id);
CREATE INDEX IF NOT EXISTS idx_newtab_grid_items_parent ON newtab_grid_items(user_id, parent_id);
ALTER TABLE newtab_settings ADD COLUMN browser_folder_recreated_at TEXT;
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0101');
