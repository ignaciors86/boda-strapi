# Usa una imagen compatible
FROM node:18-alpine

# Instala dependencias básicas del sistema
RUN apk add --no-cache libc6-compat python3 make g++

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios
COPY package*.json ./

# Instala TODAS las dependencias (incluye devDependencies)
RUN npm install

# Copia el resto de los archivos
COPY . .

# Construye la aplicación
RUN npm run build

# Limpia dependencias de desarrollo
RUN npm prune --production

# Expone el puerto de Strapi
EXPOSE 1337

# Comando para iniciar Strapi
CMD ["npm", "start"]