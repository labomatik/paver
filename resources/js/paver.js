import Localization from './localization.js'
import Shortcuts from './shortcuts.js'
import ApiClient from './apiClient.js'
import morph from '@alpinejs/morph'
import collapse from '@alpinejs/collapse'
import History from './history.js'
import helpers from './helpers.js'
import Sortable from 'sortablejs'
import 'tippy.js/dist/tippy.css'
import Alpine from 'alpinejs'
import tippy from 'tippy.js'
import './alpine/tooltip.js'
import './resizer.js'

Alpine.plugin(morph)
Alpine.plugin(collapse)

window.Paver = function (data) {
    return {
        ...Localization,

        breadcrumb: [],

        texts: data.texts,

        api: new ApiClient(data.api),

        view: data.view,

        blocks: data.blocks,

        content: data.content,

        allowedBlocks: [],

        editingBlock: null,

        edited: false,

        frame: null,

        history: History,

        debug: data.debug ?? false,

        expanded: false,

        editing: false,

        loading: true,

        blockInserter: {
            search: '',
            showAll: false,
            limit: data.blockInserterLimit ?? 6,
            showExpandButton: false,
            visibleCount: 0
        },

        blocksPanelTempOpen: false,

        popup: {
            visible: false,
            html: '',
            name: '',
            category: '',
            position: { top: 0, left: 0 }
        },

        buttons: {
            expandButton: data.showExpandButton ?? true,
            viewButton: data.showViewButton ?? true,
            saveButton: data.showSaveButton ?? false
        },

        allowRootDrop: false,

        log(...args) {
            if (!this.debug) {
                return
            }

            helpers.log(...args)
        },

        save() {
            this.$dispatch('paver-save', {content: this.content})
        },

        revert() {
            if (this.history.get().length > 1 === false) {
                return
            }

            this.history.revert()

            let last = this.history.last()

            this.log('Restoring =', last)

            if (last.editingBlock === null) {
                this.exitEditMode()
            } else {
                this.editingBlock = last.editingBlock

                if(last.componentSidebar) {
                    this.$refs.componentSidebar.innerHTML = last.componentSidebar
                }
            }

            Alpine.morph(this.root(), last.root)

            this.$nextTick(() => {
                this.rebuildContent()
            })
        },

        handleEscape() {
            if (this.expanded && this.editingBlock === null) {
                this.toggleExpand()

                return
            }

            this.exitEditMode()
        },

        exitEditMode() {
            this.editing = false

            this.frame.querySelectorAll('.paver__active-block').forEach((el) => el.classList.remove('paver__active-block'))

            this.$nextTick(() => {
                this.editingBlock = null
            })
        },

        setView(view) {
            this.view = view
        },

        toggleExpand() {
            this.expanded = !this.expanded

            document.querySelector('body').classList.toggle('paver__expanded-editor')
        },

        blockChange(event) {
            this.editingBlock.data[event.detail.key] = event.detail.value
            this.log('Block change', event)
        },

        determineAllowedBlocks() {
            this.allowedBlocks = []

            let element = this.root().querySelector('.paver__active-block .paver__sortable')

            if(! element) {
                return
            }

            if(! element.hasAttribute('data-allow-blocks')) {
                return
            }

            let elementAllowedBlocks = JSON.parse(element.getAttribute('data-allow-blocks'))

            this.allowedBlocks = [...this.allowedBlocks, ...elementAllowedBlocks]

            this.log('Blocks allowed in this block:', this.allowedBlocks)
        },

        init() {
            this.waitForFrame()

            this.listeners()

            this.determineVisibleInsertableBlocks()

            this.watchers()

            Shortcuts.revert(() => this.revert())
            Shortcuts.expand(() => this.toggleExpand())
            Shortcuts.exit(() => this.handleEscape())

            // Initialize Sortable for all category block grids
            this.initializeSortableCategories()
        },

        initializeSortableCategories() {
            const sortableContainers = document.querySelectorAll('.paver__category .paver__sortable')

            sortableContainers.forEach((container) => {
                Sortable.create(container, {
                    ghostClass: "paver__sortable-ghost",
                    chosenClass: "paver__sortable-chosen",
                    dragClass: "paver__sortable-drag",
                    group: {
                        name: 'shared',
                        pull: 'clone',
                        put: false,
                        revertClone: false
                    },
                    sort: false,
                    animation: 150,
                    onStart: (evt) => {
                        evt.clone.setAttribute('x-ignore', '')
                    },
                    onEnd: (evt) => {
                        // Close the blocks panel after drag & drop
                        this.blocksPanelTempOpen = false
                    }
                })
            })
        },

        listeners() {
            helpers.listenFromFrame('blocks', (blocks) => this.content = JSON.stringify(blocks))

            helpers.listenFromFrame('exit', (event) => this.handleEscape())

            helpers.listenFromFrame('revert', (event) => this.revert())

            helpers.listenFromFrame('expand', (event) => this.toggleExpand())

            Shortcuts.selectParentBlock(() => {
                helpers.dispatchToFrame(this.$refs.editor, 'selectParentBlock')
            })

            helpers.listenFromFrame('loading', () => this.isLoading())
            helpers.listenFromFrame('loaded', () => this.isLoaded())

            helpers.listenFromFrame('updateBreadcrumb', (event) => this.breadcrumb = event.breadcrumb)

            document.addEventListener('loading', () => this.isLoading())
            document.addEventListener('loaded', () => this.isLoaded())

            helpers.listenFromFrame('editingBlock', (event) => {
                this.edited = false
                this.editing = true

                this.editingBlock = {
                    name: event.name,
                    ...event.block
                }

                this.log('Editing block from frame')

                this.determineAllowedBlocks()

                this.$nextTick(() => {
                    this.$refs.componentSidebar.querySelector('.paver__inside').innerHTML = event.html
                    this.edited = true

                    this.record()
                })
            })

            helpers.listenFromFrame('editingBlockCategory', (event) => {
                this.edited = false

                this.editingBlock = {
                    ...event.block,
                    name: event.name,
                    category: event.category
                }

                this.log('Editing block category from frame:', event.category, 'displayMode:', event.displayMode, 'name:', event.name)

                if (event.displayMode === 'popup') {
                    this.showPopup(event)
                } else {
                    this.editing = true
                    this.determineAllowedBlocks()

                    this.$nextTick(() => {
                        this.$refs.componentSidebar.querySelector('.paver__inside').innerHTML = event.html
                        this.edited = true

                        this.record()
                    })
                }
            })

            helpers.listenFromFrame('update', (event) => {
                this.log('Updating editor content')

                let nestedSortables = this.root().querySelectorAll('.paver__sortable')

                nestedSortables.forEach(element => {
                    this.initNestedSoratable(element)
                })

                this.rebuildContent()

                this.record()
            })

            helpers.listenFromFrame('delete', (block) => {
                this.log('Deleting block')

                let blockElement = this.root().querySelector('[data-id="' + block + '"]')

                blockElement.remove()

                this.$nextTick(() => {
                    this.exitEditMode()

                    this.rebuildContent()

                    this.record()
                })
            })

            helpers.listenFromFrame('clone', (block) => {
                this.log('Cloning block')

                let newBlock = document.createElement('div')
                newBlock.innerHTML = block.blockHtml

                this.root().appendChild(newBlock.firstElementChild)

                this.exitEditMode()

                this.rebuildContent()

                this.record()
            })
        },

        watchers() {
            this.$watch('editingBlock', value => {
                if (value === null) {
                    this.allowedBlocks = []

                    return
                }

                if (!this.edited) {
                    return
                }

                this.log('Updating editing block')

                helpers.dispatchToFrame(this.$refs.editor, 'updateEditingBlock', JSON.parse(JSON.stringify(value)))
            })

            this.$watch('blockInserter.search', () => {
                this.determineVisibleInsertableBlocks()
            })

            this.$watch('blockInserter.limit', () => {
                this.determineVisibleInsertableBlocks()
            })

            this.$watch('blockInserter.showAll', () => {
                this.determineVisibleInsertableBlocks()
            })

            this.$watch('allowedBlocks', () => {
                this.determineVisibleInsertableBlocks()
            })
        },

        determineVisibleInsertableBlocks() {
            const searchTerm = this.blockInserter.search.trim().toLowerCase()
            const allowedBlocks = this.allowedBlocks.length ? this.allowedBlocks : null
            const categories = document.querySelectorAll('.paver__category')

            let visibleCount = 0
            let totalVisible = 0

            // If searching, hide the category structure and show all blocks flat
            if (searchTerm) {
                categories.forEach(category => {
                    // Add searching class to force block grid visibility via CSS
                    // This preserves Alpine.js internal state
                    category.classList.add('paver__category--searching')

                    // Hide the category toggle/header
                    const categoryToggle = category.querySelector('.paver__category-toggle')
                    if (categoryToggle) {
                        categoryToggle.style.display = 'none'
                    }

                    const blocks = category.querySelectorAll('.paver__block-handle')
                    let categoryHasVisibleBlocks = false

                    blocks.forEach(block => {
                        const blockData = JSON.parse(block.getAttribute('data-block'))
                        const blockReference = blockData.block.trim().toLowerCase()
                        const blockName = blockData.name ? blockData.name.trim().toLowerCase() : ''
                        const isHidden = block.classList.contains('paver__hide_from_block_inserter')
                        const matchesSearch = blockReference.includes(searchTerm) || blockName.includes(searchTerm)
                        const isAllowed = !allowedBlocks || allowedBlocks.includes(blockReference)
                        const withinLimit = this.blockInserter.showAll || visibleCount < this.blockInserter.limit

                        if (isHidden && (!allowedBlocks || !allowedBlocks.includes(blockReference))) {
                            block.style.display = 'none'
                            return
                        }

                        if (matchesSearch && isAllowed) {
                            totalVisible++
                            categoryHasVisibleBlocks = true
                            block.style.display = withinLimit ? 'flex' : 'none'
                            if (withinLimit) visibleCount++
                        } else {
                            block.style.display = 'none'
                        }
                    })

                    // Hide category completely if no visible blocks
                    if (categoryHasVisibleBlocks) {
                        category.classList.remove('paver__category--hidden')
                    } else {
                        category.classList.add('paver__category--hidden')
                    }
                })
            } else {
                // Not searching - restore normal category structure
                categories.forEach(category => {
                    // Remove searching class to restore Alpine control
                    category.classList.remove('paver__category--searching')

                    // Show the category toggle/header
                    const categoryToggle = category.querySelector('.paver__category-toggle')
                    if (categoryToggle) {
                        categoryToggle.style.display = ''
                    }

                    const blocks = category.querySelectorAll('.paver__block-handle')
                    let categoryHasVisibleBlocks = false

                    blocks.forEach(block => {
                        const blockData = JSON.parse(block.getAttribute('data-block'))
                        const blockReference = blockData.block.trim().toLowerCase()
                        const isHidden = block.classList.contains('paver__hide_from_block_inserter')
                        const isAllowed = !allowedBlocks || allowedBlocks.includes(blockReference)
                        const withinLimit = this.blockInserter.showAll || visibleCount < this.blockInserter.limit

                        if (isHidden && (!allowedBlocks || !allowedBlocks.includes(blockReference))) {
                            block.style.display = 'none'
                            return
                        }

                        if (isAllowed) {
                            totalVisible++
                            categoryHasVisibleBlocks = true
                            block.style.display = withinLimit ? 'flex' : 'none'
                            if (withinLimit) visibleCount++
                        } else {
                            block.style.display = 'none'
                        }
                    })

                    // Hide category if no visible blocks (e.g., due to allowedBlocks restrictions)
                    if (categoryHasVisibleBlocks) {
                        category.classList.remove('paver__category--hidden')
                    } else {
                        category.classList.add('paver__category--hidden')
                    }
                })
            }

            this.blockInserter.showExpandButton = totalVisible > this.blockInserter.limit
            this.blockInserter.visibleCount = totalVisible
        },

        root() {
            return this.frame.querySelector('.paver__editor-root')
        },

        waitForFrame() {
            const interval = setInterval(() => {
                this.frame = this.$refs.editor.contentDocument || this.$refs.editor.contentWindow.document

                if (this.root()) {
                    this.log('Found root in frame, initializing sortable')

                    clearInterval(interval)

                    this.frameInit()

                    this.loading = false

                    this.$dispatch('paver-ready')
                }
            }, 100)
        },

        record() {
            let record = {
                root: this.root().outerHTML,
                editingBlock: JSON.parse(JSON.stringify(this.editingBlock)),
            }

            if(this.$refs.componentSidebar) {
                record.componentSidebar = this.$refs.componentSidebar.innerHTML
            }

            this.history.add(record)

            this.log('Recorded entry in history', this.history)
        },

        frameInit() {
            this.record()

            // `allowRootDrop` is a dirty hack as Sortable does not recognize it
            // when an item is first dragged over the frame and then dragged
            // out of it it will still add the item on 'dragend' - yuck.
            this.root().addEventListener("dragenter", () => this.allowRootDrop = true)
            document.querySelector('body').addEventListener("dragenter", () => this.allowRootDrop = false)

            Sortable.create(this.root(), {
                ghostClass: "paver__sortable-ghost",
                chosenClass: "paver__sortable-chosen",
                dragClass: "paver__sortable-drag",
                group: {
                    name: 'shared',
                    put: (to, from, draggedElement) => {
                        if (draggedElement.hasAttribute('data-child-block-only')) {
                            return false
                        }

                        return true
                    },
                },
                animation: 150,
                handle: '.paver__block-handle',
                onAdd: (evt) => {
                    if(! this.allowRootDrop) {
                        evt.item.remove()
                    } else {
                        evt.item.innerHTML = ''
                        this.fetchBlock(evt)
                    }
                },
                onEnd: () => this.rebuildContent()
            })

            let nestedSortables = this.root().querySelectorAll('.paver__sortable')

            nestedSortables.forEach(element => {
                this.initNestedSoratable(element)
            })

            this.hoveringStates()

            this.linkClickWarnings()

            this.frameHeightManager()
        },

        initNestedSoratable(element) {
            Sortable.create(element, {
                ghostClass: "paver__sortable-ghost",
                chosenClass: "paver__sortable-chosen",
                dragClass: "paver__sortable-drag",
                group: {
                    name: 'nested',
                    pull: false,
                    put: true,
                    put: (to, from, draggedElement) => {
                        if (to.el.hasAttribute('data-allow-blocks') === false) {
                            return true
                        }

                        let allowedBlocks = JSON.parse(to.el.getAttribute('data-allow-blocks'))

                        let draggedBlock = JSON.parse(draggedElement.getAttribute('data-block')).block.trim().toLowerCase()

                        return allowedBlocks.some(block => block.trim().toLowerCase() === draggedBlock)
                    }
                },
                handle: '.paver__block-handle',
                direction: element.getAttribute('data-direction') || 'vertical',
                animation: 150,
                onAdd: (evt) => {
                    // Check if the source is a block inserter (from any category)
                    if(evt.from.closest('.paver__category')) {
                        this.fetchBlock(evt)
                    }
                },
                onEnd: (evt) => this.rebuildContent()
            })
        },

        frameHeightManager() {
            const iframeBodyHeight = this.$refs.editor.contentWindow.document.body.scrollHeight

            document.querySelector('iframe').style.height = iframeBodyHeight + 'px'

            helpers.listenFromFrame('height', (height) => {
                this.log('Setting editor height to', height)

                this.$refs.editor.style.height = height + 'px'
            })
        },

        hoveringStates() {
            this.log('Applying hover states on blocks in editor')

            this.root().addEventListener('mouseover', (e) => {
                const element = e.target.closest('.paver__sortable-item')
                if (element) {
                    element.classList.add('paver__hover-block')
                }
            })

            this.root().addEventListener('mouseout', (e) => {
                const element = e.target.closest('.paver__sortable-item')
                if (element) {
                    element.classList.remove('paver__hover-block')
                }
            })
        },

        linkClickWarnings() {
            let warning = (e) => {
                e.preventDefault()

                var proceed = confirm(this.text('Do you really want to follow this link?'))

                if (proceed) {
                    window.open(link.href, '_blank')
                }

                return
            }

            this.root().querySelectorAll('a').forEach((link) => {
                link.removeEventListener('click', warning)
                link.addEventListener('click', warning)
            })
        },

        rebuildContent() {
            this.log('Rebuilding the content value')

            const gatherBlocks = (list) => {
                let blocks = list.querySelectorAll(':scope > .paver__sortable-item')
                let newBlocks = []

                blocks.forEach((block) => {
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

                        childLists.forEach((childList) => {
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

            let newBlocks = gatherBlocks(this.root())

            this.content = JSON.stringify(newBlocks)
            this.$dispatch('paver-change', {content: this.content})

            this.hoveringStates()
            this.linkClickWarnings()
        },

        isLoading() {
            this.loading = true
        },

        isLoaded() {
            setTimeout(() => {
                this.loading = false
            }, 100)
        },

        showPopup(event) {
            // Set the popup state
            this.popup.html = event.html
            this.popup.name = event.name
            this.popup.category = event.category
            this.popup.visible = true

            // Show the modal overlay
            const modalOverlay = document.querySelector('.paver__modal-overlay')
            if (modalOverlay) {
                modalOverlay.classList.add('paver__modal-visible')
            }

            // Inject content after DOM update
            setTimeout(() => {
                // Update title and category in DOM directly
                const popupName = document.querySelector('.paver__popup-name')
                const popupCategory = document.querySelector('.paver__popup-category')
                if (popupName) {
                    popupName.textContent = event.name || ''
                }
                if (popupCategory) {
                    popupCategory.textContent = event.category || ''
                }

                const popupContent = document.querySelector('.paver__popup-content')
                if (popupContent) {
                    popupContent.innerHTML = event.html
                    this.log('Popup content injected')
                } else {
                    this.log('Popup content element not found')
                }

                // Add native event listeners for closing
                this.setupPopupCloseListeners()
            }, 50)

            this.edited = true
            this.log('Showing popup (centered)')
        },

        setupPopupCloseListeners() {
            // Backdrop click handler
            const backdrop = document.querySelector('.paver__modal-backdrop')
            if (backdrop) {
                backdrop.onclick = () => this.closePopup()
            }

            // Container click handler (click outside popup)
            const container = document.querySelector('.paver__modal-container')
            if (container) {
                container.onclick = (e) => {
                    // Only close if clicking directly on container, not on popup
                    if (e.target === container) {
                        this.closePopup()
                    }
                }
            }

            // Close button handler
            const closeBtn = document.querySelector('.paver__popup-close-btn')
            if (closeBtn) {
                closeBtn.onclick = () => this.closePopup()
            }

            // Escape key handler
            this._escapeHandler = (e) => {
                if (e.key === 'Escape' && this.popup.visible) {
                    this.closePopup()
                }
            }
            document.addEventListener('keydown', this._escapeHandler)
        },

        closePopup() {
            this.log('closePopup called, current visible state:', this.popup.visible)
            this.popup.visible = false
            this.popup.html = ''
            this.popup.name = ''
            this.popup.category = ''

            // Hide the modal overlay
            const modalOverlay = document.querySelector('.paver__modal-overlay')
            if (modalOverlay) {
                modalOverlay.classList.remove('paver__modal-visible')
            }

            // Clear popup content
            const popupContent = document.querySelector('.paver__popup-content')
            if (popupContent) {
                popupContent.innerHTML = ''
            }

            // Remove escape key listener
            if (this._escapeHandler) {
                document.removeEventListener('keydown', this._escapeHandler)
                this._escapeHandler = null
            }

            // Remove active block highlight
            if (this.frame) {
                this.frame.querySelectorAll('.paver__active-block').forEach((el) => {
                    el.classList.remove('paver__active-block')
                })
            }

            this.log('Popup closed')
        },

        async fetchBlock(evt) {
            const block = JSON.parse(evt.item.getAttribute('data-block'))

            try {
                const response = await this.api.fetchBlock(block.block, this.api.payload)

                const newElement = document.createElement('div')
                newElement.innerHTML = response.render

                newElement.firstElementChild.setAttribute('data-block', JSON.stringify({...block, data: response.data}))
                newElement.firstElementChild.setAttribute('data-id', response.id)

                evt.item.outerHTML = newElement.innerHTML

                let elementInRoot = this.root().querySelector('div[data-id="'+response.id+'"]')

                elementInRoot.querySelectorAll('.paver__sortable').forEach(element => {
                    this.log('Nested sortable found, initializing', element)

                    this.initNestedSoratable(element)
                })

                this.hoveringStates()
                this.linkClickWarnings()

                this.rebuildContent()

                this.record()
            } catch (error) {
                this.log('error', 'Error fetching options:', error)
            }
        }
    }
}

if(! window.tippy) {
    window.tippy = tippy
}

if(! window.Alpine) {
    window.Alpine = Alpine
}

if(window.__paver_start_alpine) {
    Alpine.start()
}
