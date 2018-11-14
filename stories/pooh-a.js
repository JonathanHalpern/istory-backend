module.exports = {
    name: 'pooh-a',
    meta: {
        name: 'Winnie the pooh',
        key: 'pooh-a',
        length: 10,
        description: 'a story',
    },
    clips: [{
        type: 'main',
        number: 1,
    }, {
        type: 'name',
        number: 3,
        adelay: 50
    }, {
        type: 'main',
        number: 2,
        adelay: 350
    }, {
        type: 'npc',
        npcNumber: 1,
        number: 1,
        adelay: 200,
    }, {
        type: 'main',
        number: 3,
    }]
}