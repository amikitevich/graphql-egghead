'use strict';


const { graphql, buildSchema } = require('graphql');


const schema = buildSchema(`

  type Video {
    id: ID,
    title: String,
    duration: Int,
    watched: Boolean

  }

  type Query {
    video: Video
    videos: [Video]
  }

  type Schema {
    query: Query
  }
`);

const v = {
  id: () => 'uiid1',
  title: () => 'GetStarted',
  duration: () => 200,
  watched: () => true
};

const vs = [{ ...v, id: 'uuid1' }, { ...v, id: 'uuid2' }, { ...v, id: 'uuid3' }];

const resolvers = {
  video: () => v,
  videos: () => vs
};

const query = `
  query myFquery {
    videos {
      id,
      title
    }
  }
`;

graphql(schema, query, resolvers)
  .then(res => console.log(JSON.stringify(res)), e => console.log(e));
