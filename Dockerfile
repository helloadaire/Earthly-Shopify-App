FROM node:18-alpine

ARG SHOPIFY_API_KEY xxx
ENV SHOPIFY_API_SECRET xxx
ENV SHOPIFY_API_KEY xxx
ENV PORT 8081
ENV HOST https://xxx
ENV SCOPES read_orders
EXPOSE 8081
WORKDIR /app
COPY package*.json .
COPY web .
RUN npm install
RUN npm install mongodb
RUN cd frontend && npm install && npm run build
CMD ["npm", "run", "serve"]
