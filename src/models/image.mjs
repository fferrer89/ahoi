import DB from '../../config/db.mjs';
import Database from './database.mjs';
export default class Image { // Class that provides methods for creating and retrieving User
    static #db = DB.physicalDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'images';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // e.g.: ownerId INTEGER REFERENCES users(id) NOT NULL,
    // createdAt → 1727270175 (Unix Time: The number of seconds since 1970-01-01 00:00:00 UTC)
    // createdAtStr → 2024-09-25 13:16:15
    // TODO: Add available time db column and field
    /**
     * CHECK() If the result is zero, then a constraint violation occurred. If the result is a non-zero value or NULL,
     * it means no constraint violation occurred.
     */
    static {
        Image.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Image.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            boatId INTEGER NOT NULL,
            pathName TEXT NOT NULL UNIQUE CHECK(LENGTH(TRIM(pathName)) > 0),
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            size INTEGER NOT NULL,
            position INTEGER NOT NULL CHECK(position >= 0), 
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL,
            FOREIGN KEY(boatId) REFERENCES boats(id) ON DELETE CASCADE
            ) STRICT`);
    }

    /**
     * The record id as stored in the user database. Its value will be undefined if the user has not been stored
     * in the database.
     */
    #id;
    #boatId;
    #pathName;
    #name;
    #type;
    #size;
    #position;

    /**
     * @param boatId
     * @param pathName
     * @param name
     * @param type
     * @param size
     * @param position
     */
    constructor(boatId, pathName, name, type, size, position = 0) {
        this.#boatId = boatId;
        this.#pathName = pathName;
        this.#name = name;
        this.#type = type;
        this.#size = size;
        this.#position = position;
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
     * @return {}
     */
    static getImageFromDb(id) {
        const image = Database.query(this.db, this.dbTableName, id);
        return image;
    }
    static getImageWithPathnameFromDb(pathName) {
        const query = this.db.prepare(`SELECT * FROM ${this.dbTableName} WHERE pathName = ? LIMIT 1`);
        const image = query.get(pathName);
        return image;
    }
    get db() {
        return Image.#db;
    }
    get dbTableName() {
        return Image.#dbTableName;
    }
    get dbImmutableFieldNames() {
        return ['boatId', 'pathName', 'name', 'type', 'size', 'position'];
    }
    get dbImmutableFieldValues() {
        return [this.boatId, this.pathName, this.name, this.type, this.size, this.position];
    }
    get id() {
        return this.#id;
    }
    get boatId() {
        return this.#boatId;
    }
    get pathName() {
        return this.#pathName;
    }
    get name() {
        return this.#name;
    }
    get type() {
        return this.#type;
    }
    get size() {
        return this.#size;
    }
    get position() {
        return this.#position;
    }
}
// console.log(Object.values(ACCOUNT_TYPES).join("', '"))
// const user = new User('ffcala@gooale.com', '1234abcd?', 'Boat Renter', 'abc');
// console.log(user);
// Database.insert(user);
// node --experimental-sqlite user.mjs