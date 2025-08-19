const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting específico para denúncias
const denunciaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 denúncias por IP por hora
  message: {
    error: 'Limite de denúncias excedido. Tente novamente em 1 hora.',
    code: 'DENUNCIA_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar tabela de denúncias se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS denuncias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err.message);
    } else {
      console.log('Tabela de denúncias criada/verificada com sucesso.');
    }
  });
});

// Middleware para adicionar db ao request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Função de validação de coordenadas
const validateCoordinates = (latitude, longitude) => {
  // Verificar se são números válidos
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Latitude e longitude devem ser números válidos' };
  }
  
  // Validar range de coordenadas
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { valid: false, error: 'Coordenadas fora do range válido' };
  }
  
  // Validar precisão (máximo 6 casas decimais)
  if (latitude.toString().split('.')[1]?.length > 6 || longitude.toString().split('.')[1]?.length > 6) {
    return { valid: false, error: 'Coordenadas com precisão excessiva' };
  }
  
  return { valid: true, lat, lng };
};

// Rota para criar uma nova denúncia
app.post('/api/denuncias', denunciaLimiter, (req, res) => {
  const { latitude, longitude } = req.body;
  
  // Validação básica
  if (!latitude || !longitude) {
    return res.status(400).json({
      error: 'Latitude e longitude são obrigatórias',
      code: 'MISSING_COORDINATES'
    });
  }
  
  // Validar coordenadas
  const validation = validateCoordinates(latitude, longitude);
  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
      code: 'INVALID_COORDINATES'
    });
  }
  
  const { lat, lng } = validation;
  
  // Capturar informações de segurança
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  const stmt = req.db.prepare(`
    INSERT INTO denuncias (latitude, longitude, ip_address, user_agent)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run([lat, lng, ipAddress, userAgent], function(err) {
    if (err) {
      console.error('Erro ao inserir denúncia:', err.message);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }
    
    console.log(`Nova denúncia registrada: ID ${this.lastID}, IP: ${ipAddress}`);
    
    res.status(201).json({
      id: this.lastID,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      message: 'Denúncia registrada com sucesso'
    });
  });
  
  stmt.finalize();
});

// Rota para buscar denúncias
app.get('/api/denuncias', (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  
  if (isNaN(limitNum) || isNaN(offsetNum) || limitNum < 1 || limitNum > 1000 || offsetNum < 0) {
    return res.status(400).json({
      error: 'Parâmetros de paginação inválidos. Limit deve estar entre 1-1000 e offset >= 0.',
      code: 'INVALID_PAGINATION'
    });
  }
  
  req.db.all(`
    SELECT id, latitude, longitude, timestamp
    FROM denuncias
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `, [limitNum, offsetNum], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar denúncias:', err.message);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }
    
    // Contar total de denúncias
    req.db.get('SELECT COUNT(*) as total FROM denuncias', (err, countRow) => {
      if (err) {
        console.error('Erro ao contar denúncias:', err.message);
        return res.status(500).json({
          error: 'Erro interno do servidor',
          code: 'DATABASE_ERROR'
        });
      }
      
      res.json({
        denuncias: rows,
        total: countRow.total,
        limit: limitNum,
        offset: offsetNum
      });
    });
  });
});

// Rota para estatísticas
app.get('/api/estatisticas', (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) as count FROM denuncias',
    hoje: `SELECT COUNT(*) as count FROM denuncias WHERE DATE(timestamp) = DATE('now')`,
    semana: `SELECT COUNT(*) as count FROM denuncias WHERE timestamp >= datetime('now', '-7 days')`,
    mes: `SELECT COUNT(*) as count FROM denuncias WHERE timestamp >= datetime('now', '-30 days')`
  };
  
  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  let hasError = false;
  
  Object.entries(queries).forEach(([key, query]) => {
    req.db.get(query, (err, row) => {
      if (err && !hasError) {
        hasError = true;
        console.error(`Erro ao buscar estatística ${key}:`, err.message);
        return res.status(500).json({
          error: 'Erro interno do servidor ao buscar estatísticas',
          code: 'STATISTICS_ERROR'
        });
      }
      
      if (!hasError) {
        stats[key] = row ? row.count : 0;
        
        completed++;
        if (completed === total) {
          res.json(stats);
        }
      }
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  
  // Não enviar resposta se já foi enviada
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nEncerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco de dados:', err.message);
    } else {
      console.log('Conexão com banco de dados fechada.');
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;