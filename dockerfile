# Usa una imagen base compatible con módulos nativos
FROM node:18-alpine

# Instala herramientas esenciales para compilar módulos nativos
RUN apk add --no-cache libc6-compat python3 make g++ bash

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY package.json package-lock.json ./

# Instala TODAS las dependencias necesarias para la compilación
RUN npm install

# Copia el resto de los archivos
COPY . .

# Construye la aplicación
RUN npm run build

# Limpia dependencias innecesarias para producción
RUN npm prune --production

# Expone el puerto de Strapi
EXPOSE 1337

# Comando para iniciar la aplicación
CMD ["npm", "start"]
