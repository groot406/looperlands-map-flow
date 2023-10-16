const blocks = {

    'send_notification': {
        type: 'then',
        description: 'Send notification to player',
        icon: 'NotificationsFilled',
        category: 'notification',
        throwsError: false,
        variables: {
            message: {type: 'string'},
        },
        render: (variables) => {
            return 'Send notification: {message}'
        }
    },

    'walk.player': {
        type: 'then',
        description: 'Let Player walk to a position',
        icon: 'DirectionsRunFilled',
        category: 'walk',
        throwsError: false,
        variables: {
            position: {type: 'coordinate'},
        },
        render: (variables) => {
            return 'player walks to: {position}'
        }
    },

    'walk.mob': {
        type: 'then',
        description: 'Let MOB walk to a position',
        icon: 'DirectionsRunFilled',
        category: 'walk',
        throwsError: false,
        variables: {
            mob: { tagType: 'mob'},
            position: {type: 'coordinate'},
        },
        render: (variables) => {
            return '{mob} walks to: {position}'
        }
    },

    'walk.npc': {
        type: 'then',
        description: 'Let NPC walk to a position',
        icon: 'DirectionsRunFilled',
        category: 'walk',
        throwsError: false,
        variables: {
            npc: { tagType: 'npc'},
            position: {type: 'coordinate'},
        },
        render: (variables) => {
            return '{npc} walks to: {position}'
        }
    },

    'teleport.player': {
        type: 'then',
        description: 'Teleport player to a position',
        icon: 'PersonPinCircleFilled',
        category: 'walk',
        throwsError: false,
        variables: {
            position: {type: 'coordinate'},
        },
        render: (variables) => {
            return 'Teleport player to: {position}'
        }
    },

    'spawn.mob': {
        type: 'then',
        description: 'Spawn a mob',
        icon: 'PestControlRodentFilled',
        category: 'spawn',
        throwsError: false,
        variables: {
            mob: { tagType: 'mob'},
            position: {type: 'coordinate'},
        },
        tags: {
            spawned: {tag: 'spawned', type: 'mob'},
        },
        render: (variables) => {
            return 'Spawn {mob} at {position}'
        }
    },

    'spawn.npc': {
        type: 'then',
        description: 'Spawn a NPC',
        icon: 'PestControlRodentFilled',
        category: 'spawn',
        throwsError: false,
        variables: {
            npc: { tagType: 'npc'},
            position: {type: 'coordinate'},
        },
        tags: {
            spawned: {tag: 'spawned', type: 'npc'},
        },
        render: (variables) => {
            return 'Spawn {npc} at {position}'
        }
    },

    'spawn.item': {
        type: 'then',
        description: 'Spawn an item',
        icon: 'BackpackFilled',
        category: 'spawn',
        throwsError: false,
        variables: {
            item: { tagType: 'item'},
            position: {type: 'coordinate'},
        },
        tags: {
            spawned: {tag: 'spawned', type: 'item'},
        },
        render: (variables) => {
            return 'Spawn {item} at {position}'
        }
    },

    'layer.hide': {
        type: 'then',
        description: 'Hide tile layer',
        icon: 'RemoveRedEyeOutlined',
        category: 'layer',
        throwsError: false,
        variables: {
            layer: { tagType: 'layer'},
        },
        render: (variables) => {
            return 'Hide tile layer {layer}'
        }
    },
    'layer.show': {
        type: 'then',
        description: 'Show tile layer',
        icon: 'RemoveRedEyeFilled',
        category: 'layer',
        throwsError: false,
        variables: {
            layer: { tagType: 'layer'},
        },
        render: (variables) => {
            return 'Show tile layer {layer}'
        }
    },
    'layer.toggle': {
        type: 'then',
        description: 'Toggle tile layer',
        icon: 'RemoveRedEyeFilled',
        category: 'layer',
        throwsError: false,
        variables: {
            layer: { tagType: 'layer'},
        },
        render: (variables) => {
            return 'Toggle tile layer {layer}'
        }
    },

    'talk.player': {
        type: 'then',
        description: 'Let player say something',
        icon: 'ChatBubbleOutlineFilled',
        category: 'chat',
        throwsError: false,
        variables: {
            message: {type: 'string'},
        },
        render: (variables) => {
            return 'Player says: {message}'
        }
    },

    'talk.npc': {
        type: 'then',
        description: 'Let NPC say something',
        icon: 'ChatBubbleOutlineFilled',
        category: 'chat',
        throwsError: false,
        variables: {
            npc: { tagType: 'npc' },
            message: {type: 'string'},
        },
        render: (variables) => {
            return '{npc} says: {message}'
        }
    },

    'talk.mob': {
        type: 'then',
        description: 'Let MOB say something',
        icon: 'ChatBubbleOutlineFilled',
        category: 'chat',
        throwsError: false,
        variables: {
            mob: { tagType: 'mob' },
            message: {type: 'string'},
        },
        render: (variables) => {
            return '{mob} says: {message}'
        }
    },

    'talk.player.private': {
        type: 'then',
        description: 'Let player say something (only player can see)',
        icon: 'ChatBubbleOutlineFilled',
        category: 'chat',
        throwsError: false,
        variables: {
            message: {type: 'string'},
        },
        render: (variables) => {
            return 'Player says: {message}'
        }
    },

    'talk.npc.private': {
        type: 'then',
        description: 'Let NPC say something (only player can see)',
        icon: 'ChatBubbleOutlineFilled',
        category: 'chat',
        throwsError: false,
        variables: {
            npc: { tagType: 'npc' },
            message: {type: 'string'},
        },
        render: (variables) => {
            return '{npc} says: {message}'
        }
    },

    'talk.mob.private': {
        type: 'then',
        description: 'Let MOB say something (only player can see)',
        icon: 'ChatBubbleOutlineFilled',
        category: 'chat',
        throwsError: false,
        variables: {
            mob: { tagType: 'mob' },
            message: {type: 'string'},
        },
        render: (variables) => {
            return '{mob} says: {message}'
        }
    },

    'camera.npc': {
        type: 'then',
        description: 'Camera focus on NPC ',
        icon: 'VideoCameraFrontOutlined',
        category: 'camera',
        throwsError: false,
        variables: {
            npc: { tagType: 'npc' },
        },
        render: (variables) => {
            return 'Focus camera on {npc}'
        }
    },
    'camera.player': {
        type: 'then',
        description: 'Camera focus on Player',
        icon: 'VideoCameraFrontOutlined',
        category: 'camera',
        throwsError: false,
        variables: {
        },
        render: (variables) => {
            return 'Focus camera on player'
        }
    },

    'sound.play': {
        type: 'then',
        description: 'Play sound',
        icon: 'MusicNoteRound',
        category: 'sound',
        throwsError: true,
        variables: {
            sound: { tagType: 'sound' },
        },
        render: (variables) => {
            return 'Play sound: {sound}'
        }
    },

    'music.play': {
        type: 'then',
        description: 'Play music',
        icon: 'MusicNoteRound',
        category: 'sound',
        throwsError: true,
        variables: {
            music: { tagType: 'music' },
        },
        render: (variables) => {
            return 'Start music: {music}'
        }
    },

    'trigger.activate': {
        type: 'then',
        description: 'Activate trigger',
        icon: 'FlourescentFilled',
        category: 'trigger',
        throwsError: true,
        variables: {
            trigger: { tagType: 'trigger' },
        },
        render: (variables) => {
            return 'Activate trigger: {trigger}'
        }
    },

    'trigger.deactivate': {
        type: 'then',
        description: 'Deactivate trigger',
        icon: 'FlourescentOutlined',
        category: 'trigger',
        throwsError: true,
        variables: {
            trigger: { tagType: 'trigger' },
        },
        render: (variables) => {
            return 'Deactivate trigger: {trigger}'
        }
    },

    'trigger.toggle': {
        type: 'then',
        description: 'Toggle trigger',
        icon: 'FlourescentFilled',
        category: 'trigger',
        throwsError: true,
        variables: {
            trigger: { tagType: 'trigger' },
        },
        render: (variables) => {
            return 'Toggle trigger: {trigger}'
        }
    },

    'quest.new': {
        type: 'then',
        description: 'Give quest',
        icon: 'TaskOutlined',
        category: 'quest',
        throwsError: true,
        variables: {
            quest: { tagType: 'quest' },
        },
        render: (variables) => {
            return 'Give quest: {quest}'
        }
    },

    'quest.complete': {
        type: 'then',
        description: 'Complete a quest',
        icon: 'TaskFilled',
        category: 'quest',
        throwsError: true,
        variables: {
            quest: { tagType: 'quest' },
        },
        render: (variables) => {
            return 'Complete a quest: {quest}'
        }
    },

    'inventory.add': {
        type: 'then',
        description: 'Add item to inventory',
        icon: 'BackpackFilled',
        category: 'inventory',
        throwsError: false,
        variables: {
            item: { tagType: 'item' },
            amount: { type: 'integer' },
        },
        render: (variables) => {
            return 'Add {amount}x{item} to inventory'
        }
    },

    'inventory.remove': {
        type: 'then',
        description: 'Remove item from inventory',
        icon: 'BackpackFilled',
        category: 'inventory',
        throwsError: true,
        variables: {
            item: { tagType: 'item' },
            amount: { type: 'integer' },
        },
        render: (variables) => {
            return 'Remove {amount}x{item} from inventory'
        }
    },

    'npc.animation': {
        type: 'then',
        description: 'Play NPC animation',
        icon: 'AnimationRound',
        category: 'animation',
        throwsError: true,
        variables: {
            npc: { tagType: 'npc' },
            animation: { tagType: 'animation' },
        },
        render: (variables) => {
            return 'Play NPC {npc} animation {animation}'
        }
    },

    'mob.animation': {
        type: 'then',
        description: 'Play MOB animation',
        icon: 'AnimationRound',
        category: 'animation',
        throwsError: true,
        variables: {
            mob: { tagType: 'mob' },
            animation: { tagType: 'animation' },
        },
        render: (variables) => {
            return 'Play MOB {mob} animation {animation}'
        }
    },
}

export default blocks;