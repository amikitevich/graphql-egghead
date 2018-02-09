

'use strict';

const { GraphQLInterfaceType, GraphQLNonNull, GraphQLID } = require('graphql');
const { videoType } = require('../express');
const { nodeDefinitions, fromGlobalId } = require('graphql-relay');

const v = {
  id: () => 'uiid1',
  title: () => 'GetStarted',
  duration: () => 200,
  watched: () => true
}

const generateId = (title) => new Buffer(title, 'utf8').toString('base64');
const vs = [{ ...v, id: generateId(v.title()) }, { ...v, id: generateId(v.title()) }, { ...v, id: generateId(v.title()) }];

const videoResource = {

  createVideo: (vData) => {

    const newV = { ...vData, id: generateId(vData.title) };

    vs.push(newV);
    return newV;
  },

  getVideoById: (id) => {
    return new Promise(r => r(vs.find(v => v.id === id)));
  },
  getVideos: () => {
    return new Promise(r => {
      return r(vs)
    });
  }
};

const getObjectById = (type, id) => {
  const ts = {
    video: videoResource.getVideoById,
  }

  return ts[type](id);
}

const { nodeInterface, nodeField } = nodeDefinitions(
  globalId => {
    const { type, id } = fromGlobalId(globalId);
    console.log(type, id, 'arst');
    return getObjectById();
  },
  obj => {
    if (obj.title) {
      return videoType;
    }
    return null;
  }
)

exports.nodeInterface = nodeInterface;
exports.nodeField = nodeField;
exports.videoResource = videoResource;
exports.getObjectById = getObjectById;
