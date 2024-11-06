import DB from '../../config/db.mjs';
import Database from './database.mjs';

export default class Booking {
    static #db = DB.physicalDBConnection;
    static #dbTableName = 'bookings';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    static {
        Booking.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Booking.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            userId INTEGER NOT NULL,
            boatId INTEGER NOT NULL,
            date INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            dateStr TEXT DEFAULT (DATETIME('now')) NOT NULL,
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL,
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(boatId) REFERENCES boats(id) ON DELETE CASCADE,
            ) STRICT`);
    }
    /**
     * The record id as stored in the booking database. Its value will be undefined if the booking has not been stored
     * in the database.
     */
    #id;
    #userId;
    #boatId;
    #date;
    #dateStr;

    /**
     * @param boatId
     * @param userId
     * @param date
     * @param dateStr
     */
    constructor(userId, boatId, date, dateStr) {
        this.#userId = userId;
        this.#boatId = boatId;
        this.#date = date;
        this.#dateStr = dateStr;
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
        return ['userId', 'boatId', 'date', 'dateStr'];
    }
    get dbImmutableFieldValues() {
        return [this.userId, this.boatId, this.date, this.dateStr];
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
    get date() {
        return this.#date;
    }
    get dateStr() {
        return this.#dateStr;
    }
}
