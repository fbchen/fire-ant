import {
    animate,
    AnimationTriggerMetadata,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

export const SlideAnimation: AnimationTriggerMetadata = trigger('slideAnimation', [
    state('forward', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    transition('void => forward', [
        style({ opacity: 0, transform: 'translate3d(100%, 0, 0)' }),
        animate('200ms ease-in')
    ]),
    transition('* => forward', [
        style({ opacity: 0, transform: 'translate3d(100%, 0, 0)' }),
        animate('200ms ease-in')
    ]),

    state('backward', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    transition('void => backward', [
        style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' }),
        animate('200ms ease-out')
    ]),
    transition('* => backward', [
        style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' }),
        animate('200ms ease-out')
    ])
]);
