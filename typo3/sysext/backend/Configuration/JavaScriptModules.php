<?php

return [
    'dependencies' => [
        'core',
    ],
    'tags' => [
        'backend.module',
        'backend.form',
        'backend.navigation-component',
    ],
    'imports' => [
        '@typo3/backend/' => [
            'path' => 'EXT:backend/Resources/Public/JavaScript/',
            'exclude' => [
                'EXT:backend/Resources/Public/JavaScript/Contrib/',
            ],
        ],
        '@typo3/backend/contrib/mark.js' => 'EXT:backend/Resources/Public/JavaScript/Contrib/mark.js',
        'alwan' => 'EXT:backend/Resources/Public/JavaScript/Contrib/alwan.js',
        'select-pure' => 'EXT:backend/Resources/Public/JavaScript/Contrib/select-pure.js',
    ],
];
