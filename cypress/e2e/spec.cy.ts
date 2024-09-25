describe("Map Point Interaction", () => {
  it("check zoom in and zoom out features", () => {
    cy.visit("localhost:3000");
    cy.get(".ol-zoom-in").click(); // Zoom in
    cy.get(".ol-zoom-out").click(); // Zoom out
    cy.get(".map")
      .trigger("pointerdown", {
        x: 450,
        y: 300,
        isPrimary: true,
      })
      .trigger("pointermove", { x: 380, y: 240 })
      .trigger("pointerup", { x: 380, y: 240 });
  });
});
