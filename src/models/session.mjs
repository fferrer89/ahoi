// Sessions Management
import { DatabaseSync } from 'node:sqlite';
import Database from './database.mjs';
const inMemoryDb = new DatabaseSync(':memory:'); // Database is open (similar to db.open()) // In-Memory database

export default class Session { // Class that provides methods for creating and retrieving sessions
    static #db = inMemoryDb; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'sessions';
    static {
        Session.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Session.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            expireTime INTEGER,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')), 
            createdAtStr TEXT DEFAULT (DATETIME('now'))) 
            STRICT`);
    }

    /**
     * The record id as stored in the session database. Its value will be undefined if the session has not been stored
     * in the database.
     */
    #id;
    /**
     * The created date of the session in the database in UTC (The number of seconds that have elapsed from
     * January 1, 1970, 00:00:00 until the time the record was created). To convert it to a JS date use the
     * following formula: 'new Date(createdAt * 1000)'; Since a Unix timestamp is in seconds, we need to multiply it
     * by 1000 to convert it to milliseconds.
     */
    #createdAt;
    #expireTime; // Expiration time in milliseconds
    #userId;

    /**
     *  3,600,000 milliseconds == 3,600 seconds == 1 hour
     *
     * @param expireTime number of seconds in UTC (time elapsed since January 1, 1970, 00:00:00) that the session will
     * last
     * @param storeInDb
     * @param userId
     */
    constructor(expireTime = 3600, storeInDb=false, userId=null) {
        this.#expireTime = expireTime; // 1 hour from now
        this.#userId = userId;
        this.#createdAt = Math.floor(Date.now() / 1000); // Created time in UTC seconds
        if (storeInDb) {
            this.#id = Database.insert(this);
        }
    }
    static get db() {
        return this.#db;
    }
    static get dbTableName() {
        return this.#dbTableName;
    }

    /**
     * Returns
     * @param id
     * @return {id, userId, expireTime, createdAt}
     */
    static getSessionFromDb(id) {
        const session = Database.query(this.db, this.dbTableName, id);
        return session;
    }
    static isSessionDbExpired(createdAt, expireTime) {
        const expireAtUtc = createdAt + expireTime;
        const utcNow = Math.floor(Date.now() / 1000);
        return (expireAtUtc < utcNow);
    }

    get db() {
        return Session.#db;
    }
    get dbTableName() {
        return Session.#dbTableName;
    }
    get dbMutableFieldNames() {
        return ['expireTime', 'userId'];
    }
    get dbMutableFieldValues() {
        return [this.expireTime, this.userId];
    }
    get id() {
        return this.#id;
    }
    get createdAt() {
        return this.#createdAt;
    }
    get expireTime() {
        return this.#expireTime;
    }
    get userId() {
        return this.#userId;
    }
    isSessionExpired() {
        const expireAtUtc = this.#createdAt + this.expireTime;
        const utcNow = Math.floor(Date.now() / 1000);
        return (expireAtUtc < utcNow);
    }
}

// const session = new Session(1, true);
// setTimeout(() => {
//     console.log(`session.id: ${session.id}`);
//     console.log(`session.createdAt: ${session.createdAt}`);
//     console.info(session.isSessionExpired());
//     let sess = Session.getSessionFromDb(session.id);
//     console.log(sess);
//     console.log('-------------');
//     Database.delete(session);
//     Session.getSessionFromDb(session.id);
//     console.log('-------------');
//     console.info(session.isSessionExpired());
//     }, 4000);
// console.log(session);
// console.info(session.isSessionExpired());
