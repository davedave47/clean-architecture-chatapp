import { PropertyTypes } from 'neode'
export default {
    id: {
        type: 'uuid' as PropertyTypes,
        primary: true,
    },
    participants: {
        type: 'relationship' as PropertyTypes,
        relationship: 'PARTICIPANT',
        direction: 'in',
        target: 'User',
        properties: {
            createdAt: {
                type: 'datetime',
                default: () => new Date(),
            },
        },
    },
    createdAt: {
        type: 'datetime' as PropertyTypes,
        default: () => new Date(),
    },
    updatedAt: {
        type: 'datetime' as PropertyTypes,
        default: () => new Date(),
    },
}