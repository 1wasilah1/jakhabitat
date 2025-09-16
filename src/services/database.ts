const DB_CONFIG = {
  user: import.meta.env.VITE_DB_USER || 'system',
  password: import.meta.env.VITE_DB_PASSWORD || 'Pusd4t1n2025',
  connectString: import.meta.env.VITE_DB_CONNECT_STRING || '10.15.38.162:1539/FREEPDB1',
};

export class DatabaseService {
  private baseUrl = '/api/db';

  async query(sql: string, params: any[] = []) {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!response.ok) {
      throw new Error('Database query failed');
    }

    return response.json();
  }

  async execute(sql: string, params: any[] = []) {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!response.ok) {
      throw new Error('Database execute failed');
    }

    return response.json();
  }
}

export const dbService = new DatabaseService();