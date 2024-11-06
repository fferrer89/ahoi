import DB from '../../config/db.mjs';
import Database from './database.mjs';
import Image from "./image.mjs";
import Address from "./address.mjs";
import { BOAT_TYPES } from "../utils/constants.mjs";
export default class Boat { // Class that provides methods for creating and retrieving Boat
    static #db = DB.physicalDBConnection; // Database is open (similar to db.open()) // In-Memory database
    static #dbTableName = 'boats';
    // sqlite Data Types: NULL, INTEGER, REAL, TEXT, BLOB
    // createdAt → 1727270175
    // createdAtStr → 2024-09-25 13:16:15
    // TODO: Add available time db column and field
    static {
        Boat.db.exec(`
        CREATE TABLE IF NOT EXISTS ${Boat.#dbTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,        
            ownerId INTEGER NOT NULL,        
            addressId INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('${Object.values(BOAT_TYPES).join("', '")}')),
            pricePerHour INTEGER CHECK(pricePerHour >= 0),
            title TEXT CHECK(LENGTH(TRIM(title)) > 0),
            createdAt INTEGER DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
            createdAtStr TEXT DEFAULT (DATETIME('now')) NOT NULL,
            FOREIGN KEY(ownerId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(addressId) REFERENCES addresses(id) ON DELETE CASCADE
            ) STRICT`);
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
    #title;

    /**
     *
     * @param ownerId
     * @param addressId
     * @param type
     * @param {number} pricePerHour
     * @param title
     */
    constructor(ownerId, addressId, type, pricePerHour, title) {
        this.#ownerId = ownerId;
        this.#addressId = addressId;
        this.#type = type; // Sailboat, Motorboat
        this.#pricePerHour = pricePerHour;
        this.#title = title;
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
    static getBoatImagesFromDb(boatId) {
        const query = this.db.prepare(`SELECT * FROM ${Image.dbTableName} WHERE boatId = ?`);
        const images = query.get(boatId);
        return images;
    }
    static getBoatWithImageAndAddressFromDb(boatId) {
        const query = this.db.prepare(
            `SELECT * 
                 FROM ${this.dbTableName} 
                    INNER JOIN ${Address.dbTableName} on ${Address.dbTableName}.id = ${this.dbTableName}.addressId
                    INNER JOIN ${Image.dbTableName} on ${Image.dbTableName}.boatId = ${this.dbTableName}.id
                 WHERE ${this.dbTableName}.id = ? LIMIT 1`);
        const boat = query.get(boatId);
        return boat;
    }
    // static getBoatsWithImageAndAddressFromDb(state=null, city=null, boatType=null, ownerId=null) {
    //     let queryStr = `SELECT ${this.dbTableName}.id as boatId, ${this.dbTableName}.ownerId,
    //                                   ${this.dbTableName}.type as boatType, ${this.dbTableName}.pricePerHour,
    //                                   ${this.dbTableName}.title,
    //                                   ${Address.dbTableName}.city, ${Address.dbTableName}.state,
    //                                   ${Image.dbTableName}.id as imageId, ${Image.dbTableName}.pathName,
    //                                   ${Image.dbTableName}.name as imageName
    //                            FROM ${this.dbTableName}
    //                               INNER JOIN ${Address.dbTableName} on ${Address.dbTableName}.id = ${this.dbTableName}.addressId
    //                               INNER JOIN ${Image.dbTableName} on ${Image.dbTableName}.boatId = ${this.dbTableName}.id `;
    //     let boats, query;
    //     if (state && city && boatType) {
    //         queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${Address.dbTableName}.city = :city AND ${this.dbTableName}.type = :type`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ state, city, type:boatType });
    //     } else if (state && !city && !boatType) {
    //         queryStr += `WHERE ${Address.dbTableName}.state = :state`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ state });
    //     } else if (state && city && !boatType) {
    //         queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${Address.dbTableName}.city = :city`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ state, city });
    //     } else if (state && !city && boatType) {
    //         queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${this.dbTableName}.type = :type`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ state, type:boatType });
    //     } else if (!state && city && !boatType) {
    //         queryStr += `WHERE ${Address.dbTableName}.city = :city`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ city });
    //     } else if (!state && city && boatType) {
    //         queryStr += `WHERE ${Address.dbTableName}.city = :city AND ${this.dbTableName}.type = :type`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ city, type:boatType });
    //     } else if (!state && !city && boatType) {
    //         queryStr += `WHERE ${this.dbTableName}.type = :type`;
    //         query = this.db.prepare(queryStr);
    //         boats = query.all({ type:boatType });
    //     } else {
    //         query = this.db.prepare(queryStr);
    //         boats = query.all();
    //     }
    //     return boats;
    // }
    static getBoatsWithImageAndAddressFromDb(state=null, city=null, boatType=null, ownerId=null) {
        let queryStr = `SELECT ${this.dbTableName}.id as boatId, ${this.dbTableName}.ownerId, 
                                  ${this.dbTableName}.type as boatType, ${this.dbTableName}.pricePerHour,
                                  ${this.dbTableName}.title,
                                  ${Address.dbTableName}.city, ${Address.dbTableName}.state,
                                  GROUP_CONCAT(${Image.dbTableName}.id) AS imageIds
                               FROM ${this.dbTableName}
                                  INNER JOIN ${Address.dbTableName} on ${Address.dbTableName}.id = ${this.dbTableName}.addressId
                                  INNER JOIN ${Image.dbTableName} on ${Image.dbTableName}.boatId = ${this.dbTableName}.id
                                  `;
        let boats, query;
        if (state && city && boatType && ownerId) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${Address.dbTableName}.city = :city AND ${this.dbTableName}.type = :type AND ${this.dbTableName}.ownerId = :ownerId COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, city, type:boatType, ownerId });
        } else if (state && city && boatType) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${Address.dbTableName}.city = :city AND ${this.dbTableName}.type = :type COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, city, type:boatType });
        } else if (state && city && !boatType && ownerId) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${Address.dbTableName}.city = :city AND ${this.dbTableName}.ownerId = :ownerId COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, city, ownerId });
        } else if (state && city && !boatType) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${Address.dbTableName}.city = :city COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, city });
        } else if (state && !city && boatType && ownerId) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${this.dbTableName}.type = :type AND ${this.dbTableName}.ownerId = :ownerId COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, type:boatType, ownerId });
        } else if (state && !city && boatType) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${this.dbTableName}.type = :type COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, type:boatType });
        } else if (state && !city && !boatType && ownerId) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state AND ${this.dbTableName}.ownerId = :ownerId COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state, ownerId });
        } else if (state && !city && !boatType) {
            queryStr += `WHERE ${Address.dbTableName}.state = :state COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ state });
        } else if (!state && city && boatType && ownerId) {
            queryStr += `WHERE ${Address.dbTableName}.city = :city AND ${this.dbTableName}.type = :type AND ${this.dbTableName}.ownerId = :ownerId COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ city, type:boatType, ownerId });
        } else if (!state && city && boatType) {
            queryStr += `WHERE ${Address.dbTableName}.city = :city AND ${this.dbTableName}.type = :type COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ city, type:boatType });
        } else if (!state && city && !boatType && ownerId) {
            queryStr += `WHERE ${Address.dbTableName}.city = :city AND ${this.dbTableName}.ownerId = :ownerId COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ city, ownerId });
        } else if (!state && city && !boatType) {
            queryStr += `WHERE ${Address.dbTableName}.city = :city COLLATE NOCASE`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ city });
        } else if (!state && !city && boatType && ownerId) {
            queryStr += `WHERE ${this.dbTableName}.type = :type AND ${this.dbTableName}.ownerId = :ownerId`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ type:boatType, ownerId });
        } else if (!state && !city && boatType) {
            queryStr += `WHERE ${this.dbTableName}.type = :type`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ type:boatType });
        } else if (!state && !city && !boatType && ownerId) {
            queryStr += `WHERE ${this.dbTableName}.ownerId = :ownerId`;
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all({ ownerId });
        } else {
            queryStr += ` GROUP BY ${this.dbTableName}.id`;
            query = this.db.prepare(queryStr);
            boats = query.all();
        }
        return boats;
    }
    get db() {
        return Boat.#db;
    }
    get dbTableName() {
        return Boat.#dbTableName;
    }
    get dbImmutableFieldNames() {
        return ['ownerId', 'addressId', 'type', 'pricePerHour', 'title'];
    }
    get dbImmutableFieldValues() {
        return [this.ownerId, this.addressId, this.type, this.pricePerHour, this.title];
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
    get title() {
        return this.#title;
    }
}
