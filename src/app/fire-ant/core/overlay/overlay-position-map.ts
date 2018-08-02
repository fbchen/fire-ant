import { ConnectionPositionPair } from '@angular/cdk/overlay';


export const POSITION_MAP: {[key: string]: ConnectionPositionPair} = {
    'top': new ConnectionPositionPair({
        originX: 'center',
        originY: 'top'
    }, {
        overlayX: 'center',
        overlayY: 'bottom'
    }),
    'topCenter': new ConnectionPositionPair({
        originX: 'center',
        originY: 'top'
    }, {
        overlayX: 'center',
        overlayY: 'bottom'
    }),
    'topLeft': new ConnectionPositionPair({
        originX: 'start',
        originY: 'top'
    }, {
        overlayX: 'start',
        overlayY: 'bottom'
    }),
    'topRight': new ConnectionPositionPair({
        originX: 'end',
        originY: 'top'
    }, {
        overlayX: 'end',
        overlayY: 'bottom'
    }),
    'right': new ConnectionPositionPair({
        originX: 'end',
        originY: 'center'
    }, {
        overlayX: 'start',
        overlayY: 'center',
    }),
    'rightTop': new ConnectionPositionPair({
        originX: 'end',
        originY: 'top'
    }, {
        overlayX: 'start',
        overlayY: 'top',
    }),
    'rightBottom': new ConnectionPositionPair({
        originX: 'end',
        originY: 'bottom'
    }, {
        overlayX: 'start',
        overlayY: 'bottom',
    }),
    'bottom': new ConnectionPositionPair({
        originX: 'center',
        originY: 'bottom'
    }, {
        overlayX: 'center',
        overlayY: 'top',
    }),
    'bottomCenter': new ConnectionPositionPair({
        originX: 'center',
        originY: 'bottom'
    }, {
        overlayX: 'center',
        overlayY: 'top',
    }),
    'bottomLeft': new ConnectionPositionPair({
        originX: 'start',
        originY: 'bottom'
    }, {
        overlayX: 'start',
        overlayY: 'top',
    }),
    'bottomRight': new ConnectionPositionPair({
        originX: 'end',
        originY: 'bottom'
    }, {
        overlayX: 'end',
        overlayY: 'top',
    }),
    'left': new ConnectionPositionPair({
        originX: 'start',
        originY: 'center'
    }, {
        overlayX: 'end',
        overlayY: 'center',
    }),
    'leftTop': new ConnectionPositionPair({
        originX: 'start',
        originY: 'top'
    }, {
        overlayX: 'end',
        overlayY: 'top',
    }),
    'leftBottom': new ConnectionPositionPair({
        originX: 'start',
        originY: 'bottom'
    }, {
        overlayX: 'end',
        overlayY: 'bottom',
    })
};

export const DEFAULT_4_POSITIONS: ConnectionPositionPair[] = _objectValues([
    POSITION_MAP['top'],
    POSITION_MAP['right'],
    POSITION_MAP['bottom'],
    POSITION_MAP['left']
]);
export const DEFAULT_DROPDOWN_POSITIONS: ConnectionPositionPair[] = _objectValues([
    POSITION_MAP['bottomLeft'],
    POSITION_MAP['topLeft']
]);
export const DEFAULT_DATEPICKER_POSITIONS: ConnectionPositionPair[] = [
    new ConnectionPositionPair({
        originX: 'start',
        originY: 'top'
    }, {
        overlayX: 'start',
        overlayY: 'top',
    }),
    new ConnectionPositionPair({
        originX: 'start',
        originY: 'bottom'
    }, {
        overlayX: 'start',
        overlayY: 'bottom',
    })
];

function arrayMap(array, iteratee) {
    let index = -1;
    const length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
        result[index] = iteratee(array[index], index, array);
    }
    return result;
}

function baseValues(object, props) {
    return arrayMap(props, function (key) {
        return object[key];
    });
}

function _objectValues(object) {
    return object == null ? [] : baseValues(object, Object.keys(object));
}
