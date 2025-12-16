import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Enhanced Button Component
 * Provides consistent button styling with smooth interactions
 */
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `

  const variants = {
    primary: `
      bg-primary-600 text-white hover:bg-primary-700
      shadow-sm hover:shadow-md
      focus:ring-primary-500
    `,
    secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300
      hover:shadow-sm
      focus:ring-gray-400
    `,
    outline: `
      bg-transparent border-2 border-gray-300 text-gray-700
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-gray-400
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100
      focus:ring-gray-400
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700
      shadow-sm hover:shadow-md
      focus:ring-green-500
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700
      shadow-sm hover:shadow-md
      focus:ring-red-500
    `,
    warning: `
      bg-yellow-500 text-white hover:bg-yellow-600
      shadow-sm hover:shadow-md
      focus:ring-yellow-400
    `
  }

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'pointer-events-none' : 'hover:scale-[1.02]'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconSizes[size]} transition-transform duration-200 group-hover:scale-110`} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconSizes[size]} transition-transform duration-200 group-hover:scale-110`} />
          )}
        </>
      )}
    </button>
  )
}

export default Button

