import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
    scalar Date

    type Task {
        task_id: String!
        title: String!
        created_on: Date!
        due_date: Date!
    }

    type Query {
        todo: [Task]
    }
`;
