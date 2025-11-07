<div class="paver__sidebar">
    <div class="paver__resizer"></div>
    <div class="paver__sticky"
         @toggle-blocks-panel.window="blocksPanelTempOpen = !blocksPanelTempOpen"
         x-init="
            let clickHandlers = [];
            $watch('blocksPanelTempOpen', value => {
                // Remove existing handlers
                clickHandlers.forEach(({element, handler}) => {
                    element.removeEventListener('click', handler)
                });
                clickHandlers = [];

                if (value && editing) {
                    setTimeout(() => {
                        const closeOnClickOutside = (e) => {
                            const blocksPanel = document.querySelector('.paver__blocks-panel')
                            const toggleBtn = document.querySelector('.paver__blocks-toggle-btn')

                            // Close if click is outside blocks panel and not on toggle button
                            if (blocksPanel && !blocksPanel.contains(e.target) &&
                                (!toggleBtn || !toggleBtn.contains(e.target))) {
                                blocksPanelTempOpen = false
                            }
                        }

                        // Listen on main document
                        document.addEventListener('click', closeOnClickOutside)
                        clickHandlers.push({element: document, handler: closeOnClickOutside});

                        // Also listen on iframe if it exists
                        const iframe = document.querySelector('.paver__editor')
                        if (iframe && iframe.contentDocument) {
                            iframe.contentDocument.addEventListener('click', closeOnClickOutside)
                            clickHandlers.push({element: iframe.contentDocument, handler: closeOnClickOutside});
                        }
                    }, 100)
                }
            })
         ">
        <!-- Blocks Panel - slides to the right when editing -->
        <div class="paver__blocks-panel"
             x-ref="blocksPanel"
             :class="{'paver__blocks-panel--minimized': editing, 'paver__blocks-panel--temp-open': blocksPanelTempOpen}">
            <div class="paver__section">
                <div class="paver__section-header" x-text="text('Blocks')"></div>
                <div class="paver__section-content">
                <div x-cloak x-show="blocks.length > 0" class="paver__option">
                    <input type="text" x-model="blockInserter.search" :placeholder="text('Search blocks')" class="paver__search-blocks">
                </div>

                <!-- No blocks registered -->
                <div x-cloak x-show="blocks.length === 0" style="padding: 1rem; text-align: center; color: #6B7280;">
                    Whoops, we don't have any blocks (yet)!
                </div>

                <!-- No results from search -->
                <template x-if="blocks.length > 0 && blockInserter.search.trim() !== '' && blockInserter.visibleCount === 0">
                    <div style="padding: 1rem; text-align: center; color: #6B7280;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 48px; height: 48px; margin: 0 auto 0.5rem; opacity: 0.5;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <div x-text="text('No blocks found')"></div>
                    </div>
                </template>
                <?php
                    // Group blocks by category
                    $blocksByCategory = [];
                    foreach(paver()->blocks(withInstance: true) as $block) {
                        $category = $block['category'] ?? 'Default';
                        if (!isset($blocksByCategory[$category])) {
                            $blocksByCategory[$category] = [];
                        }
                        $blocksByCategory[$category][] = $block;
                    }

                    // Sort categories alphabetically, but put 'Default' first
                    uksort($blocksByCategory, function($a, $b) {
                        if ($a === 'Default') return -1;
                        if ($b === 'Default') return 1;
                        return strcmp($a, $b);
                    });

                    $isFirstCategory = true;
                ?>
                <?php foreach($blocksByCategory as $categoryName => $categoryBlocks): ?>
                    <div class="paver__category" x-data="{ open: <?php echo $isFirstCategory ? 'true' : 'false'; ?> }">
                        <button type="button" class="paver__category-toggle" @click="open = !open">
                            <svg class="paver__category-icon" :class="{'paver__category-icon--open': open}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <span><?php echo htmlspecialchars($categoryName); ?></span>
                        </button>
                        <div x-show="open" x-collapse class="paver__block-grid paver__sortable" x-ref="blocksInserter<?php echo htmlspecialchars($categoryName); ?>">
                            <?php foreach($categoryBlocks as $block): ?>
                                <div x-paver-tooltip="text('<?php echo addslashes($block['name']); ?>')"  class="paver__sortable-item paver__block-handle <?php echo ($block['instance']->asChildOnly()) ? 'paver__hide_from_block_inserter' : ''; ?>"
                                    data-block="<?php echo htmlentities($block['instance']->toJson(['block', 'name']), ENT_QUOTES, 'UTF-8'); ?>">
                                    <span><?php echo $block['icon']; ?></span>
                                    <span><?php
                                        // Trucate the block name if it's too long
                                        if(strlen($block['name']) > 10) {
                                            echo substr($block['name'], 0, 10) . '...';
                                        } else
                                            echo $block['name'];
                                        ?>
                                    </span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php $isFirstCategory = false; ?>
                <?php endforeach; ?>
                <div x-show="blockInserter.showExpandButton">
                    <button type="button" class="paver__expand-btn" x-on:click="blockInserter.showAll = !blockInserter.showAll">
                        <span x-show="! blockInserter.showAll">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Expand
                        </span>
                        <span x-show="blockInserter.showAll">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                            </svg>
                            Collapse
                        </span>
                    </button>
                </div>
            </div>
        </div>
        </div>

        <!-- Options Panel - takes full width when editing -->
        <div class="paver__options-panel"
             x-show="editing"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition ease-in duration-300"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             style="display: none;">
                <!-- Toggle button to temporarily open blocks panel -->
                <button
                    type="button"
                    class="paver__blocks-toggle-btn"
                    @click="$dispatch('toggle-blocks-panel')"
                    x-paver-tooltip="text('Toggle blocks panel')"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                </button>

                <div class="paver__section">
                    <div class="paver__section-header">
                        <div x-text="editingBlock?.name || ''"></div>
                        <button type="button" @click="exitEditMode" x-paver-tooltip="text('Exit edit mode')" class="paver__btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="paver__component-sidebar paver__section-content" x-ref="componentSidebar">
                        <div class="paver__inside"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
