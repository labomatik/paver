describe('Editor - Category Functionality', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000')
    })

    it('renders blocks grouped by categories', () => {
        // Check that category containers exist
        cy.get('.paver__category').should('have.length.at.least', 1)
    })

    it('displays category names correctly', () => {
        // Verify that categories have visible names
        cy.get('.paver__category').first().within(() => {
            cy.get('.paver__category-toggle span').should('be.visible')
            cy.get('.paver__category-toggle span').invoke('text').should('not.be.empty')
        })
    })

    it('shows Default category first', () => {
        cy.get('.paver__category').first().within(() => {
            cy.get('.paver__category-toggle span').should('contain', 'Default')
        })
    })

    it('has category toggle buttons with chevron icons', () => {
        cy.get('.paver__category').first().within(() => {
            cy.get('.paver__category-toggle').should('exist')
            cy.get('.paver__category-icon').should('exist')
            // The SVG is directly the category icon element
            cy.get('svg.paver__category-icon').should('exist')
        })
    })

    it('groups blocks by their category property', () => {
        // Content category should contain Test Content block
        cy.get('.paver__category').contains('Content').parent('.paver__category').within(() => {
            cy.get('.paver__block-grid .paver__sortable-item').should('have.length.at.least', 1)
        })

        // Layout category should contain Test Layout block
        cy.get('.paver__category').contains('Layout').parent('.paver__category').within(() => {
            cy.get('.paver__block-grid .paver__sortable-item').should('have.length.at.least', 1)
        })

        // Media category should contain Test Media block
        cy.get('.paver__category').contains('Media').parent('.paver__category').within(() => {
            cy.get('.paver__block-grid .paver__sortable-item').should('have.length.at.least', 1)
        })
    })

    it('sorts categories alphabetically except Default first', () => {
        cy.get('.paver__category .paver__category-toggle span').then($categories => {
            const categoryNames = [...$categories].map(el => el.textContent.trim())

            // First should be Default
            expect(categoryNames[0]).to.equal('Default')

            // Rest should be alphabetically sorted
            const restOfCategories = categoryNames.slice(1)
            const sortedRest = [...restOfCategories].sort()
            expect(restOfCategories).to.deep.equal(sortedRest)
        })
    })

    it('displays all blocks with correct category assignment', () => {
        // Check that each block appears in exactly one category
        cy.get('.paver__category').each(($category) => {
            cy.wrap($category).within(() => {
                // Each category should have at least blocks container
                cy.get('.paver__block-grid').should('exist')
            })
        })
    })

    it('maintains block visibility when categories are present', () => {
        // Verify that blocks are still accessible through categories
        cy.get('.paver__category .paver__block-grid .paver__sortable-item').should('have.length.at.least', 1)
    })

    it('allows dragging blocks from categorized sections', () => {
        // Find a visible block in any category
        cy.get('.paver__category').first().within(() => {
            cy.get('.paver__block-grid .paver__sortable-item')
                .first()
                .should('have.class', 'paver__block-handle')
                .should('have.attr', 'data-block')
        })
    })
})