import { PropertyTypes } from 'neode';
export default {
    id: {
        type: 'uuid' as PropertyTypes,
        primary: true,
    },
    name: {
        type: 'string' as PropertyTypes,
        required: true,
    },
    email: {
        type: 'string' as PropertyTypes,
        required: true,
    },
    password: {
        type: 'string' as PropertyTypes,
        required: true,
    },
    createdAt: {
        type: 'datetime' as PropertyTypes,
        default: () => new Date(),
    },
    updatedAt: {
        type: 'datetime' as PropertyTypes,
        default: () => new Date(),
    },
    showFriends: {
        type: 'boolean' as PropertyTypes,
        default: true,
    },
    friends: {
        type: 'relationship' as PropertyTypes,
        relationship: 'FRIEND_OF',
        direction: 'out',
        target: 'User',
        cascade: 'detach',
        properties: {
            createdAt: {
                type: 'datetime',
                default: () => new Date(),
            },
        },
    },
    conversations: {
        type: 'relationship' as PropertyTypes,
        relationship: 'PARTICIPANT',
        direction: 'out',
        target: 'Conversation',
        cascade: 'detach',
        properties: {
            createdAt: {
                type: 'datetime',
                default: () => new Date(),
            },
        },
    },
    request: {
        type: 'relationship' as PropertyTypes,
        relationship: 'REQUEST',
        direction: 'out',
        target: 'User',
        cascade: 'detach',
        properties: {
            createdAt: {
                type: 'datetime',
                default: () => new Date(),
            },
        },
    }
}
