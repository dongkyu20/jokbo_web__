var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'wjdqlqks1!',
    database: 'jokbo_db'
});
db.connect();

module.exports = db;