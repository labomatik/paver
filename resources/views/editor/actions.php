<div class="paver__editor-actions">
    <div x-cloak :class="loading ? 'paver__flex paver__items-center' : 'paver__hidden'">
        <svg class="paver__loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>

    <div x-cloak class="paver__flex paver__items-center" x-show="canvas === 'react'">
        <button type="button" @click="revert" :disabled="! undoable" :style="undoable ? '' : 'opacity: 0.35; cursor: default'" class="paver__btn-icon" x-paver-tooltip="text('Undo')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
        </button>
        <button type="button" @click="redo" :disabled="! redoable" :style="redoable ? '' : 'opacity: 0.35; cursor: default'" class="paver__btn-icon" x-paver-tooltip="text('Redo')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
        </button>
    </div>

    <div x-cloak class="paver__hide-on-mobile" x-show="buttons.expandButton">
        <button type="button" @click="toggleExpand" x-show="!expanded" class="paver__btn-icon" x-paver-tooltip="text('Expand')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
        </button>
        <button type="button" @click="toggleExpand" x-show="expanded" class="paver__btn-icon" x-paver-tooltip="text('Minimize')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
            </svg>
        </button>
    </div>

    <button x-cloak type="button" x-show="buttons.saveButton" x-on:click="save" class="paver__btn-text paver__btn-text-primary">
        Save
    </button>
</div>
