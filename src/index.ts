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
        completed: [Task]
    }

    type Mutation {
        createTask(title: String!): Task
        deleteTask(id: ID!): Task
        markDone(id: ID!): Task
    }
`;

const resolvers = {
    DateTime: dateTimeScalar,
    Query: {
        async todo() {
            return await prisma.task.findMany({
                where: {
                    done: false
                }
            });
        },
        async completed() {
            let todayStart: Date = new Date();
            let todayEnd: Date = new Date();

            if (todayStart.getHours() < 7) { // You are in previous day
                todayEnd.setHours(7)
                todayStart.setDate(todayStart.getDate() - 1)
            } else { // You are in current day
                todayEnd.setDate(todayEnd.getDate() + 1)
                todayEnd.setHours(7)
            }

            todayStart.setHours(7) // Day always starts at 7 AM

            return await prisma.task.findMany({
                where: {
                    done: true,
                    completedAt: {
                        lte: todayEnd,
                        gte: todayStart
                    }
                }
            })
        }
    },
    Mutation: {
        async createTask(_, { title }) {
            return await prisma.task.create({
                data: {
                    title: title
                }
            });
        },
        async deleteTask(_, { id }) {
            return await prisma.task.delete({
                where: {
                    id: Number(id)
                }
            })
        },
        async markDone(_, { id }) {
            return await prisma.task.update({
                where: {
                    id: Number(id)
                },
                data: {
                    done: true,
                    completedAt: new Date()
                }
            })
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
