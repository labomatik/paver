<?php

use Jeffreyvr\Paver\Blocks\Block;
use Jeffreyvr\Paver\Blocks\Options;

class TestGrid extends Block
{
    public string $name = 'Test Grid';

    public string $icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>';

    public static string $reference = 'test.grid';

    public string $category = 'Paver Examples';

    public array $allowedChildrenBlocks = [
        'paver.example',
    ];

    public array $data = [
        'gridCols' => 4,
        'padding' => '1rem',
        'margin' => '1rem',
    ];

    public function render()
    {
        $childrens = '';
        $allowedBlocks = '"' . implode('", "', $this->allowedChildrenBlocks) . '"';

        for ($i = 0; $i < $this->data['gridCols']; $i++) {
            $childrens .= '<div class="min-h-8 paver__sortable-item" data-grid-cell="'.$i.'"><!-- Paver::children({"allowBlocks": ['.$allowedBlocks.'], "attributes": {"class": "p-2 border bg-gray-50"}}) --></div>';
        }

        $html = <<<HTML
            <div class="screen-grid grid grid-cols-{$this->data['gridCols']} gap-4" style="padding: {$this->data['padding']}; margin: {$this->data['margin']};">
                {$childrens}
            </div>
            HTML;

        return $html;
    }

    public function options()
    {
        return [
            Options\Input::make('Grid Columns', 'gridCols'),
            Options\Input::make('Padding', 'padding'),
            Options\Input::make('Margin', 'margin'),
        ];
    }
}