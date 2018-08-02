import * as cssAnimation from 'css-animation';
import { getRequestAnimationFrame, cancelRequestAnimationFrame } from './getRequestAnimationFrame';

const reqAnimFrame = getRequestAnimationFrame();

function animate(node: HTMLElement, show: boolean, done: Function) {
    let height: number;
    let requestAnimationFrameId: number;
    return cssAnimation(node, 'ant-motion-collapse', {
        start() {
            if (!show) {
                node.style.height = `${node.offsetHeight}px`;
                node.style.opacity = '1';
            } else {
                height = node.offsetHeight;
                node.style.height = '0';
                node.style.opacity = '0';
            }
        },
        active() {
            if (requestAnimationFrameId) {
                cancelRequestAnimationFrame(requestAnimationFrameId);
            }
            requestAnimationFrameId = reqAnimFrame(() => {
                node.style.height = `${show ? height : 0}px`;
                node.style.opacity = show ? '1' : '0';
            });
        },
        end() {
            if (requestAnimationFrameId) {
                cancelRequestAnimationFrame(requestAnimationFrameId);
            }
            node.style.height = '';
            node.style.opacity = '';
            done();
        },
    });
}

const animation = {
    enter(node: HTMLElement, done: Function) {
        return animate(node, true, done);
    },
    leave(node: HTMLElement, done: Function) {
        return animate(node, false, done);
    },
    appear(node: HTMLElement, done: Function) {
        return animate(node, true, done);
    },
};

export default animation;
