import { useState, useEffect, useRef, useCallback } from 'react'
import { debounce, throttle, rafThrottle } from '../utils/performance'

/**
 * Custom hooks for smooth UX interactions
 */

/**
 * Hook for smooth scrolling
 */
export function useSmoothScroll() {
  const scrollTo = useCallback((elementOrSelector, offset = 0) => {
    const element =
      typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector

    if (!element) return

    const top = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  return { scrollTo, scrollToTop }
}

/**
 * Hook for detecting scroll position
 */
export function useScrollPosition(threshold = 0) {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.pageYOffset
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > threshold)
    }, 100)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { scrollY, isScrolled }
}

/**
 * Hook for smooth value transitions (e.g., counters)
 */
export function useSmoothValue(targetValue, duration = 1000) {
  const [currentValue, setCurrentValue] = useState(0)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    startValueRef.current = currentValue
    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      const newValue = startValueRef.current + (targetValue - startValueRef.current) * easeProgress
      setCurrentValue(newValue)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [targetValue, duration])

  return currentValue
}

/**
 * Hook for intersection observer (lazy loading, animations on scroll)
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(target)

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [options, hasIntersected])

  return { targetRef, isIntersecting, hasIntersected }
}

/**
 * Hook for debounced values (useful for search inputs)
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for hover state with delay
 */
export function useHoverDelay(delay = 200) {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef(null)

  const onMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true)
    }, delay)
  }, [delay])

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { isHovered, onMouseEnter, onMouseLeave }
}

/**
 * Hook for optimistic UI updates
 */
export function useOptimisticUpdate(initialValue) {
  const [optimisticValue, setOptimisticValue] = useState(initialValue)
  const [actualValue, setActualValue] = useState(initialValue)
  const [isPending, setIsPending] = useState(false)

  const update = useCallback(async (newValue, asyncUpdate) => {
    // Immediately show optimistic value
    setOptimisticValue(newValue)
    setIsPending(true)

    try {
      // Perform actual update
      const result = await asyncUpdate(newValue)
      setActualValue(result)
      setOptimisticValue(result)
      return result
    } catch (error) {
      // Revert on error
      setOptimisticValue(actualValue)
      throw error
    } finally {
      setIsPending(false)
    }
  }, [actualValue])

  return { value: optimisticValue, isPending, update }
}

/**
 * Hook for page visibility (pause animations/requests when tab is hidden)
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}

/**
 * Hook for smooth expand/collapse animations
 */
export function useExpandCollapse(isExpanded) {
  const [height, setHeight] = useState(isExpanded ? 'auto' : '0')
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return

    if (isExpanded) {
      const contentHeight = contentRef.current.scrollHeight
      setHeight(`${contentHeight}px`)
      
      // Set to 'auto' after animation completes
      const timeout = setTimeout(() => {
        setHeight('auto')
      }, 300)
      
      return () => clearTimeout(timeout)
    } else {
      // Force reflow
      setHeight(`${contentRef.current.scrollHeight}px`)
      requestAnimationFrame(() => {
        setHeight('0')
      })
    }
  }, [isExpanded])

  return { contentRef, height }
}

export default {
  useSmoothScroll,
  useScrollPosition,
  useSmoothValue,
  useIntersectionObserver,
  useDebouncedValue,
  useHoverDelay,
  useOptimisticUpdate,
  usePageVisibility,
  useExpandCollapse
}

