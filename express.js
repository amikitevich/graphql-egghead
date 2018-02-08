'use strict';


const { graphql, buildSchema } = require('graphql');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList
} = require('graphql');

const express = require('express');

const PORT = process.env.PORT || 3000;
const server = express();
const graphqlHTTP = require('express-graphql');

const v = {
  id: () => 'uiid1',
  title: () => 'GetStarted',
  duration: () => 200,
  watched: () => true
};

const vs = [{ ...v, id: 'uuid1' }, { ...v, id: 'uuid2' }, { ...v, id: 'uuid3' }];

const videoType = new GraphQLObjectType({
  name: 'VideoType',
  description: 'v type',
  fields: {
    id: {
      type: GraphQLID
    },
    title: {
      type: GraphQLString
    },
    duration: {
      type: GraphQLInt
    },
    watched: {
      type: GraphQLBoolean
    }
  }
});

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'Query type',
  fields: () => ({
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      description: 'egghead video',
      resolve: (_, args) => {
        console.log(args, 'a');
        return new Promise(r => r(vs.find(v => v.id === args.id)));
      }
    },
    videos: {
      args: {
        first: {
          type: GraphQLInt
        }
      },
      type: new GraphQLList(videoType),
      resolve: (_, args) => (new Promise(r => r([v, v, v].slice(0, args.first))))
    }
  })
});

const schema = new GraphQLSchema({
  query: queryType
});

const query = `
  query myFquery {
    videos {
      id,
      title
    }
  }
`;

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

server.listen(PORT, () => {
  console.log('lister localhost:', PORT)
});
