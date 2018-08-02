
function isPointsEq(a1: string[], a2: string[]): boolean {
    return a1[0] === a2[0] && a1[1] === a2[1];
}

export function getAlignFromPlacement(builtinPlacements: Object, placementStr: string,
    align: { points?: string[], offset?: number[] }): Object {
    const baseAlign = builtinPlacements[placementStr] || {};
    return Object.assign({}, baseAlign, align);
}

export function getPopupClassNameFromAlign(builtinPlacements: Object, prefixCls: string,
    align: { points?: string[], offset?: number[] }): string {
    const points = align.points;
    for (const placement in builtinPlacements) {
        if (builtinPlacements.hasOwnProperty(placement)) {
            if (isPointsEq(builtinPlacements[placement].points, points)) {
                return `${prefixCls}-placement-${placement}`;
            }
        }
    }
    return '';
}
