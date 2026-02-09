function exportDeck(state) {
    const slidesHTML = state.slides.map(slide => `
        <section class="slide" data-template="${slide.template}">
            ${renderSlide(slide)}
        </section>
    `).join('\n');

    const templateCSS = getTemplateCSS();

    // Theme CSS - simplified for now, ideally we read from themes.css or styles
    // But since this is a single file export, we either need to embed the CSS file content 
    // or rely on a simple inline style block for now.
    // For MVP, let's just include the template CSS and some basic scroll snap CSS.

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Presentation</title>
    <style>
        /* Base Reset & Layout */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', sans-serif; 
            overflow: hidden; 
            background: #000;
        }
        
        /* Scroll Snap */
        .deck-container {
            height: 100vh;
            width: 100vw;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
        }
        
        .slide {
            height: 100vh;
            width: 100vw;
            scroll-snap-align: start;
            overflow: hidden;
            position: relative;
            background: white; /* Default background */
        }
        
        /* Theme Support */
        :root {
            --slide-bg: white;
            --slide-text: #333;
            --slide-accent: #3b82f6;
            --slide-font: 'Inter', sans-serif;
        }

        /* Dark Theme */
        [data-theme="dark"] {
            --slide-bg: #1e293b;
            --slide-text: #f8fafc;
            --slide-accent: #60a5fa;
        }

        /* Ocean Theme */
        [data-theme="ocean"] {
            --slide-bg: #e0f2fe;
            --slide-text: #0c4a6e;
            --slide-accent: #0284c7;
        }

        /* Sunset Theme */
        [data-theme="sunset"] {
            --slide-bg: #fff7ed;
            --slide-text: #7c2d12;
            --slide-accent: #ea580c;
        }

        /* Forest Theme */
        [data-theme="forest"] {
            --slide-bg: #f0fdf4;
            --slide-text: #14532d;
            --slide-accent: #16a34a;
        }

        /* Apply variables to slide internals */
        .slide-template {
            background-color: var(--slide-bg);
            color: var(--slide-text);
        }

        .slide-template h1, 
        .slide-template h2, 
        .slide-template h3,
        .metric-value {
            color: var(--slide-accent) !important;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        [data-theme="dark"] .metric-card {
            background: rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Active Theme Override */
        /* We set the body class or data-attribute to the selected theme */
        
        ${templateCSS}
    </style>
</head>
<body data-theme="${state.theme}">
    <div class="deck-container">
        ${slidesHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.html';
    a.click();
    URL.revokeObjectURL(url);
}
