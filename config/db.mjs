import path from "node:path";
import {DatabaseSync} from "node:sqlite";
import { createDirectoryIfNotExists } from "../src/utils/helpers.mjs";

/**
 * This class contains the databases (physical and in-memory) used by the ahoi application.
 *
 * The best place to store the SQLite database file in a Node.js:
 *  - Development: Store the database file in the project directory. This makes it easy to access and manage during
 *  development.
 *  - Production: Store the database file in a directory outside the project directory, such as the application's
 *  data directory. This helps to protect the database file from accidental deletion or modification.
 *  - macOS:
 *       - For user-specific data, use the '~/Library/Application Support' directory in your home (~). IMP
 *          - For example, '~/Library/Application Support/ahoi/ahoi.db'
 *       - For application-specific data, use the '/Library/Application Support' directory in your root (/).
 *          - For example, '/Library/Application Support/ahoi/ahoi.db'
 *  - Linux (IMP):
 *       - For user-specific data, use the ~/.config directory in your home (~). IMP
 *          - For example, '~/.config/ahoi/ahoi.db' (create the 'ahoi' directory inside '~/.config' first)
 *       - For application-specific data, use the /etc directory in your root (/).
 *          - For example, '/etc/Ahoi/ahoi.db' (create the 'ahoi' directory inside '/etc' first)
 */
export default class DB {
    static #inMemoryDBConnection;
    static #physicalDBConnection;
    static #physicalDBConnectionPath;

    /**
     * Static initialization block is executed when this module (db.mjs) is first loaded. This means that the code
     * within the block runs only once, before any other code in the module is executed. The static initialization code
     * is executed only once, even if multiple files load this module (db.mjs).
     */
    static {
        // Create a directory to store ahoi-related files (including its db)
        const ahoiDirPath = path.join(process.env.HOME, '.config/ahoi'); // /Users/kikoferrer/.config/ahoi
        createDirectoryIfNotExists(ahoiDirPath);
        this.#physicalDBConnectionPath = path.join(process.env.HOME, '.config/ahoi/ahoi.db'); // /Users/kikoferrer/.config/ahoi;
        this.#physicalDBConnection = new DatabaseSync(this.#physicalDBConnectionPath); // Database is open (similar to db.open());
        this.#inMemoryDBConnection = new DatabaseSync(':memory:'); // Database is open (similar to db.open());
    }

    /**
     * Create a File-backed database to store user-specific app data (users, boats, purchases, ...)
     *
     * @return {*|module:node:sqlite.DatabaseSync}
     */
    static get physicalDBConnection() {
        return this.#physicalDBConnection
    }
    /**
     * Create an In-Memory db to store session data (https://www.sqlite.org/draft/inmemorydb.html)
     *
     * @return {*|module:node:sqlite.DatabaseSync}
     */
    static get inMemoryDBConnection() {
        return this.#inMemoryDBConnection
    }
    static closePhysicalDBConnection() {
        if (this.#physicalDBConnection) {
            this.#physicalDBConnection.close();
        }
    }
    static closeInMemoryDBConnection() {
        if (this.#inMemoryDBConnection) {
            this.#inMemoryDBConnection.close();
        }
    }
}

