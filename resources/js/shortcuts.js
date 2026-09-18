const Shortcuts = {
    revert(callback) {
        document.addEventListener('keydown', (event) => {
            if ((event.metaKey || event.ctrlKey) && ! event.shiftKey && event.key === 'z') {
                event.preventDefault()

                callback()
            }
        })
    },

    redo(callback) {
        document.addEventListener('keydown', (event) => {
            const combo = event.metaKey || event.ctrlKey

            if (combo && ((event.shiftKey && event.key.toLowerCase() === 'z') || event.key === 'y')) {
                event.preventDefault()

                callback()
            }
        })
    },

    expand(callback) {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.altKey && event.shiftKey && event.key === 'M') {
                event.preventDefault()

                callback()
            }
        })
    },

    exit(callback) {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()

                callback()
            }
        })
    },

    selectParentBlock(callback) {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp') {
                event.preventDefault()

                callback()
            }
        })
    }
}

export default Shortcuts
