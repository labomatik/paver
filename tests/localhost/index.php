<?php

use Jeffreyvr\Paver\Blocks\Example;
use Jeffreyvr\Paver\Paver;

require __DIR__ . '/../../vendor/autoload.php';
require __DIR__ . '/TestGrid.php';
require __DIR__ . '/TestLayoutBlock.php';
require __DIR__ . '/TestContentBlock.php';
require __DIR__ . '/TestMediaBlock.php';

$paver = Paver::instance();

$paver->api->setEndpoints([
    'options' => 'index.php?options',
    'render' => 'index.php?render',
    'fetch' => 'index.php?fetch',
]);

$paver->frame->headHtml = <<<HTML
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
HTML;

$paver->registerBlock(Example::class);
$paver->registerBlock(TestGrid::class);
$paver->registerBlock(TestLayoutBlock::class);
$paver->registerBlock(TestContentBlock::class);
$paver->registerBlock(TestMediaBlock::class);

$content = [];

if(isset($_GET['content'])) {
    $content[] = ['block' => 'paver.example'];
}

if(isset($_GET['grid'])) {
    $content[] = [
        'block' => 'test.grid',
        'children' => [
            // Cell 0: has one block
            [
                ['block' => 'paver.example', 'data' => ['name' => 'Block in Cell 0']]
            ],
            // Cell 1: empty
            [],
            // Cell 2: has one block
            [
                ['block' => 'paver.example', 'data' => ['name' => 'Block in Cell 2']]
            ],
            // Cell 3: empty
            []
        ]
    ];
}

require 'endpoints.php';
?>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<body class="flex h-screen">
<script src="https://cdn.tailwindcss.com?plugins=forms"></script>

<?php
$paver->debug(true);
?>

<?php echo $paver->render($content, ['config' => [
    'showExpandButton' => false,
    'showViewButton' => true,
]]); ?>
</body>
