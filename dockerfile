# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Instala herramientas necesarias para dependencias nativas
RUN apk add --no-cache libc6-compat python3 make g++ bash

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instala TODAS las dependencias necesarias (incluye devDependencies)
RUN npm install --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para producción
COPY package.json package-lock.json ./
RUN npm install --production --legacy-peer-deps

# Copia la aplicación construida desde la etapa anterior
COPY --from=builder /app/build ./build

# Elimina herramientas del sistema para reducir el tamaño de la imagen
RUN apk del python3 make g++

# Expone el puerto que usa la aplicación
EXPOSE 1337

# Comando para iniciar la aplicación
CMD ["npm", "start"]
