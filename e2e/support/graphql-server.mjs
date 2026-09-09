import { createServer } from "node:http";
import { buildSchema, graphql, GraphQLError } from "graphql";

const schema = buildSchema(`
  type Account { id: ID!, avatar: String, email: String, first_name: String, last_name: String }
  type Profile { avatar: String, first_name: String, last_name: String }
  type NamedEntity { id: ID!, name: String! }
  type User { id: ID!, email: String!, profile: Profile!, department: NamedEntity, position: NamedEntity }
  type Users { items: [User!]!, total: Int!, page: Int!, limit: Int!, total_pages: Int! }
  type Tokens { access_token: String!, refresh_token: String!, user: Account! }
  input AuthInput { email: String!, password: String! }
  input SignupInput { email: String!, password: String!, confirmPassword: String! }
  input ForgotPasswordInput { email: String! }
  input ResetPasswordInput { newPassword: String!, confirmPassword: String! }
  input VerifyMailInput { otp: String! }
  input ChangePasswordInput { oldPassword: String!, newPassword: String!, confirmPassword: String! }
  input SearchPaginationInput { limit: Int, page: Int, search: String, sort_by: String, sort_order: String }
  type Query { me: Account!, users(params: SearchPaginationInput): Users! }
  type Mutation {
    login(auth: AuthInput!): Tokens!
    signup(auth: SignupInput!): Tokens!
    updateToken: Tokens!
    forgotPassword(auth: ForgotPasswordInput!): Boolean
    resetPassword(auth: ResetPasswordInput!): Boolean
    verifyMail(mail: VerifyMailInput!): Boolean
    sendVerification(email: String!): Boolean
    changePassword(args: ChangePasswordInput!): Account!
  }
`);
const account = { id: "e2e-user", email: "auth@example.test", avatar: null, first_name: "E2E", last_name: "User" };
const tokens = { access_token: "e2e-access", refresh_token: "e2e-refresh", user: account };
let scenario = {};
let requests = [];

function authorize(context, token = tokens.access_token) {
  if (context.authorization !== `Bearer ${token}`) {
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });
  }
}
const resolvers = {
  login: () => tokens,
  signup: () => tokens,
  updateToken: (_args, context) => { authorize(context, tokens.refresh_token); return tokens; },
  me: (_args, context) => { authorize(context); return account; },
  users: (_args, context) => {
    authorize(context);
    return { items: [], total: 0, page: 1, limit: 10, total_pages: 0 };
  },
  forgotPassword: () => null,
  resetPassword: (_args, context) => { authorize(context, "e2e-reset"); return null; },
  verifyMail: (_args, context) => { authorize(context); return null; },
  sendVerification: (_args, context) => { authorize(context); return null; },
  changePassword: (_args, context) => { authorize(context); return account; },
};
const rootValue = Object.fromEntries(Object.entries(resolvers).map(([field, resolve]) => [field,
  async (args, context) => {
    const override = scenario[field];
    if (override?.delay) await new Promise((done) => setTimeout(done, override.delay));
    if (override?.error) throw new GraphQLError(override.error, { extensions: { code: override.code ?? "BAD_USER_INPUT" } });
    return resolve(args, context);
  },
]));

const server = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  try {
    if (request.url === "/health") return response.end("{}");
    if (request.url === "/requests" && request.method === "GET") return response.end(JSON.stringify(requests));
    let body = "";
    for await (const chunk of request) body += chunk;
    if (request.url === "/scenario" && request.method === "POST") {
      scenario = JSON.parse(body);
      requests = [];
      return response.end("{}");
    }
    if (request.url !== "/graphql" || request.method !== "POST") {
      response.statusCode = 404;
      return response.end("{}");
    }
    const { query, variables, operationName } = JSON.parse(body);
    const authorization = request.headers.authorization ?? null;
    requests.push({ operationName, variables, authorization });
    const result = await graphql({ schema, source: query, variableValues: variables, operationName, rootValue, contextValue: { authorization } });
    response.end(JSON.stringify(result));
  } catch (error) {
    response.statusCode = 500;
    response.end(JSON.stringify({ errors: [{ message: String(error) }] }));
  }
});
server.listen(4100, "127.0.0.1");
