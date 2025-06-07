// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock GSAP modules
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    config: jest.fn(),
    defaults: jest.fn(),
    set: jest.fn(),
    to: jest.fn(() => ({ 
      kill: jest.fn(),
      progress: jest.fn(),
      play: jest.fn(),
      pause: jest.fn()
    })),
    fromTo: jest.fn(() => ({ 
      kill: jest.fn(),
      progress: jest.fn(),
      play: jest.fn(),
      pause: jest.fn()
    })),
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      fromTo: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis(),
      kill: jest.fn(),
      progress: jest.fn(),
      play: jest.fn(),
      pause: jest.fn()
    })),
    killTweensOf: jest.fn(),
    getProperty: jest.fn(),
    quickSetter: jest.fn()
  }
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    config: jest.fn(),
    create: jest.fn(() => ({ 
      kill: jest.fn(),
      update: jest.fn(),
      refresh: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn()
    })),
    refresh: jest.fn(),
    killAll: jest.fn(),
    getAll: jest.fn(() => []),
    clearMatchMedia: jest.fn(),
    update: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getById: jest.fn(),
    batch: jest.fn()
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
