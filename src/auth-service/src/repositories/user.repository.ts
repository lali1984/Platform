import pool from '../config/database';
import { User, CreateUserDTO } from '../types/user';

export class UserRepository {
  private tableName = 'users';

  async create(userData: CreateUserDTO): Promise<User> {
    const query = `
      INSERT INTO ${this.tableName} (email, password_hash)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userData.email, userData.password]);
    return result.rows[0];
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    // Собираем поля для обновления
    const keys = Object.keys(updateData);
    if (keys.length === 0) {
      return this.findById(id); // Если нечего обновлять, возвращаем текущие данные
    }
    
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = keys.map(key => (updateData as any)[key]);
    
    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  async findById(id: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  async updateTwoFactorSecret(userId: string, secret: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName} 
      SET two_factor_secret = $1, two_factor_enabled = true, updated_at = NOW()
      WHERE id = $2
    `;
    
    await pool.query(query, [secret, userId]);
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName} 
      SET two_factor_secret = NULL, two_factor_enabled = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
  }
}

export default new UserRepository();