// DOM Elements
const slideListEl = document.getElementById('slide-list');
const editorViewEl = document.getElementById('editor-view');
const previewViewEl = document.getElementById('preview-view');
const slidePreviewContent = document.getElementById('slide-preview-content');
const addSlideBtn = document.getElementById('add-slide-btn');
const exportBtn = document.getElementById('export-btn');
const templateSelect = document.getElementById('template-select');
const themeSelect = document.getElementById('theme-select');
const previewToggleBtn = document.getElementById('preview-toggle');

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

    exportBtn.addEventListener('click', () => {
        exportDeck(store.getState());
    });

    // Save Logic
    document.getElementById('save-btn').addEventListener('click', () => {
        const state = store.getState();
        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'slideforge-deck.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Load Logic
    const loadBtn = document.getElementById('load-btn');
    const loadFile = document.getElementById('load-file');

    loadBtn.addEventListener('click', () => {
        loadFile.click();
    });

    loadFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                // Basic validation
                if (state.slides && Array.isArray(state.slides)) {
                    store.loadState(state);
                } else {
                    alert('Invalid file format');
                }
            } catch (err) {
                console.error(err);
                alert('Error parsing file');
            }
        };
        reader.readAsText(file);
        // Reset so same file can be loaded again if needed
        loadFile.value = '';
    });

    try {
        templateSelect.addEventListener('change', (e) => {
            const state = store.getState();
            if (state.activeSlideId) {
                store.setTemplate(state.activeSlideId, e.target.value);
            }
        });

        previewToggleBtn.addEventListener('click', () => {
            editorViewEl.classList.toggle('hidden');
            previewViewEl.classList.toggle('hidden');
            const isPreview = !previewViewEl.classList.contains('hidden');
            previewToggleBtn.textContent = isPreview ? 'Edit' : 'Preview';
            if (isPreview) {
                renderPreview(store.getState());
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
    renderEditor(state);
    if (!previewViewEl.classList.contains('hidden')) {
        renderPreview(state);
    }
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

        // Click to select
        el.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                store.setActiveSlide(slide.id);
            }
        });

        // Duplicate button
        const duplicateBtn = el.querySelector('.duplicate-slide-btn');
        duplicateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            store.duplicateSlide(slide.id);
        });

        // Delete button
        const deleteBtn = el.querySelector('.delete-slide-btn');
        deleteBtn.addEventListener('click', (e) => {
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

    // If no active slide (e.g. all deleted), show empty state
    if (!activeSlide) {
        editorViewEl.innerHTML = '<div style="text-align:center; padding: 2rem; color: #666;">No slides. Add one to start.</div>';
        // Disable controls if needed
        return;
    }

    // Update controls logic to avoid loop if focusing
    // Check if templateSelect exists before accessing value
    if (templateSelect && document.activeElement !== templateSelect) {
        templateSelect.value = activeSlide.template;
    }

    // Check availability of data attributes
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

        // Define input type
        let input;
        const value = activeSlide.content[key] || '';

        if (key === 'body' || key.includes('text') || key === 'quote') {
            input = document.createElement('textarea');
            input.textContent = value; // For textarea
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
        }

        // Update state on input
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
        slidePreviewContent.innerHTML = renderSlide(activeSlide);
    } else {
        slidePreviewContent.innerHTML = '';
    }
}

init();
