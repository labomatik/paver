describe('Popup Block Change Events', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000/?category')
    })

    it('should not throw blockChange error when opening popup', () => {
        // Listen for console errors
        cy.window().then((win) => {
            cy.spy(win.console, 'error').as('consoleError')
        })

        cy.getIframeBody('.paver__editor').within(() => {
            // Click the style category button to open popup
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })

        // Check that the popup is visible
        cy.get('.paver__options-popup').should('be.visible')

        // Verify no blockChange error was thrown
        cy.get('@consoleError').should('not.have.been.calledWithMatch', /blockChange is not defined/)
    })

    it('should update block data when changing popup input value', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the style category button to open popup
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })

        // Check that the popup is visible
        cy.get('.paver__options-popup').should('be.visible')

        // Wait for popup content to be injected
        cy.get('.paver__popup-content').should('contain', 'Background Color')

        // Change the background color value
        cy.get('.paver__popup-content input[type="color"]').first().invoke('val', '#ff0000').trigger('input')

        // Wait a bit for Alpine to process
        cy.wait(100)

        // Close the popup
        cy.get('.paver__popup-close-btn').click({force: true})

        // Verify the block was updated in the iframe
        cy.getIframeBody('.paver__editor').within(() => {
            cy.get('.test-category-block').should('have.css', 'background-color', 'rgb(255, 0, 0)')
        })
    })

    it('should dispatch block-change event when modifying popup options', () => {
        // Set up event listener before opening popup
        cy.window().then((win) => {
            win.blockChangeEventFired = false
            win.document.addEventListener('block-change', () => {
                win.blockChangeEventFired = true
            })
        })

        cy.getIframeBody('.paver__editor').within(() => {
            // Click the visibility category button to open popup
            cy.wait(100).get('.paver__category-btn').eq(2).click({force: true})
        })

        // Check that the popup is visible
        cy.get('.paver__options-popup').should('be.visible')

        // Wait for popup content to be injected
        cy.get('.paver__popup-content').should('contain', 'Visible on Mobile')

        // Change the select value
        cy.get('.paver__popup-content select').first().select('0')

        // Verify the event was dispatched
        cy.window().its('blockChangeEventFired').should('eq', true)
    })

    it('should handle multiple popup opens without errors', () => {
        // Listen for console errors
        cy.window().then((win) => {
            cy.spy(win.console, 'error').as('consoleError')
        })

        // First popup open
        cy.getIframeBody('.paver__editor').within(() => {
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })
        cy.get('.paver__options-popup').should('be.visible')
        // Use invoke hide as Alpine reactivity has issues in test env
        cy.get('.paver__modal-overlay').invoke('removeClass', 'paver__modal-visible')
        cy.wait(100)

        // Second popup open
        cy.getIframeBody('.paver__editor').within(() => {
            cy.wait(100).get('.paver__category-btn').eq(2).click({force: true})
        })
        cy.get('.paver__options-popup').should('be.visible')
        cy.get('.paver__modal-overlay').invoke('removeClass', 'paver__modal-visible')
        cy.wait(100)

        // Third popup open
        cy.getIframeBody('.paver__editor').within(() => {
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })
        cy.get('.paver__options-popup').should('be.visible')

        // Verify no blockChange errors occurred
        cy.get('@consoleError').should('not.have.been.calledWithMatch', /blockChange is not defined/)
    })

    it('should update block in iframe when changing visibility option', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the visibility category button to open popup
            cy.wait(100).get('.paver__category-btn').eq(2).click({force: true})
        })

        // Check that the popup is visible
        cy.get('.paver__options-popup').should('be.visible')

        // Change visibility on mobile to "No"
        cy.get('.paver__popup-content select').first().select('0')

        // Wait for change to propagate
        cy.wait(200)

        // Close the popup using overlay removal
        cy.get('.paver__modal-overlay').invoke('removeClass', 'paver__modal-visible')

        // Verify the block in iframe has the hidden-mobile class
        cy.getIframeBody('.paver__editor').within(() => {
            cy.get('.test-category-block').should('have.class', 'hidden-mobile')
        })
    })
})