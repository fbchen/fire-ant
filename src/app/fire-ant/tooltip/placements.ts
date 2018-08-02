const autoAdjustOverflow = {
    adjustX: 1,
    adjustY: 1,
};

const targetOffset = [0, 0];

export const placements = {
    left: {
        points: ['cr', 'cl'],
        overflow: autoAdjustOverflow,
        offset: [-4, 0],
        targetOffset,
    },
    right: {
        points: ['cl', 'cr'],
        overflow: autoAdjustOverflow,
        offset: [4, 0],
        targetOffset,
    },
    top: {
        points: ['bc', 'tc'],
        overflow: autoAdjustOverflow,
        offset: [0, -4],
        targetOffset,
    },
    bottom: {
        points: ['tc', 'bc'],
        overflow: autoAdjustOverflow,
        offset: [0, 4],
        targetOffset,
    },
    topLeft: {
        points: ['bl', 'tl'],
        overflow: autoAdjustOverflow,
        offset: [0, -4],
        targetOffset,
    },
    leftTop: {
        points: ['tr', 'tl'],
        overflow: autoAdjustOverflow,
        offset: [-4, 0],
        targetOffset,
    },
    topRight: {
        points: ['br', 'tr'],
        overflow: autoAdjustOverflow,
        offset: [0, -4],
        targetOffset,
    },
    rightTop: {
        points: ['tl', 'tr'],
        overflow: autoAdjustOverflow,
        offset: [4, 0],
        targetOffset,
    },
    bottomRight: {
        points: ['tr', 'br'],
        overflow: autoAdjustOverflow,
        offset: [0, 4],
        targetOffset,
    },
    rightBottom: {
        points: ['bl', 'br'],
        overflow: autoAdjustOverflow,
        offset: [4, 0],
        targetOffset,
    },
    bottomLeft: {
        points: ['tl', 'bl'],
        overflow: autoAdjustOverflow,
        offset: [0, 4],
        targetOffset,
    },
    leftBottom: {
        points: ['br', 'bl'],
        overflow: autoAdjustOverflow,
        offset: [-4, 0],
        targetOffset,
    },
};

export interface PlacementsConfig {
    arrowWidth?: number;
    horizontalArrowShift?: number;
    verticalArrowShift?: number;
    arrowPointAtCenter?: boolean;
}

export function getPlacements(config: PlacementsConfig = {}) {
    if (!config.arrowPointAtCenter) {
        return placements;
    }
    const { arrowWidth = 5, horizontalArrowShift = 16, verticalArrowShift = 12 } = config;
    return {
        left: {
            points: ['cr', 'cl'],
            overflow: autoAdjustOverflow,
            offset: [-4, 0],
            targetOffset,
        },
        right: {
            points: ['cl', 'cr'],
            overflow: autoAdjustOverflow,
            offset: [4, 0],
            targetOffset,
        },
        top: {
            points: ['bc', 'tc'],
            overflow: autoAdjustOverflow,
            offset: [0, -4],
            targetOffset,
        },
        bottom: {
            points: ['tc', 'bc'],
            overflow: autoAdjustOverflow,
            offset: [0, 4],
            targetOffset,
        },
        topLeft: {
            points: ['bl', 'tc'],
            overflow: autoAdjustOverflow,
            offset: [-(horizontalArrowShift + arrowWidth), -4],
            targetOffset,
        },
        leftTop: {
            points: ['tr', 'cl'],
            overflow: autoAdjustOverflow,
            offset: [-4, -(verticalArrowShift + arrowWidth)],
            targetOffset,
        },
        topRight: {
            points: ['br', 'tc'],
            overflow: autoAdjustOverflow,
            offset: [horizontalArrowShift + arrowWidth, -4],
            targetOffset,
        },
        rightTop: {
            points: ['tl', 'cr'],
            overflow: autoAdjustOverflow,
            offset: [4, -(verticalArrowShift + arrowWidth)],
            targetOffset,
        },
        bottomRight: {
            points: ['tr', 'bc'],
            overflow: autoAdjustOverflow,
            offset: [horizontalArrowShift + arrowWidth, 4],
            targetOffset,
        },
        rightBottom: {
            points: ['bl', 'cr'],
            overflow: autoAdjustOverflow,
            offset: [4, verticalArrowShift + arrowWidth],
            targetOffset,
        },
        bottomLeft: {
            points: ['tl', 'bc'],
            overflow: autoAdjustOverflow,
            offset: [-(horizontalArrowShift + arrowWidth), 4],
            targetOffset,
        },
        leftBottom: {
            points: ['br', 'cl'],
            overflow: autoAdjustOverflow,
            offset: [-4, verticalArrowShift + arrowWidth],
            targetOffset,
        },
    };
}
