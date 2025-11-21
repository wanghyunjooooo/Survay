const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: "hjwang",
    host: "221.148.75.44",
    database: "hjwang_db",
    password: "reinno@1583",
    port: 5432,
});

module.exports = pool;
