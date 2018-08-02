/**
 * @license
 * Copyright 厦门乾元盛世科技有限公司 All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

import { Injectable, Input, TemplateRef, Injector } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { TreeMenuContainer } from './tree.menu.container';

export interface Position {
    x: string;
    y: string;
}

@Injectable()
export class TreeMenuService {

    /** 样式前缀 */
    @Input() prefixCls = 'ant-tree-menu';

    constructor(
        private injector: Injector,
        private overlay: Overlay) {
    }

    private getOverlayConfig(position: Position): OverlayConfig {
        const positionStrategy = this.overlay.position()
            .global()
            .top(position.y)
            .left(position.x);

        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            backdropClass: `${this.prefixCls}-backdrop`,
            panelClass: `${this.prefixCls}-panel`,
            scrollStrategy: this.overlay.scrollStrategies.close(),
            positionStrategy
        });

        return overlayConfig;
    }

    private createOverlay(position: Position): OverlayRef {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(position);
        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }

    private createInjector(template: TemplateRef<any>): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();
        // Set custom injection tokens
        injectionTokens.set(TemplateRef, template);
        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }

    open(template: TemplateRef<any>, position: Position): OverlayRef {
        // Returns an OverlayRef (which is a PortalHost)
        const overlayRef = this.createOverlay(position);
        // Subscribe to a stream that emits when the backdrop was clicked
        overlayRef.backdropClick().subscribe(_ => overlayRef.dispose());

        const injector = this.createInjector(template);
        // Create ComponentPortal that can be attached to a PortalHost
        const containerPortal = new ComponentPortal(TreeMenuContainer, null, injector);
        // Attach ComponentPortal to PortalHost
        overlayRef.attach(containerPortal);

        // Return remote control
        return overlayRef;
    }

}
