import type { Club } from '../types';

export const CLUBS: Club[] = [
    {
        id: 'debate_club',
        name: '校辩论队',
        description: '磨练口才与逻辑，是全校最受瞩目的社团之一。',
        location: 'library',
        requirements: [
            { type: 'attribute', target: 'eq', value: 60 },
            { type: 'attribute', target: 'iq', value: 65 }
        ],
        benefits: [
            { type: 'attribute', target: 'eq', value: 3 },
            { type: 'attribute', target: 'charm', value: 2 },
            { type: 'attribute', target: 'stress', value: 10 }
        ]
    },
    {
        id: 'coding_club',
        name: '算法协会 (ACM)',
        description: '如果你热爱编程与算法，这里是你的天堂（或地狱）。',
        location: 'library',
        requirements: [
            { type: 'attribute', target: 'iq', value: 75 }
        ],
        benefits: [
            { type: 'attribute', target: 'iq', value: 5 },
            { type: 'attribute', target: 'stamina', value: -10 }
        ]
    },
    {
        id: 'dance_crew',
        name: '街舞社',
        description: '在舞台上尽情释放你的活力，吸引全场的目光。',
        location: 'gym',
        requirements: [
            { type: 'attribute', target: 'charm', value: 60 },
            { type: 'attribute', target: 'stamina', value: 50 }
        ],
        benefits: [
            { type: 'attribute', target: 'charm', value: 5 },
            { type: 'attribute', target: 'stamina', value: 5 }
        ]
    },
    {
        id: 'volunteer_assoc',
        name: '青年志愿者协会',
        description: '播撒爱心，回馈社会，同时也能结识志同道合的朋友。',
        location: 'cafeteria',
        requirements: [],
        benefits: [
            { type: 'attribute', target: 'eq', value: 4 },
            { type: 'attribute', target: 'stress', value: -5 }
        ]
    }
];
