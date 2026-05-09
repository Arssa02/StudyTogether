
const mysql = require('mysql2/promise'); //library to talk to mysql database
// /promise means it uses async/await instead of callbacks
require('dotenv').config(); // load environment variables

// pool - instead of opening ONE connections, I create a pool of connections
// because many users -> many requests -> many DB queries
const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // if all connections are busy: wait instead of crashing
  connectionLimit: 10, // max 10 queries at the same time
  queueLimit: 0, // unlimited waiting requests 
                // if this was set to 5 for example only 5 requests could wait
});

module.exports = pool; // exports the pool meaning makes this pool available in other files