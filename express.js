'use strict';


const { nodeInterface, nodeField } = require('./data/node');
const { graphql, buildSchema } = require('graphql');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType
} = require('graphql');

const express = require('express');
const { videoResource } = require('./data/node');
const PORT = process.env.PORT || 3000;
const server = express();
const graphqlHTTP = require('express-graphql');
const { globalIdField, connectionDefinitions, connectionFromPromisedArray, connectionArgs, mutationWithClientMutationId } = require('graphql-relay');


const videoType = new GraphQLObjectType({
  name: 'VideoType',
  description: 'v type',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString
    },
    duration: {
      type: GraphQLInt
    },
    watched: {
      type: GraphQLBoolean
    }
  },
  interfaces: [nodeInterface]
});

const { connectionType: VideoConnection } = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      resolve: conn => conn.edges.length
    }
  })
});

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'Query type',
  fields: () => ({
    node: nodeField,
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      description: 'egghead video',
      resolve: (_, args) => {
        return videoResource.getVideoById(args.id);
      }
    },
    videos: {
      type: VideoConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        videoResource.getVideos(),
        args
      )
    }
  })
});

const videoMutation = mutationWithClientMutationId({
  name: 'AddVideo',
  inputFields: {
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    watched: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  outputFields: {
    video: {
      type: videoType
    }
  },
  mutateAndGetPayload: args => new Promise((rs, rj) => {
    Promise.resolve(videoResource.createVideo(args))
      .then(v => rs({ video: v }))
      .catch(rj);
  })
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createVideo: videoMutation
  }
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
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

exports.videoType = videoType;