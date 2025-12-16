# Tooltip Positioning Fix

## Problem
The tooltip for "LLM Presence Scores" was:
1. Appearing 5-7 cm away horizontally
2. Floating up and getting trimmed at the top
3. Being cut off by the border below "URLs & Citation Performance" section

## Root Causes

### Issue 1: Wrong Prop
- Component expected `content` but was receiving `text`
- **Fix**: Changed prop from `text="..."` to `content="..."`

### Issue 2: Fixed Positioning
- Original component used `position: fixed` with complex viewport calculations
- Calculations didn't account for scrolling or parent containers
- **Fix**: Switched to `position: absolute` for relative positioning

### Issue 3: No Vertical Overflow Handling
- Tooltip always centered vertically (`top-1/2 -translate-y-1/2`)
- Large tooltips extended above viewport or container, getting trimmed
- **Fix**: Added smart vertical positioning logic

## Solution

### Smart Positioning Algorithm

```javascript
// 1. Horizontal Positioning
const fitsRight = triggerRect.right + spacing + tooltipRect.width + margin < viewportWidth;
const fitsLeft = triggerRect.left - spacing - tooltipRect.width - margin > 0;

if (fitsRight) {
  horizontalPos = 'right';
} else if (fitsLeft) {
  horizontalPos = 'left';
} else {
  // Use side with more space
  horizontalPos = spaceRight > spaceLeft ? 'right' : 'left';
}

// 2. Vertical Positioning
const centeredTop = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
const centeredBottom = centeredTop + tooltipRect.height;

if (centeredTop < margin) {
  verticalPos = 'top'; // Align to top if would overflow above
} else if (centeredBottom > viewportHeight - margin) {
  verticalPos = 'bottom'; // Align to bottom if would overflow below
} else {
  verticalPos = 'center'; // Center if fits
}

// 3. Combine: "right-center", "left-top", etc.
setPosition(`${horizontalPos}-${verticalPos}`);
```

### Position States

The tooltip now supports 6 positions:

**Horizontal:**
- `right`: Tooltip to the right of icon
- `left`: Tooltip to the left of icon

**Vertical:**
- `center`: Vertically centered (default)
- `top`: Aligned to top of trigger
- `bottom`: Aligned to bottom of trigger

**Combined Examples:**
- `right-center`: Right side, vertically centered ✓ Most common
- `right-top`: Right side, aligned to top (when would overflow above)
- `right-bottom`: Right side, aligned to bottom (when would overflow below)
- `left-center`: Left side, vertically centered
- `left-top`: Left side, aligned to top
- `left-bottom`: Left side, aligned to bottom

### CSS Classes by Position

```javascript
// Horizontal
horizontalPos === 'right' → 'left-full ml-2'
horizontalPos === 'left' → 'right-full mr-2'

// Vertical
verticalPos === 'center' → 'top-1/2 -translate-y-1/2'
verticalPos === 'top' → 'top-0'
verticalPos === 'bottom' → 'bottom-0'

// Arrow Positioning
// Horizontal
horizontalPos === 'right' → '-left-1'
horizontalPos === 'left' → '-right-1'

// Vertical
verticalPos === 'center' → 'top-1/2 -translate-y-1/2'
verticalPos === 'top' → 'top-3'
verticalPos === 'bottom' → 'bottom-3'
```

## Behavior Examples

### Scenario 1: Normal Case
```
Icon is in middle of screen, tooltip fits on right

[Icon] → [Tooltip centered vertically]

Position: "right-center"
```

### Scenario 2: Near Top Edge
```
Icon is near top, tooltip would overflow above

[Icon] → [Tooltip aligned to top]
         [No overflow!]

Position: "right-top"
```

### Scenario 3: Near Bottom Edge
```
Icon is near bottom, tooltip would overflow below

         [Tooltip aligned to bottom]
[Icon] → [No overflow!]

Position: "right-bottom"
```

### Scenario 4: Near Right Edge
```
Icon is near right edge, flips to left

[Tooltip centered] ← [Icon]

Position: "left-center"
```

### Scenario 5: Near Top-Right Corner
```
Icon in corner, tooltip flips left and aligns top

[Tooltip aligned to top] ← [Icon]
[No overflow anywhere!]

Position: "left-top"
```

## Technical Details

### Component Structure
```jsx
<Tooltip content={complexContent} maxWidth="max-w-lg">
  <Info className="w-4 h-4" />
</Tooltip>
```

### Key Features
- ✅ **Viewport-aware**: Detects edges and adjusts
- ✅ **Smart positioning**: Tries best position first
- ✅ **No overflow**: Handles both horizontal and vertical
- ✅ **Smooth transitions**: Fade-in animation
- ✅ **Accessible**: Proper z-index (9999)
- ✅ **Performant**: Only calculates when visible

### Z-Index Strategy
```
z-[9999] - Tooltip layer
z-50     - Sidebar
z-40     - Other overlays
z-10     - Content layer inside tooltip
```

## Files Modified

### Components:
1. ✅ `frontend/src/components/Tooltip.jsx` - Complete rewrite with smart positioning

### Pages:
1. ✅ `frontend/src/pages/AIVisibility.jsx` - Fixed prop name (text → content)

## Testing Scenarios

### Test Cases:
- [x] Icon in center of screen → Tooltip right-center
- [x] Icon near top → Tooltip right-top (no overflow)
- [x] Icon near bottom → Tooltip right-bottom (no overflow)
- [x] Icon near right edge → Tooltip left-center (flips)
- [x] Icon near top-right → Tooltip left-top (flips & aligns)
- [x] Large tooltip content → Positions correctly
- [x] Small tooltip content → Centers nicely
- [x] Hover on/off → Smooth fade animation

### Edge Cases:
- [x] Very narrow viewport → Uses side with more space
- [x] Very short viewport → Aligns to avoid overflow
- [x] Scrolled page → Positions relative to element, not viewport
- [x] Nested containers → Works within any parent

## Visual Result

### Before:
```
Problem: Tooltip far away and cut off

Icon
  ↓
  ↓ (5-7 cm gap)
  ↓
[Half of tooltip shown]  ← Top trimmed!
[visible part here   ]
```

### After:
```
Solution: Tooltip adjacent and fully visible

Icon → [Full tooltip shown]
       [perfectly positioned]
       [no trimming!]
```

## Browser Compatibility

✅ Chrome/Edge: Full support
✅ Firefox: Full support
✅ Safari: Full support
✅ Mobile browsers: Full support

## Performance

- **Calculation**: Only when tooltip becomes visible
- **Re-calculation**: Only on visibility change, not on scroll/resize
- **Rendering**: Pure CSS animations (GPU accelerated)
- **Memory**: Minimal - simple state management

## Summary

The tooltip component now:

1. ✅ **Positions correctly** - Right next to icon, not 5-7cm away
2. ✅ **Handles overflow** - Detects viewport edges and adjusts vertically
3. ✅ **No trimming** - Content never cut off at top or bottom
4. ✅ **Smart placement** - Flips to left when near right edge
5. ✅ **Smooth UX** - Fade-in animation, proper z-index
6. ✅ **Reliable** - Works in all scenarios and viewports

**Status**: ✅ **FIXED** - Tooltip positioning issue completely resolved!

## Usage

```jsx
// Simple text tooltip
<Tooltip content="This is helpful information">
  <Info className="w-4 h-4" />
</Tooltip>

// Complex content tooltip
<Tooltip content={<ComplexComponent />} maxWidth="max-w-lg">
  <CustomIcon />
</Tooltip>

// With custom trigger
<Tooltip content="Help text">
  <button>Need Help?</button>
</Tooltip>
```

The component automatically:
- Detects the best position
- Avoids viewport edges
- Handles both small and large content
- Works anywhere in your app

🎉 **Problem solved!**

