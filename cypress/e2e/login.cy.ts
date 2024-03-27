describe("Login", () => {
  it("User login, and logout", () => {
    cy.viewport(1680, 489);
    cy.visit("http://localhost:3000/landing");
    cy.get('[data-cy="submit"]').click()

    cy.get("header span > span").click();
    cy.get('[data-cy="email"]').focus().type("hey@samet.codes");
    cy.get('[data-cy="password"]').type("jqufkMDnAt2mI0e");
    cy.get('form [data-cy="submit"]').click();
    cy.location("href").should("eq", "http://localhost:3000/");

    cy.get('[data-cy="user-account"]').dblclick();
    cy.get('[data-cy="logout"]').click();

    cy.location("href").should("eq", "http://localhost:3000/login");
  })
});
