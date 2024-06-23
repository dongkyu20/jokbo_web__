var mysql = require('mysql2');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '3604',
    database: 'jokbo_db'
});
db.connect();

module.exports = db;