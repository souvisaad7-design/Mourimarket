import pg from 'pg';
import { config } from './config.js';

// Return NUMERIC as JS numbers (prices fit comfortably in a double).
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));
// COUNT(*) returns BIGINT; counts here are always small.
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)));

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

export const query = (text, params) => pool.query(text, params);

export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
