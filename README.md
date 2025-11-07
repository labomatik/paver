<p align="center"><a href="https://vanrossum.dev" target="_blank"><img src="resources/svgs/logo.svg" width="320" alt="vanrossum.dev Logo"></a></p>

<p align="center">
<a href="https://packagist.org/packages/jeffreyvanrossum/paver"><img src="https://img.shields.io/packagist/dt/jeffreyvanrossum/paver" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/jeffreyvanrossum/paver"><img src="https://img.shields.io/packagist/v/jeffreyvanrossum/paver" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/jeffreyvanrossum/paver"><img src="https://img.shields.io/packagist/l/jeffreyvanrossum/paver" alt="License"></a>
</p>

# Paver

Paver Editor is a drag and drop based block editor (or page builder).

For detailed instructions on how to use the editor, see the [documentation](https://pavereditor.com/docs).

## Block Categories

Blocks can be organized into collapsible categories in the sidebar, making it easier to manage and navigate large collections of blocks.

### Using Categories

To assign a block to a specific category, set the `$category` property in your block class:

```php
use Jeffreyvr\Paver\Blocks\Block;

class MyLayoutBlock extends Block
{
    public static string $reference = 'my.layout';

    public string $name = 'My Layout';

    public string $category = 'Layout';

    // ... rest of your block code
}
```

### Default Behavior

- If you don't specify a category, blocks are automatically assigned to the **"Default"** category
- Categories are displayed as accordion-style collapsible sections in the sidebar
- The first category (Default) is **automatically opened** when the editor loads
- Categories are sorted alphabetically, but **"Default" always appears first**
- Empty categories are automatically hidden during search/filtering

### Example

```php
// This block will appear in the "Content" category
class TextBlock extends Block
{
    public string $category = 'Content';
    // ...
}

// This block will appear in the "Layout" category
class GridBlock extends Block
{
    public string $category = 'Layout';
    // ...
}

// This block will appear in the "Default" category
class ExampleBlock extends Block
{
    // No category specified - uses default
    // ...
}
```

## Related packages

* [Paver for WordPress](https://github.com/jeffreyvr/paver-for-wordpress)
* [Paver for Laravel](https://github.com/jeffreyvr/paver-for-laravel)

## Contributors
* [Jeffrey van Rossum](https://github.com/jeffreyvr)
* [All contributors](https://github.com/jeffreyvr/paver/graphs/contributors)

## License
MIT. Please see the [License File](/LICENSE) for more information.
