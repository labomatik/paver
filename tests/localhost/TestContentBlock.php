<?php

use Jeffreyvr\Paver\Blocks\Block;
use Jeffreyvr\Paver\Blocks\Options;

class TestContentBlock extends Block
{
    public string $name = 'Test Content';

    public string $icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>';

    public static string $reference = 'test.content';

    public string $category = 'Content';

    public array $data = [
        'title' => 'Sample Title',
        'text' => 'Sample content text goes here.',
    ];

    public function render()
    {
        $html = <<<HTML
            <div class="test-content" style="padding: 1.5rem; border: 1px solid #e5e7eb;">
                <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">{$this->data['title']}</h2>
                <p style="color: #6b7280;">{$this->data['text']}</p>
            </div>
            HTML;

        return $html;
    }

    public function options()
    {
        return [
            Options\Input::make('Title', 'title'),
            Options\Textarea::make('Text', 'text'),
        ];
    }
}