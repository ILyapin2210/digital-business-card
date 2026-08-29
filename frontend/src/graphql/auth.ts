import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

export type LoginData = {
  login: {
    accessToken: string;
  };
};

export type LoginVariables = {
  input: {
    email: string;
    password: string;
  };
};
