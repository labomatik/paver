describe('Translations', () => {
    const requiredKeys = [
        'Blocks',
        'Search blocks',
        'No blocks found',
        'Toggle blocks panel',
        'Exit edit mode',
        'Change to mobile',
        'Change to desktop',
        'Expand',
        'Minimize',
        'Drag',
        'Edit',
        'Edition',
        'Style',
        'Visibility',
        'Clone',
        'Delete',
        'Are you sure you want to delete this block?',
        'Do you really want to follow this link?'
    ]

    const languages = ['en', 'fr', 'nl']

    languages.forEach(lang => {
        describe(`${lang.toUpperCase()} translations`, () => {
            let translations

            before(() => {
                cy.readFile(`lang/${lang}.json`).then((content) => {
                    translations = content
                })
            })

            it('should be valid JSON', () => {
                expect(translations).to.be.an('object')
            })

            it('should have all required keys', () => {
                requiredKeys.forEach(key => {
                    expect(translations, `Missing key: ${key}`).to.have.property(key)
                })
            })

            it('should have non-empty values for all keys', () => {
                requiredKeys.forEach(key => {
                    expect(translations[key], `Empty value for key: ${key}`).to.be.a('string').and.not.be.empty
                })
            })
        })
    })

    describe('Translation consistency', () => {
        let enTranslations, frTranslations, nlTranslations

        before(() => {
            cy.readFile('lang/en.json').then((content) => {
                enTranslations = content
            })
            cy.readFile('lang/fr.json').then((content) => {
                frTranslations = content
            })
            cy.readFile('lang/nl.json').then((content) => {
                nlTranslations = content
            })
        })

        it('all language files should have the same keys', () => {
            const enKeys = Object.keys(enTranslations).sort()
            const frKeys = Object.keys(frTranslations).sort()
            const nlKeys = Object.keys(nlTranslations).sort()

            expect(frKeys).to.deep.equal(enKeys)
            expect(nlKeys).to.deep.equal(enKeys)
        })
    })
})
