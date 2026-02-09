Project Name: SlideForge - Single-File HTML/CSS Slideshow Editor

Architecture Requirements:

100% frontend implementation using HTML5, CSS3, Vanilla JavaScript only. Ideally deployed as a static website on GitHub Pages.

Zero backend dependencies or external API calls

Single HTML file output containing complete presentation, but no editor code.

Editor state managed entirely in memory via JSON data structure, persisted via browser File System Access API where available, FileReader/FileSaver fallback

Output Presentation Format:
Core Structure:
<!DOCTYPE html>
<html>
<head>
  <style>/* Complete responsive CSS with scroll-snap */</style>
</head>
<body>
  <div class="deck-container">
    <section class="slide" data-template="TYPE">/* Slide content */</section>
    <!-- Additional slides -->
  </div>
</body>
</html>

Responsive Behavior:
CSS Scroll Snap Implementation:
- Desktop (>768px): vertical scroll-snap (scroll-snap-type: y mandatory)
- Mobile (≤768px): vertical scroll-snap (scroll-snap-type: y mandatory)  
- Smooth transitions via scroll-behavior: smooth
- Each slide: scroll-snap-align: start, flex: 0 0 100vw/100vh

Editor Functional Requirements:
1. File Operations (Priority 1)
   - New Presentation (blank slide 1, "title" template)
   - Load (parse HTML/JSON input → editor state)
   - Save (JSON backup + HTML export)
   - Export (single HTML file with embedded CSS)

2. Slide Management (Priority 1)
   - Add slide (after current, duplicate current)
   - Delete slide  
   - Reorder slides (drag/drop)
   - Duplicate slide
   - Slide thumbnails in navigator panel

3. Template System (Priority 2)  
   - 12+ pre-built templates inspired by htmldecks.com free collection
   - Template categories: Title, Content, Metrics, Image, Quote, Timeline
   - Per-slide template selection (visual dropdown)
   - Template preview on hover

4. Content Editing (Priority 1)
   - Visual WYSIWYG editing (contenteditable + structured inputs)
   - Template-aware field extraction/display:
     Title: h1 editable
     Bullets: ul → input array with add/remove
     Metrics: CSS Grid → editable stat cards
   - Rich text toolbar (bold, italic, lists, links)
   - Live preview sync (<100ms latency)

5. Theme System (Priority 2)
   - 8 color themes (switch instantly via CSS custom properties)
   - Custom theme creator (6-color picker → CSS vars)
   - Theme persistence in exported HTML

6. Navigation & UX (Priority 3)
   - Split view: 25% slide navigator + 75% editor/preview
   - Keyboard shortcuts (arrow keys, Cmd+S, Cmd+Z)
   - Undo/redo stack (50 steps)
   - Fullscreen presentation mode toggle

Template Library (Minimum Viable Set):
1. title-slide: centered h1 + subtitle
2. bullet-list: title + animated bullet list  
3. metrics-grid: 3-4 responsive KPI cards
4. hero-image: background image + overlay text
5. quote-card: large quote + attribution
6. timeline: horizontal/vertical steps
7. two-column: split content layout
8. full-image: image-focused with caption
9. process-steps: numbered workflow
10. thank-you: final CTA slide


Technical Implementation Plan:
Phase 1 (MVP - 2 weeks):
[X] Core editor shell + file I/O
[X] Single slide editing + 3 templates  
[X] Basic scroll-snap output generation
[X] Responsive preview toggle

Phase 2 (1 week):  
[X] Full template library
[X] Theme system
[X] Multi-slide management

Phase 3 (1 week):
[X] Visual editing polish
[X] Keyboard shortcuts
[X] Export optimization

Success Metrics:
- Output files < 200KB (gzipped < 50KB)
- Edit-to-preview latency < 50ms
- 100% responsive on iOS Safari, Chrome Desktop
- Load 50-slide deck < 2s
Data Model (JSON):

json
{
  "version": "1.0",
  "theme": "default",
  "themeColors": {...},
  "slides": [
    {
      "id": "slide1",
      "template": "title-slide", 
      "content": {
        "title": "My Presentation",
        "subtitle": "Built with SlideForge"
      }
    }
  ]
}

Browser Support Matrix:
Target: Chrome 90+, Firefox 90+, Safari 14.1+, Edge 90+
No old browser support.
No Internet Explorer support required