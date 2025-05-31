import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PointerManager } from './pointer-manager';
import type { GestureRecognizerOptions, SwipeDirection } from './types';

import { DEFAULT_OPTIONS, GestureRecognizerBase } from './gesture-recognizer-base';

// Create a test subclass (since the base class is abstract)
class TestGestureRecognizer extends GestureRecognizerBase {
  processEvent() {
    /* Empty implementation */
  }
}

describe('GestureRecognizerBase', () => {
  let element: HTMLElement;
  let pointerManager: PointerManager;
  let recognizer: TestGestureRecognizer;
  const mockDispatchEvent = vi.fn();

  beforeEach(() => {
    element = document.createElement('div');
    pointerManager = {} as PointerManager;
    recognizer = new TestGestureRecognizer(element, pointerManager, {});
    element.dispatchEvent = mockDispatchEvent;
    mockDispatchEvent.mockClear();
  });

  describe('Constructor', () => {
    it('should merge default options', () => {
      const customOptions: GestureRecognizerOptions = {
        enableTap: false,
        longPressDelay: 1000,
      };

      const customRecognizer = new TestGestureRecognizer(element, pointerManager, customOptions);

      expect(customRecognizer['options'].longPressDelay).toBe(1000);
      expect(customRecognizer['options'].enableTap).toBe(false);
      expect(customRecognizer['options'].enableSwipe).toBe(DEFAULT_OPTIONS.enableSwipe);
    });
  });

  describe('calculateAngle()', () => {
    it('should calculate angles in different quadrants', () => {
      const cases = [
        { dx: 10, dy: 0, expected: 0 }, // Positive right
        { dx: 0, dy: 10, expected: 90 }, // Positive down
        { dx: -10, dy: 0, expected: 180 }, // Positive left
        { dx: 0, dy: -10, expected: -90 }, // Positive up
        { dx: 10, dy: 10, expected: 45 }, // Bottom right
        { dx: -10, dy: 10, expected: 135 }, // Bottom left
        { dx: -10, dy: -10, expected: -135 }, // Top left
        { dx: 10, dy: -10, expected: -45 }, // Top right
      ];

      cases.forEach(({ dx, dy, expected }) => {
        expect(recognizer['calculateAngle'](dx, dy)).toBeCloseTo(expected);
      });
    });
  });

  describe('calculateVelocity()', () => {
    it('should calculate normal velocity', () => {
      expect(recognizer['calculateVelocity'](0, 1000, 500)).toBe(0.5);
    });

    it('should return 0 when time difference is 0', () => {
      expect(recognizer['calculateVelocity'](0, 0, 500)).toBe(0);
    });

    it('should return 0 when time difference is negative', () => {
      expect(recognizer['calculateVelocity'](1000, 0, 500)).toBe(0);
    });
  });

  describe('getSwipeDirection()', () => {
    const directions: [number, SwipeDirection][] = [
      [0, 'right'], // Positive right
      [44.9, 'right'], // Right boundary
      [-44.9, 'right'], // Right boundary (negative)
      [45, 'down'], // Down (boundary)
      [89.9, 'down'], // Positive down
      [90, 'down'], // Positive down
      [134.9, 'down'], // Down boundary
      [135, 'left'], // Left (boundary)
      [180, 'left'], // Positive left
      [-45.1, 'up'], // Up boundary (negative)
      [-90, 'up'], // Positive up
      [-134.9, 'up'], // Up boundary
      [-135, 'up'], // Up (boundary) <- Fix here
      [179, 'left'], // Left boundary
      [-179, 'left'], // Left boundary (negative)
    ];

    directions.forEach(([angle, expected]) => {
      it(`angle ${angle}° should be recognized as ${expected}`, () => {
        expect(recognizer['getSwipeDirection'](angle)).toBe(expected);
      });
    });
  });

  describe('dispatchEvent()', () => {
    it('should trigger a custom event with details', () => {
      const detail = { foo: 'bar' };
      recognizer['dispatchEvent']('tap', detail);

      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
      const event = mockDispatchEvent.mock.calls[0][0];
      expect(event.type).toBe('gesture:tap');
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
      expect(event.detail).toEqual(detail);
    });
  });
});
