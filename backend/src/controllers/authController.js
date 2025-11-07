const { getDatabase } = require('../db/database');
const {
  generateId,
  hashPassword,
  comparePassword,
  generateToken,
  formatResponse
} = require('../utils/helpers');

class AuthController {
  static async register(req, res) {
    const { email, password, name, role = 'kasir', phone, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json(
        formatResponse(false, 'Email, password, and name are required')
      );
    }

    const db = getDatabase();
    
    try {
      // Check if user exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json(
          formatResponse(false, 'User already exists')
        );
      }

      const userId = generateId();
      const hashedPassword = await hashPassword(password);

      db.prepare(`
        INSERT INTO users (id, email, password, name, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, email, hashedPassword, name, role, phone, address);

      const token = generateToken({
        id: userId,
        email,
        name,
        role
      });

      res.status(201).json(
        formatResponse(true, 'User registered successfully', {
          user: { id: userId, email, name, role },
          token
        })
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Registration failed: ' + error.message)
      );
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required')
      );
    }

    const db = getDatabase();

    try {
      const user = db.prepare(`
        SELECT id, email, password, name, role, is_active
        FROM users WHERE email = ?
      `).get(email);

      if (!user) {
        return res.status(401).json(
          formatResponse(false, 'Invalid credentials')
        );
      }

      if (!user.is_active) {
        return res.status(403).json(
          formatResponse(false, 'User account is inactive')
        );
      }

      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json(
          formatResponse(false, 'Invalid credentials')
        );
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      res.json(
        formatResponse(true, 'Login successful', {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        })
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Login failed: ' + error.message)
      );
    }
  }

  static async logout(req, res) {
    // Token invalidation could be handled via blacklist in production
    res.json(
      formatResponse(true, 'Logout successful')
    );
  }

  static async getProfile(req, res) {
    const db = getDatabase();
    const userId = req.user.id;

    try {
      const user = db.prepare(`
        SELECT id, email, name, role, phone, address, created_at
        FROM users WHERE id = ?
      `).get(userId);

      if (!user) {
        return res.status(404).json(
          formatResponse(false, 'User not found')
        );
      }

      res.json(formatResponse(true, 'Profile retrieved', { user }));
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to retrieve profile: ' + error.message)
      );
    }
  }

  static async updateProfile(req, res) {
    const { name, phone, address, password } = req.body;
    const db = getDatabase();
    const userId = req.user.id;

    try {
      let updates = [];
      let params = [];

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }
      if (phone) {
        updates.push('phone = ?');
        params.push(phone);
      }
      if (address) {
        updates.push('address = ?');
        params.push(address);
      }
      if (password) {
        const hashedPassword = await hashPassword(password);
        updates.push('password = ?');
        params.push(hashedPassword);
      }

      if (updates.length === 0) {
        return res.status(400).json(
          formatResponse(false, 'No updates provided')
        );
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(userId);

      db.prepare(`
        UPDATE users SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...params);

      res.json(
        formatResponse(true, 'Profile updated successfully')
      );
    } catch (error) {
      res.status(500).json(
        formatResponse(false, 'Failed to update profile: ' + error.message)
      );
    }
  }
}

module.exports = AuthController;
