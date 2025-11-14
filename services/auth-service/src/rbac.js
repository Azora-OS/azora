const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-2025';

const getRolePermissions = (role) => {
  const rolePermissions = {
    'ADMIN': [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'payment:create', 'payment:read', 'payment:update', 'payment:delete',
      'course:create', 'course:read', 'course:update', 'course:delete',
      'system:admin'
    ],
    'EDUCATOR': [
      'course:create', 'course:read', 'course:update',
      'user:read', 'payment:read'
    ],
    'STUDENT': [
      'course:read', 'user:read', 'payment:create'
    ]
  };

  return rolePermissions[role] || [];
};

const getPermissions = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const permissions = getRolePermissions(user.role);

    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
};

module.exports = { getPermissions };
