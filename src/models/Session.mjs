// Sessions Management
// 1. Set up the SQLite Database and create a table to store session data:
import { DatabaseSync } from 'node:sqlite';

// 2. Create a Session Manager singletonClass (Session.mjs):
/**
 * // Access the singleton instance
 * const session = new Session();
 * session.createSession();
 *
 * // Attempt to create another instance
 * const anotherSession = new Session();
 * console.log(session === anotherSession); // Output: true
 */
class Session { // Class that provides methods for creating and retrieving sessions
    static #sessionInstance;
    #sessionExpireTime;
    constructor(sessionExpireTime=3600000) {
        // 3600000 milliseconds ==== 1 hour
        if (Session.#sessionInstance) {
            return Session.#sessionInstance;
        }
        this.#sessionExpireTime = sessionExpireTime;
        this.db = new DatabaseSync(':memory:'); // Database is open (similar to db.open()) // In-Memory database
        // this.db = new DatabaseSync('./data/sessions'); // In-Disk database
        // this.db = new DatabaseSync('./data/db'); // In-Disk database
        this.db.exec(`
              CREATE TABLE sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                expires INTEGER
              ) STRICT
            `);
        Session.#sessionInstance = this;
    }
    async createSession(userId=null) {
        // method that generates a unique ID, stores the sessions data in the database, and returns the sessions ID.
        const expires = Date.now() + this.#sessionExpireTime; // 1 hour from now
        const insert = this.db.prepare(`INSERT INTO sessions (userId, expires) VALUES (?, ?)`);
        const session = insert.run(userId, expires);
        return session.lastInsertRowid; // the sessions id
    }

    async getSession(id) {
        id = parseInt(id);
        // method that retrieves session data based on the session ID, checks if it has expired, and deletes it if necessary.
        const query = this.db.prepare(`SELECT id, userId, expires FROM sessions WHERE id = ? LIMIT 1`); // Same as statement from above
        const session = query.get(id);
        if (session) {
            const expires = Date.now();
            if (expires < session.expires) {
                return session.id;
            } else {
                return await this.removeSession(id);
            }
        } else {
            return null;
        }
    }
    async removeSession(id) {
        const del = this.db.prepare(`DELETE FROM sessions WHERE id = ?`);
        const session = del.run(id);
        return session;
    }
}
export default Session;