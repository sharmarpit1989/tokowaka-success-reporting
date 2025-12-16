import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Scroll to Top Button
 * Provides smooth scroll to top functionality with fade-in animation
 */
function ScrollToTop({ threshold = 400 }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled past threshold
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility)

    // Clean up
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        bg-primary-600 hover:bg-primary-700
        text-white shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      `}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}

export default ScrollToTop

