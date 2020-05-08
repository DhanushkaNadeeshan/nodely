const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const db = require('./db');
const models = require('./models');

// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;

const DB_HOST = process.env.DB_HOST;
// Construct a schema, using GraphQL's schema language
const typeDefs = require('./schema');

// Provide resolver functions for our schema fields
const resolvers = require('./resolvers');

const app = express();

// Connect to the database
db.connect(DB_HOST);

// get user information from a jwt

const getUser = token => {

  if (token) {

    try {
      // return information from a jwt
      return jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {
      //  if there is some problem with token throw an error
      throw new Error("Session is invalide");
    }
  }
}


// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // get the user token from the header
    const token = req.headers.authorization;
    // try to retrieve a user with the token
    const user = getUser(token);
    // for now, let's log the user to the console:
    // console.log(user);
    // add the db models and the user to the context
    return { models , user };
  }
});



// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });

// Appolo server Create 
app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);