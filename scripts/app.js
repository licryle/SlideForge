// DOM Elements
const slideListEl = document.getElementById('slide-list');
const editorLayerEl = document.getElementById('editor-layer');
const editorViewEl = document.getElementById('editor-view'); // This is now inside editor-layer
const slidePreviewContent = document.getElementById('slide-preview-content');
const addSlideBtn = document.getElementById('add-slide-btn');
const exportBtn = document.getElementById('export-btn');
const templateSelect = document.getElementById('template-select');
const themeSelect = document.getElementById('theme-select');
const editTriggerBtn = document.getElementById('edit-trigger-btn');
const closeEditorBtn = document.getElementById('close-editor-btn');

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

    // Edit Trigger
    editTriggerBtn.addEventListener('click', () => {
        editorLayerEl.classList.remove('hidden');
    });

    // Close Editor
    closeEditorBtn.addEventListener('click', () => {
        editorLayerEl.classList.add('hidden');
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
        templateSelect.addEventListener('change', (e) => {
            const state = store.getState();
            if (state.activeSlideId) {
                store.setTemplate(state.activeSlideId, e.target.value);
            }
        });

        themeSelect.addEventListener('change', (e) => {
            store.setTheme(e.target.value);
        });
    } catch (e) {
        console.error("Setup listeners error", e);
    }
}

function render(state = store.getState()) {
    renderSlideList(state);
    renderEditor(state); // Pre-fill editor even if hidden
    renderPreview(state); // Always render preview
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

function renderEditor(state) {
    const activeSlide = state.slides.find(s => s.id === state.activeSlideId);

    if (!activeSlide) {
        editorViewEl.innerHTML = '<div style="text-align:center; padding: 2rem; color: #666;">No slides. Add one to start.</div>';
        return;
    }

    if (templateSelect && document.activeElement !== templateSelect) {
        templateSelect.value = activeSlide.template;
    }

    // Optimization: Check if we need to rebuild the form
    const currentSlideId = editorViewEl.dataset.slideId;
    const currentTemplate = editorViewEl.dataset.template;

    if (currentSlideId === activeSlide.id && currentTemplate === activeSlide.template) {
        return;
    }

    editorViewEl.dataset.slideId = activeSlide.id;
    editorViewEl.dataset.template = activeSlide.template;
    editorViewEl.innerHTML = '';

    Object.keys(activeSlide.content).forEach(key => {
        const field = document.createElement('div');
        field.className = 'editor-field';

        const label = document.createElement('label');
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1);

        let input;
        const value = activeSlide.content[key] || '';

        if (key === 'body' || key.includes('text') || key === 'quote') {
            input = document.createElement('textarea');
            input.textContent = value;
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
        }

        input.oninput = (e) => {
            store.updateSlideContent(activeSlide.id, { [key]: e.target.value });
        };

        field.appendChild(label);
        field.appendChild(input);
        editorViewEl.appendChild(field);
    });
}

function renderPreview(state) {
    const activeSlide = state.slides.find(s => s.id === state.activeSlideId);
    if (activeSlide) {
        // App Theme sync
        themeSelect.value = state.theme;

        // Preview Theme
        slidePreviewContent.setAttribute('data-theme', state.theme);
        slidePreviewContent.innerHTML = renderSlide(activeSlide);
    } else {
        slidePreviewContent.innerHTML = '';
    }
}

init();
