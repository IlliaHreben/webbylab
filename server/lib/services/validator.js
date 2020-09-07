const LIVR = require('livr')
LIVR.Validator.defaultAutoTrim(true)

LIVR.Validator.registerAliasedDefaultRule({
    name: 'page_number',
    rules: ['not_empty', 'positive_integer', {default: 1}],
    error: 'WRONG_PAGE'
})

LIVR.Validator.registerAliasedDefaultRule({
    name: 'page_size',
    rules: ['not_empty', { 'number_between': [10, 100] }, {default: 10}],
    error: 'WRONG_PAGE_SIZE'
})

module.exports = LIVR
