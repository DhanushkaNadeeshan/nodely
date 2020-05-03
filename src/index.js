const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;

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
        newNote(content: String!) : Note!
      }
`;

// Provide resolver functions for our schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello',
    notes: () => notes,
    note :(parent,args) => {
      return notes.find( note => note.id === args.id);
    },
  
  },
  Mutation : {
    newNote :(parent,args) =>{
       
      let noteValue = {
         id : String(notes.length + 1),
         content : args.content,
         author: 'Steve Jobs'
       };
  
       notes.push(noteValue);
       return noteValue;
    }
  }
}

const app = express();

// Apollo Server setup
const server = new ApolloServer({ typeDefs, resolvers });



// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });


app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);