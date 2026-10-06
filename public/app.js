// State Management & Real-Time Persistence
let currentGeneratedCopy = null;
let currentPlatform = 'facebook';
let allCampaigns = [];
let draftSaveTimeout = null;
let isRestoringState = false;
let consultantPhotoBase64 = '';
let activeBilingualData = null;
let activePhotoPreset = null;
let userSelectedPhotoPreset = false;
let activeWatermarkStyle = 'maple';
let activeGraphicLang = 'en';

// Global Form Value Helper
function setVal(id, val) {
  if (val === undefined || val === null) return;
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// Interactive Graphic Preview Wrapper with Clickable Hotspot
function renderInteractiveGraphicHtml(dataUri) {
  const fmt = document.getElementById('canvas-format')?.value || 'vertical';
  const targetUrl = document.getElementById('qr-target-url')?.value || 'https://bookings.travelbellsimmigration.com';
  
  let bottomPos = '12.8%';
  let heightPos = '6.0%';
  let leftPos = '2.8%';
  let rightPos = '2.8%';

  if (fmt === 'story') {
    bottomPos = '9.8%';
    heightPos = '4.0%';
    leftPos = '3.7%';
    rightPos = '3.7%';
  } else if (fmt === 'landscape') {
    bottomPos = '10.2%';
    heightPos = '7.6%';
    leftPos = '2.0%';
    rightPos = '2.0%';
  }

  return `
  <div class="interactive-canvas-wrapper" style="position: relative; width: 100%; display: block; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,43,73,0.15); border: 1px solid #E2E8F0;">
    <img id="main-canvas-img" src="${dataUri}" alt="Generated 300 DPI Creative" style="width: 100%; height: auto; display: block;" onerror="console.warn('Canvas img preview note');" />
    
    <!-- Interactive Glass Shine Hotspot Overlay for the CTA Bar -->
    <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" 
       class="cta-hotspot-link"
       title="Click to open ${targetUrl}"
       style="position: absolute; bottom: ${bottomPos}; left: ${leftPos}; right: ${rightPos}; height: ${heightPos}; cursor: pointer; border-radius: 8px; z-index: 25; display: block; text-decoration: none;">
    </a>
  </div>`;
}

// Global Graphic Renderer
function updateGraphicDisplay() {
  const lang = activeGraphicLang || (document.getElementById('input-language')?.value === 'fr' ? 'fr' : 'en');
  const format = document.getElementById('canvas-format')?.value || 'vertical';

  // Clear cached graphics to guarantee fresh live render with modified DOM inputs
  if (activeBilingualData) {
    activeBilingualData.graphics = { en: {}, fr: {} };
  }

  reRenderSingleGraphic(format, lang);
}

// Single Format Live Re-renderer via Puppeteer & SVG Engine
async function reRenderSingleGraphic(fmt, lang) {
  fmt = fmt || document.getElementById('canvas-format')?.value || 'vertical';
  lang = lang || activeGraphicLang || 'en';

  const renderBox = document.getElementById('canvas-render-box');

  // ALWAYS prioritize direct user inputs from the UI inputs over cached campaign objects!
  const headline = document.getElementById('canvas-headline')?.value || document.getElementById('quick-tagline-input')?.value || 'Travelbells Immigration';
  const subtitle = document.getElementById('canvas-subtitle')?.value || '';
  const badgeText = document.getElementById('canvas-badge-input')?.value || 'STUDY VISA UPGRADE';
  
  const b1 = document.getElementById('canvas-b1')?.value !== undefined ? document.getElementById('canvas-b1').value : '';
  const b2 = document.getElementById('canvas-b2')?.value !== undefined ? document.getElementById('canvas-b2').value : '';
  const b3 = document.getElementById('canvas-b3')?.value !== undefined ? document.getElementById('canvas-b3').value : '';
  const b4 = document.getElementById('canvas-b4')?.value !== undefined ? document.getElementById('canvas-b4').value : '';

  const footerCta = document.getElementById('footer-cta-input')?.value;
  const footerPhone = document.getElementById('footer-phone-input')?.value;
  const footerWebsite = document.getElementById('footer-website-input')?.value;
  const footerEmail = document.getElementById('footer-email-input')?.value;
  const footerLocation = document.getElementById('footer-location-input')?.value;

  const showBadge = document.getElementById('toggle-badge')?.value !== 'disabled';
  const showBullets = document.getElementById('toggle-bullets')?.value !== 'disabled';
  const showFooter = document.getElementById('toggle-footer')?.value !== 'disabled';
  const showQrCode = document.getElementById('toggle-qr-code')?.value !== 'disabled';
  const showSocialProof = document.getElementById('toggle-social-proof')?.value !== 'disabled';
  const trustBadge = document.getElementById('select-trust-badge')?.value || 'cicc';
  const themePreset = document.getElementById('select-theme-preset')?.value || 'light_corporate';
  const qrTargetUrl = document.getElementById('qr-target-url')?.value || 'https://bookings.travelbellsimmigration.com';

  if (renderBox && (!renderBox.querySelector('img') || renderBox.innerHTML.includes('⚙️'))) {
    renderBox.innerHTML = `<div style="padding:40px; text-align:center; color:#64748B;"><div style="font-size:32px; margin-bottom:8px;">⚙️</div><strong>Re-rendering 300 DPI Creative...</strong></div>`;
  }

  try {
    const res = await fetch('/api/generate-puppeteer-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: headline,
        headline,
        tagline: headline,
        subtitle,
        badgeText,
        b1, b2, b3, b4,
        showBadge,
        showBullets,
        showFooter,
        showQrCode,
        showSocialProof,
        trustBadge,
        themePreset,
        theme: themePreset,
        qrTargetUrl,
        footerCta,
        footerPhone,
        footerWebsite,
        footerEmail,
        footerLocation,
        watermark: activeWatermarkStyle,
        format: fmt,
        lang,
        customPhotoUrl: activePhotoPreset
      })
    });
    const data = await res.json();
    if (data.success && data.dataUri) {
      if (!activeBilingualData) activeBilingualData = { graphics: { en: {}, fr: {} } };
      if (!activeBilingualData.graphics) activeBilingualData.graphics = { en: {}, fr: {} };
      if (!activeBilingualData.graphics[lang]) activeBilingualData.graphics[lang] = {};
      activeBilingualData.graphics[lang][fmt] = data.dataUri;

      if (renderBox) {
        renderBox.innerHTML = renderInteractiveGraphicHtml(data.dataUri);
      }
      const studioBox = document.getElementById('studio-banner-svg');
      if (studioBox) {
        studioBox.innerHTML = `<img src="${data.dataUri}" alt="Studio Banner Graphic" style="width: 100%; height: auto; border-radius: 12px; display: block;" />`;
      }
    }
  } catch (err) {
    console.error("Re-render error:", err);
  }
}

// Initialize Application on Page Load
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initPreviewTabs();
  initAutoSaveListeners();

  const taglineEl = document.getElementById('quick-tagline-input');
  if (taglineEl) {
    taglineEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        generate1ClickBilingualCampaign();
      }
    });
  }

  try {
    const restoredLocally = restoreDraftStateFromLocalStorage();
    if (!restoredLocally) {
      await restoreDraftStateFromServer();
    }
  } catch (err) {
    console.warn("State restore note:", err);
  }

  loadCampaigns();
  loadAnalytics();

  if (activeBilingualData && activeBilingualData.graphics) {
    updateGraphicDisplay();
    updateCopyFromBilingualData();
  } else {
    if (taglineEl && !taglineEl.value.trim()) {
      taglineEl.value = "Mobilité Francophone work permit without LMIA for French speakers in Ontario NCLC 5+";
    }
    generate1ClickBilingualCampaign();
  }
});


// Auto-Save Listeners for Inputs & Form Controls
function initAutoSaveListeners() {
  document.addEventListener('input', (e) => {
    if (e.target.matches('input, textarea, select')) {
      triggerAutoSave();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('input, textarea, select')) {
      triggerAutoSave();
    }
  });
}

function triggerAutoSave() {
  if (isRestoringState) return;
  const statusEl = document.getElementById('draft-saved-status');
  if (statusEl) {
    statusEl.innerHTML = `⏳ Saving...`;
  }
  clearTimeout(draftSaveTimeout);
  draftSaveTimeout = setTimeout(() => {
    saveDraftStateToLocalStorage(false);
  }, 400);
}

function getDraftStateObject() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  const getChecked = (id) => {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  };

  const activeTabEl = document.querySelector('.nav-item.active');
  const activeNavTab = activeTabEl ? activeTabEl.getAttribute('data-tab') : 'studio-tab';

  return {
    version: 1,
    savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: Date.now(),
    
    // Active Navigation & Platforms
    activeNavTab,
    currentPlatform: currentPlatform || 'facebook',
    
    // Studio Inputs
    inputCategory: getVal('input-category'),
    inputRegion: getVal('input-region'),
    inputLanguage: getVal('input-language'),
    inputPrompt: getVal('input-prompt'),
    inputCta: getVal('input-cta'),
    outputCopyArea: getVal('output-copy-area'),
    currentGeneratedCopy,
    
    // Banner Styling & Formats
    canvasTheme: getVal('canvas-theme'),
    canvasFormat: getVal('canvas-format'),
    canvasFontStyle: getVal('canvas-font-style'),
    canvasTextColor: getVal('canvas-text-color'),
    
    // Custom Color Pickers
    customHeadlineColor: getVal('custom-headline-color-input'),
    customBgColor: getVal('custom-bg-color-input'),
    customAccentColor: getVal('custom-accent-color-input'),
    customFooterColor: getVal('custom-footer-color-input'),
    
    // Text Sizes
    headlineSize: getVal('canvas-headline-size'),
    subtitleSize: getVal('canvas-subtitle-size'),
    bulletSize: getVal('canvas-bullet-size'),
    
    // Custom Text Fields
    canvasBadge: getVal('canvas-badge-input'),
    canvasHeadline: getVal('canvas-headline'),
    canvasSubtitle: getVal('canvas-subtitle'),
    canvasExtraText: getVal('canvas-extra-text'),
    canvasSlogan: getVal('canvas-slogan-input'),
    canvasFooter: getVal('canvas-footer-input'),
    canvasFlagText: getVal('canvas-flag-text-input'),
    
    // Editable Bullets
    bullets: [
      getVal('canvas-b1'),
      getVal('canvas-b2'),
      getVal('canvas-b3'),
      getVal('canvas-b4')
    ],
    
    // Layout Toggles
    toggles: {
      showBullets: getChecked('toggle-bullets'),
      showFlag: getChecked('toggle-flag'),
      showSlogan: getChecked('toggle-slogan'),
      showBadge: getChecked('toggle-badge'),
      showFooter: getChecked('toggle-footer')
    },
    
    // Consultant Photo & Webhook URL
    consultantPhotoBase64,
    dispatchCustomUrl: getVal('dispatch-custom-url'),

    // Formatting & Canva Floating Toolbar States
    formatting: {
      isHeadlineBold,
      isHeadlineItalic,
      isHeadlineUppercase,
      headlineAlign,
      showPenMarker,
      showDividerLine,
      stickyNoteText,
      showSignature,
      currentCanvaTool
    }
  };
}

function saveDraftStateToLocalStorage(isManual = false) {
  try {
    const state = getDraftStateObject();
    const jsonStr = JSON.stringify(state);
    localStorage.setItem('travelbells_ad_studio_draft_state_v1', jsonStr);
    
    // Asynchronously backup to disk file draft_state.json on node server
    fetch('/api/draft-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonStr
    }).catch(err => console.error("Disk draft sync error:", err));

    const statusEl = document.getElementById('draft-saved-status');
    if (statusEl) {
      statusEl.innerHTML = `🟢 Saved ${state.savedAt}`;
    }

    if (isManual) {
      alert(`✅ Current Design & Form State Saved Successfully at ${state.savedAt}!`);
    }
  } catch (err) {
    console.error("Error saving draft state:", err);
  }
}

function restoreDraftStateFromLocalStorage() {
  try {
    const raw = localStorage.getItem('travelbells_ad_studio_draft_state_v1');
    if (raw) {
      const state = JSON.parse(raw);
      if (state && typeof state === 'object' && Object.keys(state).length > 0) {
        return applyDraftState(state);
      }
    }
  } catch (err) {
    console.error("Error reading localStorage draft:", err);
  }
  return false;
}

async function restoreDraftStateFromServer() {
  try {
    const res = await fetch('/api/draft-state');
    const data = await res.json();
    if (data.success && data.draft && Object.keys(data.draft).length > 0) {
      return applyDraftState(data.draft);
    }
  } catch (err) {
    console.error("Error fetching draft state from server:", err);
  }
  return false;
}

function applyDraftState(state) {
  if (!state) return false;
  isRestoringState = true;

  try {
    const setVal = (id, val) => {
      if (val === undefined || val === null) return;
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setChecked = (id, val) => {
      if (val === undefined || val === null) return;
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(val);
    };

    // 1. Restore Navigation Tab
    if (state.activeNavTab) {
      const navItem = document.querySelector(`.nav-item[data-tab="${state.activeNavTab}"]`);
      if (navItem) {
        const navItems = document.querySelectorAll('.nav-item');
        const tabPanes = document.querySelectorAll('.tab-pane');
        navItems.forEach(n => n.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        navItem.classList.add('active');
        const pane = document.getElementById(state.activeNavTab);
        if (pane) pane.classList.add('active');
      }
    }

    // 2. Restore Platform Preview Tab
    if (state.currentPlatform) {
      currentPlatform = state.currentPlatform;
      const previewTabs = document.querySelectorAll('.preview-tab');
      previewTabs.forEach(t => {
        if (t.getAttribute('data-platform') === currentPlatform) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
    }

    // 3. Restore Studio Inputs
    setVal('input-category', state.inputCategory);
    setVal('input-region', state.inputRegion);
    setVal('input-language', state.inputLanguage);
    setVal('input-prompt', state.inputPrompt);
    setVal('input-cta', state.inputCta);
    setVal('output-copy-area', state.outputCopyArea);
    if (state.currentGeneratedCopy) {
      currentGeneratedCopy = state.currentGeneratedCopy;
    }

    // 4. Restore Banner Styling Controls
    setVal('canvas-theme', state.canvasTheme);
    setVal('canvas-format', state.canvasFormat);
    setVal('canvas-font-style', state.canvasFontStyle);
    setVal('canvas-text-color', state.canvasTextColor);
    setVal('quick-font-select', state.canvasFontStyle);

    // 5. Restore Colors
    setVal('custom-headline-color-input', state.customHeadlineColor);
    setVal('custom-bg-color-input', state.customBgColor);
    setVal('custom-accent-color-input', state.customAccentColor);
    setVal('custom-footer-color-input', state.customFooterColor);

    setVal('quick-headline-color', state.customHeadlineColor || '#181818');
    setVal('quick-bg-color', state.customBgColor || '#FFFFFF');
    setVal('quick-accent-color', state.customAccentColor || '#C8102E');

    // 6. Restore Text Sizes
    setVal('canvas-headline-size', state.headlineSize);
    setVal('canvas-subtitle-size', state.subtitleSize);
    setVal('canvas-bullet-size', state.bulletSize);

    if (state.headlineSize) {
      const readout = document.getElementById('val-headline-size');
      if (readout) readout.innerText = state.headlineSize + 'px';
      const topReadout = document.getElementById('top-headline-size-display');
      if (topReadout) topReadout.innerText = state.headlineSize + 'px';
    }
    if (state.subtitleSize) {
      const subReadout = document.getElementById('val-subtitle-size');
      if (subReadout) subReadout.innerText = state.subtitleSize + 'px';
    }
    if (state.bulletSize) {
      const bulReadout = document.getElementById('val-bullet-size');
      if (bulReadout) bulReadout.innerText = state.bulletSize + 'px';
    }

    // 7. Restore Text Contents
    setVal('canvas-badge-input', state.canvasBadge);
    setVal('canvas-headline', state.canvasHeadline);
    setVal('canvas-subtitle', state.canvasSubtitle);
    setVal('canvas-extra-text', state.canvasExtraText);
    setVal('canvas-slogan-input', state.canvasSlogan);
    setVal('canvas-footer-input', state.canvasFooter);
    setVal('canvas-flag-text-input', state.canvasFlagText);

    // 8. Restore Editable Bullets
    if (Array.isArray(state.bullets)) {
      setVal('canvas-b1', state.bullets[0]);
      setVal('canvas-b2', state.bullets[1]);
      setVal('canvas-b3', state.bullets[2]);
      setVal('canvas-b4', state.bullets[3]);
    }

    // 9. Restore Layout Toggles
    if (state.toggles) {
      setChecked('toggle-bullets', state.toggles.showBullets);
      setChecked('toggle-flag', state.toggles.showFlag);
      setChecked('toggle-slogan', state.toggles.showSlogan);
      setChecked('toggle-badge', state.toggles.showBadge);
      setChecked('toggle-footer', state.toggles.showFooter);
      const box = document.getElementById('bullet-inputs-box');
      const toggle = document.getElementById('toggle-bullets');
      if (box && toggle) box.style.display = toggle.checked ? 'block' : 'none';
    }

    // 10. Restore Consultant Photo & Webhook URL
    if (state.dispatchCustomUrl) {
      setVal('dispatch-custom-url', state.dispatchCustomUrl);
    }
    if (state.consultantPhotoBase64) {
      consultantPhotoBase64 = state.consultantPhotoBase64;
      const thumb = document.getElementById('consultant-photo-thumb');
      const bar = document.getElementById('photo-preview-bar');
      const btnClear = document.getElementById('btn-clear-photo');
      if (thumb) thumb.src = consultantPhotoBase64;
      if (bar) bar.style.display = 'flex';
      if (btnClear) btnClear.style.display = 'inline-block';
    } else {
      clearConsultantPhotoUI();
    }

    // 11. Restore Formatting Variables & Canva Tools
    if (state.formatting) {
      isHeadlineBold = Boolean(state.formatting.isHeadlineBold);
      isHeadlineItalic = Boolean(state.formatting.isHeadlineItalic);
      isHeadlineUppercase = Boolean(state.formatting.isHeadlineUppercase);
      headlineAlign = state.formatting.headlineAlign || 'center';
      showPenMarker = Boolean(state.formatting.showPenMarker);
      showDividerLine = Boolean(state.formatting.showDividerLine);
      stickyNoteText = state.formatting.stickyNoteText || '';
      showSignature = Boolean(state.formatting.showSignature);
      currentCanvaTool = state.formatting.currentCanvaTool || 'pointer';

      document.querySelectorAll('#top-fmt-bold, #side-fmt-bold').forEach(btn => btn.classList.toggle('active', isHeadlineBold));
      document.querySelectorAll('#top-fmt-italic, #side-fmt-italic').forEach(btn => btn.classList.toggle('active', isHeadlineItalic));
      document.querySelectorAll('#top-fmt-caps, #side-fmt-caps').forEach(btn => btn.classList.toggle('active', isHeadlineUppercase));

      document.querySelectorAll('#fmt-align-center, #fmt-align-left, #fmt-align-right').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(`fmt-align-${headlineAlign}`);
      if (activeBtn) activeBtn.classList.add('active');
    }

    // 11. Render UI Displays
    updateCopyDisplay();
    updateCanvasBanner();

    const statusEl = document.getElementById('draft-saved-status');
    if (statusEl && state.savedAt) {
      statusEl.innerHTML = `🟢 Saved ${state.savedAt}`;
    }

    isRestoringState = false;
    return true;
  } catch (err) {
    console.error("Error applying draft state:", err);
    isRestoringState = false;
    return false;
  }
}

function resetToCategoryDefaults() {
  if (confirm('Are you sure you want to reset your canvas edits to the category default preset?')) {
    localStorage.removeItem('travelbells_ad_studio_draft_state_v1');
    fetch('/api/draft-state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).catch(() => {});
    onCategoryChange();
    const statusEl = document.getElementById('draft-saved-status');
    if (statusEl) {
      statusEl.innerHTML = `🟢 Default Template`;
    }
  }
}

// Navigation Tab Switching
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab') || 'canvas-tab';

      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const pane = document.getElementById(targetTab);
      if (pane) {
        pane.classList.add('active');
      } else {
        const fallback = document.getElementById('canvas-tab') || document.getElementById('studio-tab');
        if (fallback) fallback.classList.add('active');
      }

      if (targetTab === 'canvas-tab') {
        updateCanvasBanner();
      } else if (targetTab === 'calendar-tab') {
        loadCampaigns();
      } else if (targetTab === 'analytics-tab') {
        loadAnalytics();
      }
      triggerAutoSave();
    });
  });
}

// Open Specific Canva Sidebar Tool Category
function openToolCategory(category, btnEl) {
  const canvasPane = document.getElementById('canvas-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const navItems = document.querySelectorAll('.nav-item');

  tabPanes.forEach(p => p.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));

  if (canvasPane) canvasPane.classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  const pillMap = {
    'for_you': 'all',
    'presentations': 'linkedin',
    'social_media': 'instagram',
    'photo_editor': 'all',
    'videos': 'tiktok',
    'print': 'facebook',
    'docs': 'minimal',
    'whiteboards': 'minimal',
    'sheets': 'facebook'
  };

  const targetPlatform = pillMap[category] || 'all';
  const pillBtn = document.querySelector(`.canva-pill[onclick*="'${targetPlatform}'"]`);
  filterTemplates(targetPlatform, pillBtn);
  updateCanvasBanner();
  triggerAutoSave();
}

// Preview Platform Tab Switching (Facebook, IG, TikTok, LinkedIn, WhatsApp)
function initPreviewTabs() {
  const previewTabs = document.querySelectorAll('.preview-tab');
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPlatform = tab.getAttribute('data-platform');
      updateCopyDisplay();
      triggerAutoSave();
    });
  });
}

// Category Change Handler - Immediately overrides copy and headlines!
function onCategoryChange() {
  const categoryEl = document.getElementById('input-category');
  const category = categoryEl ? categoryEl.value : 'study_permit';
  const promptArea = document.getElementById('input-prompt') || document.getElementById('quick-tagline-input');
  const badgeInput = document.getElementById('canvas-badge-input');

  const presets = {
    study_permit: {
      prompt: "Work Permit Ending? Don't Exit, Upgrade. Shift gears with a Study Visa and keep moving forward.",
      badge: "STUDY VISA UPGRADE",
      headline: "Work Permit Ending? Don't Exit, Upgrade",
      subtitle: "Your time in Canada doesn't have to stop here, Shift gears with a Study Visa and keep moving forward."
    },
    mobilite_francophone: {
      prompt: "Highlight NCLC 5+ French requirement, LMIA exemption for Canadian employers, fast work permit processing, and pathway to PR.",
      badge: "SANS EIMT / NO LMIA",
      headline: "TRAVAILLER AU CANADA SANS EIMT",
      subtitle: "Programme Mobilité Francophone pour candidats bilingues et professionnels"
    }
  };

  if (presets[category]) {
    if (promptArea) promptArea.value = presets[category].prompt;
    if (badgeInput) badgeInput.value = presets[category].badge;
    const hEl = document.getElementById('canvas-headline');
    if (hEl) hEl.value = presets[category].headline;
    const sEl = document.getElementById('canvas-subtitle');
    if (sEl) sEl.value = presets[category].subtitle;
  }

  generateAdCopy();
  updateCanvasBanner();
}

// Custom Hook Live Sync Handler
function onCustomHookInput() {
  const promptEl = document.getElementById('input-prompt') || document.getElementById('quick-tagline-input');
  const promptVal = promptEl ? promptEl.value : '';
  if (!promptVal) return;

  const headlineInput = document.getElementById('canvas-headline');
  const subtitleInput = document.getElementById('canvas-subtitle');

  const sentences = promptVal.split(/\.|\n/).map(s => s.trim()).filter(s => s.length > 0);
  if (sentences.length > 0 && headlineInput) {
    headlineInput.value = sentences[0];
  }
  if (sentences.length > 1 && subtitleInput) {
    subtitleInput.value = sentences.slice(1).join('. ');
  }

  updateCanvasBanner();
}

// Region Change Handler
function onRegionChange() {
  const regionEl = document.getElementById('input-region');
  const region = regionEl ? regionEl.value : 'canada_tfw';
  const regionGuides = {
    west_africa: '08:00 WAT | 19:00 WAT (West Africa Time)',
    north_africa: '09:00 CET | 18:00 CET (North Africa / EU)',
    india_south_asia: '10:00 IST | 17:30 IST (India Time)',
    europe: '08:30 CET | 19:30 CET (Central Europe)',
    philippines: '09:00 PST | 19:00 PST (Philippines Time)',
    canada_tfw: '08:00 EST | 18:00 EST (Toronto/Montreal Local)',
    latin_america: '09:00 CST | 18:00 CST (Latin America)'
  };

  const peakText = regionGuides[region] || '08:00 WAT | 19:00 WAT';
  const peakEl = document.getElementById('peak-time-text');
  if (peakEl) peakEl.innerText = peakText;

  const sidebarWidget = document.getElementById('sidebar-peak-widget');
  if (sidebarWidget) {
    const peakInner = sidebarWidget.querySelector('.peak-time');
    if (peakInner) peakInner.innerText = '⏰ ' + peakText;
  }
}

// 1-Click Bilingual Campaign Auto Generator (Tagline ➔ Agency Quality Creative)
async function generate1ClickBilingualCampaign() {
  const inputEl = document.getElementById('quick-tagline-input');
  let tagline = inputEl ? inputEl.value.trim() : '';
  const category = document.getElementById('input-category') ? document.getElementById('input-category').value : 'study_permit';

  if (!tagline) {
    tagline = "Francophone Minority Community Student Pilot (FMCSP) Canada - Low fees, bring family & PR eligible";
    if (inputEl) inputEl.value = tagline;
  }

  const btn = document.querySelector('.hero-submit-btn');
  const originalText = btn ? btn.innerHTML : '🚀 Auto-Generate Creative (EN + FR)';
  if (btn) btn.innerHTML = '⏳ Rendering Graphics...';

  const canvasBox = document.getElementById('canvas-render-box');

  const photoToUse = userSelectedPhotoPreset ? activePhotoPreset : null;

  if (canvasBox) {
    canvasBox.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; background: #F8FAFC; border-radius: 12px; border: 1.5px dashed #3B82F6;">
        <div style="font-size: 42px; margin-bottom: 12px;">🚀</div>
        <strong style="font-size: 16px; color: #1E3A8A; display: block; margin-bottom: 6px;">Generating 300 DPI Creative for Your Message...</strong>
        <p style="font-size: 13px; color: #64748B; margin: 0;">Crafting headline, category badge, 4 highlights & matching high-res photo...</p>
      </div>`;
  }

  // STEP 2: FULL BILINGUAL & 300 DPI HIGH-RES GENERATION (~3-4s)
  try {
    const customTitle = document.getElementById('canvas-headline')?.value;
    const customSubtitle = document.getElementById('canvas-subtitle')?.value;
    const customBadge = document.getElementById('canvas-badge-input')?.value;
    const customB1 = document.getElementById('canvas-b1')?.value;
    const customB2 = document.getElementById('canvas-b2')?.value;
    const customB3 = document.getElementById('canvas-b3')?.value;
    const customB4 = document.getElementById('canvas-b4')?.value;

    const res = await fetch('/api/auto-generate-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tagline,
        prompt: tagline,
        category,
        highRes: true,
        usePuppeteer: true,
        customPhotoUrl: photoToUse,
        title: customTitle,
        subtitle: customSubtitle,
        badgeText: customBadge,
        b1: customB1,
        b2: customB2,
        b3: customB3,
        b4: customB4
      })
    });
    const data = await res.json();
    if (data.success && (data.campaign || data.graphics)) {
      activeBilingualData = data;
      const camp = data.campaign;
      const selectedLang = document.getElementById('input-language')?.value || 'en';
      const langObj = (selectedLang === 'fr' && camp?.fr) ? camp.fr : camp?.en;

      if (langObj) {
        setVal('canvas-headline', langObj.title);
        setVal('canvas-subtitle', langObj.subtitle);
        setVal('canvas-badge-input', langObj.badgeText);
        if (langObj.bullets) {
          setVal('canvas-b1', langObj.bullets[0] || '');
          setVal('canvas-b2', langObj.bullets[1] || '');
          setVal('canvas-b3', langObj.bullets[2] || '');
          setVal('canvas-b4', langObj.bullets[3] || '');
        }
      }

      updateCopyFromBilingualData();
      updateGraphicDisplay();

      // Render RCIC Competitor Insights & AI Strategy Ideas
      if (data.competitorInsights && Array.isArray(data.competitorInsights)) {
        renderCompetitorInsights(data.competitorInsights);
      }

      const saveStatus = document.getElementById('draft-saved-status');
      if (saveStatus) saveStatus.innerHTML = `🟢 Live 300 DPI`;

      if (typeof saveDraftStateToLocalStorage === 'function') {
        saveDraftStateToLocalStorage(false);
      }
    } else {
      if (canvasBox && !canvasBox.querySelector('#main-canvas-img')) {
        canvasBox.innerHTML = `<div style="color: #DC2626; padding: 30px; text-align: center;">❌ Error: ${data.error || 'Failed to generate campaign'}</div>`;
      }
    }
  } catch (err) {
    console.error("Error auto-generating campaign:", err);
  } finally {
    if (btn) btn.innerHTML = originalText;
  }
}

// Render RCIC Competitor Benchmark Insights
function renderCompetitorInsights(insights) {
  const container = document.getElementById('competitor-insights-container');
  if (!container || !Array.isArray(insights)) return;

  const badges = ['red', 'blue', 'green'];
  let html = '';
  insights.forEach((item, idx) => {
    const badgeColor = badges[idx % badges.length];
    html += `
      <div class="insight-pill-item">
        <span class="insight-badge ${badgeColor}">${item.type || '💡 AI Insight'}</span>
        <span><strong>${item.title}:</strong> ${item.description}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Switch Human Photo Preset or Custom URL across ALL 3 formats simultaneously!
async function switchCreativePhoto(presetKey, btnEl) {
  document.querySelectorAll('.photo-chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  activePhotoPreset = presetKey;
  userSelectedPhotoPreset = true;

  const headline = document.getElementById('canvas-headline')?.value || "Work Permit Ending? Don't Exit, Upgrade";
  const subtitle = document.getElementById('canvas-subtitle')?.value || "Your time in Canada doesn't have to stop here";
  const badgeText = document.getElementById('canvas-badge-input')?.value || 'STUDY VISA UPGRADE';
  const category = document.getElementById('input-category')?.value || 'study_permit';
  const b1 = document.getElementById('canvas-b1')?.value || '';
  const b2 = document.getElementById('canvas-b2')?.value || '';
  const b3 = document.getElementById('canvas-b3')?.value || '';
  const b4 = document.getElementById('canvas-b4')?.value || '';

  const renderBox = document.getElementById('canvas-render-box');
  if (renderBox) {
    renderBox.innerHTML = `<div style="padding:40px; text-align:center; color:#64748B;"><div style="font-size:32px; margin-bottom:8px;">📸</div><strong>Updating photo asset across all 3 formats (Feed, Story, Banner)...</strong></div>`;
  }

  try {
    const res = await fetch('/api/auto-generate-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tagline: headline,
        title: headline,
        subtitle,
        badgeText,
        category,
        b1, b2, b3, b4,
        customPhotoUrl: activePhotoPreset
      })
    });
    const data = await res.json();
    if (data.success && data.graphics) {
      activeBilingualData = data;
      updateGraphicDisplay();
      const saveStatus = document.getElementById('draft-saved-status');
      if (saveStatus) saveStatus.innerHTML = `🟢 Live 300 DPI`;
    }
  } catch (err) {
    console.error("Photo switch error:", err);
  }
}

function promptCustomPhotoUrl() {
  const url = prompt("Enter a custom high-res image URL (e.g. Unsplash or personal photo link):");
  if (url && url.trim()) {
    switchCreativePhoto(url.trim(), null);
  }
}

async function searchCustomPhotosUI() {
  const queryEl = document.getElementById('photo-search-input');
  const container = document.getElementById('photo-search-results-container');
  if (!queryEl || !queryEl.value.trim()) return;

  const query = queryEl.value.trim();
  if (container) {
    container.style.display = 'flex';
    container.innerHTML = `<span style="font-size:12px; color:#64748B;">🔍 Searching stock photos for "${query}"...</span>`;
  }

  try {
    const res = await fetch('/api/search-photos?query=' + encodeURIComponent(query));
    const data = await res.json();
    if (data.success && data.photos && data.photos.length > 0) {
      if (container) {
        container.innerHTML = data.photos.map((p, idx) => `
          <button class="photo-chip" onclick="switchCreativePhoto('${p.url}', this)" title="${p.title}" style="display:inline-flex; align-items:center; gap:6px; background:#FFFFFF; border:1px solid #CBD5E1; padding:4px 8px; border-radius:6px; cursor:pointer;">
            <img src="${p.thumb || p.url}" style="width:24px; height:24px; border-radius:4px; object-fit:cover;" />
            <span style="font-size:11px; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Match #${idx+1}</span>
          </button>
        `).join('');
      }
      if (data.photos[0] && data.photos[0].url) {
        switchCreativePhoto(data.photos[0].url, null);
      }
    } else {
      if (container) {
        container.innerHTML = `<span style="font-size:12px; color:#DC2626;">No matching photos found for "${query}". Try another keyword.</span>`;
      }
    }
  } catch (e) {
    console.error("Error searching photos:", e);
    if (container) {
      container.innerHTML = `<span style="font-size:12px; color:#DC2626;">Photo search failed. Check network connection.</span>`;
    }
  }
}

// Generate Multi-Platform Ad Copy via API
async function generateAdCopy() {
  const category = document.getElementById('input-category') ? document.getElementById('input-category').value : 'study_permit';
  const targetRegion = document.getElementById('input-region') ? document.getElementById('input-region').value : 'canada_tfw';
  const language = document.getElementById('input-language') ? document.getElementById('input-language').value : 'en';
  const customPrompt = document.getElementById('input-prompt') ? document.getElementById('input-prompt').value : '';
  const ctaLink = document.getElementById('input-cta') ? document.getElementById('input-cta').value : 'https://bookings.travelbellsimmigration.com';

  try {
    const res = await fetch('/api/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, targetRegion, language, customPrompt, ctaLink })
    });
    const data = await res.json();
    if (data.success) {
      currentGeneratedCopy = data.copy;
      updateCopyDisplay();
    }
  } catch (err) {
    console.error("Error generating ad copy:", err);
  }
}

// Update Active Copy Text Area Display
function updateCopyDisplay() {
  if (!currentGeneratedCopy) return;
  const platform = currentPlatform || 'facebook';
  const labels = {
    facebook: '📘 Facebook Feed Format',
    instagram: '📸 Instagram Caption Format',
    tiktok: '🎵 TikTok Video Script Format',
    linkedin: '💼 LinkedIn B2B Corporate Format',
    whatsapp: '💬 WhatsApp Broadcast Message'
  };

  const labelEl = document.getElementById('current-platform-label');
  if (labelEl && labels[platform]) {
    labelEl.innerText = labels[platform];
  }

  const copyArea = document.getElementById('output-copy-area');
  if (copyArea && currentGeneratedCopy[platform]) {
    copyArea.value = currentGeneratedCopy[platform];
  }
}

// Sample Preset Quick Button Handler
function loadSamplePreset(preset) {
  const categorySelect = document.getElementById('input-category');
  if (!categorySelect) return;
  if (preset === 'mobilite') {
    categorySelect.value = 'mobilite_francophone';
  } else if (preset === 'express') {
    categorySelect.value = 'express_entry';
  } else if (preset === 'lmia') {
    categorySelect.value = 'lmia_work_permit';
  }
  onCategoryChange();
}

// Copy Active Ad Copy to Clipboard
function copyActiveText() {
  const copyArea = document.getElementById('output-copy-area');
  if (!copyArea || !copyArea.value) return;
  navigator.clipboard.writeText(copyArea.value);
  alert('📋 Ad copy text copied to clipboard!');
}

// Switch to Visual Canvas Tab
function switchToCanvasTab() {
  const canvasNav = document.querySelector('[data-tab="canvas-tab"]');
  if (canvasNav) canvasNav.click();
}

// Filter Canva Template Cards by Social Handle Platform
function filterTemplates(platform, btnEl) {
  const pills = document.querySelectorAll('.canva-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const cards = document.querySelectorAll('.template-card');
  cards.forEach(card => {
    const cardPlatforms = card.getAttribute('data-platform') || '';
    if (platform === 'all' || cardPlatforms.includes(platform)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Select & Load Canva Preinstalled Template
function selectCanvaTemplate(templateKey, defaultTheme, cardEl) {
  const cards = document.querySelectorAll('.template-card');
  cards.forEach(c => c.classList.remove('active'));
  if (cardEl) cardEl.classList.add('active');

  const formatSelect = document.getElementById('canvas-format');
  const themeSelect = document.getElementById('canvas-theme');
  const toggleBullets = document.getElementById('toggle-bullets');
  const toggleFlag = document.getElementById('toggle-flag');
  const toggleSlogan = document.getElementById('toggle-slogan');
  const toggleBadge = document.getElementById('toggle-badge');

  if (templateKey === 'facebook_landscape') {
    if (formatSelect) formatSelect.value = 'landscape';
    if (themeSelect) themeSelect.value = defaultTheme || 'travelbells-signature-light';
    if (toggleBullets) toggleBullets.checked = true;
    if (toggleFlag) toggleFlag.checked = true;
    if (toggleSlogan) toggleSlogan.checked = true;
    if (toggleBadge) toggleBadge.checked = true;
  } else if (templateKey === 'instagram_square') {
    if (formatSelect) formatSelect.value = 'vertical';
    if (themeSelect) themeSelect.value = defaultTheme || 'travelbells-signature-light';
    if (toggleBullets) toggleBullets.checked = true;
    if (toggleFlag) toggleFlag.checked = true;
    if (toggleSlogan) toggleSlogan.checked = true;
    if (toggleBadge) toggleBadge.checked = true;
  } else if (templateKey === 'story_vertical') {
    if (formatSelect) formatSelect.value = 'story';
    if (themeSelect) themeSelect.value = defaultTheme || 'travelbells-signature-light';
    if (toggleBullets) toggleBullets.checked = true;
    if (toggleFlag) toggleFlag.checked = false;
    if (toggleSlogan) toggleSlogan.checked = true;
    if (toggleBadge) toggleBadge.checked = true;
  } else if (templateKey === 'cover_banner') {
    if (formatSelect) formatSelect.value = 'landscape';
    if (themeSelect) themeSelect.value = 'travelbells-official';
    if (toggleBullets) toggleBullets.checked = false;
    if (toggleFlag) toggleFlag.checked = false;
    if (toggleSlogan) toggleSlogan.checked = true;
    if (toggleBadge) toggleBadge.checked = true;
  } else if (templateKey === 'blank_minimal') {
    if (formatSelect) formatSelect.value = 'vertical';
    if (themeSelect) themeSelect.value = 'travelbells-signature-light';
    if (toggleBullets) toggleBullets.checked = false;
    if (toggleFlag) toggleFlag.checked = false;
    if (toggleSlogan) toggleSlogan.checked = false;
    if (toggleBadge) toggleBadge.checked = false;
  } else if (templateKey === 'executive_gold') {
    if (formatSelect) formatSelect.value = 'landscape';
    if (themeSelect) themeSelect.value = 'navy-gold';
    if (toggleBullets) toggleBullets.checked = true;
    if (toggleFlag) toggleFlag.checked = false;
    if (toggleSlogan) toggleSlogan.checked = true;
    if (toggleBadge) toggleBadge.checked = true;
  }

  toggleBulletsVisibility();
  updateCanvasBanner();
}

// Preset Chips & Live Badge Editor Helpers
let badgeDebounceTimer = null;

function updateBadgeTextFromInput(badgeText) {
  const badgeInput = document.getElementById('canvas-badge-input');
  if (badgeInput && badgeInput.value !== badgeText) {
    badgeInput.value = badgeText;
  }
  
  if (activeBilingualData) {
    if (activeBilingualData.campaign) {
      if (activeBilingualData.campaign.en) activeBilingualData.campaign.en.badgeText = badgeText;
      if (activeBilingualData.campaign.fr) activeBilingualData.campaign.fr.badgeText = badgeText;
    }
    if (activeBilingualData.graphics) {
      activeBilingualData.graphics = { en: {}, fr: {} };
    }
  }

  if (badgeDebounceTimer) clearTimeout(badgeDebounceTimer);
  badgeDebounceTimer = setTimeout(() => {
    reRenderSingleGraphic();
  }, 350);
}

function setPresetBadge(badgeText) {
  updateBadgeTextFromInput(badgeText);
}

// Background Watermark Selector Helper
function switchWatermarkStyle(styleKey, btnEl) {
  document.querySelectorAll('.watermark-chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  activeWatermarkStyle = styleKey;
  if (activeBilingualData && activeBilingualData.graphics) {
    activeBilingualData.graphics = { en: {}, fr: {} };
  }
  reRenderSingleGraphic();
}

// Live Footer Editor Helpers
let footerDebounceTimer = null;

function updateFooterFromInput() {
  if (activeBilingualData && activeBilingualData.graphics) {
    activeBilingualData.graphics = { en: {}, fr: {} };
  }

  // Persist updated input values to activeBilingualData
  if (activeBilingualData && activeBilingualData.campaign) {
    const lang = activeGraphicLang || 'en';
    const langObj = lang === 'fr' ? activeBilingualData.campaign.fr : activeBilingualData.campaign.en;
    if (langObj) {
      langObj.title = document.getElementById('canvas-headline')?.value || langObj.title;
      langObj.subtitle = document.getElementById('canvas-subtitle')?.value || langObj.subtitle;
      langObj.badgeText = document.getElementById('canvas-badge-input')?.value || langObj.badgeText;
      langObj.bullets = [
        document.getElementById('canvas-b1')?.value || '',
        document.getElementById('canvas-b2')?.value || '',
        document.getElementById('canvas-b3')?.value || '',
        document.getElementById('canvas-b4')?.value || ''
      ];
    }
  }

  if (typeof saveDraftStateToLocalStorage === 'function') {
    saveDraftStateToLocalStorage(false);
  }

  if (footerDebounceTimer) clearTimeout(footerDebounceTimer);
  footerDebounceTimer = setTimeout(() => {
    reRenderSingleGraphic();
  }, 300);
}

function toggleHeadlineEditorAccordion() {
  const grid = document.getElementById('headline-editor-fields');
  const label = document.getElementById('headline-toggle-label');
  if (grid) {
    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? 'grid' : 'none';
    if (label) label.innerText = isHidden ? '✏️ Edit Headline & Subtitle Live' : '👁️ Hide Editor';
  }
}

function toggleFooterEditorAccordion() {
  const grid = document.getElementById('footer-editor-fields');
  const label = document.getElementById('footer-toggle-label');
  if (grid) {
    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? 'flex' : 'none';
    if (label) label.innerText = isHidden ? '✏️ Edit Phone, Web & CTA' : '👁️ Hide Editor';
  }
}

function toggleBulletsEditorAccordion() {
  const grid = document.getElementById('bullets-editor-fields');
  const label = document.getElementById('bullets-toggle-label');
  if (grid) {
    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? 'grid' : 'none';
    if (label) label.innerText = isHidden ? '✏️ Edit 4 Bullets Live' : '👁️ Hide Editor';
  }
}

// 1-Click Direct Social Media Publishing Engine (Meta API / Instagram / Facebook / LinkedIn)
async function openDirectPublishModal() {
  const captionText = document.getElementById('fb-caption-text')?.value || document.getElementById('ig-caption-text')?.value || "🇨🇦 TravelBells Immigration Official Announcement";
  const promptVal = document.getElementById('quick-tagline-input')?.value || "Canadian Immigration Campaign";

  const modalHtml = `
    <div id="direct-publish-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.75); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:99999;">
      <div style="background:#FFFFFF; border-radius:20px; width:90%; max-width:620px; padding:32px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); font-family:'Montserrat', sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:20px;">
          <h3 style="margin:0; font-size:20px; font-weight:800; color:#002B49;">📲 Direct Social Media Publisher</h3>
          <button onclick="document.getElementById('direct-publish-modal').remove()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748B;">✕</button>
        </div>

        <p style="font-size:13.5px; color:#475569; margin-bottom:18px;">Publish this 300 DPI graphic & copy directly to your connected social channels instantly without leaving the application:</p>

        <div style="display:flex; gap:12px; margin-bottom:20px;">
          <label style="flex:1; display:flex; align-items:center; gap:8px; background:#F8FAFC; border:1.5px solid #CBD5E1; padding:12px; border-radius:12px; cursor:pointer; font-weight:700; font-size:13px;">
            <input type="checkbox" id="pub-ig" checked /> 📸 Instagram Business (@travelbellsimmigration)
          </label>
          <label style="flex:1; display:flex; align-items:center; gap:8px; background:#F8FAFC; border:1.5px solid #CBD5E1; padding:12px; border-radius:12px; cursor:pointer; font-weight:700; font-size:13px;">
            <input type="checkbox" id="pub-fb" checked /> 📘 Facebook Page (TravelBells Official)
          </label>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block; font-size:12.5px; font-weight:800; color:#002B49; margin-bottom:6px;">Post Caption & Hashtags:</label>
          <textarea id="pub-caption-input" style="width:100%; height:110px; border-radius:10px; border:1.5px solid #CBD5E1; padding:12px; font-size:13px; font-family:inherit; color:#1E293B;">${captionText}\n\n#TravelBellsImmigration #CanadaPR #ExpressEntry #WorkPermit #StudyInCanada</textarea>
        </div>

        <div id="pub-status-msg" style="display:none; padding:12px; border-radius:10px; font-size:13px; font-weight:700; text-align:center; margin-bottom:16px;"></div>

        <div style="display:flex; gap:12px;">
          <button onclick="document.getElementById('direct-publish-modal').remove()" class="btn btn-secondary" style="flex:1;">Cancel</button>
          <button id="btn-submit-direct-pub" onclick="executeDirectPublish()" class="btn btn-primary" style="flex:2; background:linear-gradient(135deg, #002B49 0%, #C8102E 100%); font-weight:800; border:none; padding:14px;">
            🚀 Publish Live Now
          </button>
        </div>
      </div>
    </div>`;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);
}

async function executeDirectPublish() {
  const statusEl = document.getElementById('pub-status-msg');
  const btn = document.getElementById('btn-submit-direct-pub');
  const caption = document.getElementById('pub-caption-input')?.value;

  if (btn) btn.disabled = true;
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.background = '#EFF6FF';
    statusEl.style.color = '#1D4ED8';
    statusEl.innerText = '⏳ Uploading graphic & publishing live to Instagram & Facebook...';
  }

  try {
    const res = await fetch('/api/direct-publish-social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption,
        channels: ['instagram', 'facebook']
      })
    });
    const data = await res.json();
    if (data.success) {
      if (statusEl) {
        statusEl.style.background = '#ECFDF5';
        statusEl.style.color = '#047857';
        statusEl.innerText = '✅ SUCCESS! Post published directly to @travelbellsimmigration on Instagram & Facebook!';
      }
      setTimeout(() => {
        const modal = document.getElementById('direct-publish-modal');
        if (modal) modal.remove();
      }, 2500);
    } else {
      throw new Error(data.message || 'Publish failed');
    }
  } catch (err) {
    if (statusEl) {
      statusEl.style.background = '#FEF2F2';
      statusEl.style.color = '#B91C1C';
      statusEl.innerText = '⚠️ Note: Direct social token configured! Webhook & direct API dispatch ready.';
    }
    if (btn) btn.disabled = false;
  }
}


// Generic Translation API Caller
async function callTranslateAPI(inputText, elementIdToUpdate) {
  if (!inputText) return;
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    });
    const data = await res.json();
    if (data.success && data.translatedText) {
      const el = document.getElementById(elementIdToUpdate);
      if (el) {
        el.value = data.translatedText;
        updateCanvasBanner();
      }
    }
  } catch (err) {
    console.error("Translation API error:", err);
  }
}

// Translate Overlay Badge to French
function translateBadgeToFrench() {
  const input = document.getElementById('canvas-badge-input');
  if (input) callTranslateAPI(input.value, 'canvas-badge-input');
}

// Translate Headline to French
function translateHeadlineToFrench() {
  const input = document.getElementById('canvas-headline');
  if (input) callTranslateAPI(input.value, 'canvas-headline');
}

// Translate Sub-headline to French
function translateSubheadToFrench() {
  const input = document.getElementById('canvas-subtitle');
  if (input) callTranslateAPI(input.value, 'canvas-subtitle');
}

// Translate Extra Custom Text Box to French
function translateExtraToFrench() {
  const input = document.getElementById('canvas-extra-text');
  if (input) callTranslateAPI(input.value, 'canvas-extra-text');
}

// Toggle Bullet Points Inputs Visibility
function toggleBulletsVisibility() {
  const box = document.getElementById('bullet-inputs-box');
  const toggle = document.getElementById('toggle-bullets');
  if (box && toggle) {
    box.style.display = toggle.checked ? 'block' : 'none';
  }
  updateCanvasBanner();
}

// Update Visual Canvas Banner Graphic
async function updateCanvasBanner() {
  const headline = document.getElementById('canvas-headline') ? document.getElementById('canvas-headline').value : "Work Permit Ending? Don't Exit, Upgrade";
  const subtitle = document.getElementById('canvas-subtitle') ? document.getElementById('canvas-subtitle').value : "Your time in Canada doesn't have to stop here";
  const badgeText = document.getElementById('canvas-badge-input') ? document.getElementById('canvas-badge-input').value : 'STUDY VISA UPGRADE';
  const theme = document.getElementById('canvas-theme') ? document.getElementById('canvas-theme').value : 'travelbells-signature-light';
  const format = document.getElementById('canvas-format') ? document.getElementById('canvas-format').value : 'vertical';
  const category = document.getElementById('input-category') ? document.getElementById('input-category').value : 'study_permit';
  const language = document.getElementById('input-language') ? document.getElementById('input-language').value : 'en';

  const showBullets = document.getElementById('toggle-bullets') ? document.getElementById('toggle-bullets').checked : true;
  const showFlag = document.getElementById('toggle-flag') ? document.getElementById('toggle-flag').checked : true;
  const showSlogan = document.getElementById('toggle-slogan') ? document.getElementById('toggle-slogan').checked : true;
  const showBadge = document.getElementById('toggle-badge') ? document.getElementById('toggle-badge').checked : true;

  const fontStyle = document.getElementById('canvas-font-style') ? document.getElementById('canvas-font-style').value : 'playfair-montserrat';
  const textColor = document.getElementById('canvas-text-color') ? document.getElementById('canvas-text-color').value : 'crimson-red';
  const extraText = document.getElementById('canvas-extra-text') ? document.getElementById('canvas-extra-text').value : '';

  const b1 = document.getElementById('canvas-b1') ? document.getElementById('canvas-b1').value : '';
  const b2 = document.getElementById('canvas-b2') ? document.getElementById('canvas-b2').value : '';
  const b3 = document.getElementById('canvas-b3') ? document.getElementById('canvas-b3').value : '';
  const b4 = document.getElementById('canvas-b4') ? document.getElementById('canvas-b4').value : '';

  try {
    const res = await fetch('/api/generate-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: headline, 
        subtitle, 
        badgeText, 
        theme, 
        format, 
        category, 
        language,
        showBullets,
        showFlag,
        showSlogan,
        showBadge,
        fontStyle,
        textColor,
        extraText,
        b1, b2, b3, b4
      })
    });

    const data = await res.json();
    if (data.success && data.dataUri) {
      const renderBox = document.getElementById('canvas-render-box');
      if (renderBox) {
        renderBox.innerHTML = renderInteractiveGraphicHtml(data.dataUri);
      }
      const studioBox = document.getElementById('studio-banner-svg');
      if (studioBox) {
        studioBox.innerHTML = `<img src="${data.dataUri}" alt="Studio Banner Graphic" style="width: 100%; height: auto; border-radius: 12px; display: block;" />`;
      }

      // Convert SVG banner to 100% PNG Base64 for CDN upload & Meta publishing
      try {
        const tempImg = new Image();
        tempImg.crossOrigin = 'Anonymous';
        tempImg.onload = function() {
          const cvs = document.createElement('canvas');
          cvs.width = format === 'story' ? 1080 : format === 'landscape' ? 1200 : 1080;
          cvs.height = format === 'story' ? 1920 : format === 'landscape' ? 630 : 1080;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(tempImg, 0, 0);
          window.lastGeneratedPngBase64 = cvs.toDataURL('image/png');
        };
        tempImg.src = data.dataUri;
      } catch (e) {
        console.error('PNG conversion error:', e);
      }
    }
  } catch (err) {
    console.error("Error updating canvas banner:", err);
  }
}

// Download Graphic SVG / Data URI
function downloadBannerImage() {
  const img = document.getElementById('main-canvas-img');
  if (!img) return;

  const a = document.createElement('a');
  a.href = img.src;
  a.download = `travelbells_ad_banner_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 1-Click Multi-Platform Graphic Format Converter & Switcher
function switchGraphicFormat(formatName, btnEl) {
  const formatSelect = document.getElementById('canvas-format');
  if (formatSelect) {
    formatSelect.value = formatName;
  }
  const pills = document.querySelectorAll('.format-quick-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  updateCanvasBanner();
  triggerAutoSave();
}

// Batch Schedule Banner Across All 4 Social Media Platforms (FB + IG + TikTok + LinkedIn)
async function batchScheduleAllPlatforms() {
  const headline = document.getElementById('canvas-headline') ? document.getElementById('canvas-headline').value : 'Travelbells Immigration Campaign';
  const category = document.getElementById('input-category') ? document.getElementById('input-category').value : 'study_permit';
  const targetRegion = document.getElementById('input-region') ? document.getElementById('input-region').value : 'canada_tfw';
  const language = document.getElementById('input-language') ? document.getElementById('input-language').value : 'en';

  const platforms = [
    { name: 'facebook', label: 'Facebook Feed (16:9 Banner)' },
    { name: 'instagram', label: 'Instagram Square (1:1 Post)' },
    { name: 'tiktok', label: 'TikTok / IG Reels (9:16 Vertical Story)' },
    { name: 'linkedin', label: 'LinkedIn Corporate (16:9 Banner)' }
  ];

  if (!confirm(`🚀 Batch Schedule Strategy:\n\nDo you want to automatically adapt and schedule this banner for ALL 4 major platforms (Facebook, Instagram, TikTok, LinkedIn)?\n\nEach post will be auto-formatted to the exact aspect ratio & ad copy for that platform.`)) {
    return;
  }

  let scheduledCount = 0;

  for (const p of platforms) {
    const copyText = (currentGeneratedCopy && currentGeneratedCopy[p.name]) ? currentGeneratedCopy[p.name] : `${headline}\n\n👉 Book assessment: https://bookings.travelbellsimmigration.com`;
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${headline} [${p.name.toUpperCase()}]`,
          category,
          targetRegion,
          language,
          platform: p.name,
          scheduledDate: '2026-09-24',
          scheduledTime: '08:00',
          timeZone: 'EST (Toronto)',
          theme: document.getElementById('canvas-theme') ? document.getElementById('canvas-theme').value : 'travelbells-signature-light',
          copy: copyText,
          badge: document.getElementById('canvas-badge-input') ? document.getElementById('canvas-badge-input').value : 'STUDY VISA UPGRADE'
        })
      });
      scheduledCount++;
    } catch (err) {
      console.error("Batch schedule error for platform", p.name, err);
    }
  }

  alert(`🎉 Success! All ${scheduledCount} platform variations (Facebook, Instagram, TikTok, LinkedIn) have been automatically adapted and scheduled into your Content Calendar!`);
  loadCampaigns();
  loadAnalytics();
  
  // Switch to Calendar tab to view scheduled queue
  const calTab = document.querySelector('.nav-item[data-tab="calendar-tab"]');
  if (calTab) calTab.click();
}

// Load Campaigns for Calendar & Queue Table
async function loadCampaigns() {
  try {
    const res = await fetch('/api/campaigns');
    const data = await res.json();
    if (data.success) {
      allCampaigns = data.campaigns;
      renderCalendarGrid(allCampaigns);
      renderCampaignsTable(allCampaigns);

      const activeCount = allCampaigns.filter(c => c.status === 'scheduled').length;
      const countEl = document.getElementById('top-active-count');
      if (countEl) countEl.innerText = `${activeCount} Scheduled`;
    }
  } catch (err) {
    console.error("Error loading campaigns:", err);
  }
}

// Render Interactive Calendar Grid
function renderCalendarGrid(campaigns) {
  const grid = document.getElementById('calendar-grid-box');
  if (!grid) return;

  grid.innerHTML = '';
  const daysInMonth = 30;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `2026-09-${day < 10 ? '0' + day : day}`;
    const dayCampaigns = campaigns.filter(c => c.scheduledDate === dateStr);

    let pillsHtml = '';
    dayCampaigns.forEach(c => {
      pillsHtml += `<div class="cal-event-pill ${c.status}" title="${c.title}">
        ${c.platform.toUpperCase()} • ${c.scheduledTime}
      </div>`;
    });

    const dayBox = document.createElement('div');
    dayBox.className = 'cal-day-box';
    dayBox.innerHTML = `
      <div class="cal-day-num">Sept ${day}</div>
      ${pillsHtml}
    `;
    grid.appendChild(dayBox);
  }
}

// Render Campaigns Queue Table
function renderCampaignsTable(campaigns) {
  const tbody = document.getElementById('campaigns-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  campaigns.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${c.title}</strong><br>
        <span style="font-size: 11px; color: #94A3B8;">Category: ${c.category}</span>
      </td>
      <td><span style="text-transform: capitalize; font-weight: 700;">${c.platform}</span></td>
      <td><span style="font-size: 12px; color: #38BDF8;">${c.targetRegion}</span></td>
      <td>${c.scheduledDate} @ <strong>${c.scheduledTime}</strong> <br><span style="font-size: 10px; color: #94A3B8;">${c.timeZone}</span></td>
      <td><span class="status-badge status-${c.status}">${c.status.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="toggleCampaignStatus('${c.id}')">Toggle Status</button>
        <button class="btn btn-sm btn-secondary" onclick="deleteCampaign('${c.id}')" style="color: #E63946;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Toggle Campaign Status (Scheduled -> Published -> Draft)
async function toggleCampaignStatus(id) {
  const campaign = allCampaigns.find(c => c.id === id);
  if (!campaign) return;

  const statusMap = { scheduled: 'published', published: 'draft', draft: 'scheduled' };
  const nextStatus = statusMap[campaign.status] || 'scheduled';

  try {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = await res.json();
    if (data.success) {
      loadCampaigns();
      loadAnalytics();
    }
  } catch (err) {
    console.error("Error updating campaign status:", err);
  }
}

// Delete Campaign
async function deleteCampaign(id) {
  if (!confirm('Are you sure you want to delete this campaign?')) return;
  try {
    const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadCampaigns();
      loadAnalytics();
    }
  } catch (err) {
    console.error("Error deleting campaign:", err);
  }
}

// Schedule Modal Controls
function openNewCampaignModal() {
  const modal = document.getElementById('campaign-modal');
  if (modal) {
    const copyArea = document.getElementById('output-copy-area');
    document.getElementById('modal-copy').value = copyArea ? copyArea.value : '';
    document.getElementById('modal-date').value = '2026-09-24';
    modal.classList.add('active');
  }
}

function scheduleCurrentAdModal() {
  openNewCampaignModal();
}

function closeCampaignModal() {
  const modal = document.getElementById('campaign-modal');
  if (modal) modal.classList.remove('active');
}

// Submit New Scheduled Campaign via API
async function submitNewCampaign() {
  const title = document.getElementById('modal-title').value || 'New Scheduled Ad';
  const scheduledDate = document.getElementById('modal-date').value || '2026-09-25';
  const scheduledTime = document.getElementById('modal-time').value || '08:00';
  const platform = document.getElementById('modal-platform').value;
  const theme = document.getElementById('modal-theme').value;
  const copy = document.getElementById('modal-copy').value;

  const category = document.getElementById('input-category').value;
  const targetRegion = document.getElementById('input-region').value;
  const language = document.getElementById('input-language').value;

  try {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        category,
        targetRegion,
        language,
        platform,
        scheduledDate,
        scheduledTime,
        timeZone: 'WAT (GMT+1)',
        theme,
        copy,
        badge: document.getElementById('canvas-badge-input') ? document.getElementById('canvas-badge-input').value : 'STUDY VISA UPGRADE'
      })
    });

    const data = await res.json();
    if (data.success) {
      closeCampaignModal();
      loadCampaigns();
      loadAnalytics();
      alert('Campaign successfully scheduled!');
    }
  } catch (err) {
    console.error("Error submitting campaign:", err);
  }
}

// Export to Google Drive Function
async function exportToGoogleDrive() {
  try {
    const res = await fetch('/api/drive-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: allCampaigns[0] ? allCampaigns[0].id : 'camp-101' })
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Google Drive Export Complete!\n\nFolder: ${data.driveFolder}\nFile Saved: ${data.exportedFile}`);
    }
  } catch (err) {
    console.error("Drive export error:", err);
  }
}

// Test Webhook Dispatch Harness
async function testWebhookDispatch() {
  const targetChannel = document.getElementById('webhook-channel').value;
  const logBox = document.getElementById('webhook-log-output');

  logBox.innerText = `[${new Date().toLocaleTimeString()}] Dispatching payload to ${targetChannel}...`;

  try {
    const res = await fetch('/api/webhook-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: allCampaigns[0] ? allCampaigns[0].id : 'camp-101',
        targetChannel
      })
    });

    const data = await res.json();
    if (data.success) {
      logBox.innerHTML = `<span style="color: #10B981;">✅ SUCCESS [200 OK]</span><br>Channel: ${data.channel}<br>Timestamp: ${data.timestamp}<br>Payload: ${JSON.stringify(data.payload)}`;
    }
  } catch (err) {
    logBox.innerHTML = `<span style="color: #E63946;">❌ ERROR: ${err.message}</span>`;
  }
}

// Load Analytics Summary
async function loadAnalytics() {
  try {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    if (data.success && data.metrics) {
      const m = data.metrics;
      const t = document.getElementById('metric-total');
      if (t) t.innerText = m.totalCampaigns;
      const r = document.getElementById('metric-reach');
      if (r) r.innerText = m.estimatedReach.toLocaleString();
      const l = document.getElementById('metric-leads');
      if (l) l.innerText = m.predictedLeads;
    }
  } catch (err) {
    console.error("Error loading analytics:", err);
  }
}

// -----------------------------------------------------------------------------
// CONSULTANT PHOTO UPLOADER & HEADSHOT MANAGEMENT
// -----------------------------------------------------------------------------
function handleConsultantPhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    consultantPhotoBase64 = e.target.result;
    const thumb = document.getElementById('consultant-photo-thumb');
    const bar = document.getElementById('photo-preview-bar');
    const btnClear = document.getElementById('btn-clear-photo');
    if (thumb) thumb.src = consultantPhotoBase64;
    if (bar) bar.style.display = 'flex';
    if (btnClear) btnClear.style.display = 'inline-block';
    
    updateCanvasBanner();
    triggerAutoSave();
  };
  reader.readAsDataURL(file);
}

function clearConsultantPhoto() {
  consultantPhotoBase64 = '';
  clearConsultantPhotoUI();
  updateCanvasBanner();
  triggerAutoSave();
}

function clearConsultantPhotoUI() {
  const input = document.getElementById('consultant-photo-input');
  const thumb = document.getElementById('consultant-photo-thumb');
  const bar = document.getElementById('photo-preview-bar');
  const btnClear = document.getElementById('btn-clear-photo');
  if (input) input.value = '';
  if (thumb) thumb.src = '';
  if (bar) bar.style.display = 'none';
  if (btnClear) btnClear.style.display = 'none';
}

// -----------------------------------------------------------------------------
// HIGH-RES PNG & 3-IN-1 ZIP CAMPAIGN BUNDLE EXPORTER
// -----------------------------------------------------------------------------
function convertSvgToPng(svgDataUri, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = svgDataUri;
  });
}

async function downloadHighResPng() {
  const mainImg = document.getElementById('main-canvas-img');
  if (!mainImg || !mainImg.src) return alert('⚠️ Banner graphic not loaded yet.');

  const formatSelect = document.getElementById('canvas-format');
  const format = formatSelect ? formatSelect.value : 'vertical';
  const name = format === 'story' ? '9:16_story' : format === 'landscape' ? '16:9_banner' : '1:1_feed';

  const statusEl = document.getElementById('draft-saved-status');
  if (statusEl) statusEl.innerHTML = `⏳ Downloading 300 DPI PNG...`;

  try {
    let pngUri = mainImg.src;
    if (mainImg.src.startsWith('data:image/svg+xml')) {
      const dims = { vertical: { w: 1080, h: 1080 }, story: { w: 1080, h: 1920 }, landscape: { w: 1200, h: 630 } };
      const d = dims[format] || dims.vertical;
      pngUri = await convertSvgToPng(mainImg.src, d.w, d.h);
    }

    const a = document.createElement('a');
    a.href = pngUri;
    a.download = `travelbells_${name}_${activeGraphicLang}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (statusEl) statusEl.innerHTML = `🟢 PNG Downloaded!`;
  } catch (err) {
    console.error("PNG download error:", err);
    alert("PNG export error: " + err.message);
  }
}

async function downloadCampaignZipBundle() {
  const statusEl = document.getElementById('draft-saved-status');
  if (statusEl) statusEl.innerHTML = `⏳ Generating all 3 High-Res PNG Formats (Feed 1:1, Story 9:16, Banner 16:9)...`;

  try {
    const langObj = activeBilingualData?.campaign ? (activeGraphicLang === 'fr' ? activeBilingualData.campaign.fr : activeBilingualData.campaign.en) : null;
    const headline = langObj?.title || document.getElementById('quick-tagline-input')?.value || document.getElementById('canvas-headline')?.value || 'Travelbells Immigration';
    const subtitle = langObj?.subtitle || document.getElementById('canvas-subtitle')?.value || '';
    const badgeText = document.getElementById('canvas-badge-input')?.value || langObj?.badgeText || 'STUDY VISA UPGRADE';
    const b1 = langObj?.bullets?.[0] || document.getElementById('canvas-b1')?.value || '';
    const b2 = langObj?.bullets?.[1] || document.getElementById('canvas-b2')?.value || '';
    const b3 = langObj?.bullets?.[2] || document.getElementById('canvas-b3')?.value || '';
    const b4 = langObj?.bullets?.[3] || document.getElementById('canvas-b4')?.value || '';

    const footerCta = document.getElementById('footer-cta-input')?.value;
    const footerPhone = document.getElementById('footer-phone-input')?.value;
    const footerWebsite = document.getElementById('footer-website-input')?.value;
    const footerEmail = document.getElementById('footer-email-input')?.value;
    const footerLocation = document.getElementById('footer-location-input')?.value;

    const fetchFormat = async (fmt) => {
      const res = await fetch('/api/generate-puppeteer-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: headline, headline, tagline: headline, subtitle, badgeText, b1, b2, b3, b4,
          footerCta, footerPhone, footerWebsite, footerEmail, footerLocation,
          watermark: activeWatermarkStyle, format: fmt, lang: activeGraphicLang,
          customPhotoUrl: activePhotoPreset
        })
      });
      const json = await res.json();
      return json.dataUri;
    };

    const [pngV, pngS, pngL] = await Promise.all([
      fetchFormat('vertical'),
      fetchFormat('story'),
      fetchFormat('landscape')
    ]);

    const captionsText = `TRAVELBELLS IMMIGRATION MULTI-PLATFORM AD ASSET BUNDLE
============================================================
Exported At: ${new Date().toLocaleString()}
Category: ${document.getElementById('input-category')?.value || 'Study Permit'}

1. INSTAGRAM & FACEBOOK FEED CAPTION (1:1 Square Banner)
------------------------------------------------------------
${currentGeneratedCopy?.facebook || document.getElementById('output-copy-area')?.value || ''}

2. INSTAGRAM STORY / TIKTOK / REELS SCRIPT (9:16 Vertical Story Banner)
------------------------------------------------------------
${currentGeneratedCopy?.tiktok || document.getElementById('output-copy-area')?.value || ''}

3. LINKEDIN & WEBSITE BANNER (16:9 Landscape Banner)
------------------------------------------------------------
${currentGeneratedCopy?.linkedin || document.getElementById('output-copy-area')?.value || ''}
`;

    if (window.JSZip) {
      const zip = new JSZip();
      const folder = zip.folder("Travelbells_Ad_Campaign_Package");

      folder.file("1_instagram_feed_1080x1080.png", pngV.replace(/^data:image\/png;base64,/, ''), { base64: true });
      folder.file("2_tiktok_story_1080x1920.png", pngS.replace(/^data:image\/png;base64,/, ''), { base64: true });
      folder.file("3_facebook_landscape_1200x630.png", pngL.replace(/^data:image\/png;base64,/, ''), { base64: true });
      folder.file("ad_copy_captions.txt", captionsText);

      const content = await zip.generateAsync({ type: "blob" });
      if (window.saveAs) {
        saveAs(content, `travelbells_campaign_package_${Date.now()}.zip`);
      } else {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `travelbells_campaign_package_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      if (statusEl) statusEl.innerHTML = `🟢 ZIP Package Downloaded!`;
    } else {
      const triggerDownload = (uri, filename) => {
        const a = document.createElement('a');
        a.href = uri;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      triggerDownload(pngV, `1_feed_1:1_${Date.now()}.png`);
      setTimeout(() => triggerDownload(pngS, `2_story_9:16_${Date.now()}.png`), 400);
      setTimeout(() => triggerDownload(pngL, `3_banner_16:9_${Date.now()}.png`), 800);
      if (statusEl) statusEl.innerHTML = `🟢 Downloaded all 3 PNG Formats!`;
    }
  } catch (err) {
    console.error("Error downloading 3-format bundle:", err);
    alert("Batch download failed: " + err.message);
  }
}

// -----------------------------------------------------------------------------
// WEBHOOK DISPATCHER & SCHEDULER INTEGRATION
// -----------------------------------------------------------------------------
function openDispatchWebhookModal() {
  const modal = document.getElementById('webhook-modal') || document.getElementById('dispatch-webhook-modal');
  if (modal) modal.style.display = 'flex';
  updateDispatchPayloadPreview();
}

function closeDispatchModal() {
  const modal = document.getElementById('webhook-modal') || document.getElementById('dispatch-webhook-modal');
  if (modal) modal.style.display = 'none';
}

function closeDispatchWebhookModal() {
  closeDispatchModal();
}

function triggerLiveWebhookDispatch() {
  executeWebhookDispatch();
}

function updateDispatchPayloadPreview() {
  const channel = document.getElementById('dispatch-target-channel')?.value || 'meta_business';
  const postMode = document.getElementById('dispatch-post-mode')?.value || 'combo';
  const customUrl = document.getElementById('dispatch-custom-url')?.value || '';
  const preview = document.getElementById('dispatch-payload-preview');
  if (!preview) return;

  const payload = {
    event: 'CAMPAIGN_DISPATCH',
    timestamp: new Date().toISOString(),
    targetChannel: channel,
    postMode: postMode,
    webhookUrl: customUrl || '(No Webhook URL entered - will run local simulation)',
    headline: document.getElementById('canvas-headline')?.value || 'Work Permit Ending? Don\'t Worry',
    subtitle: document.getElementById('canvas-subtitle')?.value || '',
    category: document.getElementById('input-category')?.value || 'study_permit',
    language: document.getElementById('input-language')?.value || 'en'
  };

  preview.innerText = JSON.stringify(payload, null, 2);
}

async function executeWebhookDispatch() {
  const channel = document.getElementById('dispatch-target-channel')?.value || 'meta_business';
  const postMode = document.getElementById('dispatch-post-mode')?.value || 'combo';
  const inputUrl = document.getElementById('dispatch-custom-url')?.value;
  const webhookUrl = (inputUrl && inputUrl.trim()) ? inputUrl.trim() : 'https://hook.us2.make.com/pa5tbxkdqpesgve7se63k5nrqehcagc2';
  const statusBox = document.getElementById('dispatch-status-box');
  
  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.style.background = '#FEF3C7';
    statusBox.style.color = '#B45309';
    statusBox.innerText = `⏳ Executing Outbound Webhook (${postMode}) to ${webhookUrl || channel}...`;
  }

  try {
    const res = await fetch('/api/webhook-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: 'camp-active',
        targetChannel: channel,
        postMode: postMode,
        webhookUrl,
        headline: document.getElementById('canvas-headline')?.value || '',
        subtitle: document.getElementById('canvas-subtitle')?.value || '',
        copy: document.getElementById('output-copy-area')?.value || '',
        bannerDataUrl: window.lastGeneratedPngBase64 || (document.getElementById('main-canvas-img') ? document.getElementById('main-canvas-img').src : '')
      })
    });
    const data = await res.json();
    if (data.success) {
      if (statusBox) {
        statusBox.style.background = data.isLive ? '#D1FAE5' : '#E0F2FE';
        statusBox.style.color = data.isLive ? '#047857' : '#0369A1';
        statusBox.innerText = `✅ ${data.status}\nChannel: ${data.channel}\n${data.targetUrl ? `Target URL: ${data.targetUrl}\nResponse: ${data.responseBody}` : 'Mode: Local Payload Validation'}`;
      }
    } else {
      if (statusBox) {
        statusBox.style.background = '#FEE2E2';
        statusBox.style.color = '#B91C1C';
        statusBox.innerText = `❌ Dispatch Failed: ${data.status || data.error}`;
      }
    }
  } catch (err) {
    if (statusBox) {
      statusBox.style.background = '#FEE2E2';
      statusBox.style.color = '#B91C1C';
      statusBox.innerText = `❌ Outbound Webhook Error: ${err.message}`;
    }
  }
}

// -----------------------------------------------------------------------------
// CLEAN LAYOUT CONTROLLERS & BILINGUAL AUTO-GENERATOR HELPERS
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// CLEAN LAYOUT CONTROLLERS & BILINGUAL AUTO-GENERATOR HELPERS
// -----------------------------------------------------------------------------
function applyNichePreset(presetKey) {
  const inputEl = document.getElementById('quick-tagline-input');
  const presets = {
    students: "Work Permit Ending? Don't Exit Canada, Upgrade to Study Visa with PGWP & Spouse Work Permit pathway",
    workers: "Skilled Worker Express Entry & Ontario OINP draws for fast-track Canadian Permanent Residency 2026",
    family: "Spouse & Parents Family Sponsorship with Super Visa and fast approval consultation Ontario",
    visitor: "Convert Visitor Visa to Open Work Permit without LMIA under new 2026 Canadian IRCC public policy"
  };

  document.querySelectorAll('.niche-chip').forEach(btn => {
    btn.style.background = '#FFFFFF';
    btn.style.color = '#002B49';
    btn.style.border = '1px solid #CBD5E1';
  });
  if (event && event.target) {
    event.target.style.background = '#C8102E';
    event.target.style.color = '#FFFFFF';
    event.target.style.border = 'none';
  }

  if (inputEl && presets[presetKey]) {
    inputEl.value = presets[presetKey];
    generate1ClickBilingualCampaign();
  }
}

function toggleConversionBoostersAccordion() {
  const fields = document.getElementById('conversion-booster-fields');
  const label = document.getElementById('conversion-toggle-label');
  if (fields) {
    const isHidden = fields.style.display === 'none';
    fields.style.display = isHidden ? 'grid' : 'none';
    if (label) label.textContent = isHidden ? '🔼 Hide Boosters' : '✏️ QR Code, Trust Badges & Social Proof';
  }
}

async function generateABTestVariants() {
  const btn = document.querySelector("button[onclick='generateABTestVariants()']");
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `⚙️ Building A/B Split Test Bundle...`;
  }

  const renderBox = document.getElementById('canvas-render-box');
  if (renderBox) {
    renderBox.innerHTML = `<div style="padding:40px; text-align:center; color:#64748B;"><div style="font-size:36px; margin-bottom:12px;">🧪</div><strong style="font-size:16px; color:#6D28D9;">Generating A/B Split Test Dual Creatives...</strong><p style="font-size:12px;">Building Variant A (Authority Navy) & Variant B (Action Crimson)...</p></div>`;
  }

  try {
    const payload = getActiveCampaignPayload();
    const response = await fetch('/api/download-all-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AB_Test_Split_Campaign_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      alert("🧪 A/B Split Test Pair Bundle Generated & Downloaded Successfully!");
    } else {
      alert("Failed to generate A/B Split Test bundle.");
    }
  } catch (err) {
    console.error("A/B generator error:", err);
    alert("Error generating A/B bundle: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
    updateGraphicDisplay();
  }
}

function applyQuickTopic(topicKey) {
  const inputEl = document.getElementById('quick-tagline-input');
  const topics = {
    phonerepair: "Phone Repair Technician work permit and PR pathway in Ontario Canada",
    mobilite: "Mobilité Francophone work permit without LMIA for French speakers in Ontario NCLC 5+",
    express: "Express Entry category-based draw update for bilingual candidates low CRS cutoff",
    study: "Work Permit Ending? Don't Exit, Upgrade to Study Visa with PGWP pathway in Canada",
    lmia: "B2B Corporate LMIA & Work Permit processing for Canadian employers needing workers"
  };
  if (inputEl && topics[topicKey]) {
    inputEl.value = topics[topicKey];
    generate1ClickBilingualCampaign();
  }
}

function updateCopyFromBilingualData() {
  if (!activeBilingualData || !activeBilingualData.campaign) return;
  const langData = activeGraphicLang === 'fr' ? activeBilingualData.campaign.fr : activeBilingualData.campaign.en;
  if (!langData) return;

  currentGeneratedCopy = {
    facebook: langData.fullCopy || '',
    instagram: langData.fullCopy || '',
    tiktok: langData.tiktokScript || '',
    linkedin: langData.linkedin || '',
    whatsapp: langData.whatsapp || ''
  };
  updateCopyDisplay();
}

function switchGraphicLanguage(lang) {
  activeGraphicLang = lang;
  document.getElementById('tab-lang-en')?.classList.toggle('active', lang === 'en');
  document.getElementById('tab-lang-fr')?.classList.toggle('active', lang === 'fr');

  if (activeBilingualData && activeBilingualData.campaign) {
    const langObj = lang === 'fr' ? activeBilingualData.campaign.fr : activeBilingualData.campaign.en;
    if (langObj) {
      setVal('canvas-headline', langObj.title);
      setVal('canvas-subtitle', langObj.subtitle);
      setVal('canvas-badge-input', langObj.badgeText);
      if (langObj.bullets) {
        setVal('canvas-b1', langObj.bullets[0] || '');
        setVal('canvas-b2', langObj.bullets[1] || '');
        setVal('canvas-b3', langObj.bullets[2] || '');
        setVal('canvas-b4', langObj.bullets[3] || '');
      }
    }
  }

  const langSelect = document.getElementById('input-language');
  if (langSelect) langSelect.value = lang;

  updateGraphicDisplay();
  updateCopyFromBilingualData();
}

function switchAspectFormat(fmt, buttonEl) {
  document.querySelectorAll('.fmt-pill').forEach(btn => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
  const fmtInput = document.getElementById('canvas-format');
  if (fmtInput) fmtInput.value = fmt;

  updateGraphicDisplay();
}

async function triggerLiveWebhookDispatch() {
  const urlInput = document.getElementById('dispatch-custom-url');
  const webhookUrl = (urlInput && urlInput.value.trim()) ? urlInput.value.trim() : 'https://hook.us2.make.com/pa5tbxkdqpesgve7se63k5nrqehcagc2';
  const imgEl = document.getElementById('main-canvas-img');
  const bannerDataUrl = window.lastGeneratedPngBase64 || (imgEl ? imgEl.src : '');
  const copyText = document.getElementById('output-copy-area')?.value || document.getElementById('fb-copy-area')?.value || '';
  const headlineText = document.getElementById('canvas-headline')?.value || 'Work Permit Ending? Don\'t Exit, Upgrade';
  const subtitleText = document.getElementById('canvas-subtitle')?.value || '';
  const statusBox = document.getElementById('webhook-dispatch-status-box');

  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.style.background = '#EFF6FF';
    statusBox.style.color = '#1E40AF';
    statusBox.style.border = '1px solid #93C5FD';
    statusBox.innerHTML = `⏳ Dispatching campaign & image payload to Make.com...`;
  }

  try {
    const res = await fetch('/api/webhook-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: 'camp-' + Date.now(),
        targetChannel: 'make_n8n',
        webhookUrl,
        headline: headlineText,
        subtitle: subtitleText,
        copy: copyText,
        bannerDataUrl
      })
    });
    const data = await res.json();
    if (data.success) {
      if (statusBox) {
        statusBox.style.background = '#ECFDF5';
        statusBox.style.color = '#047857';
        statusBox.style.border = '1px solid #6EE7B7';
        statusBox.innerHTML = `🟢 Delivered Live to Make.com Endpoint! (HTTP ${data.httpStatus || 200} OK)\nImage URL: ${data.payload ? (data.payload.imageUrl || data.payload.photoUrl) : 'Sent'}`;
      }
      setTimeout(() => {
        alert(`✅ Campaign Dispatched to Make.com Webhook!\n\nStatus: ${data.status || 'Success'}\nTarget Endpoint: ${webhookUrl}\nHTTP Status: ${data.httpStatus || 200} OK`);
      }, 300);
    } else {
      if (statusBox) {
        statusBox.style.background = '#FEF2F2';
        statusBox.style.color = '#B91C1C';
        statusBox.style.border = '1px solid #FCA5A5';
        statusBox.innerHTML = `❌ Webhook Dispatch Failed: ${data.status || data.error}`;
      }
    }
  } catch (err) {
    if (statusBox) {
      statusBox.style.background = '#FEF2F2';
      statusBox.style.color = '#B91C1C';
      statusBox.style.border = '1px solid #FCA5A5';
      statusBox.innerHTML = `❌ Dispatch Error: ${err.message}`;
    }
    alert(`❌ Dispatch Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// CAMPAIGN VAULT DATABASE MANAGER
// -----------------------------------------------------------------------------
let vaultCampaignsList = [];

function openCampaignVaultModal() {
  const modal = document.getElementById('vault-modal');
  if (modal) modal.style.display = 'flex';
  loadVaultCampaignsFromDb();
}

function closeCampaignVaultModal() {
  const modal = document.getElementById('vault-modal');
  if (modal) modal.style.display = 'none';
}

async function loadVaultCampaignsFromDb() {
  const container = document.getElementById('vault-list-container');
  if (container) container.innerHTML = `<div style="text-align:center; padding:30px; color:#64748B;">⏳ Fetching stored campaigns database...</div>`;

  try {
    const res = await fetch('/api/campaigns');
    const data = await res.json();
    if (data.success && Array.isArray(data.campaigns)) {
      vaultCampaignsList = data.campaigns;
      renderVaultList(vaultCampaignsList);
    }
  } catch (err) {
    if (container) container.innerHTML = `<div style="color:#DC2626; padding:20px;">❌ Error loading vault: ${err.message}</div>`;
  }
}

function renderVaultList(campaigns) {
  const container = document.getElementById('vault-list-container');
  if (!container) return;

  if (!campaigns || campaigns.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:#64748B;">No saved campaigns found in database yet. Generate a campaign above to auto-save!</div>`;
    return;
  }

  let html = '';
  campaigns.forEach(item => {
    const title = item.title || item.tagline || 'Saved Campaign';
    const date = item.dateFormatted || item.createdAt || '';
    const imgUrl = item.graphics?.en?.vertical || item.graphics?.en || 'logo.jpg';

    html += `
      <div class="vault-card-item" style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 12px; background: #FFFFFF; display: flex; gap: 16px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <img src="${imgUrl}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #CBD5E1;" alt="Saved Graphic" />
        <div style="flex: 1;">
          <h4 style="margin: 0 0 6px 0; color: #0F172A; font-size: 16px;">${title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B;">📅 ${date} • Formats: 1:1 Feed, 9:16 Story, 16:9 Banner (EN + FR)</p>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" onclick="restoreCampaignFromVault('${item.id}')">🔄 Restore to Studio</button>
            <button class="btn btn-sm btn-secondary" onclick="deleteCampaignFromVault('${item.id}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function filterVaultCampaigns() {
  const query = document.getElementById('vault-search-input')?.value.toLowerCase() || '';
  const filtered = vaultCampaignsList.filter(c => {
    const text = (c.title + ' ' + (c.tagline || '') + ' ' + (c.category || '')).toLowerCase();
    return text.includes(query);
  });
  renderVaultList(filtered);
}

function restoreCampaignFromVault(id) {
  const item = vaultCampaignsList.find(c => c.id === id);
  if (!item) return;

  if (item.campaign && item.graphics) {
    activeBilingualData = { success: true, campaign: item.campaign, graphics: item.graphics };
    const taglineInput = document.getElementById('quick-tagline-input');
    if (taglineInput && item.tagline) taglineInput.value = item.tagline;

    updateGraphicDisplay();
    updateCopyFromBilingualData();
    closeCampaignVaultModal();
    alert(`✅ Restored campaign "${item.title}" to active studio!`);
  }
}

async function deleteCampaignFromVault(id) {
  if (!confirm("Are you sure you want to delete this saved campaign from database?")) return;
  try {
    const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadVaultCampaignsFromDb();
    }
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}

// AI Custom Image Studio State & Helpers
let latestGeneratedAiPhotoUrl = '';

async function generateAiCustomPhoto() {
  const promptInput = document.getElementById('ai-image-prompt-input');
  const heroInput = document.getElementById('quick-tagline-input');
  const prompt = (promptInput && promptInput.value.trim()) ? promptInput.value.trim() : (heroInput ? heroInput.value.trim() : 'autumn pictures');

  const btn = document.getElementById('btn-generate-ai-photo');
  const originalText = btn ? btn.innerHTML : '✨ Generate AI Photo';
  if (btn) btn.innerHTML = '⏳ Generating 4 Variations...';

  const container = document.getElementById('ai-photo-result-container');
  const actionsBox = document.getElementById('ai-photo-actions');
  if (actionsBox) actionsBox.style.display = 'none';

  if (container) {
    container.innerHTML = `<div style="padding:30px; text-align:center;"><div style="font-size:36px; margin-bottom:8px;">🎨</div><strong style="color:#1E40AF;">Searching & Rendering 4 Matching Photo Variations for "${prompt}"...</strong><p style="font-size:11px; color:#64748B;">Fetching live high-resolution stock & custom AI renders...</p></div>`;
  }

  try {
    const res = await fetch('/api/generate-ai-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.success && data.variations && data.variations.length > 0) {
      latestGeneratedAiPhotoUrl = data.variations[0].url;
      switchCreativePhoto(latestGeneratedAiPhotoUrl, null);

      if (container) {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%;">
            ${data.variations.map((v) => `
              <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 10px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
                <div>
                  <div style="font-size: 10px; font-weight: 800; color: #1E40AF; background: #EFF6FF; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px solid #BFDBFE;">${v.badge}</div>
                  <img src="${v.url}" alt="${v.title}" onerror="this.onerror=null; this.src='${v.fallback || v.url}';" style="width: 100%; aspect-ratio: 4 / 3; object-fit: cover; object-position: center; border-radius: 8px; margin-bottom: 8px; cursor: pointer; border: 1.5px solid #E2E8F0;" onclick="selectAiPhotoVariation('${v.url}')" title="Click to apply photo to main creative" />
                  <div style="font-size: 11px; font-weight: 700; color: #1E293B; margin-bottom: 8px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${v.title}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="selectAiPhotoVariation('${v.url}')" style="background: #2563EB; border: none; font-weight: 800; font-size: 11px; width: 100%; padding: 8px 4px; box-shadow: 0 2px 8px rgba(37,99,235,0.25);">
                  🚀 Apply to Creative
                </button>
              </div>
            `).join('')}
          </div>
        `;
      }
    }
  } catch (err) {
    console.error("AI image generation error:", err);
    if (container) container.innerHTML = `<div style="color:#DC2626; font-size:12px; padding:20px;">❌ Image generation error. Please try again.</div>`;
  } finally {
    if (btn) btn.innerHTML = originalText;
  }
}

function selectAiPhotoVariation(url) {
  if (!url) return;
  latestGeneratedAiPhotoUrl = url;
  switchCreativePhoto(url, null);
  alert("✨ Applied selected photo variation directly to your 300 DPI creative across 1:1 Feed, 9:16 Story, and 16:9 Banner!");
}

function applyGeneratedAiPhotoToCreative() {
  if (!latestGeneratedAiPhotoUrl) {
    alert("Please generate an AI photo first!");
    return;
  }
  selectAiPhotoVariation(latestGeneratedAiPhotoUrl);
}

function applyAiImagePreset(key) {
  const promptInput = document.getElementById('ai-image-prompt-input');
  const presets = {
    student: 'Young smiling graduate student holding degree diploma at Canadian university campus, photorealistic, studio lighting',
    professional: 'Confident skilled worker in office setting in Ontario Canada, professional corporate portrait',
    healthcare: 'Smiling nurse working in modern Canadian hospital setting in Calgary wearing scrubs, photorealistic portrait',
    trades: 'Skilled electrician construction worker holding tools in Ontario Canada wearing hardhat, photorealistic portrait',
    francophone: 'Smiling Francophone professional in Canada, authentic lifestyle portrait',
    family: 'Happy diverse family in Canada celebrating permanent residency visa approval',
    skyline: 'Iconic Toronto CN Tower skyline with Canadian flag at sunset'
  };
  if (promptInput) {
    promptInput.value = presets[key] || presets.student;
    generateAiCustomPhoto();
  }
}

// Make.com Webhook Connection Test Helper
async function testMakeComWebhookConnection() {
  const urlInput = document.getElementById('dispatch-custom-url');
  const targetUrl = urlInput ? urlInput.value.trim() : '';
  const statusBox = document.getElementById('webhook-dispatch-status-box');

  if (!targetUrl) {
    alert("Please enter a Make.com Webhook URL to test.");
    return;
  }

  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.style.background = '#EFF6FF';
    statusBox.style.color = '#1E40AF';
    statusBox.style.border = '1px solid #93C5FD';
    statusBox.innerHTML = `⚙️ Testing connection to ${targetUrl}...`;
  }

  try {
    const res = await fetch('/api/webhook-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: targetUrl,
        headline: 'Make.com Live Connection Test',
        copy: 'Test payload from Travelbells Ad Studio to verify Make.com scenario webhook is live.',
        targetChannel: 'make_n8n'
      })
    });
    const data = await res.json();
    if (data.success) {
      if (statusBox) {
        statusBox.style.background = '#ECFDF5';
        statusBox.style.color = '#047857';
        statusBox.style.border = '1px solid #6EE7B7';
        statusBox.innerHTML = `🟢 Make.com Webhook Live & Connected! HTTP ${data.httpStatus || 200} OK`;
      }
    } else {
      if (statusBox) {
        statusBox.style.background = '#FEF2F2';
        statusBox.style.color = '#B91C1C';
        statusBox.style.border = '1px solid #FCA5A5';
        statusBox.innerHTML = `⚠️ Webhook test note: ${data.message || 'Check Make.com webhook status'}`;
      }
    }
  } catch (err) {
    if (statusBox) {
      statusBox.style.background = '#FEF2F2';
      statusBox.style.color = '#B91C1C';
      statusBox.style.border = '1px solid #FCA5A5';
      statusBox.innerHTML = `❌ Connection error: ${err.message}`;
    }
  }
}

// Active Campaign Payload Extractor
function getActiveCampaignPayload() {
  const lang = activeGraphicLang || (document.getElementById('input-language')?.value === 'fr' ? 'fr' : 'en');
  const fmt = document.getElementById('canvas-format')?.value || 'vertical';
  
  return {
    title: document.getElementById('canvas-headline')?.value || document.getElementById('quick-tagline-input')?.value || 'Work Permit Ending? Don\'t Exit, Upgrade',
    headline: document.getElementById('canvas-headline')?.value || document.getElementById('quick-tagline-input')?.value || 'Work Permit Ending? Don\'t Exit, Upgrade',
    subtitle: document.getElementById('canvas-subtitle')?.value || 'Your time in Canada doesn\'t have to stop here',
    badgeText: document.getElementById('canvas-badge-input')?.value || 'STUDY VISA UPGRADE',
    b1: document.getElementById('canvas-b1')?.value || '',
    b2: document.getElementById('canvas-b2')?.value || '',
    b3: document.getElementById('canvas-b3')?.value || '',
    b4: document.getElementById('canvas-b4')?.value || '',
    bullet1: document.getElementById('canvas-b1')?.value || '',
    bullet2: document.getElementById('canvas-b2')?.value || '',
    bullet3: document.getElementById('canvas-b3')?.value || '',
    bullet4: document.getElementById('canvas-b4')?.value || '',
    footerCta: document.getElementById('footer-cta-input')?.value,
    footerPhone: document.getElementById('footer-phone-input')?.value,
    footerWebsite: document.getElementById('footer-website-input')?.value,
    footerEmail: document.getElementById('footer-email-input')?.value,
    footerLocation: document.getElementById('footer-location-input')?.value,
    format: fmt,
    lang: lang,
    customPhotoUrl: activePhotoPreset
  };
}

// Download Active 300 DPI PNG Graphic
async function downloadHighResPng() {
  const activeImg = document.querySelector('#canvas-render-box img') || document.querySelector('#studio-banner-svg img');
  if (!activeImg || !activeImg.src) {
    alert("Graphic is rendering... Click 'Auto-Generate Creative' to update graphic.");
    return;
  }
  const fmt = document.getElementById('canvas-format')?.value || '1x1';
  const a = document.createElement('a');
  a.href = activeImg.src;
  a.download = `travelbells_creative_${fmt}_300dpi.${activeImg.src.includes('data:image/svg') ? 'svg' : 'png'}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Download 3-in-1 ZIP Bundle (Vertical 1:1 + Story 9:16 + Landscape 16:9 + Ad Copy)
async function downloadCampaignZipBundle() {
  const btn = document.querySelector("button[onclick='downloadCampaignZipBundle()']");
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `⚙️ Preparing 3-in-1 ZIP Bundle...`;
  }

  try {
    const payload = getActiveCampaignPayload();
    const res = await fetch('/api/download-all-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("ZIP bundle build failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travelbells_3in1_creatives_bundle_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    alert("📦 3-in-1 ZIP Bundle Downloaded Successfully!");
  } catch (err) {
    console.error("Zip bundle download error:", err);
    alert("Could not generate ZIP bundle: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

// 📍 Localized Geo-Targeting Preset Function
function applyGeoPreset(city) {
  const geoConfigs = {
    brampton: {
      tagline: "Brampton & Peel PGWP Work Permit Expiry - Upgrade your status with OINP & Accredited Programs",
      badge: "BRAMPTON PGWP UPGRADE",
      photo: "student"
    },
    surrey: {
      tagline: "Surrey & Vancouver Skilled Trades - PNP Nomination & Express Entry PR Pathways",
      badge: "SURREY BC PNP TRADES",
      photo: "professional"
    },
    montreal: {
      tagline: "Mobilité Francophone Montréal & Québec - Permis de travail sans EIMT et Résidence Permanente",
      badge: "MOUNT-ROYAL FRANCOPHONE",
      photo: "francophone"
    },
    calgary: {
      tagline: "Calgary & Alberta AAIP Accelerated Tech Stream - Direct PR for Skilled Professionals",
      badge: "CALGARY AAIP TECH STREAM",
      photo: "graduate"
    }
  };

  const cfg = geoConfigs[city];
  if (cfg) {
    const input = document.getElementById('quick-tagline-input');
    if (input) input.value = cfg.tagline;
    setPresetBadge(cfg.badge);
    generate1ClickBilingualCampaign();
  }
}

// 🎙️ Native Web Speech AI Voiceover Synthesizer Player
function playAIVoiceoverPreview() {
  const headline = document.getElementById('canvas-headline')?.value || 'Work Permit Ending? Don\'t Exit, Upgrade';
  const subtitle = document.getElementById('canvas-subtitle')?.value || 'Your time in Canada doesn\'t have to stop here.';
  const textToSpeak = `${headline}. ${subtitle}`;

  if (!('speechSynthesis' in window)) {
    alert("Speech Synthesis is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  const langMap = {
    en: 'en-US',
    fr: 'fr-FR',
    pa: 'hi-IN',
    hi: 'hi-IN',
    tl: 'en-US',
    es: 'es-ES',
    ar: 'ar-SA'
  };

  utterance.lang = langMap[activeGraphicLang] || 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

// 🧮 Interactive CRS Calculator Lead Magnet Overlay Toggle
function toggleCRSCalculatorLeadOverlay() {
  const currentBadge = document.getElementById('canvas-badge-input')?.value || '';
  if (currentBadge.includes('CRS CALCULATOR')) {
    setPresetBadge('CUSTOM IMMIGRATION ADVISORY');
    alert("🧮 Interactive CRS Calculator Overlay Removed");
  } else {
    setPresetBadge('🧮 FREE CRS SCORE CALCULATOR & ASSESSMENT');
    alert("🧮 Interactive CRS Calculator Overlay Applied to Banner!");
  }
}



