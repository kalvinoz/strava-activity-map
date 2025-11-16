# Strava Activity Map - Project Implementation Plan

## Overview

Build a web-based visualization tool that displays Strava activities on an interactive map with time-based animation. Activities will be fetched via the Strava API, filtered based on user criteria, animated chronologically, and exportable as video or GIF files.

## Technology Stack

### Frontend & Visualization
- **Vite**: Fast development server and build tool
- **Leaflet.js** or **Mapbox GL JS**: Map rendering and interaction
- **HTML5 Canvas**: Custom polyline animation rendering
- **CSS3 & Vanilla JavaScript**: UI and interactions

### Backend & Data Processing
- **Node.js**: Runtime for scripts and data processing
- **Axios**: HTTP client for Strava API requests
- **dotenv**: Environment variable management

### Export & Animation
- **Puppeteer**: Headless browser for capturing animations
- **FFmpeg**: Video encoding (MP4 export)
- **GIFEncoder**: GIF generation from frames
- **Canvas (Node)**: Server-side rendering for export

### Data Storage
- **JSON files**: Local activity data cache
- **IndexedDB** (future): Browser-side caching for web app

## Implementation Phases

---

## Phase 1: Foundation & Data Layer

**Goal**: Set up project infrastructure and implement Strava API integration

### Tasks

#### 1.1 Project Setup
- [x] Initialize Git repository
- [x] Create package.json with dependencies
- [x] Set up .gitignore
- [x] Create README and PROJECT_PLAN
- [ ] Create folder structure
- [ ] Install dependencies

#### 1.2 Strava API Integration
- [ ] Create OAuth 2.0 authentication flow
  - [ ] Build local server to handle OAuth callback
  - [ ] Implement token exchange
  - [ ] Store access/refresh tokens securely
- [ ] Implement token refresh logic
- [ ] Create activity fetching script
  - [ ] Fetch all activities with pagination
  - [ ] Handle rate limiting (100 requests/15min, 1000/day)
  - [ ] Parse activity data structure
- [ ] Create detailed activity fetch for polylines
  - [ ] Fetch individual activity streams (latlng, time, distance)
  - [ ] Handle encoded polylines (decode algorithm)
  - [ ] Cache activity data locally

#### 1.3 Data Models
- [ ] Define Activity interface/schema
  ```typescript
  interface Activity {
    id: number;
    name: string;
    type: string; // Run, Ride, Swim, etc.
    start_date: string;
    distance: number; // meters
    moving_time: number; // seconds
    polyline: string; // encoded
    decoded_polyline: [number, number][]; // [lat, lng]
    summary_polyline: string;
    location_city: string;
    location_country: string;
    bounds: [[number, number], [number, number]]; // SW, NE
  }
  ```
- [ ] Create data cache manager
  - [ ] Save activities to JSON files
  - [ ] Load cached activities
  - [ ] Incremental sync (fetch only new activities)

**Deliverables**:
- Working OAuth authentication
- Script to fetch and cache all activities
- Local JSON database of activities with polylines
- Token refresh mechanism

**Estimated Time**: 3-4 days

---

## Phase 2: Map Visualization

**Goal**: Display activities on an interactive map

### Tasks

#### 2.1 Map Setup
- [ ] Choose map provider (Mapbox vs Leaflet + OSM)
- [ ] Create basic HTML page with map container
- [ ] Initialize map with default view
- [ ] Add zoom/pan controls
- [ ] Implement responsive design

#### 2.2 Activity Rendering
- [ ] Load activity data from cache
- [ ] Parse and decode polylines
- [ ] Render all activities as polylines on map
  - [ ] Different colors for activity types
  - [ ] Style configuration (weight, opacity)
- [ ] Calculate and set appropriate map bounds
  - [ ] Fit all activities in view
  - [ ] Or focus on specific region

#### 2.3 Interactivity
- [ ] Activity click/hover interactions
  - [ ] Show activity details (name, date, distance)
  - [ ] Highlight selected activity
- [ ] Activity list sidebar
  - [ ] Display all activities chronologically
  - [ ] Click to focus on activity
  - [ ] Show activity metadata
- [ ] Timeline slider
  - [ ] Filter activities by date range
  - [ ] Visual timeline representation

**Deliverables**:
- Interactive web map showing all activities
- Clickable polylines with activity information
- Responsive UI with activity list

**Estimated Time**: 3-4 days

---

## Phase 3: Filtering System

**Goal**: Implement comprehensive activity filtering

### Tasks

#### 3.1 Filter UI Components
- [ ] Create filter panel/sidebar
- [ ] Activity type selector (checkboxes)
  - [ ] Run, Ride, Swim, Hike, etc.
  - [ ] Select all / deselect all
- [ ] Distance range slider
  - [ ] Min/max distance inputs
  - [ ] Display in km/miles
- [ ] Date range picker
  - [ ] Start and end date
  - [ ] Preset ranges (last month, year, all time)
- [ ] Location filter
  - [ ] Draw bounding box on map
  - [ ] City/country search
  - [ ] Radius from point
- [ ] Additional filters
  - [ ] Moving time range
  - [ ] Elevation gain range
  - [ ] Average speed range

#### 3.2 Filter Logic
- [ ] Create filter engine
  ```typescript
  interface FilterCriteria {
    activityTypes: string[];
    distanceMin: number;
    distanceMax: number;
    dateStart: Date;
    dateEnd: Date;
    bounds?: [[number, number], [number, number]];
    locationRadius?: { center: [number, number], radius: number };
  }
  ```
- [ ] Implement filtering algorithm
  - [ ] Chain multiple filters
  - [ ] Efficient filtering for large datasets
- [ ] Update map in real-time as filters change
- [ ] Display filter stats (X of Y activities shown)

#### 3.3 Filter Persistence
- [ ] Save filter state to localStorage
- [ ] Load saved filters on page load
- [ ] Export/import filter presets
- [ ] URL parameters for sharing filtered views

**Deliverables**:
- Comprehensive filtering UI
- Real-time map updates based on filters
- Saved filter presets

**Estimated Time**: 3-4 days

---

## Phase 4: Animation Engine

**Goal**: Animate activities chronologically on the map

### Tasks

#### 4.1 Animation Core
- [ ] Design animation system architecture
  ```typescript
  class AnimationController {
    activities: Activity[];
    currentTime: Date;
    speed: number; // days per second
    isPlaying: boolean;

    play(): void;
    pause(): void;
    reset(): void;
    seek(date: Date): void;
    setSpeed(speed: number): void;
  }
  ```
- [ ] Implement time-based animation loop
  - [ ] Use requestAnimationFrame
  - [ ] Calculate current date/time in animation
  - [ ] Determine which activities to show
- [ ] Progressive polyline drawing
  - [ ] Animate polyline from start to end
  - [ ] Smooth interpolation between points
  - [ ] Configurable draw speed

#### 4.2 Animation Controls
- [ ] Play/Pause button
- [ ] Stop/Reset button
- [ ] Speed control slider (0.5x - 10x)
- [ ] Timeline scrubber
  - [ ] Seek to specific date
  - [ ] Visual indicators for activities
- [ ] Date display (current animation date)
- [ ] Activity counter (activities shown)

#### 4.3 Visual Effects
- [ ] Fade-in effect for new activities
- [ ] Trail effect (gradually fade old activities)
- [ ] Highlight "currently drawing" activity
- [ ] Activity markers at endpoints
- [ ] Smooth camera movements
  - [ ] Auto-follow new activities
  - [ ] Optional: keep all activities in view

#### 4.4 Performance Optimization
- [ ] Limit simultaneous rendered polylines
- [ ] Use WebGL rendering for large datasets
- [ ] Implement level of detail (LOD)
  - [ ] Simplify distant polylines
  - [ ] Full detail for focused activities
- [ ] Canvas rendering for smoother animation
- [ ] Worker thread for data processing

**Deliverables**:
- Smooth chronological animation of activities
- Full playback controls
- Optimized rendering for thousands of activities

**Estimated Time**: 5-6 days

---

## Phase 5: Export Functionality

**Goal**: Export animations as MP4 videos or animated GIFs

### Tasks

#### 5.1 Frame Capture System
- [ ] Set up Puppeteer for headless rendering
- [ ] Create capture script
  - [ ] Launch headless browser
  - [ ] Load visualization page
  - [ ] Apply filters
  - [ ] Control animation programmatically
- [ ] Frame-by-frame capture
  - [ ] Screenshot at each frame
  - [ ] Store frames in memory or temp files
  - [ ] Handle large animations (memory management)
- [ ] Configure export parameters
  - [ ] Resolution (720p, 1080p, 4K)
  - [ ] Frame rate (24fps, 30fps, 60fps)
  - [ ] Duration
  - [ ] Animation speed

#### 5.2 Video Export (MP4)
- [ ] Install FFmpeg
- [ ] Create FFmpeg integration
  - [ ] Convert frame sequence to video
  - [ ] Configure codec settings (H.264)
  - [ ] Set bitrate and quality
- [ ] Add audio support (optional)
  - [ ] Background music
  - [ ] Sound effects on activity appearances
- [ ] Progress indicator during export
- [ ] Error handling and validation

#### 5.3 GIF Export
- [ ] Set up GIFEncoder
- [ ] Create GIF generation pipeline
  - [ ] Convert frames to GIF format
  - [ ] Optimize colors (256 color palette)
  - [ ] Control loop settings
- [ ] GIF optimization
  - [ ] Reduce file size
  - [ ] Frame skipping for large animations
  - [ ] Dithering options

#### 5.4 Export CLI
- [ ] Create command-line interface
  ```bash
  npm run export -- \
    --format mp4 \
    --duration 60 \
    --resolution 1080p \
    --fps 30 \
    --filter-type Run \
    --filter-date-start 2024-01-01 \
    --output my-runs-2024.mp4
  ```
- [ ] Validate parameters
- [ ] Progress bar with ETA
- [ ] Success/error messages
- [ ] Output file location

#### 5.5 Web Export UI (Optional)
- [ ] Add export button to web interface
- [ ] Export settings modal
  - [ ] Format selection
  - [ ] Resolution and quality
  - [ ] Current filters applied
- [ ] Client-side export (limited)
  - [ ] Use MediaRecorder API
  - [ ] Record canvas directly
- [ ] Server-side export trigger
  - [ ] Queue export job
  - [ ] Notify when complete
  - [ ] Download link

**Deliverables**:
- CLI tool to export animations
- MP4 video output with configurable settings
- GIF output for shorter animations
- Optional web-based export interface

**Estimated Time**: 4-5 days

---

## Phase 6: Polish & Enhancements

**Goal**: Improve UX, add features, and optimize performance

### Tasks

#### 6.1 UI/UX Improvements
- [ ] Responsive design for mobile/tablet
- [ ] Dark mode support
- [ ] Customizable color schemes
- [ ] Activity type icons and colors
- [ ] Loading states and spinners
- [ ] Error messages and validation
- [ ] Tooltips and help text
- [ ] Keyboard shortcuts

#### 6.2 Advanced Features
- [ ] Heatmap view
  - [ ] Show activity density
  - [ ] Popular routes
- [ ] Clustering for dense areas
- [ ] Route comparison
  - [ ] Overlay multiple activities
  - [ ] Segment analysis
- [ ] Statistics dashboard
  - [ ] Total distance over time
  - [ ] Activity type breakdown
  - [ ] Charts and graphs
- [ ] 3D terrain view (optional)
  - [ ] Elevation profile
  - [ ] 3D polylines

#### 6.3 Data Management
- [ ] Incremental sync
  - [ ] Only fetch new activities
  - [ ] Update existing activities
- [ ] Data export/import
  - [ ] Export filtered activities as GPX/GeoJSON
  - [ ] Import from other sources
- [ ] Cache management
  - [ ] Clear cache option
  - [ ] Cache size monitoring

#### 6.4 Configuration
- [ ] Settings panel
  - [ ] Map style selection
  - [ ] Default filters
  - [ ] Animation preferences
  - [ ] Export defaults
- [ ] Config file support
  - [ ] JSON configuration
  - [ ] Per-user settings

#### 6.5 Testing & Documentation
- [ ] Write unit tests for core functions
- [ ] Integration tests for API calls
- [ ] Browser compatibility testing
- [ ] Performance benchmarking
- [ ] User documentation
  - [ ] Setup guide
  - [ ] Usage examples
  - [ ] Troubleshooting
- [ ] Code documentation
  - [ ] JSDoc comments
  - [ ] Architecture diagram

**Deliverables**:
- Polished, production-ready application
- Comprehensive documentation
- Test coverage for critical paths

**Estimated Time**: 4-5 days

---

## Total Estimated Timeline

- **Phase 1**: 3-4 days
- **Phase 2**: 3-4 days
- **Phase 3**: 3-4 days
- **Phase 4**: 5-6 days
- **Phase 5**: 4-5 days
- **Phase 6**: 4-5 days

**Total**: 22-28 days of focused development

## Milestones

1. **Week 1**: Complete Phases 1-2 (Data + Basic Map)
   - Can fetch activities and display them on a map

2. **Week 2**: Complete Phases 3-4 (Filtering + Animation)
   - Can filter activities and see animated playback

3. **Week 3**: Complete Phase 5 (Export)
   - Can export animations as videos/GIFs

4. **Week 4**: Complete Phase 6 (Polish)
   - Production-ready application

## Technical Considerations

### Rate Limiting
- Strava API: 100 requests/15min, 1000 requests/day
- Solution: Cache aggressively, batch requests, implement retry logic

### Performance
- Target: Handle 1000+ activities smoothly
- Strategy: Canvas rendering, WebGL, progressive loading, LOD

### Browser Compatibility
- Target: Chrome, Firefox, Safari (latest 2 versions)
- Fallbacks: Use Leaflet instead of Mapbox if needed

### File Size
- Activity data can be large (polylines)
- Solution: Compress JSON, lazy load polylines, paginate

### Privacy
- Keep all data local (no server upload)
- Option to exclude specific activities
- Blur sensitive locations (home/work)

## Future Enhancements (Post-MVP)

- Multi-athlete comparison
- Social sharing features
- Activity challenges and goals
- Integration with other fitness platforms (Garmin, Polar)
- Mobile app (React Native)
- Live activity tracking
- Weather overlay
- Photos/videos along routes
- Community features (public maps)

---

## Getting Started

Start with **Phase 1** to establish the foundation. The Strava API integration is critical - everything else builds on having reliable access to your activity data.

Once you can fetch and cache activities, move to **Phase 2** to visualize them. The map rendering will help validate your data processing pipeline.

**Phase 4** (animation) is the most complex and may require iteration to get smooth performance with many activities.

Good luck! This is an exciting project with lots of potential for creativity and personalization.
