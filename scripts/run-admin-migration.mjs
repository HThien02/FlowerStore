/**
 * Apply scripts/setup-admin.sql to Supabase Postgres directly.
 * Usage:  node --env-file=.env.local scripts/run-admin-migration.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'

const conn =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

if (!conn) {
  console.error('Missing POSTGRES_URL / POSTGRES_URL_NON_POOLING in env.')
  process.exit(1)
}

const sqlPath = path.join(process.cwd(), 'scripts', 'setup-admin.sql')
const sql = await fs.readFile(sqlPath, 'utf8')

const client = new pg.Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  await client.query(sql)
  console.log('Migration applied successfully.')
} catch (e) {
  console.error('Migration failed:', e.message)
  process.exit(1)
} finally {
  await client.end()
}
