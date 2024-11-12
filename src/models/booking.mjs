import DB from '../../config/db.mjs';
import Database from './database.mjs';

export default class Booking {
    static #db = DB.physicalDBConnection;
    static #dbTableName = 'bookings';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // checkIn → 2024-11-12 07:00:00
    // checkOut →  2024-11-12 13:00:00
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    static {
        Booking.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Booking.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            userId INTEGER NOT NULL,
            boatId INTEGER NOT NULL,
            checkIn TEXT NOT NULL,
            checkOut TEXT NOT NULL,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL,
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(boatId) REFERENCES boats(id) ON DELETE CASCADE
            ) STRICT`);
    }
    /**
     * The record id as stored in the booking database. Its value will be undefined if the booking has not been stored
     * in the database.
     */
    #id;
    #userId;
    #boatId;
    #checkIn;
    #checkOut;

    /**
     * @param boatId
     * @param userId
     * @param checkIn
     * @param checkOut
     */
    constructor(userId, boatId, checkIn, checkOut) {
        this.#userId = userId;
        this.#boatId = boatId;
        this.#checkIn = checkIn;
        this.#checkOut = checkOut;
    }
    static get db() {
        return this.#db;
    }
    static get dbTableName() {
        return this.#dbTableName;
    }

    static getBookingFromDb(id) {
        const booking = Database.query(this.db, this.dbTableName, id);
        return booking;
    }

    get db() {
        return Booking.#db;
    }
    get dbTableName() {
        return Booking.#dbTableName;
    }
    get dbImmutableFieldNames() {
        return ['userId', 'boatId', 'checkIn', 'checkOut'];
    }
    get dbImmutableFieldValues() {
        return [this.userId, this.boatId, this.checkIn, this.checkOut];
    }
    get id() {
        return this.#id;
    }
    get userId() {
        return this.#userId;
    }
    get boatId() {
        return this.#boatId;
    }
    get checkIn() {
        return this.#checkIn;
    }
    get checkOut() {
        return this.#checkOut;
    }
}
