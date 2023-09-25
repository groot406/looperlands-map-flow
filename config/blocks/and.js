const blocks = {
    'tag.equals': {
        type: 'and',
        description: 'Tag equals',
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
            return '{field} = {value}'
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