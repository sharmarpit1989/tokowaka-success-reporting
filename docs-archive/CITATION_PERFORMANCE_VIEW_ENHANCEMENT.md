# Citation Performance View Enhancement

## Overview
Enhanced the Citation Performance view to provide better filtering capabilities and a dedicated platform performance overview using uploaded target URLs and brand presence data.

## Changes Made

### 1. **Multi-Select Week Filter**
- **Before**: Single-select dropdown for weeks (select one week at a time)
- **After**: Multi-select interface with visual tags
  - Select multiple weeks simultaneously
  - Clear visual representation of selected weeks with removable tags
  - Click to add, click X to remove
  - Shows "All weeks" when none are selected

### 2. **Multi-Select URL Filter with Search**
- **New Feature**: Search and filter by specific URLs
  - Search box to find URLs quickly
  - Multi-select interface with visual tags
  - Shows up to 20 matching URLs at a time
  - Selected URLs displayed as green tags with remove button
  - Truncates long URLs for better display (hover to see full URL)

### 3. **Platform Performance Overview Section**
- **New Section**: Dedicated view showing citation performance by platform
  - Displays all platforms as cards
  - Each platform card shows:
    - **Targeted URL Rate**: Citation rate for specifically tracked URLs (blue)
    - **Domain Rate**: Overall domain citation rate (green)
    - Number of unique URLs cited
    - Total prompts and citations
  - Cards sorted by targeted URL rate (highest first)
  - Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
  - Respects week and URL filters

### 4. **Reorganized Layout**
New section order for better user experience:
1. **Upload Section**: Upload target URLs and brand presence data
2. **Key Metrics Summary**: Top-level statistics (3 metric cards)
3. **Filters Section**: Multi-select week and URL filters (highlighted with gradient background)
4. **Platform Performance Overview**: Visual cards showing platform-level statistics
5. **Detailed Data Table**: Granular week-by-platform table with view mode toggle

### 5. **Filter Integration**
- All filters apply to both Platform Performance Overview and Detailed Data Table
- Clear filter button applies to all selections
- Filter counters show how many items are selected
- Filters persist across view mode changes

## User Workflow

### Step 1: Upload Data
1. Upload target URLs (CSV/Excel) - can use data from AI Visibility Analysis
2. Upload brand presence data (Excel files from AI platforms)

### Step 2: Apply Filters (Optional)
1. Select one or more weeks to analyze
2. Search and select specific URLs to focus on
3. Clear filters anytime to see all data

### Step 3: View Results

#### Platform Performance Overview
- Quick visual comparison of all platforms
- See which platforms cite your URLs most frequently
- Compare targeted URL rates vs overall domain rates

#### Detailed Data Table
- Granular week-by-week breakdown
- Toggle between summary and detailed views
- Additional platform filter for table only
- Export-ready data format

## Data Structure

### Required Data
- **Target URLs**: List of URLs to track for citations
- **Brand Presence Data**: Excel files with citation information
  - Format: `brandpresence-{platform}-w{week}-{year}.xlsx`
  - Contains: prompts, sources, citation flags

### Citation Metrics
1. **Targeted URL Citation Rate**: % of prompts that cited tracked URLs
2. **Domain Citation Rate**: % of prompts that cited any URL from the domain
3. **Total Citations**: Count of all citations to tracked URLs

## Technical Details

### State Management
```javascript
const [selectedWeeks, setSelectedWeeks] = useState([])      // Multi-select weeks
const [selectedUrls, setSelectedUrls] = useState([])        // Multi-select URLs
const [urlSearchTerm, setUrlSearchTerm] = useState('')      // URL search term
```

### Filtering Logic
```javascript
const filteredData = summaryRates.filter(rate => {
  const weekMatch = selectedWeeks.length === 0 || selectedWeeks.includes(rate.week);
  const urlMatch = selectedUrls.length === 0 || 
                   rate.citedUrls.some(url => selectedUrls.includes(url));
  return weekMatch && urlMatch;
});
```

### Platform Aggregation
Data is aggregated by platform across selected weeks and URLs:
- Sums total prompts, citations, and domain citations
- Collects unique cited URLs per platform
- Calculates rates as percentages

## UI Components

### New Icons Used
- `Search`: Filter section and URL search box
- `X`: Remove tags for selected filters
- `Target`: Platform Performance Overview header
- `Sparkles`: Platform cards

### Color Scheme
- **Blue**: Targeted URL metrics
- **Green**: Domain metrics
- **Purple**: Total citations and sparkle accents
- **Gray**: Neutral backgrounds and borders

## Benefits

1. **Better Filtering**: Multi-select enables complex queries (e.g., "Show weeks 44, 45, 46 for these 3 specific URLs")
2. **Visual Overview**: Platform cards provide at-a-glance performance comparison
3. **Flexibility**: Can view aggregate platform performance or drill into week-by-week details
4. **User-Friendly**: Visual tags make filter state obvious, easy to modify
5. **Scalability**: Search functionality handles large URL lists efficiently

## Future Enhancements (Potential)

1. **Export Functionality**: Export filtered data as CSV/Excel
2. **Date Range Picker**: Select week ranges more easily
3. **Comparison Mode**: Compare two time periods side-by-side
4. **Trend Charts**: Visualize citation rates over time
5. **URL Grouping**: Group URLs by category or subdomain
6. **Platform Filtering**: Multi-select for platforms in addition to single-select
7. **Saved Filters**: Save common filter combinations

## Testing

To test the new features:

1. Navigate to Citation Performance page
2. Upload target URLs and brand presence data (or use pre-loaded data from AI Visibility)
3. Use the Filters section to select multiple weeks
4. Search for specific URLs and add them to the filter
5. Observe Platform Performance Overview updates based on filters
6. Verify Detailed Data Table also respects the filters
7. Clear filters and verify data resets to show all

## Compatibility

- Works with existing backend API endpoints
- Compatible with data from unified project workflow
- Maintains backwards compatibility with previous upload format
- Responsive design works on mobile, tablet, and desktop

