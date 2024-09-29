import Database from './database.mjs';
import DB from '../../config/db.mjs';
export default class Visitor { // Class that provides methods for creating and retrieving sessions
    static #db = DB.inMemoryDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'visitors';
    // createdAt → (Unix Time: The number of seconds since 1970-01-01 00:00:00 UTC)
    static {
        Visitor.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Visitor.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expireTime INTEGER,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now'))
            ) STRICT`);
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

    /**
     *  3,600,000 milliseconds == 3,600 seconds == 1 hour
     *  (365 * 24 * 60 * 60 * 10) seconds == 10 years
     *
     * @param expireTime number of seconds in UTC (time elapsed since January 1, 1970, 00:00:00) that the session will
     * last. The maximum age for cookies in Google Chrome is 400 days (13 months) from the time the cookie was set
     * @param storeInDb
     */
    constructor(expireTime = (365 * 24 * 60 * 60 * 10), storeInDb=false) {
        this.#expireTime = expireTime; // 10 years from now
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
    static getVisitorFromDb(id) {
        const visitor = Database.query(this.db, this.dbTableName, id);
        return visitor;
    }
    static isExpiredVisitorDb(createdAt, expireTime) {
        const expireAtUtc = createdAt + expireTime;
        const utcNow = Math.floor(Date.now() / 1000);
        return (expireAtUtc < utcNow);
    }

    get db() {
        return Visitor.#db;
    }
    get dbTableName() {
        return Visitor.#dbTableName;
    }
    get dbImmutableFieldNames() {
        return ['expireTime'];
    }
    get dbImmutableFieldValues() {
        return [this.expireTime];
    }
    get id() {
        return this.#id;
    }
    get expireTime() {
        return this.#expireTime;
    }
    get createdAt() {
        return this.#createdAt;
    }
    isExpiredVisitor() {
        const expireAtUtc = this.#createdAt + this.expireTime;
        const utcNow = Math.floor(Date.now() / 1000);
        return (expireAtUtc < utcNow);
    }
}

// const session = new Visitor(1, true);
// setTimeout(() => {
//     console.log(`session.id: ${session.id}`);
//     console.log(`session.createdAt: ${session.createdAt}`);
//     console.info(session.isSessionExpired());
//     let sess = Visitor.getSessionFromDb(session.id);
//     console.log(sess);
//     console.log('-------------');
//     Database.delete(session);
//     Visitor.getVisitorFromDb(session.id);
//     console.log('-------------');
//     console.info(session.isSessionExpired());
//     }, 4000);
// console.log(session);
// console.info(session.isSessionExpired());
