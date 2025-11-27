# Design Guidelines: Consistency Tracker

## Design Approach
**System:** Material Design + Linear-inspired productivity aesthetics  
**Rationale:** This is a utility-focused productivity tool requiring clarity, efficiency, and data visualization excellence. Drawing from Linear's minimalist precision and Material Design's structured approach to data-heavy interfaces.

## Typography System
- **Primary Font:** Inter (Google Fonts) for UI elements and body text
- **Display Font:** Cal Sans or similar geometric sans for hero numbers and consistency scores
- **Hierarchy:**
  - Hero numbers/scores: 4xl to 6xl, font-semibold
  - Section headers: xl to 2xl, font-semibold
  - Dashboard labels: sm, font-medium, uppercase tracking-wide
  - Body text: base, font-normal
  - Metadata/timestamps: xs to sm, font-medium

## Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24  
- Micro spacing: p-2, gap-2 (8px)
- Component padding: p-4, p-6 (16-24px)
- Section spacing: p-8, py-12 (32-48px)
- Grid gaps: gap-4, gap-6 (16-24px)

**Dashboard Bento Grid:**
- Container: max-w-7xl mx-auto px-4
- Grid structure: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Large widgets span: `md:col-span-2` or `lg:col-span-2`
- Consistency score widget: Prominent placement, `lg:col-span-1` with large display number

## Component Library

### Dashboard Cards (Bento Boxes)
- Rounded corners: rounded-2xl
- Padding: p-6 to p-8
- Border treatment: border with subtle opacity
- Each card has header (title + action), content area, optional footer
- Maintain consistent card heights within rows using min-h-[value]

### Time Blocking Timeline
- Full vertical layout: Left side shows hourly markers (6 AM - 11 PM)
- Timeline markers: text-xs, positioned at h-16 intervals
- Draggable blocks: rounded-lg, p-3, with category indicator strip (left border-l-4)
- Block labels: text-sm font-medium with time duration text-xs
- Interactive states: cursor-grab when idle, cursor-grabbing when dragging
- Drop zones: dashed borders when dragging active

### Heatmap Visualization
- Square cells: w-3 h-3 (12px) with gap-1
- 52-week grid layout (7 rows × 52 columns)
- Intensity indicated through opacity variations
- Month labels positioned above grid: text-xs
- Tooltip on hover showing date and score

### Consistency Score Display
- Large centered number: text-6xl to text-8xl font-bold
- Circular progress ring surrounding score
- Trend indicator: small arrow icon + percentage change text-sm
- Contextual subtitle: "Based on last 7 days" text-xs

### Task Lists
- Checkbox: w-5 h-5 rounded-md with custom check icon
- Task row: flex items-center gap-3, py-2, px-4
- Completed tasks: line-through, reduced opacity
- Category badges: text-xs px-2 py-1 rounded-full

### Charts
- Line chart container: h-64 to h-80
- Use Recharts or similar library
- Grid lines: subtle, dashed
- Data points: w-2 h-2 rounded-full
- Axes labels: text-xs
- Legend: text-sm, positioned top-right

### Navigation
- Top navbar: h-16, border-b, backdrop-blur
- Logo/brand: text-xl font-semibold
- Nav items: text-sm font-medium, px-4
- User profile: rounded-full avatar w-8 h-8

### Authentication Pages
- Centered card: max-w-md mx-auto, mt-20
- Form inputs: h-12, px-4, rounded-lg, text-base
- Submit button: w-full h-12, rounded-lg, font-medium
- Form spacing: space-y-4

## Interactions & States
- Hover states: subtle scale (scale-[1.02]), brightness increase
- Focus rings: ring-2 ring-offset-2 with appropriate offset
- Loading states: skeleton loaders with shimmer animation
- Disabled states: opacity-50, cursor-not-allowed
- Success/error states: border and icon color changes

## Responsive Behavior
- Mobile (base): Single column, stack all bento cards
- Tablet (md:): 2-column bento grid, collapsible sidebar
- Desktop (lg:): 3-column bento grid, persistent sidebar
- Timeline: Horizontal scroll on mobile, full vertical on desktop

## Data Visualization Principles
- Emphasize the consistency score prominently
- Use subtle gridlines, never overpower data
- Maintain adequate whitespace around charts
- Tooltips appear on hover with precise data
- Color intensity represents data magnitude (for heatmap)

## Dashboard Widget Composition
Each bento card includes:
1. **Header:** Title (text-lg font-semibold) + action button/icon (text-sm)
2. **Content:** Primary data visualization or interaction area
3. **Footer (when applicable):** Metadata, timestamps, or quick actions (text-xs)

## Layout Specifications
- Page max-width: max-w-7xl
- Dashboard grid: 3-column on large screens, 2 on medium, 1 on mobile
- Sidebar width: w-64 (256px) on desktop, slide-over on mobile
- Modal max-width: max-w-2xl for forms, max-w-4xl for data views

This design creates a professional, data-rich productivity interface optimized for daily tracking workflows with minimal visual noise.