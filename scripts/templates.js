const templates = {
    title: {
        name: 'Title Slide',
        render: (content) => `
            <div class="slide-template title-slide">
                <h1>${content.title}</h1>
                <h2>${content.subtitle}</h2>
            </div>
        `,
        css: `
            .title-slide {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                text-align: center;
            }
            .title-slide h1 { font-size: 4rem; margin-bottom: 1rem; }
            .title-slide h2 { font-size: 2rem; color: #666; font-weight: 400; }
        `
    },
    content: {
        name: 'Content Slide',
        render: (content) => `
            <div class="slide-template content-slide">
                <h2>${content.title}</h2>
                <div class="content-body">${content.body ? content.body.replace(/\n/g, '<br>') : ''}</div>
            </div>
        `,
        css: `
            .content-slide {
                padding: 4rem;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .content-slide h2 { font-size: 3rem; margin-bottom: 2rem; }
            .content-slide .content-body { font-size: 1.5rem; line-height: 1.6; }
        `
    },
    quote: {
        name: 'Quote Slide',
        render: (content) => `
            <div class="slide-template quote-slide">
                <blockquote>"${content.quote}"</blockquote>
                <cite>- ${content.author}</cite>
            </div>
        `,
        css: `
            .quote-slide {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                padding: 4rem;
                text-align: center;
                background: #f8f9fa; /* lightly different bg */
            }
            .quote-slide blockquote {
                font-size: 3rem;
                font-style: italic;
                margin-bottom: 2rem;
                line-height: 1.4;
            }
            .quote-slide cite {
                font-size: 1.5rem;
                font-weight: bold;
            }
        `
    },
    image: {
        name: 'Image Slide',
        render: (content) => `
            <div class="slide-template image-slide" style="background-image: url('${content.imageUrl}');">
                <div class="overlay">
                    <h2>${content.title}</h2>
                </div>
            </div>
        `,
        css: `
            .image-slide {
                height: 100%;
                background-size: cover;
                background-position: center;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .image-slide .overlay {
                background: rgba(0, 0, 0, 0.5);
                padding: 2rem;
                border-radius: 8px;
            }
            .image-slide h2 {
                color: white;
                font-size: 3rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
        `
    },
    split: {
        name: 'Split Slide',
        render: (content) => `
            <div class="slide-template split-slide">
                <div class="half text-half">
                    <h2>${content.title}</h2>
                    <p>${content.body}</p>
                </div>
                <div class="half image-half" style="background-image: url('${content.imageUrl}');"></div>
            </div>
        `,
        css: `
            .split-slide {
                display: flex;
                height: 100%;
            }
            .split-slide .half {
                flex: 1;
                height: 100%;
            }
            .split-slide .text-half {
                padding: 4rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .split-slide .image-half {
                background-size: cover;
                background-position: center;
            }
            .split-slide h2 { font-size: 2.5rem; margin-bottom: 1.5rem; }
            .split-slide p { font-size: 1.25rem; line-height: 1.6; }
        `
    },
    metrics: {
        name: 'Metrics Slide',
        render: (content) => `
            <div class="slide-template metrics-slide">
                <h2>${content.title}</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${content.metric1Value}</div>
                        <div class="metric-label">${content.metric1Label}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${content.metric2Value}</div>
                        <div class="metric-label">${content.metric2Label}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${content.metric3Value}</div>
                        <div class="metric-label">${content.metric3Label}</div>
                    </div>
                </div>
            </div>
        `,
        css: `
            .metrics-slide {
                padding: 4rem;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .metrics-slide h2 { font-size: 3rem; margin-bottom: 3rem; }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
                width: 100%;
            }
            .metric-card {
                background: #f1f5f9;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .metric-value {
                font-size: 4rem;
                font-weight: 700;
                color: #2563eb;
                margin-bottom: 1rem;
            }
            .metric-label {
                font-size: 1.25rem;
                color: #64748b;
                font-weight: 500;
            }
        `
    }
    // Add more templates here
};

function renderSlide(slide) {
    const template = templates[slide.template];
    if (!template) return '<div>Unknown Template</div>';
    return template.render(slide.content);
}

function getTemplateCSS() {
    return Object.values(templates).map(t => t.css).join('\n');
}
