const LIVR = require('livr')
LIVR.Validator.defaultAutoTrim(true)

LIVR.Validator.registerAliasedDefaultRule({
  name: 'shortly_text',
  rules: ['string', { max_length: 90 }],
  error: 'WRONG_TEXT'
})

module.exports = LIVR
