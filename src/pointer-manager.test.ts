import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PointerManager } from './pointer-manager';

class MockPointerEvent extends Event {
  clientX: number;
  clientY: number;
  pointerId: number;
  pointerType: string;
  pressure: number;
  tiltX?: number;
  tiltY?: number;
  timeStamp: number;
  constructor(type: string, init: any) {
    super(type, init);
    this.pointerId = init?.pointerId ?? 0;
    this.pointerType = init?.pointerType ?? 'mouse';
    this.clientX = init?.clientX ?? 0;
    this.clientY = init?.clientY ?? 0;
    this.pressure = init?.pressure ?? 0;
    this.tiltX = init?.tiltX;
    this.tiltY = init?.tiltY;
    this.timeStamp = init?.timeStamp ?? Date.now();
  }
}

class MockTouch {
  clientX: number;
  clientY: number;
  force: number;
  identifier: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  screenX: number;
  screenY: number;
  target: EventTarget | null;
  constructor(init: any) {
    this.identifier = init?.identifier ?? 0;
    this.target = init?.target ?? null;
    this.clientX = init?.clientX ?? 0;
    this.clientY = init?.clientY ?? 0;
    // Add these properties to match real Touch interface
    this.screenX = init?.screenX ?? 0;
    this.screenY = init?.screenY ?? 0;
    this.pageX = init?.pageX ?? 0;
    this.pageY = init?.pageY ?? 0;
    this.radiusX = init?.radiusX ?? 0;
    this.radiusY = init?.radiusY ?? 0;
    this.rotationAngle = init?.rotationAngle ?? 0;
    this.force = init?.force ?? 0;
  }
}

class MockTouchEvent extends Event {
  changedTouches: MockTouch[];
  timeStamp: number;
  touches: MockTouch[];
  constructor(type: string, init: any) {
    super(type, init);
    this.changedTouches = init?.changedTouches ?? [];
    this.touches = init?.touches ?? [];
    this.timeStamp = init?.timeStamp ?? Date.now();
  }
}

global.PointerEvent = MockPointerEvent as any;
global.Touch = MockTouch as any;
global.TouchEvent = MockTouchEvent as any;

describe('PointerManager', () => {
  let manager: PointerManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = vi.fn(() => ({
      bottom: 600,
      height: 400,
      left: 100,
      right: 400,
      toJSON: () => {},
      top: 200,
      width: 300,
      x: 100,
      y: 200,
    }));
    manager = new PointerManager(mockElement);
  });

  describe('constructor', () => {
    it('should initialize with empty active pointers', () => {
      expect(manager.getActivePointers()).toEqual([]);
    });

    it('should store the element reference', () => {
      const element = document.createElement('div');
      const m = new PointerManager(element);
      expect(m).toBeInstanceOf(PointerManager);
    });
  });

  describe('addPointer', () => {
    it('should add mouse pointer', () => {
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 150,
        clientY: 250,
      });
      const pointer = manager.addPointer(mouseEvent);

      expect(pointer).toEqual({
        distance: 0,
        duration: 0,
        event: mouseEvent,
        identifier: 0,
        originalStartX: 150,
        originalStartY: 250,
        originalTimeStamp: mouseEvent.timeStamp,
        pressure: 0,
        relX: (150 - 100) / 300,
        relY: (250 - 200) / 400,
        scaledX: 150 - 100,
        scaledY: 250 - 200,
        startX: 150,
        startY: 250,
        tiltX: undefined,
        tiltY: undefined,
        timeStamp: mouseEvent.timeStamp,
        type: 'mouse',
        x: 150,
        y: 250,
      });

      expect(manager.getActivePointers().length).toBe(1);
    });

    it('should add pointer event', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 200,
        clientY: 300,
        pointerId: 1,
        pointerType: 'pen',
        pressure: 0.5,
        tiltX: 10,
        tiltY: -5,
      });
      const pointer = manager.addPointer(pointerEvent);

      expect(pointer?.identifier).toBe(1);
      expect(pointer?.type).toBe('pen');
      expect(pointer?.pressure).toBe(0.5);
      expect(pointer?.tiltX).toBe(10);
      expect(pointer?.tiltY).toBe(-5);
      expect(manager.getActivePointers().length).toBe(1);
    });

    it('should add touch event', () => {
      const touch = new Touch({
        clientX: 250,
        clientY: 350,
        identifier: 2,
        target: mockElement,
      });

      const touchEvent = new TouchEvent('touchstart', {
        changedTouches: [touch],
        touches: [touch],
      });

      const pointer = manager.addPointer(touchEvent);

      expect(pointer).not.toBeNull();
      expect(pointer?.identifier).toBe(2);
      expect(pointer?.type).toBe('touch');
      expect(pointer?.pressure).toBe(0.5);
      expect(manager.getActivePointers().length).toBe(1);
    });

    it('should return null for touch event with no touches', () => {
      const touchEvent = new TouchEvent('touchstart', {
        changedTouches: [],
      });
      const pointer = manager.addPointer(touchEvent);
      expect(pointer).toBeNull();
    });
  });

  describe('removePointer', () => {
    it('should remove pointer by identifier', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 200,
        clientY: 300,
        pointerId: 3,
      });
      manager.addPointer(pointerEvent);
      expect(manager.getActivePointers().length).toBe(1);

      const removed = manager.removePointer(pointerEvent);
      expect(removed).toBeTruthy();
      expect(manager.getActivePointers().length).toBe(0);
    });

    it('should handle touch event removal', () => {
      // First create and add a touch
      const touch = new Touch({
        clientX: 250,
        clientY: 350,
        identifier: 4,
        target: mockElement,
      });

      const touchStartEvent = new TouchEvent('touchstart', {
        changedTouches: [touch],
        touches: [touch],
      });

      // Add the pointer first
      manager.addPointer(touchStartEvent);
      expect(manager.getActivePointers().length).toBe(1); // Verify it was added

      // Now create the removal event
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [touch],
      });

      // Remove the pointer
      const removed = manager.removePointer(touchEndEvent);

      expect(removed).toBeTruthy();
      expect(removed?.identifier).toBe(4);
      expect(manager.getActivePointers().length).toBe(0);
    });

    it('should return pointer object even if not previously active', () => {
      const pointerEvent = new PointerEvent('pointerup', {
        clientX: 200,
        clientY: 300,
        pointerId: 999, // Never added
      });

      const result = manager.removePointer(pointerEvent);

      // Verify it returns the pointer object (current behavior)
      expect(result).not.toBeNull();
      expect(result?.identifier).toBe(999);
      expect(manager.getActivePointers().length).toBe(0); // Not actually added
    });
  });

  describe('updatePointer', () => {
    it('should update existing pointer', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 200,
        clientY: 300,
        pointerId: 5,
      });
      manager.addPointer(pointerEvent);

      const moveEvent = new PointerEvent('pointermove', {
        clientX: 250,
        clientY: 350,
        pointerId: 5,
      });
      const updated = manager.updatePointer(moveEvent);

      expect(updated).toBeTruthy();
      expect(updated?.x).toBe(250);
      expect(updated?.y).toBe(350);
      expect(updated?.distance).toBeGreaterThan(0);
      expect(updated?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existing pointer', () => {
      const moveEvent = new PointerEvent('pointermove', {
        clientX: 250,
        clientY: 350,
        pointerId: 999,
      });
      const updated = manager.updatePointer(moveEvent);
      expect(updated).toBeNull();
    });
  });

  describe('getPointerById', () => {
    it('should return pointer by id', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 200,
        clientY: 300,
        pointerId: 6,
      });
      manager.addPointer(pointerEvent);

      const pointer = manager.getPointerById(6);
      expect(pointer).toBeTruthy();
      expect(pointer?.identifier).toBe(6);
    });

    it('should return undefined for unknown id', () => {
      const pointer = manager.getPointerById(999);
      expect(pointer).toBeUndefined();
    });
  });

  describe('getPointerId', () => {
    it('should return id from pointer event', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        pointerId: 7,
      });
      expect(manager.getPointerId(pointerEvent)).toBe(7);
    });

    it('should return id from touch event', () => {
      const touchEvent = new TouchEvent('touchstart', {
        changedTouches: [
          new Touch({
            identifier: 8,
            target: mockElement,
          }),
        ],
      });
      expect(manager.getPointerId(touchEvent)).toBe(8);
    });

    it('should return 0 for mouse event', () => {
      const mouseEvent = new MouseEvent('mousedown');
      expect(manager.getPointerId(mouseEvent)).toBe(0);
    });

    it('should return null for touch event with no touches', () => {
      const touchEvent = new TouchEvent('touchstart', {
        changedTouches: [],
      });
      expect(manager.getPointerId(touchEvent)).toBeNull();
    });
  });

  describe('clearPointers', () => {
    it('should clear all active pointers', () => {
      const pointerEvent1 = new PointerEvent('pointerdown', { pointerId: 1 });
      const pointerEvent2 = new PointerEvent('pointerdown', { pointerId: 2 });

      manager.addPointer(pointerEvent1);
      manager.addPointer(pointerEvent2);
      expect(manager.getActivePointers().length).toBe(2);

      manager.clearPointers();
      expect(manager.getActivePointers().length).toBe(0);
    });
  });

  describe('getActivePointers', () => {
    it('should return all active pointers', () => {
      const pointerEvent1 = new PointerEvent('pointerdown', { pointerId: 1 });
      const pointerEvent2 = new PointerEvent('pointerdown', { pointerId: 2 });

      manager.addPointer(pointerEvent1);
      manager.addPointer(pointerEvent2);

      const pointers = manager.getActivePointers();
      expect(pointers.length).toBe(2);
      expect(pointers[0].identifier).toBe(1);
      expect(pointers[1].identifier).toBe(2);
    });
  });

  describe('createUnifiedPointer', () => {
    it('should maintain original values on update', () => {
      const pointerEvent1 = new PointerEvent('pointerdown', {
        clientX: 200,
        clientY: 300,
        pointerId: 9,
      });
      manager.addPointer(pointerEvent1);

      const pointerEvent2 = new PointerEvent('pointermove', {
        clientX: 250,
        clientY: 350,
        pointerId: 9,
      });
      const updated = manager.updatePointer(pointerEvent2);

      expect(updated?.originalStartX).toBe(200);
      expect(updated?.originalStartY).toBe(300);
      expect(updated?.originalTimeStamp).toBe(pointerEvent1.timeStamp);
      expect(updated?.startX).toBe(200);
      expect(updated?.startY).toBe(300);
    });

    it('should calculate relative and scaled positions correctly', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 250,
        clientY: 400,
        pointerId: 10,
      });
      const pointer = manager.addPointer(pointerEvent);

      expect(pointer?.scaledX).toBe(150); // 250 - 100 (left)
      expect(pointer?.scaledY).toBe(200); // 400 - 200 (top)
      expect(pointer?.relX).toBe(0.5); // 150 / 300 (width)
      expect(pointer?.relY).toBe(0.5); // 200 / 400 (height)
    });

    it('should calculate distance and duration', () => {
      const pointerEvent1 = new PointerEvent('pointerdown', {
        clientX: 200,
        clientY: 300,
        pointerId: 11,
      });
      manager.addPointer(pointerEvent1);

      // Simulate time passing
      const pointerEvent2 = new PointerEvent('pointermove', {
        clientX: 300,
        clientY: 400,
        pointerId: 11,
        timeStamp: pointerEvent1.timeStamp + 100,
      } as any);
      const updated = manager.updatePointer(pointerEvent2);

      expect(updated?.distance).toBeCloseTo(141.42, 2); // sqrt(100² + 100²)
      expect(updated?.duration).toBe(100);
    });
  });
});
