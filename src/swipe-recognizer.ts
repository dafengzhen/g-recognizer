import type { SwipeEvent, UnifiedPointer } from './types.ts';

import { GestureRecognizerBase } from './gesture-recognizer-base.ts';

export class SwipeRecognizer extends GestureRecognizerBase {
  private currentPointer: null | UnifiedPointer = null;

  private isSwiping = false;

  private startPointer: null | UnifiedPointer = null;

  processEvent(event: MouseEvent | PointerEvent | TouchEvent, eventType: 'cancel' | 'end' | 'move' | 'start') {
    if (!this.options.enableSwipe) {
      return;
    }

    switch (eventType) {
      case 'cancel':
        this.reset();
        break;
      case 'end':
        this.handleEnd(event);
        break;
      case 'move':
        this.handleMove(event);
        break;
      case 'start':
        this.handleStart(event);
        break;
    }
  }

  private handleEnd(event: MouseEvent | PointerEvent | TouchEvent) {
    const startPointer = this.startPointer;
    const currentPointer = this.currentPointer;
    if (!startPointer || !currentPointer) {
      return;
    }

    const endPointer = this.pointerManager.removePointer(event);
    if (!endPointer || endPointer.identifier !== startPointer.identifier) {
      return;
    }

    if (this.isSwiping) {
      this.triggerSwipe(endPointer);
    }

    this.reset();
  }

  private handleMove(event: MouseEvent | PointerEvent | TouchEvent) {
    const startPointer = this.startPointer;
    if (!startPointer) {
      return;
    }

    const updatedPointer = this.pointerManager.updatePointer(event);
    if (!updatedPointer || updatedPointer.identifier !== startPointer.identifier) {
      return;
    }

    const threshold = this.options.swipeThreshold;
    if (!this.isSwiping && updatedPointer.distance > threshold) {
      this.isSwiping = true;
    }

    this.currentPointer = updatedPointer;
  }

  private handleStart(event: MouseEvent | PointerEvent | TouchEvent) {
    const pointer = this.pointerManager.addPointer(event);
    if (!pointer) {
      return;
    }

    this.startPointer = pointer;
    this.currentPointer = pointer;
    this.isSwiping = false;
  }

  private reset() {
    this.startPointer = null;
    this.currentPointer = null;
    this.isSwiping = false;
  }

  private triggerSwipe(pointer: UnifiedPointer) {
    const { swipeMaxDuration, swipeMinVelocity } = this.options;

    const dx = pointer.x - pointer.startX;
    const dy = pointer.y - pointer.startY;
    const distance = Math.hypot(dx, dy); // 更快更简洁
    const duration = pointer.duration;

    const velocity = this.calculateVelocity(pointer.originalTimeStamp, pointer.timeStamp, distance);
    if (velocity < swipeMinVelocity || duration > swipeMaxDuration) {
      return;
    }

    const angle = this.calculateAngle(dx, dy);
    const direction = this.getSwipeDirection(angle);

    const swipeEvent: SwipeEvent = {
      ...pointer,
      angle,
      direction,
      velocity,
    };

    this.dispatchEvent('swipe', swipeEvent);
  }
}
