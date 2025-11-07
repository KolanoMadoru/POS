const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function generateId() {
  return uuidv4();
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function formatResponse(success, message, data = null) {
  return {
    success,
    message,
    ...(data && { data })
  };
}

function formatPrice(price) {
  return Math.round(price * 100) / 100;
}

function calculateTax(subtotal, taxPercent = 0) {
  return formatPrice((subtotal * taxPercent) / 100);
}

function calculateDiscount(subtotal, discountPercent = 0) {
  return formatPrice((subtotal * discountPercent) / 100);
}

function calculateTotal(subtotal, discount = 0, tax = 0) {
  return formatPrice(subtotal - discount + tax);
}

module.exports = {
  generateId,
  hashPassword,
  comparePassword,
  generateToken,
  formatResponse,
  formatPrice,
  calculateTax,
  calculateDiscount,
  calculateTotal
};
