import type { PointerType, UnifiedPointer } from './types.ts';

export class PointerManager {
  private activePointers = new Map<number, UnifiedPointer>();

  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  addPointer(event: MouseEvent | PointerEvent | TouchEvent): null | UnifiedPointer {
    const pointer = this.createUnifiedPointer(event);
    if (pointer) {
      this.activePointers.set(pointer.identifier, pointer);
    }
    return pointer;
  }

  clearPointers(): void {
    this.activePointers.clear();
  }

  getActivePointers(): UnifiedPointer[] {
    return [...this.activePointers.values()];
  }

  getPointerById(identifier: number): undefined | UnifiedPointer {
    return this.activePointers.get(identifier);
  }

  getPointerId(event: MouseEvent | PointerEvent | TouchEvent): null | number {
    if ('touches' in event) {
      return event.changedTouches?.[0]?.identifier ?? null;
    }
    return 'pointerId' in event ? event.pointerId : 0;
  }

  removePointer(event: MouseEvent | PointerEvent | TouchEvent): null | UnifiedPointer {
    const pointer = this.createUnifiedPointer(event, true);
    if (pointer) {
      this.activePointers.delete(pointer.identifier);
    }
    return pointer;
  }

  updatePointer(event: MouseEvent | PointerEvent | TouchEvent): null | UnifiedPointer {
    const pointer = this.createUnifiedPointer(event);
    if (pointer && this.activePointers.has(pointer.identifier)) {
      this.activePointers.set(pointer.identifier, pointer);
      return pointer;
    }
    return null;
  }

  private createUnifiedPointer(
    event: MouseEvent | PointerEvent | Touch | TouchEvent,
    isEndEvent = false,
  ): null | UnifiedPointer {
    let identifier = 0;
    let type: PointerType = 'mouse';
    let pressure = 0,
      x = 0,
      y = 0;
    let tiltX: number | undefined, tiltY: number | undefined;
    let baseEvent: MouseEvent | PointerEvent | Touch;

    const timeStamp = (event as any).timeStamp;

    if ('touches' in event) {
      const touch = isEndEvent ? event.changedTouches[0] : event.touches[0];
      if (!touch) {
        return null;
      }
      baseEvent = touch;
      identifier = touch.identifier;
      type = 'touch';
      x = touch.clientX;
      y = touch.clientY;
      pressure = 0.5;
    } else if ('pointerId' in event) {
      baseEvent = event;
      identifier = event.pointerId;
      type = event.pointerType as PointerType;
      x = event.clientX;
      y = event.clientY;
      pressure = event.pressure;
      tiltX = event.tiltX;
      tiltY = event.tiltY;
    } else {
      baseEvent = event;
      x = event.clientX;
      y = event.clientY;
      pressure = 0;
    }

    const rect = this.element.getBoundingClientRect();
    const scaledX = x - rect.left;
    const scaledY = y - rect.top;
    const relX = scaledX / rect.width;
    const relY = scaledY / rect.height;

    const existing = this.activePointers.get(identifier);

    const startX = existing?.startX ?? x;
    const startY = existing?.startY ?? y;
    const originalStartX = existing?.originalStartX ?? x;
    const originalStartY = existing?.originalStartY ?? y;
    const originalTimeStamp = existing?.originalTimeStamp ?? timeStamp;

    const dx = x - startX;
    const dy = y - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = timeStamp - originalTimeStamp;

    return {
      distance,
      duration,
      event: baseEvent,
      identifier,
      originalStartX,
      originalStartY,
      originalTimeStamp,
      pressure,
      relX,
      relY,
      scaledX,
      scaledY,
      startX,
      startY,
      tiltX,
      tiltY,
      timeStamp,
      type,
      x,
      y,
    };
  }
}
