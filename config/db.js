const { Pool } = require("pg");
const pool = new Pool({
  connectionString:
    "postgresql://aiganym:6TH0JTO85jdGWgq8Ue6sBluKqiRVS8jb@dpg-d28g73qdbo4c73ficna0-a.oregon-postgres.render.com/qosyl_db",
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
