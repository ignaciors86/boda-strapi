# Usa una imagen base de Node.js compatible
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instala TODAS las dependencias (incluye devDependencies porque `build` puede requerirlas)
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación (esto genera los archivos para producción)
RUN npm run build

# Elimina las dependencias innecesarias para producción
RUN npm prune --production

# Expone el puerto que utiliza Strapi
EXPOSE 1337

# Comando para iniciar Strapi
CMD ["npm", "start"]

