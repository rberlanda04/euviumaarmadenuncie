// Configuração da API
export const API_CONFIG = {
  // URL base da API - será substituída quando o backend estiver em produção
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Endpoints
  ENDPOINTS: {
    DENUNCIAS: '/denuncias',
    STATS: '/stats',
    HEALTH: '/health'
  },
  
  // Configurações de timeout
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Função para verificar se estamos em produção sem backend
export const isProductionWithoutBackend = () => {
  return import.meta.env.PROD && (API_CONFIG.BASE_URL.includes('localhost') || API_CONFIG.BASE_URL.includes('api-mock-temp'));
};

// Mock data para quando não há backend disponível
export const MOCK_DATA = {
  estatisticas: {
    total: 0,
    hoje: 0,
    semana: 0
  },
  denuncias: []
};