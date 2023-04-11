FROM node:18-alpine

ARG SHOPIFY_API_KEY fb26845c482a6b847e672021da8c185d
ENV SHOPIFY_API_SECRET 5d19779d86b5fe20cc0ef470e05d21de
ENV SHOPIFY_API_KEY fb26845c482a6b847e672021da8c185d
ENV PORT 8081
ENV HOST https://aminfri-xg7jrfaima-uc.a.run.app
ENV SCOPES read_orders
EXPOSE 8081
WORKDIR /app
COPY package*.json .
COPY web .
RUN npm install
RUN npm install mongodb
RUN cd frontend && npm install && npm run build
CMD ["npm", "run", "serve"]
