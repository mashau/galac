import { combineResolvers } from 'graphql-resolvers';
import  Sequelize  from 'sequelize';
import { isAuthenticated, isMessagerOwner } from './authorization';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string => 
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
   message: async(parent, { id }, { models }) => {
         return await models.Message.findById(id);
    },
   messages: async(parent, { cursor, limit = 100}, { models }) => {
     const cursorOptions = cursor 
       ? {
        where: {
          createdAt: {
            [Sequelize.Op.lt]: fromCursorHash(cursor),
          },
        },
       }
       : {};
    const messages = await models.Message.findAll({
      order: [['createdAt', 'DESC']],
      limit: limit + 1,
      ...cursorOptions
    });

    const hasNextPage = messages.length > limit;
    const edges = hasNextPage ? messages.slice(0, -1) : messages;

    return {
      edges: messages,
      pageInfo: {
        hasNextPage,
        endCursor: toCursorHash(
          edges[edges.length - 1].createdAt.toString(),
        ),
      }
    }
     }
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async(parent, { text }, { me, models }) => {
      return await models.Message.create({
        text,
        userId: me.id,
      });
    }),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessagerOwner,
      async(parent, { id }, { models }) => {
      return await models.Message.destroy({ where: { id }});
    },
    ),
  },

  Message: {
    user: async(message, args, {models}) => {
        return await models.User.findById(message.userId);
    },
  },
};