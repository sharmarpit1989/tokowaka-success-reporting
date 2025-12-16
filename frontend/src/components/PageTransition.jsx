import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Page Transition Wrapper
 * Provides smooth transitions between page changes
 */
function PageTransition({ children }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('enter')

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('exit')
    }
  }, [location, displayLocation])

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timeout = setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('enter')
      }, 150) // Half of the transition duration

      return () => clearTimeout(timeout)
    }
  }, [transitionStage, location])

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${transitionStage === 'exit' 
          ? 'opacity-0 translate-y-2' 
          : 'opacity-100 translate-y-0'
        }
      `}
    >
      {children}
    </div>
  )
}

export default PageTransition

