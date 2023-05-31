FROM node:18-alpine

ARG SHOPIFY_API_KEY dbeab1c55f0e6f9e2693f4fd2bbaf363
ENV SHOPIFY_API_SECRET c13179ab1c17869deb9b24ed432bde2c
ENV SHOPIFY_API_KEY dbeab1c55f0e6f9e2693f4fd2bbaf363
ENV PORT 8081
ENV HOST https://earthly-shopify-app-2-xg7jrfaima-uc.a.run.app
ENV SCOPES read_orders
ENV MONGODBCS mongodb+srv://earthlyapp:70JKQBvUUWkbLrWd@earthly.fkmgicj.mongodb.net/?retryWrites=true&w=majority
ENV TESTPAYMENT true
EXPOSE 8081
WORKDIR /app
COPY package*.json ./
COPY web .
RUN npm install
RUN npm install mongodb
RUN npm install dotenv
RUN cd frontend && npm install && npm run build
CMD ["npm", "run", "serve"]
