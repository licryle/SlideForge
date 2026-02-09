// Parse exported HTML back into state
function parseHTMLToState(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Extract theme from body data-theme attribute
    const theme = doc.body.getAttribute('data-theme') || 'default';

    // Extract slides
    const slideElements = doc.querySelectorAll('.slide');
    const slides = [];

    slideElements.forEach(slideEl => {
        const template = slideEl.getAttribute('data-template');
        const slideTemplate = slideEl.querySelector('.slide-template');

        if (!slideTemplate || !template) return;

        const content = extractContentFromTemplate(slideTemplate, template);

        slides.push({
            id: crypto.randomUUID(),
            template: template,
            content: content
        });
    });

    if (slides.length === 0) {
        throw new Error('No valid slides found in HTML');
    }

    return {
        slides: slides,
        activeSlideId: slides[0].id,
        theme: theme
    };
}

function extractContentFromTemplate(element, template) {
    const content = {};

    switch (template) {
        case 'title':
            const h1 = element.querySelector('h1');
            const h2 = element.querySelector('h2');
            content.title = h1 ? h1.textContent : '';
            content.subtitle = h2 ? h2.textContent : '';
            break;

        case 'content':
            const contentH2 = element.querySelector('h2');
            const body = element.querySelector('.content-body');
            content.title = contentH2 ? contentH2.textContent : '';
            content.body = body ? body.innerHTML.replace(/<br>/g, '\n') : '';
            break;

        case 'quote':
            const blockquote = element.querySelector('blockquote');
            const cite = element.querySelector('cite');
            content.quote = blockquote ? blockquote.textContent.replace(/^"|"$/g, '') : '';
            content.author = cite ? cite.textContent.replace(/^- /, '') : '';
            break;

        case 'image':
            const imageH2 = element.querySelector('h2');
            const imageDiv = element.querySelector('.image-slide');
            content.title = imageH2 ? imageH2.textContent : '';
            if (imageDiv) {
                const bgImage = imageDiv.style.backgroundImage;
                content.imageUrl = bgImage ? bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '') : '';
            }
            break;

        case 'split':
            const splitH2 = element.querySelector('h2');
            const splitP = element.querySelector('p');
            const imageHalf = element.querySelector('.image-half');
            content.title = splitH2 ? splitH2.textContent : '';
            content.body = splitP ? splitP.textContent : '';
            if (imageHalf) {
                const bgImage = imageHalf.style.backgroundImage;
                content.imageUrl = bgImage ? bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '') : '';
            }
            break;

        case 'metrics':
            const metricsH2 = element.querySelector('h2');
            const metricCards = element.querySelectorAll('.metric-card');
            content.title = metricsH2 ? metricsH2.textContent : '';

            if (metricCards.length >= 1) {
                content.metric1Value = metricCards[0].querySelector('.metric-value')?.textContent || '';
                content.metric1Label = metricCards[0].querySelector('.metric-label')?.textContent || '';
            }
            if (metricCards.length >= 2) {
                content.metric2Value = metricCards[1].querySelector('.metric-value')?.textContent || '';
                content.metric2Label = metricCards[1].querySelector('.metric-label')?.textContent || '';
            }
            if (metricCards.length >= 3) {
                content.metric3Value = metricCards[2].querySelector('.metric-value')?.textContent || '';
                content.metric3Label = metricCards[2].querySelector('.metric-label')?.textContent || '';
            }
            break;

        default:
            content.title = element.textContent || '';
    }

    return content;
}
