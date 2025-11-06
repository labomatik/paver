<?php

namespace Jeffreyvr\Paver\Blocks;

use Jeffreyvr\Paver\View;

class Renderer
{
    protected Block $block;

    protected string $context;

    public function __construct(Block $block, string $context = 'front-end')
    {
        $this->block = $block;
        $this->context = $context;
    }

    protected function isEditorContext(): bool
    {
        return $this->context === 'editor';
    }

    public function renderToolbar(): string
    {
        if (! $this->isEditorContext()) {
            return '';
        }

        return new View(paver()->viewPath().'/block-toolbar.php', [
            'block' => $this->block,
        ]);
    }

    public function renderChildren(): string
    {
        $output = '';

        if (empty($this->block->children)) {
            return $output;
        }
        // ray($this->block->children)->purple();

        $originalBlock = $this->block;

        // Check if children is array of arrays (grid format) or flat array
        // Grid format: [[{block1}, {block2}], [{block3}], ...]
        // Normal format: [{block1}, {block2}, ...]
        $firstChild = $this->block->children[0] ?? null;
        $isArrayOfArrays = is_array($firstChild) && (
            empty($firstChild) || // Empty array (empty cell)
            (isset($firstChild[0]) && is_array($firstChild[0])) // Has blocks
        );

        // For grid format (array of arrays), flatten it first
        $children = $this->block->children;
        if ($isArrayOfArrays) {
            // Filter out empty arrays before merging
            $nonEmptyChildren = array_filter($children, fn($cell) => !empty($cell));
            $children = !empty($nonEmptyChildren) ? array_merge(...$nonEmptyChildren) : [];
        }

        foreach ($children as $childBlock) {
            // Skip empty or invalid blocks
            if (empty($childBlock) || !isset($childBlock['block'])) {
                continue;
            }

            $childBlockInstance = BlockFactory::createById($childBlock['block'], $childBlock['data'] ?? [], $childBlock['children'] ?? []);

            $childRenderer = new Renderer($childBlockInstance, $this->context);
            $output .= $childRenderer->render();
        }

        $this->block = $originalBlock;

        return $output;
    }

    public function replacePaverComments(string $html, string $innerHtml): string
    {
        $pattern = '/<!--\s*Paver::children\((\{.*?\})?\)\s*-->/';

        if (preg_match_all($pattern, $html, $matches)) {
            $commentCount = count($matches[0]);

            // If there are multiple comments (like grid cells), distribute children among them
            if ($commentCount > 1 && !empty($this->block->children)) {
                // Ensure children is an array (it might be a JSON string)
                $children = is_string($this->block->children)
                    ? json_decode($this->block->children, true)
                    : $this->block->children;

                // Check if children is array of arrays (new format) or flat array (old format)
                // Grid format: [[{block1}, {block2}], [{block3}], ...]
                // Normal format: [{block1}, {block2}, ...]
                $firstChild = $children[0] ?? null;
                $isArrayOfArrays = is_array($firstChild) && (
                    empty($firstChild) || // Empty array (empty cell)
                    (isset($firstChild[0]) && is_array($firstChild[0])) // Has blocks
                );

                foreach ($matches[1] as $index => $jsonString) {
                    $dataArray = json_decode($jsonString, true);
                    $attributes = $dataArray['attributes'] ?? [];

                    $attributes['class'] = 'paver__sortable '.($attributes['class'] ?? '');

                    if (! empty($dataArray['allowBlocks'])) {
                        $attributes['data-allow-blocks'] = json_encode($dataArray['allowBlocks']);
                    }

                    $attributeString = implode(' ', array_map(function ($key) use ($attributes) {
                        return $key.'="'.htmlspecialchars($attributes[$key]).'"';
                    }, array_keys($attributes)));

                    // Render children for this specific cell
                    $cellContent = '';
                    if ($isArrayOfArrays && isset($children[$index]) && is_array($children[$index])) {
                        // New format: children[cellIndex] = array of blocks for that cell
                        foreach ($children[$index] as $childBlock) {
                            // Skip if null or empty
                            if (empty($childBlock)) {
                                continue;
                            }

                            // Decode if it's a JSON string
                            $childBlock = is_string($childBlock) ? json_decode($childBlock, true) : $childBlock;

                            // Skip if decoding failed or block is missing
                            if (empty($childBlock) || !isset($childBlock['block'])) {
                                continue;
                            }

                            $childBlockInstance = BlockFactory::createById($childBlock['block'], $childBlock['data'] ?? [], $childBlock['children'] ?? []);
                            $childRenderer = new Renderer($childBlockInstance, $this->context);
                            $cellContent .= $childRenderer->render();
                        }
                    } elseif (!$isArrayOfArrays && isset($children[$index])) {
                        // Old format: children[index] = single block (backward compatibility)
                        $childBlock = $children[$index];

                        // Skip if null or empty
                        if (!empty($childBlock)) {
                            // Decode if it's a JSON string
                            $childBlock = is_string($childBlock) ? json_decode($childBlock, true) : $childBlock;

                            // Only render if valid
                            if (!empty($childBlock) && isset($childBlock['block'])) {
                                $childBlockInstance = BlockFactory::createById($childBlock['block'], $childBlock['data'] ?? [], $childBlock['children'] ?? []);
                                $childRenderer = new Renderer($childBlockInstance, $this->context);
                                $cellContent = $childRenderer->render();
                            }
                        }
                    }

                    $replacementContent = '<div '.$attributeString.'>'.$cellContent.'</div>';

                    $html = preg_replace('/<!--\s*Paver::children\('.preg_quote($jsonString, '/').'\)\s*-->/', $replacementContent, $html, 1);
                }
            } else {
                // Single comment: use all children (original behavior)
                foreach ($matches[1] as $jsonString) {
                    $dataArray = json_decode($jsonString, true);
                    $attributes = $dataArray['attributes'] ?? [];

                    $attributes['class'] = 'paver__sortable '.($attributes['class'] ?? '');

                    if (! empty($dataArray['allowBlocks'])) {
                        $attributes['data-allow-blocks'] = json_encode($dataArray['allowBlocks']);
                    }

                    $attributeString = implode(' ', array_map(function ($key) use ($attributes) {
                        return $key.'="'.htmlspecialchars($attributes[$key]).'"';
                    }, array_keys($attributes)));

                    $replacementContent = '<div '.$attributeString.'>'.$innerHtml.'</div>';

                    $html = preg_replace('/<!--\s*Paver::children\('.preg_quote($jsonString, '/').'\)\s*-->/', $replacementContent, $html, 1);
                }
            }
        }

        return $html;
    }

    public function blockClassName()
    {
        return strtolower(str_replace('.', '-', $this->block::$reference));
    }

    public function render(): string
    {
        $attributeString = $this->isEditorContext()
            ? 'class="'.$this->blockClassName().' paver__block paver__sortable-item parent" data-id="'.$this->block->getId().'" data-block="'.htmlspecialchars($this->block->toJson(), ENT_QUOTES, 'UTF-8').'"'
            : 'class="'.$this->blockClassName().'"';

        if($this->isEditorContext()) {
            $this->block->isInEditor = true;
        }

        $content = '<div '.$attributeString.'>';
        $content .= $this->renderToolbar();
        $content .= (string) $this->block->render();
        $content .= '</div>';

        return $this->replacePaverComments($content, $this->renderChildren());
    }

    public static function block(Block $block, string $context = 'front-end'): string
    {
        return (new static($block, $context))->render();
    }

    public static function blocks($blocks, $context = 'front-end'): string
    {
        if (is_string($blocks)) {
            $blocks = json_decode($blocks, true);
        }

        $content = '';

        foreach ($blocks as $block) {
            $_block = BlockFactory::createById($block['block'], $block['data'] ?? [], $block['children'] ?? []);

            $content .= $_block->renderer($context)->render();
        }

        return $content;
    }
}
