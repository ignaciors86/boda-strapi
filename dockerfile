# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Instalar herramientas necesarias para dependencias nativas
RUN apk add --no-cache libc6-compat python3 make g++ bash

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instala TODAS las dependencias (incluye devDependencies)
RUN npm install --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# Construye el proyecto Strapi
RUN npm run build --loglevel verbose

# Etapa 2: Producción
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias para producción
COPY package.json package-lock.json ./
RUN npm install --production --legacy-peer-deps

# Copiar archivos construidos desde la etapa de construcción
COPY --from=builder /app/build ./build

# Copiar configuraciones y otros archivos necesarios
COPY ./public ./public
COPY ./config ./config
COPY ./src ./src

# Establece las variables de entorno predeterminadas para producción
ENV NODE_ENV=production

# Expone el puerto utilizado por Strapi
EXPOSE 1337

# Comando para iniciar la aplicación Strapi
CMD ["npm", "start"]
