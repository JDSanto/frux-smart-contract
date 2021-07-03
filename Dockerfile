FROM node:16.3.0
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --ignore-scripts
ARG MNEMONIC
ENV MNEMONIC $MNEMONIC
ARG INFURA_API_KEY
ENV INFURA_API_KEY $INFURA_API_KEY
COPY . .
RUN npm run compile