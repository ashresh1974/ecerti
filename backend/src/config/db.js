require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql');
const util = require('util');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

db.query = util.promisify(db.query);

module.exports = db;
