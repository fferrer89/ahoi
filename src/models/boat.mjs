import Database from './database.mjs';
import DB from '../../config/db.mjs';

export default class Boat { // Class that provides methods for creating and retrieving Boat
    static #db = DB.physicalDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'boats';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // e.g.: ownerId INTEGER REFERENCES users(id) NOT NULL,
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    // TODO: Add available time db column and field
    static {
        Boat.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Boat.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,        
            ownerId INTEGER NOT NULL,        
            addressId INTEGER NOT NULL,
            type TEXT,
            pricePerHour INTEGER,
            description TEXT,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL) 
            STRICT`);
    }

    /**
     * The record id as stored in the boat database. Its value will be undefined if the boat has not been stored
     * in the database.
     */
    #id;
    #ownerId;
    #addressId;
    #type;
    #pricePerHour;
    #description;

    /**
     *
     * @param ownerId
     * @param addressId
     * @param type
     * @param pricePerHour
     * @param description
     */
    constructor(ownerId, addressId, type, pricePerHour, description) {
        this.#ownerId = ownerId;
        this.#addressId = addressId;
        this.#type = type; // Sailboat, Motorboat
        this.#pricePerHour = pricePerHour;
        this.#description = description;
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
        return ['ownerId', 'addressId', 'type', 'pricePerHour', 'description'];
    }
    get dbMutableFieldValues() {
        return [this.ownerId, this.addressId, this.type, this.pricePerHour, this.description];
    }
    get id() {
        return this.#id;
    }
    get ownerId() {
        return this.#ownerId;
    }
    get addressId() {
        return this.#addressId;
    }
    get type() {
        return this.#type;
    }
    get pricePerHour() {
        return this.#pricePerHour;
    }
    get description() {
        return this.#description;
    }
}
