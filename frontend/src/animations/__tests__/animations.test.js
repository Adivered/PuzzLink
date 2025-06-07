import { 
  animateFeatureElement,
  animateTestimonialElement,
  animatePricingElement,
  animateFAQElement,
  animateCTAElement 
} from '../sections';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    set: jest.fn(),
    to: jest.fn(() => ({ kill: jest.fn() })),
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      fromTo: jest.fn().mockReturnThis(),
      kill: jest.fn()
    })),
    killTweensOf: jest.fn()
  }
}));

describe('Animation Functions', () => {
  let mockElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockElement = {
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };
  });

  describe('animateFeatureElement', () => {
    test('should animate feature element correctly', () => {
      animateFeatureElement(mockElement, 0);

      expect(require('gsap').gsap.set).toHaveBeenCalledWith(
        mockElement,
        { opacity: 0, y: 30, scale: 0.95 }
      );
      
      expect(require('gsap').gsap.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0
        })
      );
    });

    test('should handle index for stagger delay', () => {
      animateFeatureElement(mockElement, 2);

      expect(require('gsap').gsap.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          delay: 0.2 // 2 * 0.1 stagger
        })
      );
    });
  });

  describe('animateTestimonialElement', () => {
    test('should animate testimonial element correctly', () => {
      animateTestimonialElement(mockElement, 1);

      expect(require('gsap').gsap.set).toHaveBeenCalledWith(
        mockElement,
        { opacity: 0, scale: 0.95, y: 20 }
      );
      
      expect(require('gsap').gsap.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          delay: 0.15 // 1 * 0.15 stagger
        })
      );
    });
  });

  describe('animatePricingElement', () => {
    test('should animate pricing element correctly', () => {
      animatePricingElement(mockElement, 0);

      expect(require('gsap').gsap.set).toHaveBeenCalledWith(
        mockElement,
        { opacity: 0, y: 30, scale: 0.95 }
      );
      
      expect(require('gsap').gsap.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6
        })
      );
    });
  });

  describe('animateFAQElement', () => {
    test('should animate FAQ element correctly', () => {
      animateFAQElement(mockElement, 1);

      expect(require('gsap').gsap.set).toHaveBeenCalledWith(
        mockElement,
        { opacity: 0, x: -20 }
      );
      
      expect(require('gsap').gsap.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          opacity: 1,
          x: 0,
          delay: 0.08 // 1 * 0.08 stagger
        })
      );
    });
  });

  describe('animateCTAElement', () => {
    test('should animate CTA element correctly', () => {
      animateCTAElement(mockElement, 2);

      expect(require('gsap').gsap.set).toHaveBeenCalledWith(
        mockElement,
        { opacity: 0, y: 20 }
      );
      
      expect(require('gsap').gsap.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          opacity: 1,
          y: 0,
          delay: 0.16 // 2 * 0.08 stagger
        })
      );
    });
  });

  describe('Animation Callbacks', () => {
    test('should add gsap-animated class onStart', () => {
      const { gsap } = require('gsap');
      
      // Mock the callback execution
      gsap.to.mockImplementation((element, config) => {
        if (config.onStart) {
          config.onStart();
        }
        return { kill: jest.fn() };
      });

      animateFeatureElement(mockElement, 0);

      expect(mockElement.classList.add).toHaveBeenCalledWith('gsap-animated');
    });

    test('should set willChange property onStart', () => {
      const { gsap } = require('gsap');
      
      gsap.to.mockImplementation((element, config) => {
        if (config.onStart) {
          config.onStart();
        }
        return { kill: jest.fn() };
      });

      animateFeatureElement(mockElement, 0);

      expect(mockElement.style.willChange).toBe('transform, opacity');
    });
  });
}); 