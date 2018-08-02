import {
    animate,
    AnimationTriggerMetadata,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

export const RouteAnimation: AnimationTriggerMetadata = trigger('routeAnimation', [
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    transition(':enter', [
        style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' }),
        animate('200ms ease-in')
    ]),
    transition(':leave', [
        animate('150ms ease-out'),
        style({ opacity: 0, transform: 'translate3d(0, -100%, 0)' })
    ]),
]);
