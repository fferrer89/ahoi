import DB from '../../config/db.mjs';
import Database from './database.mjs';
import Boat from './boat.mjs';
import User from "./user.mjs";

export default class Booking {
    static #db = DB.physicalDBConnection;
    static #dbTableName = 'bookings';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // checkIn → 2024-11-12 07:00:00
    // checkOut →  2024-11-12 13:00:00
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    /**
     * Date Functions/Manipulations in SQLite
     *
     * SELECT createdAt, createdAtStr, date(createdAtStr), time(createdAtStr), datetime(createdAtStr), unixepoch(createdAtStr), timediff(checkOut, checkIn), substr(timediff(checkOut,checkIn), 13, 5), strftime('%H', substr(timediff(checkOut,checkIn), 13, 5))  FROM bookings;
     *
     * createdAt → 1731552179
     * createdAtStr → 2024-11-14 02:42:59
     * datetime(createdAtStr) → 2024-11-14 02:42:59
     * date(createdAtStr) → 2024-11-14
     * time(createdAtStr) →  02:42:59
     * unixepoch(createdAtStr) →  1731552179 === (STRFTIME('%s', 'now')) === createdAt
     *
     * checkIn → 2024-11-13 13:00:00
     * checkOut → 2024-11-13 17:30:00
     * timediff(checkOut, checkIn) → +0000-00-00 04:30:00.000
     * substr(timediff(checkOut, checkIn), 13, 5) → 04:30
     * strftime('%H', substr(timediff(checkOut,checkIn), 13, 5)) → 04
     * strftime('%m/%d/%Y', checkOut) → 11/13/2024
     * strftime('%H', checkOut) – strftime('%H', checkIn) → 4
     *
     * CAST(unixepoch(checkOut) – unixepoch(checkIn) AS REAL) / 3600 → 4.5
     * CAST(STRFTIME('%s', checkOut) - STRFTIME('%s', checkIn) AS REAL) / 3600 → 4.5
     */
    static {
        Booking.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Booking.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            userId INTEGER NOT NULL,
            boatId INTEGER NOT NULL,
            checkIn TEXT NOT NULL,
            checkOut TEXT NOT NULL,
            hoursReserved REAL NOT NULL CHECK(hoursReserved >= 0),
            hoursReservedVirtual REAL NOT NULL GENERATED ALWAYS AS (CAST(unixepoch(checkOut) - unixepoch(checkIn) AS REAL) / 3600) VIRTUAL CHECK(hoursReserved >= 0),
            hoursReservedStored REAL NOT NULL GENERATED ALWAYS AS (CAST(unixepoch(checkOut) - unixepoch(checkIn) AS REAL) / 3600) STORED CHECK(hoursReserved >= 0),
            ownerAmount REAL NOT NULL CHECK(ownerAmount >= 0),
            serviceFee REAL DEFAULT 5 CHECK(serviceFee >= 0),
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
    #hoursReserved;
    #ownerAmount;
    #serviceFee


    constructor(userId, boatId, checkIn, checkOut, hoursReserved, ownerAmount, serviceFee=5) {
        this.#userId = userId;
        this.#boatId = boatId;
        this.#checkIn = checkIn;
        this.#checkOut = checkOut;
        this.#hoursReserved = hoursReserved;
        this.#ownerAmount = ownerAmount;
        this.#serviceFee = serviceFee;
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
    static getBookingsWithOwnerAndBoatFromDb(userId) {
        const query = this.db.prepare(
            `SELECT ${this.dbTableName}.id as id, ${this.dbTableName}.checkIn, ${this.dbTableName}.checkOut,
                        ${this.dbTableName}.hoursReserved, ${this.dbTableName}.ownerAmount, ${this.dbTableName}.serviceFee,
                        ${Boat.dbTableName}.id as boatId, ${Boat.dbTableName}.title as boatTitle, 
                        ${Boat.dbTableName}.pricePerHour as boatPricePerHour,
                        ${User.dbTableName}.id as boatOwnerId, ${User.dbTableName}.username as boatOwnerUsername, 
                        ${User.dbTableName}.email as boatOwnerEmail
                 FROM ${this.dbTableName}
                    INNER JOIN ${Boat.dbTableName} on ${Boat.dbTableName}.id = ${this.dbTableName}.boatId
                    INNER JOIN ${User.dbTableName} on ${User.dbTableName}.id = ${Boat.dbTableName}.ownerId
                 WHERE ${this.dbTableName}.userId = ? 
                 ORDER BY unixepoch(${this.dbTableName}.checkIn) ASC
                 `
        );
        const bookings = query.all(userId);
        return bookings;
    }

    get db() {
        return Booking.#db;
    }
    get dbTableName() {
        return Booking.#dbTableName;
    }
    get dbImmutableFieldNames() {
        return ['userId', 'boatId', 'checkIn', 'checkOut', 'hoursReserved', 'ownerAmount', 'serviceFee'];
    }
    get dbImmutableFieldValues() {
        return [this.userId, this.boatId, this.checkIn, this.checkOut, this.hoursReserved, this.ownerAmount, this.serviceFee];
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
    get hoursReserved() {
        return this.#hoursReserved;
    }
    get ownerAmount() {
        return this.#ownerAmount;
    }
    get serviceFee() {
        return this.#serviceFee;
    }
}
