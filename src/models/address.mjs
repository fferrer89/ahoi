import Database from './database.mjs';
import DB from '../../config/db.mjs';
import { STATES } from "../utils/constants.mjs";

/**
 * Example:
 * INSERT INTO addresses (street, city, state, country, zipCode)
 * VALUES ('123 Main Street', 'Anytown', 'CA', 'USA', '12345');
 */
export default class Address {
    static #db = DB.physicalDBConnection;
    static #dbTableName = 'addresses';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    static {
        Address.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Address.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            state TEXT NOT NULL CHECK(userType IN ('${STATES.join("', '")}')),
            city TEXT NOT NULL CHECK(LENGTH(TRIM(city)) > 0),
            country TEXT NOT NULL DEFAULT 'USA' CHECK(LENGTH(TRIM(country)) > 0),
            zipCode TEXT NOT NULL,
            street TEXT CHECK(LENGTH(TRIM(street)) > 0,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL),
            CHECK (
                   LENGTH(TRIM(zipCode)) = 5 AND
                   zipCode GLOB '*[0-9]*'
                  )
            ) STRICT`);
    }
    /**
     * The record id as stored in the address database. Its value will be undefined if the address has not been stored
     * in the database.
     */
    #id;
    #state;
    #city;
    #country;
    #zipCode;
    #street;

    /**
     * @param city
     * @param state
     * @param country
     * @param zipCode
     * @param street
     */
    constructor(city, state, country='USA', zipCode, street) {
        this.#state = state;
        this.#city = city;
        this.#country = country;
        this.#zipCode = zipCode;
        this.#street = street;
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
    static getAddressFromDb(id) {
        const address = Database.query(this.db, this.dbTableName, id);
        return address;
    }

    get db() {
        return Address.#db;
    }
    get dbTableName() {
        return Address.#dbTableName;
    }
    get dbMutableFieldNames() {
        return ['state', 'city', 'country', 'zipCode', 'street'];
    }
    get dbMutableFieldValues() {
        return [this.state, this.city, this.country, this.zipCode, this.street];
    }
    get id() {
        return this.#id;
    }
    get state() {
        return this.#state;
    }
    get city() {
        return this.#city;
    }
    get country() {
        return this.#country;
    }
    get zipCode() {
        return this.#zipCode;
    }
    get street() {
        return this.#street;
    }
}
