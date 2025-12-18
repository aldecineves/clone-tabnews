import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnetionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnetionsValue =
    databaseMaxConnetionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnetionsResult = await database.query({
    text: "SELECT count (*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnetionsValue =
    databaseOpenedConnetionsResult.rows[0].count;

  // Máximo de conexões
  const maxConnResult = await database.query("SHOW max_connections;");
  const maxConnections = maxConnResult.rows[0].max_connections;

  // Conexões ativas
  const usedConnResult = await database.query(
    "SELECT COUNT(*) AS used_connections FROM pg_stat_activity;",
  );
  const usedConnections = usedConnResult.rows[0].used_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnetionsValue),
        opened_connections: databaseOpenedConnetionsValue,
      },
    },

    used_connections: usedConnections,
  });
}

export default status;
