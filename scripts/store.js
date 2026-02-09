// Basic Pub/Sub for state management
class Store {
    constructor() {
        this.state = {
            slides: [
                {
                    id: crypto.randomUUID(),
                    template: 'title',
                    content: {
                        title: 'Welcome to SlideForge',
                        subtitle: 'Create simple slides in your browser'
                    }
                }
            ],
            activeSlideId: null,
            theme: 'default',
            presentationName: 'My Presentation'
        };

        // Set initial active slide
        this.state.activeSlideId = this.state.slides[0].id;

        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    getState() {
        return this.state;
    }

    // Actions
    addSlide(template = 'title') {
        const newSlide = {
            id: crypto.randomUUID(),
            template,
            content: this.getInitialContent(template)
        };

        const activeIndex = this.state.slides.findIndex(s => s.id === this.state.activeSlideId);
        if (activeIndex >= 0) {
            this.state.slides.splice(activeIndex + 1, 0, newSlide);
        } else {
            this.state.slides.push(newSlide);
        }

        this.state.activeSlideId = newSlide.id;
        this.notify();
    }

    updateSlideContent(slideId, content) {
        const slide = this.state.slides.find(s => s.id === slideId);
        if (slide) {
            slide.content = { ...slide.content, ...content };
            this.notify();
        }
    }

    setActiveSlide(slideId) {
        if (this.state.slides.find(s => s.id === slideId)) {
            this.state.activeSlideId = slideId;
            this.notify();
        }
    }

    setTheme(themeName) {
        this.state.theme = themeName;
        this.notify();
    }

    setPresentationName(name) {
        this.state.presentationName = name;
        this.notify();
    }

    setTemplate(slideId, templateName) {
        const slide = this.state.slides.find(s => s.id === slideId);
        if (slide) {
            slide.template = templateName;
            // Merge existing content where possible or reset?
            // For now, let's keep common fields
            const newContent = this.getInitialContent(templateName);
            slide.content = { ...newContent, ...slide.content };
            this.notify();
        }
    }

    loadState(newState) {
        this.state = newState;
        // Validate active slide
        if (!this.state.slides.find(s => s.id === this.state.activeSlideId)) {
            this.state.activeSlideId = this.state.slides.length > 0 ? this.state.slides[0].id : null;
        }
        this.notify();
    }

    reorderSlides(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.state.slides.length ||
            toIndex < 0 || toIndex >= this.state.slides.length) return;

        const [movedSlide] = this.state.slides.splice(fromIndex, 1);
        this.state.slides.splice(toIndex, 0, movedSlide);
        this.notify();
    }

    duplicateSlide(slideId) {
        const index = this.state.slides.findIndex(s => s.id === slideId);
        if (index === -1) return;

        const slide = this.state.slides[index];
        const newSlide = {
            id: crypto.randomUUID(),
            template: slide.template,
            content: { ...slide.content } // Deep copy if nested? Content is simple level object for now.
        };

        this.state.slides.splice(index + 1, 0, newSlide);
        this.state.activeSlideId = newSlide.id;
        this.notify();
    }

    deleteSlide(slideId) {
        const index = this.state.slides.findIndex(s => s.id === slideId);
        if (index === -1) return;

        this.state.slides.splice(index, 1);

        // If active slide is deleted, select another one
        if (this.state.activeSlideId === slideId) {
            if (this.state.slides.length > 0) {
                // Try to select the one before, or the first one
                const newIndex = Math.max(0, index - 1);
                this.state.activeSlideId = this.state.slides[newIndex].id;
            } else {
                this.state.activeSlideId = null;
            }
        }

        this.notify();
    }

    getInitialContent(template) {
        switch (template) {
            case 'title':
                return { title: 'New Slide', subtitle: 'Subtitle here' };
            case 'content':
                return { title: 'Topic Title', body: 'Add your content here...' };
            case 'quote':
                return { quote: 'Insert inspiring quote here...', author: 'Author Name' };
            case 'image':
                return { title: 'Image Caption', imageUrl: 'https://picsum.photos/1920/1080' };
            case 'split':
                return { title: 'Split Content', body: 'Details on the left...', imageUrl: 'https://picsum.photos/800/1080' };
            case 'metrics':
                return {
                    title: 'Key Performance Indicators',
                    metric1Value: '85%', metric1Label: 'Growth',
                    metric2Value: '1.2M', metric2Label: 'Users',
                    metric3Value: '$50k', metric3Label: 'Revenue'
                };
            default:
                return { title: 'Title' };
        }
    }
}

const store = new Store();
