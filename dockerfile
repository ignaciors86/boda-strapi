# Usa una imagen de Node.js compatible
FROM node:18-alpine

# Instala herramientas del sistema para construir módulos nativos
RUN apk add --no-cache libc6-compat python3 make g++ bash

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instala TODAS las dependencias (incluye devDependencies porque 'build' puede necesitarlas)
RUN npm install

# Copia el resto de los archivos
COPY . .

# Construye la aplicación
RUN npm run build

# Limpia dependencias innecesarias después del build
RUN npm prune --production

# Expone el puerto que utiliza Strapi
EXPOSE 1337

# Comando para iniciar Strapi
CMD ["npm", "start"]
