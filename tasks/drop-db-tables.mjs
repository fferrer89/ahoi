import DB from "../config/db.mjs";
let dBConnection = DB.physicalDBConnection;
// Remove all the data from the database
const query = dBConnection.prepare(`SELECT name FROM sqlite_master WHERE type = "table"`);
const dbTables = query.all();
dbTables?.forEach(table => {
    if (table?.name !== 'sqlite_sequence') {
        dBConnection?.exec(`DROP TABLE IF EXISTS ${table?.name}`);
    }
})