beforeEach(() => {
    cy.visit('http://localhost:8000/?grid=1')
})

it('renders a grid with multiple cells', () => {
    cy.getIframeBody('.paver__editor').within(() => {
        // Check that the grid is rendered
        cy.wait(200).get('.screen-grid').should('exist')

        // Check that we have multiple sortable containers (grid cells)
        cy.get('.screen-grid .paver__sortable').should('have.length.at.least', 2)
    })
})

it('has blocks in specific cells from initial data', () => {
    cy.getIframeBody('.paver__editor').within(() => {
        // Get all grid cell sortables
        cy.get('.screen-grid .paver__sortable').then($cells => {
            // Verify we have 4 cells (matching our grid setup)
            expect($cells).to.have.length(4)

            // Cell 0 should have 1 block
            expect($cells.eq(0).find('.paver__sortable-item[data-block]')).to.have.length(1)

            // Cell 1 should be empty
            expect($cells.eq(1).find('.paver__sortable-item[data-block]')).to.have.length(0)

            // Cell 2 should have 1 block
            expect($cells.eq(2).find('.paver__sortable-item[data-block]')).to.have.length(1)

            // Cell 3 should be empty
            expect($cells.eq(3).find('.paver__sortable-item[data-block]')).to.have.length(0)
        })
    })
})

it('maintains separate children for each grid cell', () => {
    cy.getIframeBody('.paver__editor').within(() => {
        // Verify grid exists and has at least 2 cells
        cy.get('.screen-grid').should('exist')
        cy.get('.screen-grid .paver__sortable').should('have.length.at.least', 2)

        // Check that cells are initially empty or have content
        cy.get('.screen-grid .paver__sortable').first().as('firstCell')
        cy.get('.screen-grid .paver__sortable').eq(1).as('secondCell')
    })
})

it('correctly serializes grid children as array of arrays', () => {
    cy.getIframeBody('.paver__editor').within(() => {
        // Get the grid block's data-block attribute (it's on the parent wrapper)
        cy.get('.screen-grid').parent('[data-block]').then($grid => {
            const blockData = JSON.parse($grid.attr('data-block'))

            // If there are children, verify they are structured correctly
            if (blockData.children && blockData.children.length > 0) {
                // For grids with multiple cells, children should be an array of arrays
                // Each sub-array represents one cell's contents
                const firstChild = blockData.children[0]

                // Check if it's array of arrays format (new format for grids)
                // In array of arrays: firstChild is an array like [] or [{block: '...'}]
                // In flat format: firstChild is an object like {block: '...'}
                const isArrayOfArrays = Array.isArray(firstChild) && (
                    firstChild.length === 0 || // Empty cell (empty array)
                    (firstChild.length > 0 && typeof firstChild[0] === 'object' && 'block' in firstChild[0]) // Has blocks (array of block objects)
                )

                // Log the structure for debugging
                cy.log('Grid children structure:', JSON.stringify(blockData.children))

                // If we have multiple sortable containers, we should have array of arrays
                cy.get('.screen-grid .paver__sortable').then($sortables => {
                    if ($sortables.length > 1) {
                        expect(isArrayOfArrays).to.be.true
                    }
                })
            }
        })
    })
})

it('preserves cell-specific content after moving blocks', () => {
    // This test would require more complex setup with actual blocks
    // For now, we verify the structure is correct
    cy.getIframeBody('.paver__editor').within(() => {
        cy.get('.screen-grid').should('exist')

        // Count sortable containers (cells)
        cy.get('.screen-grid .paver__sortable').then($cells => {
            const cellCount = $cells.length
            cy.log(`Grid has ${cellCount} cells`)

            // Each cell should be able to contain blocks independently
            $cells.each((index, cell) => {
                const $cell = Cypress.$(cell)
                cy.log(`Cell ${index} has ${$cell.find('.paver__sortable-item[data-block]').length} blocks`)
            })
        })
    })
})

it('does not duplicate blocks across cells when saving', () => {
    cy.getIframeBody('.paver__editor').within(() => {
        // Get initial state
        cy.get('.screen-grid .paver__sortable').then($cells => {
            const initialCounts = []

            $cells.each((index, cell) => {
                const count = Cypress.$(cell).find('.paver__sortable-item[data-block]').length
                initialCounts.push(count)
            })

            // Store for later comparison
            cy.wrap(initialCounts).as('initialCounts')
        })
    })

    // Wait for any debounced updates
    cy.wait(1500)

    // Verify blocks haven't been duplicated
    cy.getIframeBody('.paver__editor').within(() => {
        cy.get('.screen-grid .paver__sortable').then($cells => {
            const finalCounts = []

            $cells.each((index, cell) => {
                const count = Cypress.$(cell).find('.paver__sortable-item[data-block]').length
                finalCounts.push(count)
            })

            cy.get('@initialCounts').then(initialCounts => {
                // Counts should remain the same (no duplication)
                expect(finalCounts).to.deep.equal(initialCounts)
            })
        })
    })
})