export type ItemType = 'ibm' | 'ibm_spare' | 'chair_white' | 'chair_brown' | 'stool' | 'text';

export interface ItemDef {
    type: ItemType;
    name: string;
    width: number;
    height: number;
    color: string;
    borderColor?: string;
    shape: 'rect' | 'circle' | 'round-rect' | 'text' | 'triangle';
    maxCount: number;
}

export interface PlacedItem {
    id: string;
    type: ItemType;
    x: number;
    y: number;
    rotation: number;
    text?: string;
}

export const ITEM_DEFS: Record<Exclude<ItemType, 'text'>, ItemDef> = {
    ibm: {
        type: 'ibm',
        name: 'IBM桌',
        width: 120,
        height: 40,
        color: '#34d399', // Green (emerald-400)
        borderColor: '#059669',
        shape: 'rect',
        maxCount: 24
    },
    ibm_spare: {
        type: 'ibm_spare',
        name: '電資學院桌',
        width: 120,
        height: 40,
        color: '#f87171', // Red (red-400)
        borderColor: '#b91c1c',
        shape: 'rect',
        maxCount: 10
    },
    chair_white: {
        type: 'chair_white',
        name: '白色椅子',
        width: 35,
        height: 35,
        color: '#9ca3af', // Gray (gray-400)
        borderColor: '#6b7280',
        shape: 'circle',
        maxCount: 106
    },
    chair_brown: {
        type: 'chair_brown',
        name: '咖啡色椅子',
        width: 35,
        height: 35,
        color: '#8D6E63', // brown
        borderColor: '#5D4037',
        shape: 'circle',
        maxCount: 10
    },
    stool: {
        type: 'stool',
        name: '高腳椅',
        width: 34,
        height: 34,
        color: '#1f2937', // Black (gray-800)
        borderColor: '#000000',
        shape: 'triangle',
        maxCount: 15
    }
};
