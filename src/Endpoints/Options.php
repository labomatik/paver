<?php

namespace Jeffreyvr\Paver\Endpoints;

use Jeffreyvr\Paver\Blocks\BlockFactory;

class Options extends Endpoint
{
    public function handle()
    {
        $blockData = $this->get('block')['block'];
        $category = $this->get('category');

        $block = BlockFactory::createById($blockData);
        $block->data = array_merge($block->data, $this->get('block')['data']);

        // If block has categories but no specific category requested, default to 'edition'
        if ($block->hasOptionCategories() && ! $category) {
            $category = 'edition';
        }

        $init = '';
        foreach ($block->data as $key => $value) {
            $init .= '$watch(\''.$key.'\', value => {
                $dispatch(\'block-change\', { key: \''.$key.'\', value: value });
            });';
        }

        $data = htmlentities(json_encode($block->data), ENT_QUOTES, 'UTF-8');

        // Determine which options to render
        if ($category && $block->hasOptionCategories()) {
            $optionsHtml = $block->renderCategoryOptions($category);
            $categories = $block->getOptionCategories();
            $displayMode = $categories[$category]['displayMode'] ?? 'slide-in';
        } else {
            // Backward compatibility: render all options
            $optionsHtml = $block->renderOptions();
            $displayMode = 'slide-in';
        }

        $html = '<div x-data="'.$data.'" x-init="'.$init.'">';
        $html .= $optionsHtml;
        $html .= '</div>';

        $this->json([
            'name' => $block->name,
            'optionsHtml' => $html,
            'displayMode' => $displayMode,
            'hasCategories' => $block->hasOptionCategories(),
            'category' => $category,
        ]);
    }
}
