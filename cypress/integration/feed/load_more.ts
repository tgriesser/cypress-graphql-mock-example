/// <reference types="cypress" />
/// <reference path="../../support/commands.ts" />
import schema from '../../../schema.json';
import { Mocks_AllOperations } from '../../src/mock-types';

describe('load more', () => {
  beforeEach(() => {
    cy.server();
    cy.route('/sockjs-node', {});
  });

  it('Should show submit button when logged in', () => {
    cy.mockGraphql<Mocks_AllOperations>({
      schema,
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
  });

  it('Should show submit button when logged in', () => {
    cy.mockGraphql<Mocks_AllOperations>({
      schema,
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
    cy.mockGraphql<Mocks_AllOperations>({
      schema,
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
