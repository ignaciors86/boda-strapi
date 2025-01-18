# Usa una imagen base de Node.js
FROM node:18-alpine

# Instala herramientas del sistema necesarias para compilar módulos nativos
RUN apk add --no-cache libc6-compat python3 make g++ bash

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instala TODAS las dependencias (incluye devDependencies)
RUN npm install --legacy-peer-deps

# Copia el archivo .env al contenedor para la configuración de Strapi
COPY .env .env

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación Strapi para producción
RUN npm run build

# Elimina dependencias innecesarias para producción
RUN npm prune --production

# Expone el puerto que utiliza Strapi
EXPOSE 1337

# Comando para iniciar Strapi en modo producción
CMD ["npm", "start"]
