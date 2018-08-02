const availablePrefixs = ['moz', 'ms', 'webkit'];

function requestAnimationFramePolyfill(): Function {
    let lastTime = 0;
    return function (callback: Function) {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

export function getRequestAnimationFrame(): any {
    if (typeof window === 'undefined') {
        return () => { };
    }
    if (window.requestAnimationFrame) {
        // https://github.com/vuejs/vue/issues/4465
        return window.requestAnimationFrame.bind(window);
    }

    const prefix = availablePrefixs.filter(key => `${key}RequestAnimationFrame` in window)[0];

    return prefix
        ? window[`${prefix}RequestAnimationFrame`]
        : requestAnimationFramePolyfill();
}

export function cancelRequestAnimationFrame(id: number): void {
    if (typeof window === 'undefined') {
        return null;
    }
    if (window.cancelAnimationFrame) {
        return window.cancelAnimationFrame(id);
    }
    const prefix = availablePrefixs.filter(key =>
        `${key}CancelAnimationFrame` in window || `${key}CancelRequestAnimationFrame` in window,
    )[0];

    return prefix ?
        (window[`${prefix}CancelAnimationFrame`] || window[`${prefix}CancelRequestAnimationFrame`]).call(this, id)
        : clearTimeout(id);
}
