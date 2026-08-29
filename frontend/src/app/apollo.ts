import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';

import { getToken, removeToken } from '../auth/token';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? '/graphql',
});

const authLink = new SetContextLink((prevContext) => {
  const token = getToken();

  return {
    headers: {
      ...prevContext.headers,
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
});

const authErrorLink = new ErrorLink(({ error }) => {
  if (
    getToken() &&
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphqlError) => graphqlError.extensions?.code === 'UNAUTHENTICATED',
    )
  ) {
    sessionStorage.setItem(
      'postLoginRedirect',
      `${window.location.pathname}${window.location.search}`,
    );
    removeToken();
    window.location.assign('/login');
  }
});

export const apolloClient = new ApolloClient({
  link: authErrorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});
