// Sessions Management
import Database from './database.mjs';
import DB from '../../config/db.mjs';
const physicalDBConnection = DB.physicalDBConnection;
export default class Session { // Class that provides methods for creating and retrieving sessions
    static #db = DB.inMemoryDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'sessions';
    // createdAt → (Unix Time: The number of seconds since 1970-01-01 00:00:00 UTC)
    // visitors -> parent_table
    // users -> parent_table
    // FOREIGN KEY(userId) REFERENCES physicalDBConnection.users(id) ON DELETE CASCADE
    static {
        Session.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Session.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitorId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            expireTime INTEGER,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')),
            FOREIGN KEY(visitorId) REFERENCES visitors(id) ON DELETE CASCADE
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
    #visitorId;
    #userId;

    /**
     *  3,600,000 milliseconds == 3,600 seconds == 1 hour
     *
     * @param expireTime number of seconds in UTC (time elapsed since January 1, 1970, 00:00:00) that the session will
     * last
     * @param storeInDb
     * @param visitorId
     * @param userId
     */
    constructor(visitorId, userId, expireTime = 3600, storeInDb=false) {
        this.#visitorId = visitorId;
        this.#userId = userId;
        this.#expireTime = expireTime; // 1 hour from now
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
    static isExpiredSessionDb(createdAt, expireTime) {
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
    get dbImmutableFieldNames() {
        return ['visitorId', 'userId', 'expireTime'];
    }
    get dbImmutableFieldValues() {
        return [this.visitorId, this.userId, this.expireTime];
    }
    get dbMutableFieldNames() {
        return ['visitorId'];
    }
    get dbMutableFieldValues() {
        return [this.visitorId];
    }
    get id() {
        return this.#id;
    }
    get visitorId() {
        return this.#visitorId;
    }
    set visitorId(visitorId) {
        this.#visitorId = visitorId;
    }
    get userId() {
        return this.#userId;
    }
    get expireTime() {
        return this.#expireTime;
    }
    get createdAt() {
        return this.#createdAt;
    }
    isExpiredSession() {
        const expireAtUtc = this.createdAt + this.expireTime;
        const utcNow = Math.floor(Date.now() / 1000);
        return (expireAtUtc < utcNow);
    }
}
