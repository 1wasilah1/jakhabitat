import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'Pusd4t1n2025',
  connectString: process.env.DB_CONNECT_STRING || '10.15.38.162:1539/FREEPDB1',
};

export async function deletePanorama(id) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    console.log('Deleting panorama with ID:', id);
    
    const result = await connection.execute(
      `DELETE FROM WEBSITE_JAKHABITAT_PANORAMAS WHERE ID = :id`,
      { id: parseInt(id) },
      { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('Delete panorama result:', result.rowsAffected);
    
    return { rowsAffected: result.rowsAffected, success: true };
  } catch (error) {
    console.error('Delete panorama error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}