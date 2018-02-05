FROM docker.ttx.com/ttx-node:v6.10.2
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && npm test
CMD ["npm", "start"]
