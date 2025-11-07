describe('Editor - Collapsible Sections and Panels', () => {
    beforeEach(() => {
        // Visit with content to have blocks available for testing
        cy.visit('http://localhost:8000/?content=1')
    })

    describe('Collapsible Category Sections', () => {
        it('first category starts expanded by default', () => {
            cy.get('.paver__category').first().within(() => {
                // The block grid should be visible for the first category
                cy.get('.paver__block-grid').should('be.visible')
            })
        })

        it('can collapse a category section', () => {
            cy.get('.paver__category').first().within(() => {
                // Click the toggle button
                cy.get('.paver__category-toggle').click()

                // Wait for Alpine.js collapse animation
                cy.wait(300)

                // Block grid should not be visible
                cy.get('.paver__block-grid').should('not.be.visible')
            })
        })

        it('can expand a collapsed category section', () => {
            cy.get('.paver__category').first().within(() => {
                // First collapse it
                cy.get('.paver__category-toggle').click()
                cy.wait(300)

                // Then expand it again
                cy.get('.paver__category-toggle').click()
                cy.wait(300)

                // Block grid should be visible again
                cy.get('.paver__block-grid').should('be.visible')
            })
        })

        it('chevron icon rotates when toggling category', () => {
            cy.get('.paver__category').first().within(() => {
                // Check initial state (should have open class)
                cy.get('.paver__category-icon').should('have.class', 'paver__category-icon--open')

                // Click to collapse
                cy.get('.paver__category-toggle').click()
                cy.wait(100)

                // Icon should not have open class
                cy.get('.paver__category-icon').should('not.have.class', 'paver__category-icon--open')

                // Click to expand again
                cy.get('.paver__category-toggle').click()
                cy.wait(100)

                // Icon should have open class again
                cy.get('.paver__category-icon').should('have.class', 'paver__category-icon--open')
            })
        })

        it('maintains independent collapse state for each category', () => {
            // Expand second category if there is one
            cy.get('.paver__category').then($categories => {
                if ($categories.length > 1) {
                    // Collapse first category
                    cy.get('.paver__category').eq(0).within(() => {
                        cy.get('.paver__category-toggle').click()
                    })
                    cy.wait(300)

                    // Expand second category
                    cy.get('.paver__category').eq(1).within(() => {
                        cy.get('.paver__category-toggle').click()
                    })
                    cy.wait(300)

                    // First should be collapsed, second should be expanded
                    cy.get('.paver__category').eq(0).within(() => {
                        cy.get('.paver__block-grid').should('not.be.visible')
                    })

                    cy.get('.paver__category').eq(1).within(() => {
                        cy.get('.paver__block-grid').should('be.visible')
                    })
                }
            })
        })

        it('preserves block functionality when category is collapsed and reopened', () => {
            cy.get('.paver__category').first().within(() => {
                // Get initial block count
                cy.get('.paver__block-grid .paver__sortable-item').its('length').as('initialCount')

                // Collapse
                cy.get('.paver__category-toggle').click()
                cy.wait(300)

                // Expand
                cy.get('.paver__category-toggle').click()
                cy.wait(300)

                // Block count should be the same
                cy.get('@initialCount').then(initialCount => {
                    cy.get('.paver__block-grid .paver__sortable-item').should('have.length', initialCount)
                })
            })
        })
    })

    describe('Collapsible Blocks Panel', () => {
        it('blocks panel is visible by default', () => {
            cy.get('.paver__blocks-panel').should('be.visible')
            cy.get('.paver__blocks-panel').should('not.have.class', 'paver__blocks-panel--minimized')
        })

        it('blocks panel minimizes when entering edit mode', () => {
            // Click edit button on a block
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Blocks panel should be minimized
            cy.get('.paver__blocks-panel').should('have.class', 'paver__blocks-panel--minimized')

            // Options panel should be visible
            cy.get('.paver__options-panel').should('be.visible')
        })

        it('shows toggle button to temporarily open blocks panel during edit mode', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Toggle button should be visible
            cy.get('.paver__blocks-toggle-btn').should('be.visible')
        })

        it('can temporarily open blocks panel during edit mode', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Click toggle button
            cy.get('.paver__blocks-toggle-btn').click()
            cy.wait(100)

            // Blocks panel should have temp-open class
            cy.get('.paver__blocks-panel').should('have.class', 'paver__blocks-panel--temp-open')
        })

        it('closes blocks panel when clicking outside of it', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Open blocks panel temporarily
            cy.get('.paver__blocks-toggle-btn').click({force: true})
            cy.wait(100)

            // Verify panel is open
            cy.get('.paver__blocks-panel').should('have.class', 'paver__blocks-panel--temp-open')

            // Click outside the blocks panel (on options panel)
            cy.get('.paver__options-panel .paver__section-header').click({force: true})
            cy.wait(100)

            // Panel should be closed
            cy.get('.paver__blocks-panel').should('not.have.class', 'paver__blocks-panel--temp-open')
        })

        it('closes blocks panel when clicking in the iframe editor', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Open blocks panel temporarily
            cy.get('.paver__blocks-toggle-btn').click({force: true})
            cy.wait(200)

            // Verify panel is open
            cy.get('.paver__blocks-panel').should('have.class', 'paver__blocks-panel--temp-open')

            // Click in the iframe editor
            cy.getIframeBody('.paver__editor').within(() => {
                cy.get('.paver__editor-root').click({force: true})
            })
            cy.wait(200)

            // Panel should be closed
            cy.get('.paver__blocks-panel').should('not.have.class', 'paver__blocks-panel--temp-open')
        })

        it('closes temporary blocks panel when clicking toggle again', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Open temporarily
            cy.get('.paver__blocks-toggle-btn').click({force: true})
            cy.wait(100)

            // Close temporarily
            cy.get('.paver__blocks-toggle-btn').click({force: true})
            cy.wait(100)

            // Should not have temp-open class
            cy.get('.paver__blocks-panel').should('not.have.class', 'paver__blocks-panel--temp-open')
        })

        it('blocks panel returns to normal when exiting edit mode', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Verify minimized
            cy.get('.paver__blocks-panel').should('have.class', 'paver__blocks-panel--minimized')

            // Exit edit mode
            cy.get('.paver__options-panel').within(() => {
                cy.get('button').last().click()
            })

            cy.wait(100)

            // Should no longer be minimized
            cy.get('.paver__blocks-panel').should('not.have.class', 'paver__blocks-panel--minimized')
        })
    })

    describe('Options Panel Collapsible Behavior', () => {
        it('options panel only appears during edit mode', () => {
            // Should not be visible initially
            cy.get('.paver__options-panel').should('not.be.visible')

            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Should now be visible (wait for transition)
            cy.wait(400)
            cy.get('.paver__options-panel').should('be.visible')
        })

        it('options panel shows block name', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.get('.paver__options-panel .paver__section-header').should('be.visible')
            cy.get('.paver__options-panel .paver__section-header div').first().invoke('text').should('not.be.empty')
        })

        it('options panel has exit button', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.get('.paver__options-panel .paver__section-header button').should('be.visible')
        })

        it('clicking exit button closes options panel', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.wait(400) // Wait for open transition

            cy.get('.paver__options-panel .paver__section-header button').click()

            // Wait for close transition to complete
            cy.wait(400)

            cy.get('.paver__options-panel').should('not.be.visible')
        })

        it('displays block options in the options panel', () => {
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.get('.paver__component-sidebar .paver__inside').should('be.visible')
        })
    })

    describe('Responsive Panel Behavior', () => {
        it('maintains layout structure during transitions', () => {
            // Initial state
            cy.get('.paver__sidebar').should('be.visible')
            cy.get('.paver__sticky').should('be.visible')

            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Structure should still be intact
            cy.get('.paver__sidebar').should('be.visible')
            cy.get('.paver__sticky').should('be.visible')
            cy.get('.paver__blocks-panel').should('exist')
            cy.get('.paver__options-panel').should('exist')
        })

        it('can interact with categories while blocks panel is temporarily open', () => {
            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            // Temporarily open blocks panel
            cy.get('.paver__blocks-toggle-btn').click()
            cy.wait(100)

            // Should be able to toggle categories
            cy.get('.paver__category').first().within(() => {
                cy.get('.paver__category-toggle').click()
                cy.wait(300)
                cy.get('.paver__block-grid').should('not.be.visible')
            })
        })
    })
})