<?php

namespace Jeffreyvr\Paver\Blocks;

use Jeffreyvr\Paver\Blocks\Options\Option;

abstract class Block
{
    public string $name = 'Block';

    public array $children = [];

    public array $styles = [];

    public array $scripts = [];

    public array $data = [];

    public bool $isInEditor = false;

    public bool $asChildOnly = false;

    public string $category = 'Default';

    public static string $reference = 'REFERENCE_NOT_SET';

    public string $icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
    </svg>';

    public function __construct()
    {
        //
    }

    public function renderer($context = 'front-end'): Renderer
    {
        return new Renderer($this, $context);
    }

    public function isInEditor()
    {
        return $this->isInEditor;
    }

    public function asChildOnly()
    {
        return $this->asChildOnly;
    }

    public function getIcon(): string
    {
        return $this->icon;
    }

    public function setData(array $data): self
    {
        $this->data = $data;

        return $this;
    }

    public function setReference(string $reference): self
    {
        $this->reference = $reference;

        return $this;
    }

    public function setChildren(array $children): self
    {
        $this->children = $children;

        return $this;
    }

    public function hasChildren(): bool
    {
        return ! empty($this->children);
    }

    public function getId()
    {
        return md5(uniqid(rand(), true));
    }

    public function beforeEditorRender()
    {
        // Do something before the editor is rendered
    }

    public function script($handle, $src, $deps = [])
    {
        $this->scripts[] = compact('handle', 'src', 'deps');

        return $this;
    }

    public function style($handle, $src, $deps = [])
    {
        $this->styles[] = compact('handle', 'src', 'deps');

        return $this;
    }

    public function render()
    {
        return '<!-- Block has no content -->';
    }

    public function options()
    {
        return 'This block has no options.';
    }

    /**
     * Edition options (size, dimensions, content)
     * @return array|string|null
     */
    public function editionOptions()
    {
        return null;
    }

    /**
     * Style options (colors, appearance)
     * @return array|string|null
     */
    public function styleOptions()
    {
        return null;
    }

    /**
     * Visibility options (conditional display)
     * @return array|string|null
     */
    public function visibilityOptions()
    {
        return null;
    }

    /**
     * Display mode for edition options
     * @return string 'popup' | 'slide-in'
     */
    protected function getEditionDisplayMode(): string
    {
        return 'slide-in';
    }

    /**
     * Display mode for style options
     * @return string 'popup' | 'slide-in'
     */
    protected function getStyleDisplayMode(): string
    {
        return 'popup';
    }

    /**
     * Display mode for visibility options
     * @return string 'popup' | 'slide-in'
     */
    protected function getVisibilityDisplayMode(): string
    {
        return 'popup';
    }

    /**
     * Check if block uses the new category system
     */
    public function hasOptionCategories(): bool
    {
        return $this->editionOptions() !== null
            || $this->styleOptions() !== null
            || $this->visibilityOptions() !== null;
    }

    /**
     * Get available option categories with metadata
     */
    public function getOptionCategories(): array
    {
        $categories = [];

        if ($this->editionOptions() !== null) {
            $categories['edition'] = [
                'label' => 'Edition',
                'icon' => 'edition',
                'displayMode' => $this->getEditionDisplayMode(),
                'options' => $this->editionOptions(),
            ];
        }

        if ($this->styleOptions() !== null) {
            $categories['style'] = [
                'label' => 'Style',
                'icon' => 'style',
                'displayMode' => $this->getStyleDisplayMode(),
                'options' => $this->styleOptions(),
            ];
        }

        if ($this->visibilityOptions() !== null) {
            $categories['visibility'] = [
                'label' => 'Visibility',
                'icon' => 'visibility',
                'displayMode' => $this->getVisibilityDisplayMode(),
                'options' => $this->visibilityOptions(),
            ];
        }

        return $categories;
    }

    /**
     * Render options for a specific category
     */
    public function renderCategoryOptions(string $category): string
    {
        $categories = $this->getOptionCategories();

        if (! isset($categories[$category])) {
            return '';
        }

        $options = $categories[$category]['options'];

        if (is_array($options)) {
            $output = '';
            foreach ($options as $option) {
                if ($option instanceof Option) {
                    $output .= $option;
                } else {
                    $output .= $option;
                }
            }

            return $output;
        }

        return (string) $options;
    }

    public function renderOptions()
    {
        $options = $this->options();

        if (is_array($options)) {
            $output = '';
            foreach ($options as $option) {
                if ($option instanceof Option) {
                    $output .= $option;
                } else {
                    $output .= $option;
                }
            }

            return $output;
        }

        return $options;
    }

    public function toJson($include = ['name', 'block', 'children', 'data']): string
    {
        $object = [
            'name' => $this->name,
            'block' => static::$reference,
            'children' => $this->children,
            'data' => $this->data,
            'icon' => $this->icon,
        ];

        $object = array_intersect_key($object, array_flip($include));

        return json_encode($object);
    }
}
