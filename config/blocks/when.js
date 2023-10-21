const blocks = {
    'player.spawned': {
        type: 'when',
        description: 'Player spawned',
        icon: 'AccessibilityNewTwotone',
        tags: {
            player: {tag: 'player', type: 'player'},
        },
        category: 'player',
        render: () => 'Player spawned'
    },

    'player.died': {
        type: 'when',
        description: 'Player died',
        icon: 'PersonOffFilled',
        tags: {
            player: {tag: 'player', type: 'player'},
            position: { tag:"position", type:"coordinate"},
        },
        category: 'player',
        render: () => 'Player died'
    },

    'player.killed_mob': {
        type: 'when',
        description: 'Player Killed Mob',
        icon: 'PestControlRodentFilled',
        tags: {
            player: {tag: 'player', type: 'player'},
            mob: {tag: 'mob', type: 'mob'},
        },
        variables: {
            mob: { tagType: 'mob'},
        },
        category: 'player',
        render: () => 'Player killed {mob}'
    },

    'player.looted_items': {
        type: 'when',
        description: 'Player Looted item',
        icon: 'BackpackOutlined',
        tags: {
            player: {tag: 'player', type: 'player'},
            item: {tag: 'item', type: 'item'},
        },
        variables: {
            item: { tagType: 'item'},
        },
        category: 'player',
        render: () => 'Player looted {item}'
    },

    'area.entered': {
        type: 'when',
        description: 'Player entered an area',
        icon: 'PinDropOutlined',
        tags: {
            player: {tag: 'player', type: 'player'},
            area: {tag: 'area', type: 'area'},
        },
        category: 'player',
        variables: {
            area: { tagType: 'area'},
        },
        render: () => 'Player entered {area} area'
    },

    'area.left': {
        type: 'when',
        description: 'Player left an area',
        icon: 'PinDropOutlined',
        tags: {
            player: {tag: 'player', type: 'player'},
            area: {tag: 'area', type: 'area'},
        },
        variables: {
            area: { tagType: 'area'},
        },
        category: 'player',
        render: () => 'Player left {area} area'
    },

    'npc.talked': {
        type: 'when',
        description: 'NPC Talked',
        icon: 'ChatFilled',
        tags: {
            npc: {tag: 'npc', type: 'npc'},
            player: {tag: 'player', type: 'player'},
            message: {tag: 'message', type: 'text'},
        },
        variables: {
            npc: { tagType: 'npc'},
        },
        category: 'npc',
        render: () => 'NPC {npc} Talked'
    },

    'trigger.activated': {
        type: 'when',
        description: 'Trigger activated',
        icon: 'FlourescentFilled',
        tags: {
            trigger: {tag: 'trigger', type: 'trigger'},
        },
        variables: {
            trigger: { tagType: 'trigger'},
        },
        category: 'trigger',
        render: () => 'Trigger {trigger} activated'
    },

    'trigger.deactivated': {
        type: 'when',
        description: 'Trigger deactivated',
        icon: 'FlourescentOutlined',
        tags: {
            trigger: {tag: 'trigger', type: 'trigger'},
        },
        variables: {
            trigger: { tagType: 'trigger'},
        },
        category: 'trigger',
        render: () => 'Trigger {trigger} deactivated'
    },

    'quest.completed': {
        type: 'when',
        description: 'Quest completed',
        icon: 'TaskFilled',
        tags: {
            quest: {tag: 'quest', type: 'quest'},
            xp: {tag: 'xp', type: 'integer'},
        },
        variables: {
            quest: { tagType: 'quest'},
        },
        category: 'quest',
        render: () => 'Quest {quest} completed'
    }
};

export default blocks;