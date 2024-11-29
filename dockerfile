# Usa una imagen base de Node.js compatible
FROM node:18-alpine

# Instala herramientas necesarias para módulos nativos
RUN apk add --no-cache libc6-compat python3 make g++ bash

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para dependencias
COPY package.json package-lock.json ./

# Instala TODAS las dependencias
RUN npm install

# Copia el resto de los archivos
COPY . .

# Construye el proyecto
RUN npm run build

# Limpia dependencias innecesarias para producción
RUN npm prune --production

# Expone el puerto que utiliza Strapi
EXPOSE 1337

# Comando para iniciar la aplicación
CMD ["npm", "start"]
