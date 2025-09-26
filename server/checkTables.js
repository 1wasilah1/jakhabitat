import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'Pusd4t1n2025',
  connectString: process.env.DB_CONNECT_STRING || '10.15.38.162:1539/FREEPDB1',
};

async function checkTables() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(
      `SELECT table_name FROM user_tables WHERE table_name LIKE '%JAKHABITAT%' ORDER BY table_name`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('Tables found:');
    result.rows.forEach(row => {
      console.log('- ' + row.TABLE_NAME);
    });
    
    return result.rows;
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

checkTables();