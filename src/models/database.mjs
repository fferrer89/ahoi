export default class Database {
    /**
     * const insert = db.prepare(`INSERT INTO sessions (userId, expires) VALUES (?, ?)`);
     * const session = insert.run(userId, expires);
     *
     * @param data
     * @return number
     */
    static insert(data) {
        const dbTable = data.dbTableName;
        const fieldNames = data.dbImmutableFieldNames;
        const fieldValues = data.dbImmutableFieldValues;
        const insert = data.db.prepare(
            `INSERT INTO ${dbTable} (${fieldNames.join()}) VALUES (${'?,'.repeat(fieldValues.length).slice(0, -1)})`
        );
        const result = insert.run(...fieldValues); // { lastInsertRowid: 1, changes: 1 }
        return result.lastInsertRowid;
    }

    /**
     * Example:
     *    const updateStmt = db.prepare('UPDATE your_table SET column1 = ?, column2 = ? WHERE id = ?');
     *    updateStmt.run(new_value1, new_value2, id_of_record_to_update);
     * @param data
     * @return {StatementResultingChanges}
     */
    static updateAll(data) {
        const dbTable = data.dbTableName;
        const fieldNames = data.dbMutableFieldNames;
        const fieldValues = data.dbMutableFieldValues;

        const update = data.db.prepare(
            `UPDATE ${dbTable} SET ${fieldNames.map(val => `${val}=?`).join()} WHERE id = ?`
        );
        const record = update.run(...fieldValues.push(data.id));
        return record;
    }
    static update(data) {
        // TODO: update individual values
    }

    /**
     * const del = db.prepare(`DELETE FROM sessions WHERE id = ?`);
     * const result = del.run(data.id);
     *
     * @param data
     * @return {lastInsertRowid, changes}
     */
    static delete(data) {
        const dbTable = data.dbTableName;
        const del = data.db.prepare(`DELETE FROM ${dbTable} WHERE id = ?`);
        const result = del.run(data.id);
        return result; // {lastInsertRowid: 1, changes: 1}; or {lastInsertRowid: 1, changes: 0};
    }
    /**
     * const query = db.prepare(`SELECT id, userId, expires FROM sessions WHERE id = ? LIMIT 1`);
     * const result = query.get(id);
     *
     * @param db the database containing the database table (dbTable)
     * @param dbTable the database table name. For example: Session, User, Product, ....
     * @param recordId optional attribute
     * @return {unknown} either the record js object form with id 'recordId' or all the record in js object form in
     * the 'table'.
     */
    static query(db, dbTable, recordId) {
        if (recordId) {
            const query = db.prepare(`SELECT * FROM ${dbTable} WHERE id = ? LIMIT 1`);
            const record = query.get(recordId);
            return record;
        } else {
            const query = db.prepare(`SELECT * FROM ${dbTable}`);
            const records = query.get(recordId);
            return records;
        }
    }
}