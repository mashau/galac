import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { 
  ApolloServer,
  AuthenticationError } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();
app.use(cors());

const getMe = async req => {
  const token = req.headers['x-token'];

  if(token) {
    try{
      return await jwt.verify(token, process.env.SECRET);
    } catch {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      )
    }
  }
}

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req }) => ({
    me: await getMe(req),

    return: {
      models,
      me,
      secret: process.env.SECRET,
    },
  }),
});

server.applyMiddleware({ app, path: '/graphql' });

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {

  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }
  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
});

const createUsersWithMessages = async () => {
  await models.User.create({
    username: 'sam',
    email: 'hello@robin.com',
    password: 'rwieruch',
    messages: [{
      text: 'Published the Road to learn React',
    },
  ],
  }, 
  {include: [models.Message],
  },
  );

  await models.User.create(
    {
      username: 'jam',
      email: 'hello@david.com',
      password: 'ddavids',
      messages: [
        {
          text: 'Happy to release ...',
        },
        {
          text: 'Published a complete ...',
        },
      ],
    },

    {
      include: [models.Message],
    },
  );
};

