import Database from './database.mjs';
import DB from '../../config/db.mjs';
import { ACCOUNT_TYPES } from '../utils/constants.mjs';

export default class User { // Class that provides methods for creating and retrieving User
    static #db = DB.physicalDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'users';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // e.g.: ownerId INTEGER REFERENCES users(id) NOT NULL,
    // createdAt → 1727270175 (Unix Time: The number of seconds since 1970-01-01 00:00:00 UTC)
    // createdAtStr → 2024-09-25 13:16:15
    // TODO: Add available time db column and field
    /**
     * CHECK() If the result is zero, then a constraint violation occurred. If the result is a non-zero value or NULL,
     * it means no constraint violation occurred.
     *
     * Email Check:
     * The E-mail address is supposed to be in the format X@Y.Z and X, Y may be latin characters or numbers while Z may
     * only contain latin letters. X, Y, and Z are supposed to be non-empty strings. (see: https://stackoverflow.com/questions/66227005/check-for-proper-e-mail-format-in-sqlite)
     * %_@_%._% -> zero or more characters (%), followed by a single character (_), followed by the @ character,
     * followed by a single character (_), followed by zero or more characters (%),  followed by the . character, ...
     *
     * Password Check:
     *  - At least 10 characters long
     *  - Should include at least one special symbol/character, at least one number, and at least one letter
     */
    static {
        User.db.exec(`
        CREATE TABLE IF NOT EXISTS ${User.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            password TEXT NOT NULL,
            userType TEXT NOT NULL CHECK(userType IN ('${ACCOUNT_TYPES.BOAT_RENTER}', '${ACCOUNT_TYPES.BOAT_OWNER}', '${ACCOUNT_TYPES.ADMIN}')),
            username TEXT CHECK(LENGTH(TRIM(username)) > 0),         
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL,
            CHECK (
                email LIKE '%_@_%._%' AND
                LENGTH(email) - LENGTH(REPLACE(email, '@', '')) = 1
                  )
            CHECK (
                LENGTH(TRIM(password)) > 7 AND
                password GLOB '*[^0-9a-zA-Z ]*' AND
                password GLOB '*[0-9]*' AND
                password GLOB '*[a-zA-Z]*'
                  )
            ) STRICT`);
    }

    /**
     * The record id as stored in the user database. Its value will be undefined if the user has not been stored
     * in the database.
     */
    #id;
    #email;
    #password;
    #userType;
    #username;

    /**
     *
     * @param email
     * @param password
     * @param userType
     * @param username
     */
    constructor(email, password, userType=ACCOUNT_TYPES.BOAT_RENTER, username=null) {
        this.#email = email;
        this.#password = password;
        this.#userType = userType; // Boat Renter, Boat Owner
        this.#username = username;
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
    static getUserFromDb(id) {
        const user = Database.query(this.db, this.dbTableName, id);
        return user;
    }
    static getLoginUserFromDb(email, password) {
        const query = this.db.prepare(`SELECT * FROM ${this.dbTableName} WHERE email = ? AND password = ? LIMIT 1`);
        const user = query.get(email, password);
        return user;
    }

    get db() {
        return User.#db;
    }
    get dbTableName() {
        return User.#dbTableName;
    }
    get dbImmutableFieldNames() {
        return ['email', 'password', 'userType', 'username'];
    }
    get dbImmutableFieldValues() {
        return [this.email, this.password, this.userType, this.username];
    }
    get id() {
        return this.#id;
    }
    get email() {
        return this.#email;
    }
    get password() {
        return this.#password;
    }
    get userType() {
        return this.#userType;
    }
    get username() {
        return this.#username;
    }
}