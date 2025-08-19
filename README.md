# Sistema de Denúncias Anônimas

Um sistema web para denúncias anônimas com geolocalização, desenvolvido com React e Node.js.

## 🚀 Funcionalidades

- **Denúncias Anônimas**: Sistema seguro para envio de denúncias sem identificação
- **Geolocalização**: Captura automática da localização do usuário
- **Mapa Interativo**: Visualização das denúncias em mapa usando Leaflet/OpenStreetMap
- **Interface Responsiva**: Design moderno e acessível com React Bootstrap
- **API RESTful**: Backend robusto com Node.js e Express
- **Banco de Dados**: Armazenamento seguro com SQLite

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18 com TypeScript
- Vite (build tool)
- React Bootstrap (UI framework)
- Leaflet (mapas interativos)
- Geolocation API

### Backend
- Node.js
- Express.js
- SQLite3
- CORS
- dotenv

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/euviumaarmadenuncie.git
cd euviumaarmadenuncie
```

### 2. Instale as dependências do frontend
```bash
npm install
```

### 3. Instale as dependências do backend
```bash
cd server
npm install
```

### 4. Configure as variáveis de ambiente
Crie um arquivo `.env` na pasta `server` com:
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 5. Execute o backend
```bash
cd server
npm run dev
```

### 6. Execute o frontend (em outro terminal)
```bash
npm run dev
```

## 🚀 Deploy

### Vercel (Frontend)
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente de produção
3. Deploy automático a cada push

### Backend
O backend pode ser deployado em:
- Railway
- Render
- Heroku
- DigitalOcean

## 📁 Estrutura do Projeto

```
euviumaarmadenuncie/
├── public/                 # Arquivos públicos
├── src/                   # Código fonte do frontend
│   ├── components/        # Componentes React
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Ponto de entrada
├── server/               # Backend Node.js
│   ├── index.js         # Servidor Express
│   └── package.json     # Dependências do backend
├── package.json         # Dependências do frontend
└── README.md           # Este arquivo
```

## 🔒 Segurança

- Denúncias completamente anônimas
- Validação de dados no backend
- CORS configurado adequadamente
- Sanitização de inputs
- Geolocalização opcional

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para tornar o mundo um lugar mais seguro**
