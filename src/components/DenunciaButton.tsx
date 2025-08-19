import React, { useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
}

interface DenunciaButtonProps {
  onDenunciaSubmitted?: (location: Location) => void;
}

export const DenunciaButton: React.FC<DenunciaButtonProps> = ({ onDenunciaSubmitted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada neste navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMsg = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMsg = 'Tempo limite para obter localização';
              break;
          }
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const submitDenuncia = async (location: Location): Promise<void> => {
    const response = await fetch('http://localhost:3001/api/denuncias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    return response.json();
  };

  const handleDenuncia = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const location = await getCurrentLocation();
      
      // Enviar denúncia para a API
      await submitDenuncia(location);
      
      setStatus('success');
      onDenunciaSubmitted?.(location);
      
      // Reset status após 3 segundos
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Reset status após 5 segundos
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Obtendo localização...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle size={18} className="me-2" />
          Denúncia enviada!
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <XCircle size={18} className="me-2" />
          Erro ao enviar
        </>
      );
    }

    return (
      <>
        <AlertTriangle size={18} className="me-2" />
        DENUNCIAR ARMA
      </>
    );
  };

  const getButtonVariant = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'danger';
    return 'danger';
  };

  return (
    <div className="d-flex flex-column align-items-center w-100" style={{ maxWidth: '28rem', margin: '0 auto' }}>
      <Button
        onClick={handleDenuncia}
        disabled={isLoading}
        variant={getButtonVariant()}
        size="lg"
        className="btn-denuncia fw-bold py-3 px-4 w-100 mb-3"
        style={{ minWidth: '280px', fontSize: '1.1rem' }}
        aria-describedby={errorMessage ? 'error-message' : status === 'idle' ? 'help-text' : undefined}
      >
        {getButtonContent()}
      </Button>
      
      {errorMessage && (
        <Alert 
          variant="danger" 
          className="text-center small mb-0 py-2"
          id="error-message"
          role="alert"
        >
          {errorMessage}
        </Alert>
      )}
      
      {status === 'idle' && (
        <div 
          id="help-text"
          className="text-muted small text-center px-2"
          aria-live="polite"
        >
          Clique para denunciar a presença de arma nesta localização
        </div>
      )}
      
      {status === 'success' && (
        <Alert 
          variant="success" 
          className="text-center small mb-0 py-2"
          role="status"
        >
          Denúncia registrada com sucesso! Obrigado por contribuir com a segurança.
        </Alert>
      )}
    </div>
  );
};