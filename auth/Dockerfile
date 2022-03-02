FROM node:17

WORKDIR /app
RUN npm config set registry https://registry.npmjs.org/
COPY package.json .
RUN npm install --only=prod
COPY . .

CMD ["npm", "start"]