// DOM Elements
const slideListEl = document.getElementById('slide-list');
const slidePreviewContent = document.getElementById('slide-preview-content');
const addSlideBtn = document.getElementById('add-slide-btn');
const exportBtn = document.getElementById('export-btn');
const themeSelect = document.getElementById('theme-select');
const templateSelectFloating = document.getElementById('template-select-floating');

// Inject Template CSS
const styleEl = document.createElement('style');
styleEl.textContent = getTemplateCSS();
document.head.appendChild(styleEl);

// Initial Render
function init() {
    setupEventListeners();
    store.subscribe(render);
    // Force initial render
    render(store.getState());
}

function setupEventListeners() {
    addSlideBtn.addEventListener('click', () => {
        store.addSlide();
    });

    // Load Logic - Parse HTML
    const loadBtn = document.getElementById('load-btn');
    const loadFile = document.getElementById('load-file');

    loadBtn.addEventListener('click', () => {
        if (confirm('Unsaved changes will be lost. Continue loading?')) {
            loadFile.click();
        }
    });

    loadFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const htmlContent = e.target.result;
                const state = parseHTMLToState(htmlContent);
                store.loadState(state);
            } catch (err) {
                console.error(err);
                alert('Error parsing HTML file: ' + err.message);
            }
        };
        reader.readAsText(file);
        loadFile.value = '';
    });

    // Confirm before leaving page
    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
    });

    exportBtn.addEventListener('click', () => {
        exportDeck(store.getState());
    });

    try {
        if (templateSelectFloating) {
            templateSelectFloating.addEventListener('change', (e) => {
                const state = store.getState();
                if (state.activeSlideId) {
                    store.setTemplate(state.activeSlideId, e.target.value);
                }
            });
        }

        themeSelect.addEventListener('change', (e) => {
            store.setTheme(e.target.value);
        });
    } catch (e) {
        console.error("Setup listeners error", e);
    }
}

function render(state = store.getState()) {
    renderSlideList(state);
    renderPreview(state);
}

function renderSlideList(state) {
    slideListEl.innerHTML = '';
    state.slides.forEach((slide, index) => {
        const el = document.createElement('div');
        el.className = `slide-item ${slide.id === state.activeSlideId ? 'active' : ''}`;
        el.draggable = true;
        el.dataset.index = index;

        el.innerHTML = `
            <span class="slide-number">${index + 1}</span>
            <span class="slide-summary">${slide.content.title || 'Untitled'}</span>
            <div class="slide-actions">
                <button class="duplicate-slide-btn" title="Duplicate">❐</button>
                <button class="delete-slide-btn" title="Delete">×</button>
            </div>
        `;

        el.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                store.setActiveSlide(slide.id);
            }
        });

        el.querySelector('.duplicate-slide-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            store.duplicateSlide(slide.id);
        });

        el.querySelector('.delete-slide-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this slide?')) {
                store.deleteSlide(slide.id);
            }
        });

        // Drag and Drop
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            e.dataTransfer.effectAllowed = 'move';
            el.classList.add('dragging');
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            document.querySelectorAll('.slide-item').forEach(item => item.classList.remove('drag-over'));
        });

        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            el.classList.add('drag-over');
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over');
        });

        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            if (fromIndex !== toIndex && !isNaN(fromIndex)) {
                store.reorderSlides(fromIndex, toIndex);
            }
        });

        slideListEl.appendChild(el);
    });
}

function renderPreview(state) {
    const activeSlide = state.slides.find(s => s.id === state.activeSlideId);
    if (activeSlide) {
        themeSelect.value = state.theme;
        if (templateSelectFloating) {
            templateSelectFloating.value = activeSlide.template;
        }
        slidePreviewContent.setAttribute('data-theme', state.theme);
        slidePreviewContent.innerHTML = renderSlide(activeSlide);
        makeSlidesEditable(activeSlide.id);
    } else {
        slidePreviewContent.innerHTML = '';
    }
}

function makeSlidesEditable(slideId) {
    const slideState = store.getState().slides.find(s => s.id === slideId);
    if (!slideState) return;

    const container = slidePreviewContent;

    const setupField = (element, key, isRich = false) => {
        if (!element) return;
        element.classList.add('editable-field');
        element.setAttribute('title', 'Click to edit');

        const icon = document.createElement('div');
        icon.className = 'edit-icon';
        icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        element.appendChild(icon);

        element.onclick = (e) => {
            e.stopPropagation();
            if (element.classList.contains('editing')) return;

            element.classList.add('editing');
            const currentText = slideState.content[key] || '';

            let input;
            if (isRich || currentText.length > 50) {
                input = document.createElement('textarea');
                input.style.width = '100%';
                input.style.height = '100%';
                input.style.minHeight = '60px';
                input.style.font = 'inherit';
                input.style.color = 'black';
                input.style.border = 'none';
                input.style.outline = 'none';
                input.style.background = 'transparent';
                input.style.resize = 'none';
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.style.width = '100%';
                input.style.font = 'inherit';
                input.style.color = 'black';
                input.style.border = 'none';
                input.style.outline = 'none';
                input.style.background = 'transparent';
            }

            input.value = currentText;
            element.innerHTML = '';
            element.appendChild(input);
            input.focus();

            const save = () => {
                const newValue = input.value;
                if (newValue !== currentText) {
                    store.updateSlideContent(slideId, { [key]: newValue });
                } else {
                    renderPreview(store.getState());
                }
            };

            input.onblur = save;
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !isRich) {
                    e.preventDefault();
                    input.blur();
                }
                if (e.key === 'Escape') {
                    renderPreview(store.getState());
                }
            };
        };
    };

    switch (slideState.template) {
        case 'title':
            setupField(container.querySelector('h1'), 'title');
            setupField(container.querySelector('h2'), 'subtitle');
            break;
        case 'content':
            setupField(container.querySelector('h2'), 'title');
            setupField(container.querySelector('.content-body'), 'body', true);
            break;
        case 'quote':
            setupField(container.querySelector('blockquote'), 'quote', true);
            setupField(container.querySelector('cite'), 'author');
            break;
        case 'image':
            setupField(container.querySelector('h2'), 'title');
            const imgContainer = container.querySelector('.image-slide');
            if (imgContainer) {
                imgContainer.classList.add('editable-field');
                imgContainer.onclick = () => {
                    const newUrl = prompt("Enter Image URL:", slideState.content.imageUrl);
                    if (newUrl) store.updateSlideContent(slideId, { imageUrl: newUrl });
                };
            }
            break;
        case 'split':
            setupField(container.querySelector('h2'), 'title');
            setupField(container.querySelector('p'), 'body', true);
            const splitImg = container.querySelector('.image-half');
            if (splitImg) {
                splitImg.classList.add('editable-field');
                splitImg.onclick = () => {
                    const newUrl = prompt("Enter Image URL:", slideState.content.imageUrl);
                    if (newUrl) store.updateSlideContent(slideId, { imageUrl: newUrl });
                };
            }
            break;
        case 'metrics':
            setupField(container.querySelector('h2'), 'title');
            const cards = container.querySelectorAll('.metric-card');
            cards.forEach((card, i) => {
                const val = card.querySelector('.metric-value');
                const label = card.querySelector('.metric-label');
                setupField(val, `metric${i + 1}Value`);
                setupField(label, `metric${i + 1}Label`);
            });
            break;
    }
}

init();
