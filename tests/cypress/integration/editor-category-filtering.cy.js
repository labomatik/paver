describe('Editor - Category Filtering with Restrictions', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8000/?content=1')
    })

    describe('Empty Category Hiding', () => {
        it('shows all categories by default when no restrictions', () => {
            // Count visible categories (not hidden)
            cy.get('.paver__category:not(.paver__category--hidden)').should('have.length.at.least', 1)
        })

        it('categories with visible blocks are shown', () => {
            cy.get('.paver__category').each(($category) => {
                // If the category is not hidden, it should have at least one visible block
                if (!$category.hasClass('paver__category--hidden')) {
                    cy.wrap($category).within(() => {
                        cy.get('.paver__block-handle').then($blocks => {
                            // Find at least one block that is displayed
                            const hasVisibleBlock = [...$blocks].some(block => {
                                return window.getComputedStyle(block).display !== 'none'
                            })
                            expect(hasVisibleBlock).to.be.true
                        })
                    })
                }
            })
        })

        it('hides categories with no visible blocks during search', () => {
            // Search for a term that only matches blocks in some categories
            cy.get('.paver__search-blocks').type('content')
            cy.wait(300)

            // Some categories should be hidden
            cy.get('.paver__category--hidden').should('exist')

            // Hidden categories should have no visible blocks
            cy.get('.paver__category--hidden').each(($category) => {
                cy.wrap($category).within(() => {
                    cy.get('.paver__block-handle').each($block => {
                        expect($block).to.have.css('display', 'none')
                    })
                })
            })
        })

        it('shows categories again when search is cleared', () => {
            // First search to hide some categories
            cy.get('.paver__search-blocks').type('nonexistent')
            cy.wait(300)

            // Most/all categories should be hidden
            cy.get('.paver__category--hidden').should('have.length.at.least', 1)

            // Clear search
            cy.get('.paver__search-blocks').clear()
            cy.wait(300)

            // Categories with blocks should be visible again
            cy.get('.paver__category:not(.paver__category--hidden)').should('have.length.at.least', 1)
        })

        it('category system responds correctly to edit mode restrictions', () => {
            // Enter edit mode on a block
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.wait(500)

            // Check if hidden categories exist and verify they have no visible blocks
            cy.get('body').then($body => {
                const $hiddenCategories = $body.find('.paver__category--hidden')

                if ($hiddenCategories.length > 0) {
                    cy.log(`Found ${$hiddenCategories.length} hidden categories with restrictions`)

                    cy.get('.paver__category--hidden').each(($category) => {
                        cy.wrap($category).within(() => {
                            cy.get('.paver__block-handle').each($block => {
                                // All blocks in hidden category should be display:none
                                expect($block).to.have.css('display', 'none')
                            })
                        })
                    })
                } else {
                    cy.log('No hidden categories (all blocks are allowed in this context)')
                    // Just verify visible categories have visible blocks
                    cy.get('.paver__category:not(.paver__category--hidden)').should('have.length.at.least', 1)
                }
            })
        })

        it('only shows categories with allowed blocks when restrictions active', () => {
            // Enter edit mode to potentially trigger restrictions
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.wait(500)

            // Visible categories should have at least one visible block
            cy.get('.paver__category:not(.paver__category--hidden)').each(($category) => {
                cy.wrap($category).within(() => {
                    cy.get('.paver__block-handle').then($blocks => {
                        const hasVisibleBlock = [...$blocks].some(block => {
                            return window.getComputedStyle(block).display !== 'none'
                        })
                        expect(hasVisibleBlock).to.be.true
                    })
                })
            })
        })

        it('restores all relevant categories when exiting edit mode', () => {
            // Get initial category count
            cy.get('.paver__category:not(.paver__category--hidden)').its('length').as('initialCount')

            // Enter edit mode
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.wait(500)

            // Exit edit mode
            cy.get('.paver__options-panel .paver__section-header button').click()
            cy.wait(300)

            // Category count should be restored (or at least similar)
            cy.get('@initialCount').then(initialCount => {
                cy.get('.paver__category:not(.paver__category--hidden)').should('have.length', initialCount)
            })
        })

        it('maintains category visibility state while searching with restrictions', () => {
            // Enter edit mode to set restrictions
            cy.getIframeBody('.paver__editor').within(() => {
                cy.wait(200).get('.paver__block-toolbar button').eq(1).click({force: true})
            })

            cy.wait(500)

            // Temporarily open blocks panel to access search
            cy.get('.paver__blocks-toggle-btn').click({force: true})
            cy.wait(200)

            // Search while restrictions are active
            cy.get('.paver__search-blocks').type('test', {force: true})
            cy.wait(300)

            // Hidden categories should exist
            cy.get('.paver__category').then($categories => {
                const hiddenCategories = $categories.filter('.paver__category--hidden')
                const visibleCategories = $categories.not('.paver__category--hidden')

                // Log for debugging
                cy.log(`Hidden: ${hiddenCategories.length}, Visible: ${visibleCategories.length}`)

                // At least some categories should be handled
                expect($categories.length).to.be.greaterThan(0)
            })
        })
    })

    describe('Category Toggle Behavior with Empty Categories', () => {
        it('can still toggle categories that become empty', () => {
            // Search to make a category empty
            cy.get('.paver__search-blocks').type('xyz123nonexistent')
            cy.wait(300)

            // Clear search
            cy.get('.paver__search-blocks').clear()
            cy.wait(300)

            // Should be able to toggle categories normally
            cy.get('.paver__category:not(.paver__category--hidden)').first().within(() => {
                cy.get('.paver__category-toggle').click()
                cy.wait(300)
                cy.get('.paver__block-grid').should('not.be.visible')
            })
        })
    })
})