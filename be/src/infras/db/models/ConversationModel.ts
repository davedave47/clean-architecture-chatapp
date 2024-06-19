import { PropertyTypes } from 'neode'
export default {
    id: {
        type: 'uuid' as PropertyTypes,
        primary: true,
    },
    name: {
        type: 'string' as PropertyTypes,
        required: false,
    },
    createdAt: {
        type: 'datetime' as PropertyTypes,
        default: () => new Date(),
    },
    lastMessageAt: {
        type: 'datetime' as PropertyTypes,
        default: null,
    }
}