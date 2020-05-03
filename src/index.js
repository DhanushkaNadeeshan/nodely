const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db'); 
const models = require('./models');

// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;

const DB_HOST = process.env.DB_HOST;

let notes = [{id:'1',content:"Test Web" , auther:"Steve Jobs"},{id:'2',content:"Test Web" , auther:"Steve Jobs"}];
// Construct a schema, using GraphQL's schema language
const typeDefs = gql`
      type Query {
          hello : String
          notes : [Note!]! 
          note(id:ID!) : Note!
      }

      type Note {
        id:ID!
        content: String!
        author: String
      }

      type Mutation{
        newNote(content: String! ,author : String!) : Note!
      }
`;

// Provide resolver functions for our schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello',
    notes: async () => {
       return await models.Note.find();
    },
    note :  async (parent,args) => {
      return await models.Note.findById(args.id);
    },
  
  },
  Mutation : {
    newNote : async (parent,args) =>{

  return await models.Note.create({
    content: args.content,
    author: args.author
  });
    }
  }
}

const app = express();

// Connect to the database
db.connect(DB_HOST);

// Apollo Server setup
const server = new ApolloServer({ typeDefs, resolvers });



// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });


app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);