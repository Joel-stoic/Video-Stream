FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install


RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 5000

CMD ["npm","run","dev"]