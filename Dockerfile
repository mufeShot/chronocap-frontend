# ----- Build stage -----
FROM node:20-alpine AS build
WORKDIR /app

# Sistemskie odvisnosti (če bi kdaj potreboval sharp / canvas ipd. – trenutno lahko ostane samo libc6-compat)
RUN apk add --no-cache libc6-compat

# Kopiraj samo manifest za hiter layer cache
COPY package*.json ./

# Deterministična namestitev
RUN npm ci

# Kopiraj ostalo kodo
COPY . .

# Proizvodni build
RUN npm run build

# ----- Runtime stage -----
FROM nginx:alpine AS prod
# Kopiraj build artefakte
COPY --from=build /app/dist /usr/share/nginx/html

# (Neobvezno) prilagojen nginx.conf če bi želel fallback na index.html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]