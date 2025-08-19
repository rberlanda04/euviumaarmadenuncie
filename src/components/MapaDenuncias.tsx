import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone customizado para denúncias
const denunciaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Denuncia {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface MapaDenunciasProps {
  denuncias: Denuncia[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const MapaDenuncias: React.FC<MapaDenunciasProps> = ({
  denuncias,
  center = [-23.5505, -46.6333], // São Paulo como padrão
  zoom = 10,
  height = '400px'
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Calcular centro baseado nas denúncias se houver
  const getMapCenter = (): [number, number] => {
    if (denuncias.length === 0) return center;
    
    const latSum = denuncias.reduce((sum, d) => sum + d.latitude, 0);
    const lngSum = denuncias.reduce((sum, d) => sum + d.longitude, 0);
    
    return [
      latSum / denuncias.length,
      lngSum / denuncias.length
    ];
  };

  // Não renderizar no servidor (SSR)
  if (!isClient) {
    return (
      <div 
        className="bg-light rounded d-flex align-items-center justify-content-center"
        style={{ height }}
      >
        <div className="text-muted">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div className="w-100 rounded overflow-hidden shadow">
      <MapContainer
        center={getMapCenter()}
        zoom={denuncias.length > 0 ? 12 : zoom}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {denuncias.map((denuncia) => (
          <Marker
            key={denuncia.id}
            position={[denuncia.latitude, denuncia.longitude]}
            icon={denunciaIcon}
          >
            <Popup>
              <div className="small">
                <div className="fw-semibold text-danger mb-2">
                  🚨 Denúncia de Arma
                </div>
                <div>
                  <div className="mb-1">
                    <strong>ID:</strong> #{denuncia.id}
                  </div>
                  <div className="mb-1">
                    <strong>Coordenadas:</strong><br />
                    Lat: {denuncia.latitude.toFixed(6)}<br />
                    Lng: {denuncia.longitude.toFixed(6)}
                  </div>
                  <div className="mb-1">
                    <strong>Data/Hora:</strong><br />
                    {formatTimestamp(denuncia.timestamp)}
                  </div>
                </div>
                <div className="mt-2" style={{fontSize: '0.75rem', color: '#6c757d'}}>
                  Denúncia anônima registrada no sistema
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {denuncias.length === 0 && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="bg-white p-4 rounded text-center">
            <div className="text-muted mb-2">📍</div>
            <div className="small text-secondary">
              Nenhuma denúncia registrada ainda
            </div>
          </div>
        </div>
      )}
    </div>
  );
};