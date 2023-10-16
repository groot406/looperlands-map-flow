const blocks = {
    'has.killed.mob': {
        type: 'and',
        description: 'Killed mob',
        icon: 'CheckRound',
        category: 'field',
        tags: {
        },
        variables: {
            mob: { tagType: 'mob'},
            amount: { type: 'integer' },
        },
        render: (variables) => {
            return 'Player killed {amount} or more {mob}'
        }
    },

    'has.looted.item': {
        type: 'and',
        description: 'Looted item',
        icon: 'CheckRound',
        category: 'field',
        tags: {
        },
        variables: {
            item: { tagType: 'item'},
            amount: { type: 'integer' },
        },
        render: (variables) => {
            return 'Player looted {amount} or more {item}'
        }
    },

    'has.quest.received': {
        type: 'and',
        description: 'Has quest received',
        icon: 'CheckRound',
        category: 'field',
        tags: {
        },
        variables: {
            quest: { tagType: 'quest'},
        },
        render: (variables) => {
            return 'Player has received {quest} quest'
        }
    },

    'has.quest.completed': {
        type: 'and',
        description: 'Has quest completed',
        icon: 'CheckRound',
        category: 'field',
        tags: {
        },
        variables: {
            quest: { tagType: 'quest'},
        },
        render: (variables) => {
            return 'Player has completed {quest} quest'
        }
    },

    'has.level': {
        type: 'and',
        description: 'Player has level',
        icon: 'CheckRound',
        category: 'field',
        tags: {
        },
        variables: {
            level: { type: 'integer'},
        },
        render: (variables) => {
            return 'Player has level {level} or greater'
        }
    },

    'in.area': {
        type: 'and',
        description: 'Player is in area',
        icon: 'CheckRound',
        category: 'field',
        tags: {
        },
        variables: {
            top_left: { type: 'coordinate'},
            bottom_right: { type: 'coordinate'},
        },
        render: (variables) => {
            return 'Player is area {top_left} to {bottom_right}'
        }
    },

    'tag.contains': {
        type: 'and',
        description: 'Tag contains text',
        icon: 'CheckRound',
        category: 'field',
        variables: {
            field: {
                type: 'tag',
                tagType: 'text'
            },
            value: {
                type: 'text'
            }
        },
        render: (variables) => {
            return '{field} contains {value}'
        }
    },

    'number.greater.than': {
        type: 'and',
        description: 'Number is greater than',
        icon: 'CheckRound',
        category: 'field',
        variables: {
            number: {
                type: 'tag',
                tagType: 'number'
            },
            value: {
                type: 'number'
            }
        },
        render: (variables) => {
            return '{number} is greater than {value}'
        }
    },

    'and.number.less.than': {
        type: 'and',
        description: 'Number is less than',
        icon: 'CheckRound',
        category: 'field',
        variables: {
            number: {
                type: 'tag',
                tagType: 'number'
            },
            value: {
                type: 'number'
            }
        },
        render: (variables) => {
            return '{number} is less than {value}'
        }
    }
}

export default blocks