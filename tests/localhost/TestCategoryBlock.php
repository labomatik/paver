<?php

use Jeffreyvr\Paver\Blocks\Block;
use Jeffreyvr\Paver\Blocks\Options;

class TestCategoryBlock extends Block
{
    public string $name = 'Category Block';

    public string $icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>';

    public static string $reference = 'test.category';

    public string $category = 'Test';

    public array $data = [
        'title' => 'Category Block Title',
        'width' => '100%',
        'background_color' => '#ffffff',
        'text_color' => '#000000',
        'visible_on_mobile' => '1',
        'visible_on_desktop' => '1',
    ];

    public function render()
    {
        $mobileClass = $this->data['visible_on_mobile'] === '1' ? '' : 'hidden-mobile';
        $desktopClass = $this->data['visible_on_desktop'] === '1' ? '' : 'hidden-desktop';

        $html = <<<HTML
            <div class="test-category-block {$mobileClass} {$desktopClass}"
                 style="padding: 1.5rem; width: {$this->data['width']}; background-color: {$this->data['background_color']}; color: {$this->data['text_color']}; border: 2px dashed #6366f1;">
                <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">{$this->data['title']}</h3>
                <p style="font-size: 0.875rem; opacity: 0.7;">This block uses the new category options system</p>
            </div>
            HTML;

        return $html;
    }

    public function editionOptions()
    {
        return [
            Options\Input::make('Title', 'title'),
            Options\Input::make('Width', 'width'),
        ];
    }

    public function styleOptions()
    {
        return [
            Options\Input::make('Background Color', 'background_color', ['type' => 'color']),
            Options\Input::make('Text Color', 'text_color', ['type' => 'color']),
        ];
    }

    public function visibilityOptions()
    {
        return [
            Options\Select::make('Visible on Mobile', 'visible_on_mobile', [
                '1' => 'Yes',
                '0' => 'No',
            ]),
            Options\Select::make('Visible on Desktop', 'visible_on_desktop', [
                '1' => 'Yes',
                '0' => 'No',
            ]),
        ];
    }

    protected function getEditionDisplayMode(): string
    {
        return 'slide-in';
    }

    protected function getStyleDisplayMode(): string
    {
        return 'popup';
    }

    protected function getVisibilityDisplayMode(): string
    {
        return 'popup';
    }
}
