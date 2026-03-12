/**
 * Storage layer - Abstract interface
 *
 * Change the import here to switch storage backends
 * (e.g., from Google Sheets to Postgres, Supabase, etc.)
 */

import * as googlesheets from './googlesheets.js';

// Export current storage implementation
export const { readProducts, writeProducts, readConfig, writeConfig } = googlesheets;
