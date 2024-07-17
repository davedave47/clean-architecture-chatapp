=======
# Clean-architecture-template
Introduction:

Typical chatapp that uses [Uncle Bob's clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html). Backend is written in Go and uses [fiber](https://docs.gofiber.io/) API framework for HTTP and Websocket. Frontend is written in Typescript and uses [Vitejs](https://v4.vitejs.dev/guide/) and [Reactjs](https://react.dev/learn). The server stores user information and conversation information and friend relationships on a graph database called Neo4j and stores messages on a NoSQL scalable database called MongoDB. Files are stored directly on server /uploads folder

How to run:

## Prerequisites

Before you can run this project, you need to have Go and Node.js installed on your machine.

- For Go, download and install it from [here](https://golang.org/dl/).
- For Node.js, download and install it from [here](https://nodejs.org/en/download/).

Make sure you have MongoDB and Neo4j running on your device (I recommend install via [Docker](https://docs.docker.com/engine/install)).
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Neo4j](https://neo4j.com/docs/operations-manual/current/installation/)

## Environment variables

Make a file named `.env` file in both be and fe and include these lines:
1. For fe:  

`VITE_BACKEND_URL=YOUR_BACKEND_URL` (default value is `http://YOUR_LOCAL_IP:3000` i.e `http://192.128.1.2:3000`)

2. For be:  

Secret key for JWT authorization:  
`SECRET_KEY=YOUR_JWT_SECRET_KEY`  

Create an admin user and enter it here:  
`ADMIN_ID=YOUR_ADMIN_ID`

Neo4j configurations:  
`NEO4J_PASSWORD=YOUR_NEO4J_PASSWORD`  
`NEO4J_URL=YOUR_NEO4J_URL`  
`NEO4J_USERNAME=YOUR_NEO4J_USERNAME` (default value is `neo4j`)  
`NEO4J_DATABASE=YOUR_NEO4J_DATABASE` (default value is `neo4j`)  

MongoDB configurations:  
`MONGO_URL=YOUR_MONGODB_URL` (default is `mongodb://127.0.0.1:27017` if you run in localhost)
`MONGO_DATABASE=YOUR_MONGODB_DATABASE` (can be anyname to store messages)

Front-end url for CORS:
`FRONTEND_URL=YOUR_FRONTEND_URL` (`http://YOUR_LOCAL_IP:5173` i.e `http://192.128.1.2:5173`)

## Running the Project

(Here you can add the steps to run your project, for example:)

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Type `make install` to install all the dependencies
4. Type `make test` to run the project in development mode