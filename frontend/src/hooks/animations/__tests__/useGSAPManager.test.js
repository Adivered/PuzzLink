import { renderHook, act } from '@testing-library/react';
import { useGSAPManager } from '../useGSAPManager';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    config: jest.fn(),
    defaults: jest.fn(),
    set: jest.fn(),
    to: jest.fn(() => ({ kill: jest.fn() })),
    fromTo: jest.fn(() => ({ kill: jest.fn() })),
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      fromTo: jest.fn().mockReturnThis(),
      kill: jest.fn()
    })),
    killTweensOf: jest.fn()
  },
  ScrollTrigger: {
    config: jest.fn(),
    create: jest.fn(() => ({ kill: jest.fn() })),
    refresh: jest.fn(),
    killAll: jest.fn()
  }
}));

describe('useGSAPManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize GSAP manager correctly', () => {
    const { result } = renderHook(() => useGSAPManager());
    
    expect(result.current).toBeDefined();
    expect(result.current.gsap).toBeDefined();
    expect(result.current.ScrollTrigger).toBeDefined();
    expect(result.current.createAnimation).toBeDefined();
    expect(result.current.createScrollTrigger).toBeDefined();
    expect(result.current.animateElements).toBeDefined();
    expect(result.current.refresh).toBeDefined();
  });

  test('should create animation correctly', () => {
    const { result } = renderHook(() => useGSAPManager());
    const mockElement = document.createElement('div');
    const animationProps = { opacity: 1, duration: 0.5 };

    act(() => {
      result.current.createAnimation(mockElement, animationProps);
    });

    expect(require('gsap').gsap.to).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining(animationProps)
    );
  });

  test('should create scroll trigger correctly', () => {
    const { result } = renderHook(() => useGSAPManager());
    const mockElement = document.createElement('div');
    const triggerConfig = {
      trigger: mockElement,
      start: 'top 80%',
      animation: { opacity: 1 }
    };

    act(() => {
      result.current.createScrollTrigger(triggerConfig);
    });

    expect(require('gsap').ScrollTrigger.create).toHaveBeenCalled();
  });

  test('should animate multiple elements with stagger', () => {
    const { result } = renderHook(() => useGSAPManager());
    const mockElements = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div')
    ];

    act(() => {
      result.current.animateElements(mockElements, 'feature');
    });

    expect(require('gsap').gsap.set).toHaveBeenCalledTimes(mockElements.length);
    expect(require('gsap').gsap.to).toHaveBeenCalledTimes(mockElements.length);
  });

  test('should refresh ScrollTrigger', () => {
    const { result } = renderHook(() => useGSAPManager());

    act(() => {
      result.current.refresh();
    });

    expect(require('gsap').ScrollTrigger.refresh).toHaveBeenCalled();
  });

  test('should cleanup animations on unmount', () => {
    const { unmount } = renderHook(() => useGSAPManager());

    unmount();

    expect(require('gsap').ScrollTrigger.killAll).toHaveBeenCalled();
  });
}); 