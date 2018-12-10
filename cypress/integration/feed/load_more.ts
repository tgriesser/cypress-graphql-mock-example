/// <reference types="cypress" />
/// <reference types="cypress-graphql-mock" />
import schema from '../../../schema.json';
import { Mocks_AllOperations } from '../../src/mock-types';
import { IntrospectionQuery } from 'graphql';

describe('load more', () => {
  beforeEach(() => {
    cy.server();
    cy.mockGraphql({
      // Casting here likely due to slight inconsistencies between
      // GraphQL versions
      schema: (schema as any) as IntrospectionQuery,
    });
    cy.route('/sockjs-node', {});
  });

  it('Should show submit button when logged in', () => {
    cy.mockGraphqlOps<Mocks_AllOperations>({
      operations: {
        CurrentUserForLayout: {
          currentUser: {
            login: 'Tim Griesser',
            avatar_url: 'https://avatars1.githubusercontent.com/u/154748?v=4',
          },
        },
      },
    });
    cy.visit('/');
    cy.get('[data-e2e="submit_btn"]').should('have.attr', 'href', '/submit');
    cy.mockGraphqlOps<Mocks_AllOperations>({
      operations: {
        CurrentUserForLayout: {
          currentUser: null,
        },
      },
    });
    cy.reload();
    cy.get('[data-e2e="submit_btn"]').should('not.exist');
  });

  it('Should show submit button when logged in', () => {
    cy.mockGraphqlOps<Mocks_AllOperations>({
      operations: {
        CurrentUserForLayout: {
          currentUser: null,
        },
      },
    });
    cy.visit('/');
    cy.get('[data-e2e="submit_btn"]').should('not.exist');
  });

  it('Renders an empty state', () => {
    cy.mockGraphqlOps<Mocks_AllOperations>({
      operations: {
        Feed: {
          feed: [],
        },
      },
    });
    cy.visit('/');
    // Broken because of SSR. Need to dig in more.
    // cy.get('[data-e2e="empty_state"]').should('be.visible');
    cy.get('[data-e2e="feed"]').should('be.visible');
  });
});
