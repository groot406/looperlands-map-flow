const blocks = {
    'start': {
        group: 'logic',
        type: 'start',
        icon: 'PlayArrowFilled',
        description: "Start"
    },

    'any': {
        group: 'logic',
        type: 'any',
        description: "ANY",
        render: () => '<span class="text-slate-400 font-normal font-mono text-sm">ANY</span>'
    },
    'all': {
        group: 'logic',
        type: 'all',
        description: "ALL",
        render: () => '<span class="text-slate-400 font-normal font-mono text-sm">ALL</span>'
    },
    'delay': {
        group: 'logic',
        type: 'delay',
        category: 'Delay',
        description: "Delay",
        icon: 'AccessTimeRound',
        render: () => '<span class="text-slate-400 font-normal font-mono text-sm">{{delay}}ms</span>',
        variables: {
            delay: {
                type: 'number',
                default: 1000
            }
        }
    }
}

export default blocks;