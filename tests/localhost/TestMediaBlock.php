<?php

use Jeffreyvr\Paver\Blocks\Block;
use Jeffreyvr\Paver\Blocks\Options;

class TestMediaBlock extends Block
{
    public string $name = 'Test Media';

    public string $icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>';

    public static string $reference = 'test.media';

    public string $category = 'Media';

    public array $data = [
        'imageUrl' => 'https://via.placeholder.com/600x400',
        'alt' => 'Placeholder image',
        'width' => '100%',
    ];

    public function render()
    {
        $html = <<<HTML
            <div class="test-media" style="text-align: center; padding: 1rem;">
                <img src="{$this->data['imageUrl']}" alt="{$this->data['alt']}" style="width: {$this->data['width']}; height: auto; border-radius: 0.5rem;">
            </div>
            HTML;

        return $html;
    }

    public function options()
    {
        return [
            Options\Input::make('Image URL', 'imageUrl'),
            Options\Input::make('Alt Text', 'alt'),
            Options\Input::make('Width', 'width'),
        ];
    }
}