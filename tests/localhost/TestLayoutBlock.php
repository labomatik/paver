<?php

use Jeffreyvr\Paver\Blocks\Block;
use Jeffreyvr\Paver\Blocks\Options;

class TestLayoutBlock extends Block
{
    public string $name = 'Test Layout';

    public string $icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>';

    public static string $reference = 'test.layout';

    public string $category = 'Layout';

    public array $data = [
        'alignment' => 'left',
        'backgroundColor' => '#ffffff',
    ];

    public function render()
    {
        $html = <<<HTML
            <div class="test-layout" style="text-align: {$this->data['alignment']}; background-color: {$this->data['backgroundColor']}; padding: 2rem;">
                <!-- Paver::children() -->
            </div>
            HTML;

        return $html;
    }

    public function options()
    {
        return [
            Options\Select::make('Alignment', 'alignment')->options([
                'left' => 'Left',
                'center' => 'Center',
                'right' => 'Right',
            ]),
            Options\Input::make('Background Color', 'backgroundColor'),
        ];
    }
}