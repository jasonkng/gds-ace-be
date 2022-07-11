import pg from "pg";
const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnAuthorized: false,
      },
    } : {
      user: "postgres",
      password: "password",
      host: "localhost",
      port: "5432",
      database: "football"
    };

const pool = new Pool(poolConfig);
export default pool;
