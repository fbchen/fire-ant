
/**
 * 下一帧执行回调函数
 *
 * @param callback Function
 */
export function onNextFrame(callback: FrameRequestCallback): number {
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame(callback);
    }
    return window.setTimeout(callback, 1);
}

/**
 * 清除执行任务
 *
 * @param nextFrameId 任务ID
 */
export function clearNextFrameAction(nextFrameId: number): void {
    if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(nextFrameId);
    } else {
        window.clearTimeout(nextFrameId);
    }
}
