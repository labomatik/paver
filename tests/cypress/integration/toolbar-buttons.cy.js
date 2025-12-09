describe('Toolbar Buttons', () => {
    describe('Blocks with option categories', () => {
        beforeEach(() => {
            cy.visit('http://localhost:8000/?category')
        })

        it('should not show generic edit button for blocks with categories', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.get('.test-category-block').should('be.visible')

                // Should have category buttons
                cy.get('.paver__category-btn').should('have.length', 3)

                // Should NOT have the generic edit button (only category buttons + drag + clone + delete)
                // The generic edit button has x-on:click="edit($event)" without paver__category-btn class
                cy.get('.paver__block-toolbar-actions button').then($buttons => {
                    const editButtons = $buttons.filter((i, el) => {
                        const hasEditClick = el.getAttribute('x-on:click') === 'edit($event)'
                        const isCategoryBtn = el.classList.contains('paver__category-btn')
                        return hasEditClick && !isCategoryBtn
                    })
                    expect(editButtons.length).to.equal(0)
                })
            })
        })

        it('should show Edition, Style and Visibility category buttons', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.get('.paver__category-btn').should('have.length', 3)

                // Check tooltips
                cy.get('.paver__category-btn').eq(0).should('have.attr', 'x-paver-tooltip', "text('Edition')")
                cy.get('.paver__category-btn').eq(1).should('have.attr', 'x-paver-tooltip', "text('Style')")
                cy.get('.paver__category-btn').eq(2).should('have.attr', 'x-paver-tooltip', "text('Visibility')")
            })
        })

        it('should have drag, clone and delete buttons alongside category buttons', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                // Drag button (has paver__block-handle class)
                cy.get('.paver__block-handle').should('exist')

                // Clone button
                cy.get('button[x-on\\:click="clone($event)"]').should('exist')

                // Delete button
                cy.get('button[x-on\\:click="trash($event)"]').should('exist')
            })
        })
    })

    describe('Blocks without option categories', () => {
        beforeEach(() => {
            cy.visit('http://localhost:8000/?content')
        })

        it('should show generic edit button for blocks without categories', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.get('.paver__block').should('be.visible')

                // Should have the generic edit button
                cy.get('button[x-on\\:click="edit($event)"]').should('exist')

                // Should NOT have category buttons
                cy.get('.paver__category-btn').should('not.exist')
            })
        })

        it('should have drag, clone and delete buttons alongside edit button', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                // Drag button
                cy.get('.paver__block-handle').should('exist')

                // Edit button
                cy.get('button[x-on\\:click="edit($event)"]').should('exist')

                // Clone button
                cy.get('button[x-on\\:click="clone($event)"]').should('exist')

                // Delete button
                cy.get('button[x-on\\:click="trash($event)"]').should('exist')
            })
        })
    })
})