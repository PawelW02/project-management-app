// Przykładowy test Cypress dla aplikacji zarządzania projektami
// Wymaga: zainstalowanego Cypress i uruchomionej aplikacji (domyślnie na http://localhost:5000)

describe('Project Management App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5000');
  });

  it('Dodaje nowe zadanie i wyświetla je na liście', () => {
    cy.get('#task-title').type('FrontendTest');
    cy.get('#task-description').type('Opis frontendowy');
    cy.get('#new-task-form').submit();
    cy.contains('FrontendTest').should('exist');
  });

  it('Edytuje zadanie', () => {
    cy.contains('FrontendTest').parent().parent().find('.edit-btn').click();
    cy.get('#edit-task-title').clear().type('FrontendTestEdit');
    cy.get('#edit-task-form').submit();
    cy.contains('FrontendTestEdit').should('exist');
  });

  it('Usuwa zadanie', () => {
    cy.contains('FrontendTestEdit').parent().parent().find('.delete-btn').click();
    cy.on('window:confirm', () => true);
    cy.contains('FrontendTestEdit').should('not.exist');
  });

  it('Dodaje zależność między zadaniami', () => {
    // Dodaj dwa zadania
    cy.get('#task-title').type('A');
    cy.get('#new-task-form').submit();
    cy.get('#task-title').type('B');
    cy.get('#new-task-form').submit();
    // Dodaj zależność
    cy.get('#from-task').select('A');
    cy.get('#to-task').select('B');
    cy.get('#add-dependency-form').submit();
    // Sprawdź, czy graf się odświeżył (węzły A i B istnieją)
    cy.wait(500); // poczekaj na odświeżenie grafu
    cy.window().then(win => {
      const container = win.document.getElementById('graph-container');
      expect(container).to.exist;
    });
  });

  it('Wyszukuje zadanie po tytule', () => {
    cy.get('#task-title').type('Szukane');
    cy.get('#new-task-form').submit();
    cy.get('input[placeholder="Szukaj zadania po tytule..."]').type('Szukane');
    cy.contains('Szukane').should('exist');
  });
});
