import faker from 'faker';
import introspectionSchema from '../../schema.json';
import { buildClientSchema, printSchema } from 'graphql';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

const schemaAsSDL = printSchema(buildClientSchema(introspectionSchema as any));

const schema = makeExecutableSchema({
  typeDefs: schemaAsSDL,
});

faker.seed(0);

addMockFunctionsToSchema({
  schema,
  mocks: {
    // Could add a lot more mocks here to represent the actual types,
    // skipping that for now.
    String: () => faker.random.word(),
  },
});

export { schema };
