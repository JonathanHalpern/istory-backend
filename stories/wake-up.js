module.exports = {
    name: 'wake-up',
    clips: [{
        type: 'name',
        number: 1,
        adelay: 1000,
    }, {
        type: 'main',
        number: 1,
        adelay: 2000,
        volume: 5
    }, {
        type: 'pronoun',
        specifier: 'possesive',
        number: 1,
        adelay: 1000,
        volume: 0.2
    }, {
        type: 'main',
        number: 2,
        volume: 6
    }, {
        type: 'pronoun',
        specifier: 'possesive',
        number: 1,
        volume: 4
    }, {
        type: 'main',
        number: 3
    }, {
        type: 'name',
        number: 2
    }, 
    {
        type: 'name',
        number: 1
    }, {
        type: 'main',
        number: 4
    }, {
        type: 'pronoun',
        specifier: 'reflexive',
        number: 1
    }, {
        type: 'main',
        number: 5
    }, {
        type: 'pronoun',
        specifier: 'object',
        number: 1
    }, {
        type: 'main',
        number: 6
    }]
}