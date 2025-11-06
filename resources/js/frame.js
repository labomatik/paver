import Localization from './localization.js'
import ApiClient from './apiClient.js'
import Shortcuts from './shortcuts.js'
import morph from '@alpinejs/morph'
import helpers from './helpers.js'
import 'tippy.js/dist/tippy.css'
import Alpine from 'alpinejs'
import tippy from 'tippy.js'
import './alpine/tooltip.js'

Alpine.plugin(morph)

window.PaverFrame = function (data) {
    return {
        ...Localization,

        locale: data.locale,

        texts: data.texts,

        blocks: [],

        breadcrumb: [],

        editingBlock: null,

        editingElement: null,

        api: new ApiClient(data.api),

        init() {
            this.renderEditingBlock()

            Shortcuts.revert(() => this.revert())
            Shortcuts.expand(() => this.expand())
            Shortcuts.exit(() => this.exit())

            Shortcuts.selectParentBlock(() => this.selectParentBlock())
            helpers.listenFromFrame('selectParentBlock', () => this.selectParentBlock())

            document.addEventListener('loading', () => helpers.dispatchToParent('loading'))
            document.addEventListener('loaded', () => helpers.dispatchToParent('loaded'))

            helpers.listenFromFrame('updateEditingBlock', (block) => {
                this.editingBlock = block
            })

            this.$watch('blocks', (value) => {
                helpers.dispatchToParent('blocks', JSON.parse(JSON.stringify(value)))
            })

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === document.body) {
                        helpers.dispatchToParent('height', document.body.scrollHeight)
                    }
                }
            });

            resizeObserver.observe(document.body)
        },

        exit() {
            helpers.dispatchToParent('exit', {})
        },

        expand() {
            helpers.dispatchToParent('expand', {})
        },

        revert(event) {
            helpers.dispatchToParent('revert', {})
        },

        selectParentBlock() {
            if (this.breadcrumb.length > 1) {
                this.edit(this.breadcrumb[this.breadcrumb.length - 2].target)
            }
        },

        trash(e) {
            e.preventDefault()

            if (!confirm(this.text('Are you sure you want to delete this block?'))) {
                return
            }

            let target = e.currentTarget.closest('.paver__block')
            let block = target.getAttribute('data-id')

            helpers.dispatchToParent('delete', JSON.parse(JSON.stringify(block)))
            this.breadcrumb = []
        },

        clone(e) {
            let target = e.currentTarget.closest('.paver__block')
            // let block = JSON.parse(target.getAttribute('data-block'))

            helpers.dispatchToParent('clone', JSON.parse(JSON.stringify({ blockHtml: target.outerHTML })))

            this.breadcrumb = []
        },

        getBlockBreadcrumb(block) {
            let breadcrumb = [];
            let current = block;

            while (current) {
                breadcrumb.push({target: current, data: JSON.parse(current.getAttribute('data-block'))})
                current = current.parentElement.closest('.paver__block')
            }

            return breadcrumb.reverse()
        },

        async edit(e) {
            let target = null;

            if (e instanceof Event) {
                if (e.currentTarget.classList.contains('paver__block')) {
                    target = e.currentTarget
                } else {
                    target = e.currentTarget.closest('.paver__block')
                }
            } else if (e instanceof HTMLElement) {
                if (e.classList.contains('paver__block')) {
                    target = e
                } else {
                    target = e.closest('.paver__block')
                }
            }

            if (!target || target.classList.contains('paver__active-block')) {
                return
            }

            this.breadcrumb = this.getBlockBreadcrumb(target)

            let block = JSON.parse(target.getAttribute('data-block'))

            document.querySelectorAll('.paver__active-block').forEach((el) => {
                el.classList.remove('paver__active-block')
            })

            target.classList.add('paver__active-block')

            try {
                const response = await this.api.fetchBlockOptions(block)

                helpers.dispatchToParent('editingBlock', {
                    html: response.optionsHtml,
                    name: response.name,
                    block: { ...{ render: false }, ...JSON.parse(JSON.stringify(block)) }
                })

                this.editingElement = target

            } catch (error) {
                console.log('error', 'Error fetching options:', error)
            }
        },

        async renderEditingBlock() {
            this.$watch('editingBlock', (value) => {
                this.debouncedFetchAndUpdate()
            })

            this.debouncedFetchAndUpdate = Alpine.debounce(async () => {
                let editingBlock = JSON.parse(JSON.stringify(this.editingBlock))

                // Rebuild the child blocks in case they have changed.
                // This function MUST mirror the exact logic in gatherBlocks() from paver.js
                // to correctly handle nested sortable containers (like grid cells)
                function gatherBlocks(list) {
                    let blocks = list.querySelectorAll(':scope > .paver__sortable-item')
                    let newBlocks = []

                    blocks.forEach(block => {
                        // Check if this sortable item has a data-block attribute
                        // Grid cells are sortable-items but don't have data-block
                        if (!block.hasAttribute('data-block')) {
                            // This is a wrapper (like a grid cell), collect from its sortable container
                            let childList = block.querySelector('.paver__sortable')
                            if (childList) {
                                // Recursively gather blocks from the nested sortable
                                let childBlocks = gatherBlocks(childList)
                                newBlocks = newBlocks.concat(childBlocks)
                            }
                            return
                        }

                        let blockData = JSON.parse(block.getAttribute('data-block'))

                        // A block can have multiple sortable containers (e.g., grid cells)
                        let childLists = block.querySelectorAll('.paver__sortable')

                        if (childLists.length > 1) {
                            // Multiple sortables (like grid cells): create array of arrays
                            let childrenByCell = []

                            childLists.forEach(childList => {
                                let cellBlocks = gatherBlocks(childList)
                                childrenByCell.push(cellBlocks)
                            })

                            blockData.children = childrenByCell
                        } else if (childLists.length === 1) {
                            // Single sortable: use flat array (normal behavior)
                            blockData.children = gatherBlocks(childLists[0])
                        }

                        newBlocks.push(blockData)
                    })

                    return newBlocks
                }

                // Handle blocks with children (including special cases like grids with multiple cells)
                // Find all sortable containers within the editing element
                let sortableContainers = this.editingElement.querySelectorAll('.paver__sortable')

                console.log('[PAVER FRAME] Found sortable containers:', sortableContainers.length)

                if (sortableContainers.length > 1) {
                    // Multiple sortables (like grid cells): create array of arrays
                    let childrenByCell = []

                    sortableContainers.forEach((sortableContainer, index) => {
                        let cellBlocks = gatherBlocks(sortableContainer)
                        console.log(`[PAVER FRAME] Cell ${index} has ${cellBlocks.length} blocks:`, cellBlocks)
                        childrenByCell.push(cellBlocks)
                    })

                    console.log('[PAVER FRAME] Children by cell:', childrenByCell)
                    editingBlock.children = childrenByCell
                } else if (sortableContainers.length === 1) {
                    // Single sortable: use flat array (normal behavior)
                    let blocks = gatherBlocks(sortableContainers[0])
                    console.log('[PAVER FRAME] Single sortable with', blocks.length, 'blocks')
                    editingBlock.children = blocks
                }

                console.log('[PAVER FRAME] Final editingBlock.children:', editingBlock.children)

                const response = await this.api.renderBlock(editingBlock)

                this.editingElement.removeAttribute('x-show')

                let currentBlock = JSON.parse(this.editingElement.getAttribute('data-block'))

                currentBlock.data = response.data

                Alpine.morph(this.editingElement, response.render)
                const newElement = document.createElement('div')
                newElement.innerHTML = response.render

                this.editingElement.innerHTML = newElement.querySelector('[data-block]').innerHTML

                this.editingElement.setAttribute('data-block', JSON.stringify(currentBlock))

                helpers.dispatchToParent('update', {})
            }, 1000)
        },

        updateBlockById(id, newData) {
            const updateRecursive = (items) => {
                for (let item of items) {
                    if (item.id === id) {
                        Object.keys(newData).forEach(key => {
                            item[key] = newData[key]
                        })

                        return true
                    }
                    if (item.children) {
                        const updated = updateRecursive(item.children)
                        if (updated) return true
                    }
                }
                return false
            }

            updateRecursive(this.blocks)
        }
    }
}

if (!window.tippy) {
    window.tippy = tippy
}

if (!window.Alpine) {
    window.Alpine = Alpine
}

if (window.__paver_start_alpine) {
    console.log('[PAVER] Starting Alpine.js from frame')

    Alpine.start()
}
