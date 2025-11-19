const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const commonMiddleware = () => {
  return (req, res, next) => {
    next();
  };
};

const setupMiddleware = (app) => {
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
};

module.exports = { commonMiddleware, setupMiddleware };