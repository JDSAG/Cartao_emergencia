const { Pool } = require("pg");

const databaseUrl = new URL(process.env.DATABASE_URL);

databaseUrl.searchParams.delete("sslmode");
databaseUrl.searchParams.delete("sslcert");
databaseUrl.searchParams.delete("sslkey");
databaseUrl.searchParams.delete("sslrootcert");

module.exports = new Pool({
    connectionString: databaseUrl.toString(),
    ssl: {
        rejectUnauthorized: false
    }
});
