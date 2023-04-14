import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLScalarType, Kind } from 'graphql';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.getTime(); // Convert outgoing Date to integer for JSON
        }
        throw Error('GraphQL Date Scalar serializer expected a `Date` object');
    },
    parseValue(value) {
        if (typeof value === 'number') {
            return new Date(value); // Convert incoming integer to Date
        }
        throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            // Convert hard-coded AST string to integer and then to Date
            return new Date(parseInt(ast.value, 10));
        }
        // Invalid hard-coded value (not an integer)
        return null;
    },
});

const typeDefs = `#graphql
    scalar DateTime

    type Task {
        id: ID!
        title: String!
        createdAt: DateTime!
        completedAt: DateTime
        done: Boolean!
    }

    type Query {
        todo: [Task]
    }

    type Mutation {
        createTask(title: String!): Task
    }
`;

const resolvers = {
    DateTime: dateTimeScalar,
    Query: {
        async todo() {
            return await prisma.task.findMany();
        },
    },
    Mutation: {
        async createTask(_, { title }) {
            return await prisma.task.create({
                data: {
                    title: title
                }
            });
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
