import DB from "../config/db.mjs";
let dBConnection = DB.physicalDBConnection;
// Remove all the data from the database
const query = dBConnection.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`);
const dbTables = query.all();
// console.info(dbTables);
dbTables?.forEach(table => {
    if (!table?.name?.startsWith('sqlite')) {
        console.log(`DROP TABLE IF EXISTS ${table?.name}`)
        // dBConnection?.exec(`DROP TABLE IF EXISTS ${table?.name}`); // FIXME: This returns an error, so I am manually deleting the tables below
    }
})

dBConnection?.exec(`DROP TABLE IF EXISTS addresses`);
dBConnection?.exec(`DROP TABLE IF EXISTS boats`);
dBConnection?.exec(`DROP TABLE IF EXISTS images`);
dBConnection?.exec(`DROP TABLE IF EXISTS users`);
DB.closePhysicalDBConnection();