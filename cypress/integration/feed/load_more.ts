/// <reference types="cypress" />
/// <reference path="../../support/commands.ts" />

describe('load more', () => {
  beforeEach(() => {
    cy.server();
    cy.route('/sockjs-node', {});
  });

  it('Should show submit button when logged in', () => {
    cy.mockGraphql({
      operations: {
        CurrentUserForLayout: {
          currentUser: {
            login: 'Tim Griesser',
            avatar_url: 'https://avatars1.githubusercontent.com/u/154748?v=4',
          },
        },
      },
    });
    cy.visit('http://localhost:3000');
    cy.get('[data-e2e="submit_btn"]').should('have.attr', 'href', '/submit');
  });

  it('Should show submit button when logged in', () => {
    cy.mockGraphql({
      operations: {
        CurrentUserForLayout: {
          currentUser: null,
        },
      },
    });
    cy.visit('http://localhost:3000');
    cy.get('[data-e2e="submit_btn"]').should('not.exist');
  });

  it('Renders an empty state', () => {
    cy.mockGraphql({
      operations: {
        Feed: {
          feed: [],
        },
      },
    });
    cy.visit('http://localhost:3000');

    // I'm sort of confused by this. The correct value is being rendered but
    // the data attribute is incorrect. Need to dig in and see if this is an
    // issue with React or with cypress.
    cy.get('[data-e2e="empty_state"]').should('be.visible');
  });
});
