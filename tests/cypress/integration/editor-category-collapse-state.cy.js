describe('Editor - Category Collapse State Persistence', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000/?content=1')
    })

    it('maintains category collapse state when opening blocks panel temporarily', () => {
        // Step 1: Collapse some categories initially
        cy.get('.paver__category').then($categories => {
            if ($categories.length > 1) {
                // First, ensure the second category is initially open
                cy.get('.paver__category').eq(1).within(() => {
                    // If it's already closed, open it first
                    cy.get('.paver__block-grid').then($grid => {
                        if (!$grid.is(':visible')) {
                            cy.get('.paver__category-toggle').click()
                            cy.wait(500)
                        }
                    })
                })

                // Now collapse the second category
                cy.get('.paver__category').eq(1).within(() => {
                    cy.get('.paver__category-toggle').click()
                    // Wait for Alpine's x-collapse animation to complete
                    // Check both visibility and that animation is complete (display:none)
                    cy.get('.paver__block-grid').should('satisfy', ($el) => {
                        const isHidden = $el.css('display') === 'none' || !$el.is(':visible')
                        return isHidden
                    }, { timeout: 2000 })
                    cy.get('.paver__category-icon').should('not.have.class', 'paver__category-icon--open')
                })

                // Keep first category open
                cy.get('.paver__category').eq(0).within(() => {
                    cy.get('.paver__block-grid').should('be.visible')
                    cy.get('.paver__category-icon').should('have.class', 'paver__category-icon--open')
                })
            }
        })

        // Step 2: Enter edit mode
        cy.getIframeBody('.paver__editor').within(() => {
            cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
        })

        cy.wait(500)

        // Step 3: Open blocks panel temporarily
        cy.get('.paver__blocks-toggle-btn').click({force: true})
        cy.wait(300)

        // Step 4: Verify collapse states are preserved
        cy.get('.paver__category').then($categories => {
            if ($categories.length > 1) {
                // First category should still be open
                cy.get('.paver__category').eq(0).within(() => {
                    cy.get('.paver__block-grid').should('be.visible')
                    cy.get('.paver__category-icon').should('have.class', 'paver__category-icon--open')
                })

                // Second category should still be collapsed
                cy.get('.paver__category').eq(1).within(() => {
                    cy.get('.paver__block-grid').should('not.be.visible')
                    cy.get('.paver__category-icon').should('not.have.class', 'paver__category-icon--open')
                })
            }
        })
    })

    it('category toggle works correctly after opening blocks panel temporarily', () => {
        // Collapse a category
        cy.get('.paver__category').first().within(() => {
            cy.get('.paver__category-toggle').click()
            // Wait for Alpine's x-collapse animation to complete
            cy.get('.paver__block-grid').should('not.be.visible', { timeout: 1000 })
        })

        // Enter edit mode
        cy.getIframeBody('.paver__editor').within(() => {
            cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
        })

        cy.wait(500)

        // Open blocks panel temporarily
        cy.get('.paver__blocks-toggle-btn').click({force: true})
        cy.wait(300)

        // Try to toggle the category
        cy.get('.paver__category').first().within(() => {
            // Should be collapsed, click to open
            cy.get('.paver__category-toggle').click()
            cy.get('.paver__block-grid').should('be.visible', { timeout: 1000 })

            // Click again to close
            cy.get('.paver__category-toggle').click()
            cy.get('.paver__block-grid').should('not.be.visible', { timeout: 1000 })
        })
    })

    it('does not force all categories open when restrictions are applied', () => {
        // Manually set collapse states for all categories
        cy.get('.paver__category').each(($category, index) => {
            if (index === 0) {
                // Keep first one open
                cy.wrap($category).within(() => {
                    cy.get('.paver__block-grid').then($grid => {
                        if (!$grid.is(':visible')) {
                            cy.get('.paver__category-toggle').click()
                            cy.wait(200)
                        }
                    })
                })
            } else {
                // Collapse others
                cy.wrap($category).within(() => {
                    cy.get('.paver__block-grid').then($grid => {
                        if ($grid.is(':visible')) {
                            cy.get('.paver__category-toggle').click()
                            cy.wait(200)
                        }
                    })
                })
            }
        })

        cy.wait(300)

        // Store the initial state
        cy.get('.paver__category').then($categories => {
            const initialStates = []
            $categories.each((index, cat) => {
                const $grid = Cypress.$(cat).find('.paver__block-grid')
                initialStates.push($grid.is(':visible'))
            })
            cy.wrap(initialStates).as('initialStates')
        })

        // Enter edit mode
        cy.getIframeBody('.paver__editor').within(() => {
            cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
        })

        cy.wait(500)

        // Open blocks panel temporarily
        cy.get('.paver__blocks-toggle-btn').click({force: true})
        cy.wait(300)

        // Verify states haven't all become open
        cy.get('@initialStates').then((initialStates) => {
            cy.get('.paver__category').each(($category, index) => {
                // Skip hidden categories
                if (!$category.hasClass('paver__category--hidden')) {
                    cy.wrap($category).within(() => {
                        cy.get('.paver__block-grid').then($grid => {
                            const currentlyVisible = $grid.is(':visible')
                            const wasVisible = initialStates[index]

                            // State should be preserved (or reasonably similar)
                            cy.log(`Category ${index}: Was ${wasVisible ? 'open' : 'closed'}, Now ${currentlyVisible ? 'open' : 'closed'}`)

                            // The important check: if it was closed, it shouldn't suddenly be forced open
                            if (!wasVisible && index > 0) {
                                // Categories after the first that were closed should stay closed
                                expect(currentlyVisible).to.be.false
                            }
                        })
                    })
                }
            })
        })
    })
})