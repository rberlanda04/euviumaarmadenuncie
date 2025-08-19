import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { DenunciaButton } from './components/DenunciaButton';
import { MapaDenuncias } from './components/MapaDenuncias';
import { Shield, MapPin, RefreshCw } from 'lucide-react';

interface Denuncia {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface Estatisticas {
  total: number;
  hoje: number;
  semana: number;
  mes: number;
}

function App() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    hoje: 0,
    semana: 0,
    mes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchEstatisticas = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/estatisticas`);
      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchDenuncias = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/denuncias?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setDenuncias(data.denuncias || []);
      }
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchEstatisticas(), fetchDenuncias()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDenunciaSubmitted = () => {
    // Recarregar dados após nova denúncia
    loadData();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom" role="banner">
        <Container className="py-4">
          <Row className="justify-content-center">
            <Col xs="auto" className="d-flex align-items-center">
              <Shield size={32} className="text-danger me-3" aria-hidden="true" />
              <div className="text-center">
                <h1 className="h2 fw-bold text-dark mb-1">
                  EU VI UMA ARMA - DENUNCIE
                </h1>
                <p className="text-muted mb-0">
                  Sistema de denúncia anônima para presença de armas
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Content */}
      <main role="main">
        <Container className="py-5">
          <section className="text-center mb-5" aria-labelledby="main-heading">
            <Row className="justify-content-center">
              <Col lg={8}>
                <h2 id="main-heading" className="display-4 fw-bold text-dark mb-4">
                  Viu uma arma? Denuncie agora!
                </h2>
                <p className="lead text-muted mb-4">
                  Sua denúncia é anônima e ajuda a manter nossa comunidade mais segura. 
                  Ao clicar no botão, sua localização atual será registrada automaticamente.
                </p>
                
                <DenunciaButton onDenunciaSubmitted={handleDenunciaSubmitted} />
              </Col>
            </Row>
          </section>

          {/* Estatísticas */}
          <section aria-labelledby="stats-heading">
            <Card className="card-custom mb-4">
              <Card.Body>
                <Row className="align-items-center mb-3">
                  <Col>
                    <h3 id="stats-heading" className="h5 fw-semibold text-dark d-flex align-items-center mb-0">
                      <MapPin size={20} className="text-danger me-2" aria-hidden="true" />
                      Estatísticas de Denúncias
                    </h3>
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={loadData}
                      disabled={isLoading}
                      aria-label="Atualizar estatísticas"
                    >
                      <RefreshCw size={16} className={isLoading ? 'me-2' : 'me-2'} aria-hidden="true" />
                      Atualizar
                    </Button>
                  </Col>
                </Row>
          
                {isLoading ? (
                  <div className="text-center py-5 text-muted" role="status" aria-live="polite">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span className="sr-only">Carregando</span>
                    Carregando estatísticas...
                  </div>
                ) : (
                  <Row className="g-3 mb-4">
                    <Col xs={6} lg={3}>
                      <div className="bg-danger bg-opacity-10 rounded p-3 text-center" role="region" aria-label="Total de denúncias">
                        <div className="h4 fw-bold text-danger mb-1">
                          {estatisticas.total}
                        </div>
                        <div className="small text-muted">
                          Total
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} lg={3}>
                      <div className="bg-warning bg-opacity-10 rounded p-3 text-center" role="region" aria-label="Denúncias de hoje">
                        <div className="h4 fw-bold text-warning mb-1">
                          {estatisticas.hoje}
                        </div>
                        <div className="small text-muted">
                          Hoje
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} lg={3}>
                      <div className="bg-info bg-opacity-10 rounded p-3 text-center" role="region" aria-label="Denúncias desta semana">
                        <div className="h4 fw-bold text-info mb-1">
                          {estatisticas.semana}
                        </div>
                        <div className="small text-muted">
                          Esta semana
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} lg={3}>
                      <div className="bg-success bg-opacity-10 rounded p-3 text-center" role="region" aria-label="Denúncias deste mês">
                        <div className="h4 fw-bold text-success mb-1">
                          {estatisticas.mes}
                        </div>
                        <div className="small text-muted">
                          Este mês
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}
          
                {/* Lista das últimas denúncias */}
                {denuncias.length > 0 && (
                  <div role="region" aria-labelledby="recent-reports">
                    <h4 id="recent-reports" className="h6 fw-medium text-dark mb-3">Últimas denúncias:</h4>
                    <div style={{ maxHeight: '16rem', overflowY: 'auto' }}>
                      {denuncias.map((denuncia) => (
                        <div key={denuncia.id} className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between bg-light rounded p-3 mb-2 small">
                          <div className="d-flex align-items-center mb-1 mb-sm-0">
                            <MapPin size={16} className="text-muted me-2 flex-shrink-0" aria-hidden="true" />
                            <span className="text-break">
                              Lat: {denuncia.latitude.toFixed(6)}, 
                              Lng: {denuncia.longitude.toFixed(6)}
                            </span>
                          </div>
                          <span className="text-muted">
                            {formatTimestamp(denuncia.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </section>

          {/* Mapa de Denúncias */}
          <section aria-labelledby="map-heading">
            <Card className="card-custom mb-4">
              <Card.Body>
                <h3 id="map-heading" className="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
                  <MapPin size={20} className="text-danger me-2" aria-hidden="true" />
                  Mapa de Denúncias
                </h3>
                <p className="text-muted mb-3 small">
                  Visualize as denúncias registradas no mapa. Cada marcador representa uma denúncia anônima.
                </p>
                <div className="w-100 overflow-hidden rounded">
                  <MapaDenuncias 
                    denuncias={denuncias} 
                    height="400px"
                  />
                </div>
              </Card.Body>
            </Card>
          </section>

          {/* Informações importantes */}
          <section aria-labelledby="important-info">
            <Alert variant="warning" className="mb-4">
              <h3 id="important-info" className="h6 fw-semibold mb-3 d-flex align-items-center">
                <span className="me-2" aria-hidden="true">⚠️</span>
                Informações Importantes
              </h3>
              <ul className="mb-0 small" role="list">
                <li className="d-flex align-items-start mb-2">
                  <span className="me-2 mt-1 flex-shrink-0">•</span>
                  <span>Suas denúncias são completamente anônimas</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <span className="me-2 mt-1 flex-shrink-0">•</span>
                  <span>Apenas a localização é registrada, não dados pessoais</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <span className="me-2 mt-1 flex-shrink-0">•</span>
                  <span>Em caso de emergência, ligue <strong>190</strong></span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-2 mt-1 flex-shrink-0">•</span>
                  <span>Este sistema é para denúncias preventivas</span>
                </li>
              </ul>
            </Alert>
          </section>
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5" role="contentinfo">
        <Container className="text-center">
          <p className="text-light mb-2">
            Sistema desenvolvido para promover a segurança comunitária
          </p>
          <p className="text-muted small mb-0">
            © 2024 EU VI UMA ARMA - DENUNCIE
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
