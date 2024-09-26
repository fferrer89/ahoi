// Sessions Management
import Database from './database.mjs';
import DB from '../../config/db.mjs';

export default class Boat { // Class that provides methods for creating and retrieving Boat
    static #db = DB.physicalDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'boats';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // e.g.: ownerId INTEGER REFERENCES users(id) NOT NULL,
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    static {
        Boat.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Boat.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            ownerId INTEGER NOT NULL,
            type TEXT,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL) 
            STRICT`);
    }

    /**
     * The record id as stored in the boat database. Its value will be undefined if the boat has not been stored
     * in the database.
     */
    #id;
    /**
     * The created date of the boat in the database in UTC (The number of seconds that have elapsed from
     * January 1, 1970, 00:00:00 until the time the record was created). To convert it to a JS date use the
     * following formula: 'new Date(createdAt * 1000)'; Since a Unix timestamp is in seconds, we need to multiply it
     * by 1000 to convert it to milliseconds.
     */
    #type;
    #ownerId;

    /**
     * @param ownerId
     * @param type
     */
    constructor(ownerId, type) {
        this.#ownerId = ownerId;
        this.#type = type; // Sailboat, Motorboat
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
    static getBoatFromDb(id) {
        const boat = Database.query(this.db, this.dbTableName, id);
        return boat;
    }

    get db() {
        return Boat.#db;
    }
    get dbTableName() {
        return Boat.#dbTableName;
    }
    get dbMutableFieldNames() {
        return ['ownerId', 'type'];
    }
    get dbMutableFieldValues() {
        return [this.ownerId, this.type];
    }
    get id() {
        return this.#id;
    }
    get ownerId() {
        return this.#ownerId;
    }
    get type() {
        return this.#type;
    }
}
