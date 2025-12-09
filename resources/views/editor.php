<div
    class="paver__container"
    x-cloak
    x-data="Paver({
        view: 'desktop',
        texts: <?php echo htmlspecialchars(json_encode(paver()->getLocalizations()), ENT_QUOTES, 'UTF-8'); ?>,
        content: '<?php echo htmlspecialchars($content, ENT_QUOTES, 'UTF-8'); ?>',
        api: <?php echo htmlspecialchars(json_encode(paver()->api()), ENT_QUOTES, 'UTF-8'); ?>,
        blocks: <?php echo htmlspecialchars(paver()->blocks(encode: true)); ?>,
        ...<?php echo htmlspecialchars(json_encode($config)); ?>
    })">

    <div>
        <div class="paver__section paver__section-main">
            <div class="paver__section-header">
                Editor
            </div>

            <?php echo new \Jeffreyvr\Paver\View(paver()->viewPath().'editor/actions.php'); ?>
        </div>
        <div class="paver__iframe-wrapper">
            <div class="paver__iframe-overlay"></div>
            <iframe x-ref="editor" id="editor"
                class="paver__editor"
                :class="view == 'desktop' ? 'paver__desktop' : 'paver__mobile'"
                srcdoc="<?php echo htmlspecialchars($editorHtml, ENT_QUOTES, 'UTF-8'); ?>"></iframe>
        </div>
    </div>

    <?php echo new \Jeffreyvr\Paver\View(paver()->viewPath().'editor/sidebar.php'); ?>

    <!-- Popup Modal for category options - controlled via class binding -->
    <div class="paver__modal-overlay" :class="{ 'paver__modal-visible': popup.visible }" @keydown.escape.window="closePopup()">
        <!-- Backdrop -->
        <div class="paver__modal-backdrop" @click="closePopup()"></div>

        <!-- Popup Panel -->
        <div class="paver__modal-container" @click="closePopup()">
            <div class="paver__options-popup" @click.stop x-ref="optionsPopup">
                <div class="paver__popup-header">
                    <div class="paver__popup-title">
                        <span class="paver__popup-name" x-text="popup.name"></span>
                        <span class="paver__popup-category" x-text="popup.category"></span>
                    </div>
                    <button type="button" @click="closePopup()" class="paver__btn-icon paver__popup-close-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="paver__popup-content paver__inside" x-ref="popupContent"></div>
                <div class="paver__popup-footer">
                    <button type="button" class="paver__btn paver__btn-secondary paver__popup-cancel-btn"></button>
                    <button type="button" class="paver__btn paver__btn-primary paver__popup-save-btn"></button>
                </div>
            </div>
        </div>
    </div>

    <input type="hidden" name="paver_editor_content" x-model="content">
</div>

<style>
<?php echo paver()->loadAssetContent('/css/paver.css'); ?>
</style>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('Paver', (data) => (
            window.Paver(data)
        ));
    });
</script>

<script>
    window.__paver_start_alpine = <?php echo paver()->alpine ? 'true' : 'false'; ?>;

    <?php echo paver()->loadAssetContent('/js/paver.js'); ?>
</script>
