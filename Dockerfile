# Etapa 1: imagem base
FROM node:18-alpine

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia apenas arquivos necessários para instalar dependências
COPY package*.json ./

# Instala dependências (sem devDependencies em produção)
RUN npm install --only=production

# Copia o restante dos arquivos da aplicação
COPY . .

# Define variáveis de ambiente padrão
ENV PORT=3000
ENV MONGO_URL=mongodb://mongo:27017/leiturasdb

# Expõe a porta da aplicação
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
