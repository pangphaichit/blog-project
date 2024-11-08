import * as pg from "pg";
const { Pool } = pg.default;
const pool = new Pool({
connectionString:
"postgresql://postgres:pstgrs1235@localhost:5432/my-blog",
});
export { pool };
