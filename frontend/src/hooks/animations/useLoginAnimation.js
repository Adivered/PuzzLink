import { useRef } from 'react';
import gsap from 'gsap';
import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';

const useLoginAnimation = () => {
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const googleButtonRef = useRef(null);
  const dividerRef = useRef(null);
  const inputsRef = useRef([]);

  useIsomorphicLayoutEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, 2);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", opacity: 0 } });
      
      tl.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8
      })
      .from(googleButtonRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.5
      }, "-=0.3")
      .from(dividerRef.current, {
        scaleX: 0,
        duration: 0.5
      }, "-=0.2")
      .from(inputsRef.current, {
        y: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 0.4
      }, "-=0.2");
    });

    return () => ctx.revert();
  }, []);

  return { formRef, titleRef, googleButtonRef, dividerRef, inputsRef };
}

export default useLoginAnimation;

