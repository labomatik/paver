const History = {
    entries: [],
    undone: [],

    // A new entry opens another branch: what was undone can no longer come back.
    add(entry) {
        this.entries.push(entry)
        this.undone = []
    },

    revert() {
        const entry = this.entries.pop()

        if (entry) {
            this.undone.push(entry)
        }
    },

    redo() {
        const entry = this.undone.pop()

        if (entry) {
            this.entries.push(entry)
        }

        return entry ?? null
    },

    last() {
        return this.entries[this.entries.length - 1]
    },

    clear() {
        this.entries = []
        this.undone = []
    },

    get() {
        return this.entries
    }
}

export default History
