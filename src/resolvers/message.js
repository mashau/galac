import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessagerOwner } from './authorization';

export default {
  Query: {
   message: async(parent, { id }, { models }) => {
         return await models.Message.findById(id);
    },
   messages: async(parent, args, { models }) => {
    return await models.Message.findAll();
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