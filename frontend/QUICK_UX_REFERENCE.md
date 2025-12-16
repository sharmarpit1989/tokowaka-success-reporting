# Quick UX Reference Guide

## 🎨 Common Patterns & Classes

### Animations

```jsx
// Fade in on mount
<div className="animate-fade-in">...</div>

// Stagger children (great for lists)
<div>
  {items.map((item, idx) => (
    <div className="stagger-item" style={{animationDelay: `${idx * 0.1}s`}}>
      {item}
    </div>
  ))}
</div>

// Scale in on mount
<div className="animate-scale-in">...</div>

// Slide down (for expand/collapse)
<div className="animate-slide-down">...</div>

// Page enter (for page transitions)
<div className="page-enter">...</div>
```

### Hover Effects

```jsx
// Lift effect
<div className="hover-lift">...</div>

// Scale on hover
<div className="hover:scale-105 transition-transform duration-200">...</div>

// Smooth shadow transition
<div className="shadow-sm hover:shadow-lg transition-shadow duration-300">...</div>
```

### Loading States

```jsx
import SkeletonLoader from './components/SkeletonLoader'

// While loading, show skeleton
{loading ? (
  <SkeletonLoader type="card" count={3} />
) : (
  <YourContent />
)}
```

### Toast Notifications

```jsx
import { useToast } from './components/Toast'

function MyComponent() {
  const { success, error, info, warning } = useToast()
  
  const handleAction = async () => {
    try {
      await doSomething()
      success('Action completed successfully!')
    } catch (err) {
      error('Action failed: ' + err.message)
    }
  }
}
```

### Buttons

```jsx
import Button from './components/Button'
import { Save } from 'lucide-react'

// Primary button with icon
<Button 
  variant="primary" 
  icon={Save}
  loading={isLoading}
  onClick={handleSave}
>
  Save Changes
</Button>

// Variants: primary, secondary, outline, ghost, success, danger, warning
// Sizes: small, medium, large
```

## 🎯 Performance Tips

### Debounce Search Inputs

```jsx
import { useDebouncedValue } from './hooks/useSmooth'

const [search, setSearch] = useState('')
const debouncedSearch = useDebouncedValue(search, 300)

// Use debouncedSearch for API calls
useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch)
  }
}, [debouncedSearch])
```

### Smooth Scroll

```jsx
import { useSmoothScroll } from './hooks/useSmooth'

const { scrollTo, scrollToTop } = useSmoothScroll()

// Scroll to element
<button onClick={() => scrollTo('#section-id')}>Go to section</button>

// Scroll to top
<button onClick={scrollToTop}>Back to top</button>
```

### Lazy Load on Scroll

```jsx
import { useIntersectionObserver } from './hooks/useSmooth'

const { targetRef, hasIntersected } = useIntersectionObserver()

return (
  <div ref={targetRef}>
    {hasIntersected && <ExpensiveComponent />}
  </div>
)
```

### Optimistic Updates

```jsx
import { useOptimisticUpdate } from './hooks/useSmooth'

const { value, isPending, update } = useOptimisticUpdate(initialValue)

const handleUpdate = async (newValue) => {
  try {
    await update(newValue, async (val) => {
      // API call here
      return await api.update(val)
    })
  } catch (error) {
    // Automatically reverts on error
    console.error(error)
  }
}
```

## 🎨 CSS Classes Reference

### Layout & Spacing
- `prevent-layout-shift` - Prevents content from jumping
- `glass` - Glass morphism effect

### Animations
- `animate-fade-in` - Fade in with translate up
- `animate-slide-in-right` - Slide in from right
- `animate-slide-down` - Slide down
- `animate-scale-in` - Scale in
- `animate-shimmer` - Shimmer loading effect
- `animate-pulse-soft` - Subtle pulse
- `stagger-item` - Stagger with siblings
- `page-enter` - Page entrance animation

### Interactive
- `hover-lift` - Lift on hover
- `optimistic-update` - Shows update feedback

## 🚀 Common Recipes

### Loading List with Skeleton

```jsx
function MyList({ data, loading }) {
  if (loading) {
    return <SkeletonLoader type="listItem" count={5} />
  }
  
  return (
    <div>
      {data.map((item, idx) => (
        <div 
          key={item.id} 
          className="stagger-item hover-lift"
          style={{animationDelay: `${idx * 0.05}s`}}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
```

### Card with Smooth Interactions

```jsx
<div className="
  bg-white rounded-lg border border-gray-200 p-6
  hover:shadow-lg hover:translate-y-[-2px]
  transition-all duration-300
  animate-fade-in
">
  <h3 className="font-bold mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### Expandable Section

```jsx
import { useExpandCollapse } from './hooks/useSmooth'

function ExpandableSection() {
  const [isOpen, setIsOpen] = useState(false)
  const { contentRef, height } = useExpandCollapse(isOpen)
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <div 
        style={{ height, overflow: 'hidden' }}
        className="transition-all duration-300"
      >
        <div ref={contentRef}>
          Content here
        </div>
      </div>
    </div>
  )
}
```

### Form with Toast Feedback

```jsx
import Button from './components/Button'
import { useToast } from './components/Toast'

function MyForm() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await submitForm()
      success('Form submitted successfully!')
    } catch (err) {
      error('Failed to submit form: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button 
        type="submit" 
        variant="primary" 
        loading={loading}
      >
        Submit
      </Button>
    </form>
  )
}
```

## 📱 Responsive Best Practices

```jsx
// Use Tailwind's responsive classes
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {/* Items */}
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">Mobile only</div>
```

## ✅ Checklist for New Features

When adding new features, remember to:

- [ ] Add loading states with skeletons
- [ ] Include toast notifications for actions
- [ ] Add hover effects for interactive elements
- [ ] Use stagger animations for lists
- [ ] Test keyboard navigation
- [ ] Add proper ARIA labels
- [ ] Debounce search/filter inputs
- [ ] Handle errors gracefully
- [ ] Test on mobile devices
- [ ] Verify smooth transitions

## 🎓 Tips

1. **Always animate state changes** - Use transitions for smooth UX
2. **Show immediate feedback** - Use optimistic updates
3. **Prevent layout shifts** - Use skeletons during load
4. **Debounce expensive operations** - Search, filters, etc.
5. **Use semantic HTML** - Better accessibility
6. **Test with keyboard** - Ensure tab navigation works
7. **Add loading states** - Users should never wonder what's happening
8. **Keep animations subtle** - Too much is overwhelming
9. **Be consistent** - Use same patterns throughout
10. **Test error states** - Graceful degradation

## 🔍 Debug Tips

### Check animation performance
```javascript
// In browser console
const perfEntries = performance.getEntriesByType('measure')
console.log(perfEntries)
```

### Disable animations for testing
```css
/* Add to CSS temporarily */
* {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
```

### Test with slow network
- Chrome DevTools > Network > Throttling > Slow 3G
- Verify skeletons appear correctly

---

**Remember**: Good UX is invisible - users shouldn't notice the details, they should just feel that the app is smooth and responsive!

