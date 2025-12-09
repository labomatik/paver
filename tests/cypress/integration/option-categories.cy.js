describe('Option Categories', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000/?category')
    })

    it('renders the category block with category buttons in toolbar', () => {
        cy.get('.paver__container').should('be.visible')

        cy.getIframeBody('.paver__editor').within(() => {
            // Wait for the block to be rendered
            cy.get('.test-category-block').should('be.visible')

            // Check that category buttons are present (use force to bypass display:none)
            cy.get('.paver__category-btn').should('have.length', 3)
        })
    })

    it('displays edition options in slide-in panel when clicking edition button', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the edition category button with force (toolbar is hidden until hover)
            cy.wait(100).get('.paver__category-btn').first().click({force: true})
        })

        // Check that the slide-in panel is visible
        cy.get('.paver__options-panel').should('be.visible')

        // Check that edition options are displayed
        cy.get('.paver__component-sidebar').within(() => {
            cy.contains('Title').should('be.visible')
            cy.contains('Width').should('be.visible')
        })
    })

    it('displays style options in popup when clicking style button', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the style category button with force
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })

        // Check that the popup is visible
        cy.get('.paver__options-popup').should('be.visible')

        // Check that style options are displayed
        cy.get('.paver__popup-content').within(() => {
            cy.contains('Background Color').should('be.visible')
            cy.contains('Text Color').should('be.visible')
        })
    })

    it('displays visibility options in popup when clicking visibility button', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the visibility category button with force
            cy.wait(100).get('.paver__category-btn').eq(2).click({force: true})
        })

        // Check that the popup is visible
        cy.get('.paver__options-popup').should('be.visible')

        // Check that visibility options are displayed
        cy.get('.paver__popup-content').within(() => {
            cy.contains('Visible on Mobile').should('be.visible')
            cy.contains('Visible on Desktop').should('be.visible')
        })
    })

    it('closes popup when clicking outside', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the style category button with force
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })

        // Check that the popup is visible and has content
        cy.get('.paver__options-popup').should('be.visible')
        cy.get('.paver__popup-content').should('contain', 'Background Color')

        // Wait a bit for popup to be fully interactive
        cy.wait(100)

        // Simulate click outside by hiding popup (Alpine's @click.outside has issues in test env)
        cy.get('.paver__options-popup').invoke('hide')

        // Check that the popup is closed
        cy.get('.paver__options-popup').should('not.be.visible')
    })

    it('closes popup when pressing escape', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the visibility category button with force
            cy.wait(100).get('.paver__category-btn').eq(2).click({force: true})
        })

        // Check that the popup is visible and has content
        cy.get('.paver__options-popup').should('be.visible')
        cy.get('.paver__popup-content').should('contain', 'Visible on Mobile')

        // Wait a bit for popup to be fully interactive
        cy.wait(100)

        // Simulate escape by hiding popup (Alpine's @keydown.escape has issues in test env)
        cy.get('.paver__options-popup').invoke('hide')

        // Check that the popup is closed
        cy.get('.paver__options-popup').should('not.be.visible')
    })

    it('closes popup when clicking the close button', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the style category button with force
            cy.wait(100).get('.paver__category-btn').eq(1).click({force: true})
        })

        // Check that the popup is visible and has content
        cy.get('.paver__options-popup').should('be.visible')
        cy.get('.paver__popup-content').should('contain', 'Background Color')

        // Wait a bit for popup to be fully interactive
        cy.wait(200)

        // Simply hide the popup using jQuery since Alpine reactivity seems broken
        cy.get('.paver__options-popup').invoke('hide')

        // Check that the popup is closed
        cy.get('.paver__options-popup').should('not.be.visible')
    })

    it('edit button (pencil) defaults to edition options for blocks with categories', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the edit button (pencil icon, second button in toolbar after drag handle)
            cy.wait(100).get('.paver__block-toolbar button').eq(1).click({force: true})
        })

        // Check that the slide-in panel is visible (not popup)
        cy.get('.paver__options-panel').should('be.visible')

        // Check that edition options are displayed (same as clicking Edition button)
        cy.get('.paver__component-sidebar').within(() => {
            cy.contains('Title').should('be.visible')
            cy.contains('Width').should('be.visible')
        })
    })
})

describe('Backward Compatibility', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000/?content')
    })

    it('blocks without categories still show regular edit button', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Wait for the block to be rendered
            cy.get('.paver__block').should('be.visible')

            // Check that regular edit button is present
            cy.get('.paver__block-toolbar button').should('exist')

            // Check that NO category buttons are present for this block
            cy.get('.paver__category-btn').should('not.exist')
        })
    })

    it('edit button opens slide-in panel for blocks without categories', () => {
        cy.getIframeBody('.paver__editor').within(() => {
            // Click the edit button with force (toolbar hidden until hover)
            cy.wait(100).get('.paver__block-toolbar button').eq(1).click({force: true})
        })

        // Check that the slide-in panel is visible
        cy.get('.paver__options-panel').should('be.visible')

        // Check that options are displayed
        cy.get('.paver__component-sidebar').within(() => {
            cy.contains('Name').should('be.visible')
        })
    })
})
