import { changelog } from './changelog.js';
import { pool } from './index.js';

export async function seeder() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const change of changelog) {
            await client.query(change);
        }

        await client.query('COMMIT');
        console.log("Banco atualizado!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    } finally {
        client.release();
    }
}