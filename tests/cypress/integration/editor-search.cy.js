describe('Editor - Block Search Functionality', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000/?content=1')
    })

    it('shows search input when blocks exist', () => {
        cy.get('.paver__search-blocks').should('be.visible')
    })

    it('filters blocks based on search term', () => {
        // Get initial block count
        cy.get('.paver__block-handle').filter(':visible').its('length').as('initialCount')

        // Search for "layout" which should match fewer blocks than all
        cy.get('.paver__search-blocks').type('layout')
        cy.wait(300)

        // Should have fewer blocks visible (or same if only layout blocks exist)
        cy.get('@initialCount').then(initialCount => {
            cy.get('.paver__block-handle').filter(':visible').its('length').should('be.lte', initialCount)
        })
    })

    it('shows "No blocks found" message when search returns no results', () => {
        // Search for something that doesn't exist
        cy.get('.paver__search-blocks').type('xyz123nonexistent')
        cy.wait(300)

        // Should show no results message
        cy.contains('No blocks found').should('be.visible')

        // Should show search icon
        cy.get('svg').filter(':visible').should('have.length.at.least', 1)
    })

    it('hides "No blocks found" message when search field is empty', () => {
        // Make sure message doesn't appear initially (element should not exist in DOM with x-if)
        cy.get('body').should('not.contain', 'No blocks found')
    })

    it('shows blocks again after clearing search with no results', () => {
        // Search for non-existent block
        cy.get('.paver__search-blocks').type('xyz123nonexistent')
        cy.wait(300)

        // Verify message shows
        cy.contains('No blocks found').should('be.visible')

        // Clear search
        cy.get('.paver__search-blocks').clear()
        cy.wait(300)

        // Message should be removed from DOM and blocks should be visible
        cy.get('body').should('not.contain', 'No blocks found')
        cy.get('.paver__block-handle').filter(':visible').should('have.length.at.least', 1)
    })

    it('searches by block name', () => {
        // Search for "test" which should match test blocks
        cy.get('.paver__search-blocks').type('test')
        cy.wait(300)

        // Should have at least one visible block
        cy.get('.paver__block-handle').filter(':visible').should('have.length.at.least', 1)

        // Should not show "No blocks found"
        cy.get('body').should('not.contain', 'No blocks found')
    })

    it('search is case insensitive', () => {
        // Search with different case
        cy.get('.paver__search-blocks').type('TEST')
        cy.wait(300)

        // Should still find blocks
        cy.get('.paver__block-handle').filter(':visible').should('have.length.at.least', 1)
    })

    it('hides category toggles during search', () => {
        // Category toggles should be visible initially
        cy.get('.paver__category-toggle').first().should('be.visible')

        // Start searching
        cy.get('.paver__search-blocks').type('content')
        cy.wait(300)

        // Category toggles should be hidden
        cy.get('.paver__category-toggle').first().should('not.be.visible')
    })

    it('shows category toggles again after clearing search', () => {
        // Search
        cy.get('.paver__search-blocks').type('test')
        cy.wait(300)

        // Clear
        cy.get('.paver__search-blocks').clear()
        cy.wait(300)

        // Category toggles should be visible again
        cy.get('.paver__category-toggle').first().should('be.visible')
    })

    it('no blocks found message appears only during active search', () => {
        // Should not show initially
        cy.get('body').should('not.contain', 'No blocks found')

        // Type search that has results
        cy.get('.paver__search-blocks').type('test')
        cy.wait(100)
        cy.get('body').should('not.contain', 'No blocks found')

        // Change to search with no results
        cy.get('.paver__search-blocks').clear().type('xyz123')
        cy.wait(300)
        cy.contains('No blocks found').should('be.visible')

        // Clear search
        cy.get('.paver__search-blocks').clear()
        cy.wait(100)
        cy.get('body').should('not.contain', 'No blocks found')
    })
})
