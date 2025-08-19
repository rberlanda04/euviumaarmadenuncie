# 🚀 Deploy do Backend - Instruções

## Opção 1: Railway (Recomendado)

### Passo a passo:

1. **Acesse [railway.app](https://railway.app)** e faça login com GitHub

2. **Clique em "New Project"** → **"Deploy from GitHub repo"**

3. **Selecione o repositório** `euviumaarmadenuncie`

4. **Configure o Root Directory:**
   - Clique em **Settings** → **General**
   - Em **Root Directory**, digite: `server`
   - Salve as alterações

5. **Configure as Variáveis de Ambiente:**
   - Vá em **Variables**
   - Adicione as seguintes variáveis:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://euviumaarmadenuncie.vercel.app
   DB_PATH=./database.sqlite
   ```

6. **Deploy Automático:**
   - O Railway fará o deploy automaticamente
   - Aguarde alguns minutos
   - Anote a URL gerada (ex: `https://seu-app.railway.app`)

### ✅ Vantagens do Railway:
- ✅ Deploy gratuito
- ✅ Banco SQLite funciona perfeitamente
- ✅ HTTPS automático
- ✅ Deploy automático via Git
- ✅ Logs em tempo real

---

## Opção 2: Render

### Passo a passo:

1. **Acesse [render.com](https://render.com)** e faça login

2. **Clique em "New"** → **"Web Service"**

3. **Conecte o repositório GitHub** `euviumaarmadenuncie`

4. **Configure o serviço:**
   - **Name:** `euviumaarmadenuncie-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Configure as Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   FRONTEND_URL=https://euviumaarmadenuncie.vercel.app
   DB_PATH=./database.sqlite
   ```

6. **Deploy:**
   - Clique em **Create Web Service**
   - Aguarde o deploy (pode demorar alguns minutos)

### ⚠️ Limitações do Render (plano gratuito):
- ⚠️ Aplicação "dorme" após 15 min de inatividade
- ⚠️ Pode demorar 30s+ para "acordar"
- ⚠️ 750 horas/mês de uso

---

## 📝 Após o Deploy:

### 1. Teste a API:
Acesse: `https://sua-url-do-backend.com/api/health`

Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 123.45
}
```

### 2. Atualize o Frontend:
- Vá no **Vercel Dashboard**
- Acesse o projeto `euviumaarmadenuncie`
- Vá em **Settings** → **Environment Variables**
- Edite `VITE_API_URL` para: `https://sua-url-do-backend.com/api`
- Faça um **Redeploy**

### 3. Teste a Aplicação:
- Acesse: `https://euviumaarmadenuncie.vercel.app`
- Teste fazer uma denúncia
- Verifique se aparece no mapa

---

## 🔧 Troubleshooting:

### Erro de CORS:
- ✅ Já configurado para aceitar requisições do Vercel
- ✅ Suporta múltiplas origens

### Erro de Banco de Dados:
- ✅ SQLite funciona em ambas as plataformas
- ✅ Banco é criado automaticamente

### Aplicação não responde (Render):
- ⏰ Aguarde 30-60 segundos (aplicação "acordando")
- 🔄 Tente novamente

---

## 💡 Dicas:

1. **Railway é mais confiável** para este projeto
2. **Render é gratuito** mas tem limitações
3. **Sempre teste** a URL da API antes de atualizar o frontend
4. **Monitore os logs** durante o primeiro deploy

---

**🎯 Próximo passo:** Após escolher uma plataforma e fazer o deploy, atualize a `VITE_API_URL` no Vercel!