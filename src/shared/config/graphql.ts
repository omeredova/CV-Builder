const configuredGraphqlUrl = process.env.VITE_GRAPHQL_URL;

if (!configuredGraphqlUrl) {
  throw new Error("VITE_GRAPHQL_URL is not configured");
}

export const graphqlUrl = configuredGraphqlUrl;
