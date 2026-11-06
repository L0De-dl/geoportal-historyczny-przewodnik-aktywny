(function () {
  const storageKey = 'geoportal-golancz-guide-seen-v1';
  const steps = [
    {
      title: 'Poznaj historię Gołańczy',
      description: 'Odkrywaj, jak miasto zmieniało się w czasie, porównując dawne mapy, warstwy i fotografie. Przewodnik pokaże Ci najważniejsze możliwości geoportalu.',
      action: 'start'
    },
    {
      title: 'Porównuj lata na suwakach',
      description: 'Przesuń dowolny suwak w panelu, aby wybrać inny rok podkładu mapowego, zabudowy, komunikacji lub zdjęć.',
      focus: ['#suwak-czasu', '#suwak-zabudowa', '#suwak-komunikacja', '#suwak-zdjecia'],
      action: 'sliders'
    },
    {
      title: 'Włączaj i wyłączaj widoczność',
      description: 'Użyj przycisku oka przy dowolnej warstwie, aby ją ukryć, a następnie ponownie włącz jej widoczność.',
      focus: ['#btn-toggle-podklad', '#btn-toggle-zabudowa', '#btn-toggle-komunikacja', '#btn-toggle-zdjecia'],
      action: 'visibility'
    },
    {
      title: 'Otwórz archiwalne zdjęcie',
      description: 'Wybierz na suwaku rok, dla którego dostępne są zdjęcia. Kliknij ikonę zdjęcia na mapie, aby je otworzyć, a następnie zamknij popup.',
      focus: '#suwak-zdjecia',
      action: 'photo'
    },
    {
      title: 'Rysuj, mierz i eksportuj',
      description: 'Narysuj co najmniej trzy obiekty. Następnie edytuj jeden z nich, usuń wybrany obiekt (może być ten sam) i kliknij 🖨️, aby wyeksportować mapę do obrazka.',
      focus: ['.leaflet-draw', '.print-button'],
      action: 'draw'
    },
    {
      title: 'Możesz zaczynać!',
      description: 'Znasz już najważniejsze narzędzia. Eksploruj Gołańcz we własnym tempie — przewodnik uruchomisz ponownie przyciskiem „?”.',
      action: 'finish'
    }
  ];

  const backdrop = document.createElement('div');
  backdrop.className = 'guide-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  const shades = Array.from({ length: 4 }, function () {
    const shade = document.createElement('span');
    shade.className = 'guide-shade';
    backdrop.appendChild(shade);
    return shade;
  });
  const spotlight = document.createElement('div');
  spotlight.className = 'guide-spotlight';
  spotlight.setAttribute('aria-hidden', 'true');

  const card = document.createElement('section');
  card.className = 'guide-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-labelledby', 'guide-title');
  card.setAttribute('aria-describedby', 'guide-description');
  card.innerHTML = [
    '<div class="guide-card-top">',
    '  <span class="guide-progress"></span>',
    '  <button class="guide-speak" type="button" aria-label="Odtwórz polecenie lektora" title="Odtwórz polecenie lektora">🔊</button>',
    '</div>',
    '<h2 id="guide-title"></h2>',
    '<p id="guide-description"></p>',
    '<div class="guide-status" aria-live="polite"></div>',
    '<div class="guide-card-actions">',
    '  <button class="guide-next" type="button"></button>',
    '</div>'
  ].join('');
  const progress = card.querySelector('.guide-progress');
  const title = card.querySelector('#guide-title');
  const description = card.querySelector('#guide-description');
  const status = card.querySelector('.guide-status');
  const nextButton = card.querySelector('.guide-next');
  const speakButton = card.querySelector('.guide-speak');
  const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  let currentStep = -1;
  let completed = false;
  let drawnShapeCount = 0;
  let editedShape = false;
  let deletedShape = false;
  let exportCompleted = false;
  let activeDrawMode = null;
  let drawModeCommitted = false;
  let visibilityChanges = { hidden: false, shown: false };
  let photoOpened = false;
  let focusedElements = [];
  let drawHighlightGroup = null;
  let drawHighlightMap = null;
  let stepBaseline = null;
  let autoStartTimer = null;
  let speechTimer = null;
  let spotlightFrame = null;
  let drawHighlightFrame = null;

  if (!supportsSpeech) speakButton.hidden = true;

  function logGuide(action, target, details) {
    document.dispatchEvent(new CustomEvent('geoportal:guide-log', {
      detail: {
        action: action,
        target: target,
        details: details || ''
      }
    }));
  }

  function speakText(text) {
    if (!supportsSpeech || !text) return;

    window.clearTimeout(speechTimer);
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.95;
    const polishVoice = window.speechSynthesis.getVoices().find(function (voice) {
      return voice.lang.toLowerCase().startsWith('pl');
    });
    if (polishVoice) utterance.voice = polishVoice;
    utterance.onerror = function (event) {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('Nie udało się odtworzyć polecenia przewodnika.', event.error);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function speakCurrentStep() {
    const currentDescription = description.textContent;
    const currentStatus = status.textContent;
    speakText([title.textContent, currentDescription, currentStatus].filter(Boolean).join('. '));
  }

  function setStatus(message, announce) {
    status.textContent = message;
    if (announce && !card.hidden) {
      window.clearTimeout(speechTimer);
      speechTimer = window.setTimeout(function () {
        if (!card.hidden) speakText(message);
      }, 350);
    }
  }

  function rememberVisit() {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (error) {
      console.warn('Nie udało się zapisać stanu przewodnika w pamięci przeglądarki.', error);
    }
  }

  function clearFocus() {
    focusedElements.forEach(function (element) {
      element.classList.remove('guide-focus');
    });
    focusedElements = [];
    if (drawHighlightGroup && drawHighlightMap) {
      drawHighlightMap.removeLayer(drawHighlightGroup);
    }
    drawHighlightGroup = null;
    drawHighlightMap = null;
  }

  function setDynamicFocus(elements) {
    clearFocus();
    focusedElements = elements.filter(function (element) {
      return element && element.isConnected;
    });
    focusedElements.forEach(function (element) {
      element.classList.add('guide-focus');
    });
    spotlight.hidden = focusedElements.length === 0;
    requestAnimationFrame(updateSpotlight);
  }

  function highlightDrawnLayers(layers, map) {
    if (!map || !window.L) return;
    if (drawHighlightGroup && drawHighlightMap) {
      drawHighlightMap.removeLayer(drawHighlightGroup);
    }

    const paneName = 'geoportal-guide-highlight';
    if (!map.getPane(paneName)) {
      map.createPane(paneName);
      map.getPane(paneName).style.zIndex = '450';
      map.getPane(paneName).style.pointerEvents = 'none';
    }
    const renderer = L.svg({ pane: paneName });
    const baseStyle = {
      opacity: 1,
      fillOpacity: 0.7,
      interactive: false,
      bubblingMouseEvents: false,
      pane: paneName,
      renderer: renderer,
      lineCap: 'round',
      lineJoin: 'round'
    };
    const highlightLayers = [];

    layers.forEach(function (layer) {
      let outer = null;
      let inner = null;
      if (layer instanceof L.Circle) {
        const radius = layer.getRadius();
        outer = L.circle(layer.getLatLng(), Object.assign({}, baseStyle, {
          color: '#fff',
          weight: 15,
          fillColor: '#fff',
          fillOpacity: 0.3,
          radius: radius + Math.max(12, radius * 0.07)
        }));
        inner = L.circle(layer.getLatLng(), Object.assign({}, baseStyle, {
          color: '#00bfa5',
          weight: 8,
          fillColor: '#00e5c4',
          fillOpacity: 0.35,
          radius: radius + Math.max(5, radius * 0.025)
        }));
      } else if (layer instanceof L.CircleMarker) {
        const radius = layer.getRadius();
        outer = L.circleMarker(layer.getLatLng(), Object.assign({}, baseStyle, {
          color: '#fff',
          weight: 6,
          fillColor: '#fff',
          fillOpacity: 0.45,
          radius: radius + 10
        }));
        inner = L.circleMarker(layer.getLatLng(), Object.assign({}, baseStyle, {
          color: '#00bfa5',
          weight: 4,
          fillColor: '#00e5c4',
          fillOpacity: 0.45,
          radius: radius + 4
        }));
      } else if (layer instanceof L.Marker) {
        outer = L.circleMarker(layer.getLatLng(), Object.assign({}, baseStyle, {
          color: '#fff',
          weight: 7,
          fillColor: '#fff',
          fillOpacity: 0.4,
          radius: 25
        }));
        inner = L.circleMarker(layer.getLatLng(), Object.assign({}, baseStyle, {
          color: '#00bfa5',
          weight: 5,
          fillColor: '#00e5c4',
          fillOpacity: 0.4,
          radius: 18
        }));
      } else if (layer instanceof L.Polygon) {
        outer = L.polygon(layer.getLatLngs(), Object.assign({}, baseStyle, {
          color: '#fff',
          weight: 14,
          fillColor: '#fff',
          fillOpacity: 0.32
        }));
        inner = L.polygon(layer.getLatLngs(), Object.assign({}, baseStyle, {
          color: '#00bfa5',
          weight: 8,
          fillColor: '#00e5c4',
          fillOpacity: 0.35
        }));
      } else if (layer instanceof L.Polyline) {
        outer = L.polyline(layer.getLatLngs(), Object.assign({}, baseStyle, {
          color: '#fff',
          weight: 14,
          fill: false
        }));
        inner = L.polyline(layer.getLatLngs(), Object.assign({}, baseStyle, {
          color: '#00bfa5',
          weight: 8,
          fill: false
        }));
      }
      if (outer) highlightLayers.push(outer);
      if (inner) highlightLayers.push(inner);
    });

    if (!highlightLayers.length) return;
    drawHighlightGroup = L.featureGroup(highlightLayers);
    drawHighlightMap = map;
    drawHighlightMap.addLayer(drawHighlightGroup);
  }

  function focusDrawAction(title) {
    const action = title === 'Eksport mapy'
      ? document.querySelector('.print-button')
      : document.querySelector('.leaflet-draw-actions a[title="' + title + '"]');
    if (action) setDynamicFocus([action]);
  }

  function focusDrawToolbar() {
    setDynamicFocus([
      document.querySelector('.leaflet-draw'),
      document.querySelector('.print-button')
    ]);
  }

  function getVisibleDrawAction(titlePrefix) {
    return Array.from(document.querySelectorAll('.leaflet-draw-actions a')).find(function (action) {
      return action.title.indexOf(titlePrefix) === 0 && (action.offsetWidth || action.offsetHeight);
    });
  }

  function focusDrawnShapes(layers, modeSelector) {
    const modeButton = document.querySelector(modeSelector);
    const saveButton = getVisibleDrawAction('Save changes') ||
      document.querySelector('.leaflet-draw-actions a[title="Save changes"]');
    const cancelButton = getVisibleDrawAction('Cancel') ||
      document.querySelector('.leaflet-draw-actions a[title^="Cancel"]');
    setDynamicFocus([modeButton, saveButton, cancelButton].filter(Boolean));
  }

  function scheduleDrawModeFocus(layers, map, mode, selector) {
    requestAnimationFrame(function () {
      if (card.hidden || currentStep !== 4 || activeDrawMode !== mode) return;
      focusDrawnShapes(layers, selector);
      highlightDrawnLayers(layers, map);
    });
  }

  function scheduleDrawHighlightUpdate(event) {
    if (card.hidden || currentStep !== 4 || activeDrawMode !== 'edit' || drawHighlightFrame !== null) return;
    drawHighlightFrame = requestAnimationFrame(function () {
      drawHighlightFrame = null;
      if (card.hidden || currentStep !== 4 || activeDrawMode !== 'edit') return;
      highlightDrawnLayers(event.detail.layers, event.detail.map);
    });
  }

  function placeShade(element, left, top, width, height) {
    element.style.left = left + 'px';
    element.style.top = top + 'px';
    element.style.width = Math.max(0, width) + 'px';
    element.style.height = Math.max(0, height) + 'px';
  }

  function updatePhotoPopupLayout() {
    const mapElement = document.getElementById('map');
    const mapRect = mapElement.getBoundingClientRect();
    const maxPopupWidth = Math.max(200, Math.floor(mapRect.width - 96));
    document.body.style.setProperty('--guide-photo-popup-max-width', maxPopupWidth + 'px');

    const panelWidth = window.innerWidth - mapRect.right - 32;
    if (panelWidth >= 220) {
      card.style.width = Math.min(360, panelWidth) + 'px';
    } else {
      card.style.width = '';
    }
  }

  function placePhotoGuideCard(popupRect) {
    const mapRect = document.getElementById('map').getBoundingClientRect();
    const panelWidth = window.innerWidth - mapRect.right - 32;
    const popupWithinMap = popupRect.left >= mapRect.left && popupRect.right <= mapRect.right;
    const rightSpace = window.innerWidth - popupRect.right - 32;
    if (rightSpace >= 220) {
      card.style.width = Math.min(360, rightSpace) + 'px';
      const cardRect = card.getBoundingClientRect();
      card.style.right = '';
      card.style.bottom = '';
      card.style.left = popupRect.right + 16 + 'px';
      card.style.top = Math.max(16, (window.innerHeight - cardRect.height) / 2) + 'px';
      return;
    }

    const leftSpace = popupRect.left - 32;
    if (leftSpace >= 220) {
      card.style.width = Math.min(360, leftSpace) + 'px';
      const cardRect = card.getBoundingClientRect();
      card.style.right = '';
      card.style.bottom = '';
      card.style.left = popupRect.left - cardRect.width - 16 + 'px';
      card.style.top = Math.max(16, (window.innerHeight - cardRect.height) / 2) + 'px';
      return;
    }

    if (panelWidth >= 220 && popupWithinMap) {
      card.style.width = Math.min(360, panelWidth) + 'px';
      const cardRect = card.getBoundingClientRect();
      card.style.right = '';
      card.style.bottom = '';
      card.style.left = mapRect.right + 16 + 'px';
      card.style.top = Math.max(16, (window.innerHeight - cardRect.height) / 2) + 'px';
      return;
    }

    placeCardAwayFromPopup(card.getBoundingClientRect(), popupRect);
  }

  function scheduleSpotlightUpdate() {
    if (spotlightFrame !== null) return;
    spotlightFrame = requestAnimationFrame(function () {
      spotlightFrame = null;
      updateSpotlight();
    });
  }

  function placeCardAwayFromPopup(cardRect, popupRect) {
    const gap = 16;
    const maxLeft = Math.max(gap, window.innerWidth - cardRect.width - gap);
    const maxTop = Math.max(gap, window.innerHeight - cardRect.height - gap);
    const candidates = [
      { left: gap, top: gap },
      { left: maxLeft, top: gap },
      { left: gap, top: maxTop },
      { left: maxLeft, top: maxTop }
    ];

    const placement = candidates.reduce(function (best, candidate) {
      const overlapWidth = Math.max(0, Math.min(candidate.left + cardRect.width, popupRect.right) - Math.max(candidate.left, popupRect.left));
      const overlapHeight = Math.max(0, Math.min(candidate.top + cardRect.height, popupRect.bottom) - Math.max(candidate.top, popupRect.top));
      const overlapArea = overlapWidth * overlapHeight;
      if (!best || overlapArea < best.overlapArea) {
        return { left: candidate.left, top: candidate.top, overlapArea: overlapArea };
      }
      return best;
    }, null);

    card.style.right = '';
    card.style.bottom = '';
    card.style.left = placement.left + 'px';
    card.style.top = placement.top + 'px';
  }

  function updateSpotlight() {
    if (card.hidden) return;

    focusedElements = focusedElements.filter(function (element) {
      return element.isConnected;
    });

    if (document.body.classList.contains('guide-focus-visibility')) {
      spotlight.hidden = true;
      shades.forEach(function (shade) {
        shade.hidden = true;
      });
      const map = document.getElementById('map').getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const maxLeft = Math.max(16, Math.min(map.right - cardRect.width - 16, window.innerWidth - cardRect.width - 16));
      const maxTop = Math.max(16, Math.min(map.bottom - cardRect.height - 16, window.innerHeight - cardRect.height - 16));
      card.style.right = '';
      card.style.left = Math.max(map.left + 16, maxLeft) + 'px';
      card.style.top = Math.max(map.top + 16, Math.min(map.top + (map.height - cardRect.height) / 2, maxTop)) + 'px';
      return;
    }

    if (focusedElements.length === 0) {
      spotlight.hidden = true;
      shades.forEach(function (shade) {
        shade.hidden = true;
      });
      card.style.left = Math.max(16, (window.innerWidth - card.offsetWidth) / 2) + 'px';
      card.style.top = Math.max(16, (window.innerHeight - card.offsetHeight) / 2) + 'px';
      return;
    }

    const rect = focusedElements.reduce(function (bounds, element) {
      const elementRect = element.getBoundingClientRect();
      return {
        left: Math.min(bounds.left, elementRect.left),
        top: Math.min(bounds.top, elementRect.top),
        right: Math.max(bounds.right, elementRect.right),
        bottom: Math.max(bounds.bottom, elementRect.bottom)
      };
    }, {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity
    });
    const padding = 8;
    const left = Math.max(0, rect.left - padding);
    const top = Math.max(0, rect.top - padding);
    const right = Math.min(window.innerWidth, rect.right + padding);
    const bottom = Math.min(window.innerHeight, rect.bottom + padding);

    placeShade(shades[0], 0, 0, window.innerWidth, top);
    placeShade(shades[1], 0, top, left, bottom - top);
    placeShade(shades[2], right, top, window.innerWidth - right, bottom - top);
    placeShade(shades[3], 0, bottom, window.innerWidth, window.innerHeight - bottom);
    const keepMapUnshaded = document.body.classList.contains('guide-focus-map');
    shades.forEach(function (shade) {
      shade.hidden = keepMapUnshaded;
    });

    spotlight.hidden = false;
    spotlight.style.left = left + 'px';
    spotlight.style.top = top + 'px';
    spotlight.style.width = right - left + 'px';
    spotlight.style.height = bottom - top + 'px';

    const cardRect = card.getBoundingClientRect();
    if (document.body.classList.contains('guide-focus-photo-close')) {
      updatePhotoPopupLayout();
      const popup = document.querySelector('.leaflet-popup');
      const popupRect = popup ? popup.getBoundingClientRect() : focusedElements[0].getBoundingClientRect();
      placePhotoGuideCard(popupRect);
      return;
    }

    const gap = 16;
    let cardLeft = rect.left - cardRect.width - gap;
    if (cardLeft < 16) cardLeft = rect.right + gap;
    if (cardLeft + cardRect.width > window.innerWidth - 16) {
      cardLeft = Math.max(16, window.innerWidth - cardRect.width - 16);
    }
    const cardTop = Math.min(
      Math.max(16, rect.top),
      Math.max(16, window.innerHeight - cardRect.height - 16)
    );
    card.style.left = cardLeft + 'px';
    card.style.top = cardTop + 'px';
  }

  function setStep(index) {
    window.clearTimeout(speechTimer);
    clearFocus();
    currentStep = index;
    completed = false;
    stepBaseline = null;
    drawnShapeCount = 0;
    editedShape = false;
    deletedShape = false;
    exportCompleted = false;
    activeDrawMode = null;
    drawModeCommitted = false;
    visibilityChanges = { hidden: false, shown: false };
    photoOpened = false;
    backdrop.style.opacity = '';
    card.style.width = '';
    document.body.style.removeProperty('--guide-photo-popup-max-width');
    document.body.classList.remove('guide-focus-panel', 'guide-focus-map', 'guide-focus-visibility', 'guide-focus-photo-close');
    const step = steps[currentStep];
    if (step.action === 'sliders' || step.action === 'visibility' || step.action === 'photo') {
      document.body.classList.add('guide-focus-panel');
    }
    if (step.action === 'visibility') {
      document.body.classList.add('guide-focus-visibility');
    } else if (step.action === 'draw') {
      document.body.classList.add('guide-focus-map');
    }

    title.textContent = step.title;
    description.textContent = step.description;
    progress.textContent = 'Krok ' + (currentStep + 1) + ' z ' + steps.length;
    setStatus('', false);
    status.classList.remove('is-success');
    if (step.action === 'draw') {
      setStatus('Narysuj 3 obiekty, edytuj jeden, usuń wybrany obiekt i pobierz obraz mapy.', false);
    } else if (step.action === 'sliders') {
      stepBaseline = new Map(
        Array.from(document.querySelectorAll('.panel-boczny input[type="range"]')).map(function (slider) {
          return [slider.id, slider.value];
        })
      );
    } else if (step.action === 'visibility') {
      setStatus('Ukryj warstwę przyciskiem oka, a następnie ponownie ją pokaż.', false);
    } else if (step.action === 'photo') {
      setStatus('Otwórz zdjęcie na mapie, a po obejrzeniu zamknij jego popup.', false);
    }

    if (step.focus) {
      const selectors = Array.isArray(step.focus) ? step.focus : [step.focus];
      focusedElements = selectors.map(function (selector) {
        const control = document.querySelector(selector);
        if (step.action === 'visibility') return control;
        return control && (control.closest('.sekcja-panelu') || control.closest('.leaflet-control') || control);
      }).filter(Boolean);
      focusedElements.forEach(function (element) {
        element.classList.add('guide-focus');
      });
      card.style.right = '';
    }

    nextButton.disabled = step.action !== 'start' && step.action !== 'finish';
    nextButton.textContent = step.action === 'start'
      ? 'Rozpocznij'
      : (step.action === 'finish' ? 'Zakończ' : 'Wykonaj zadanie');
    card.hidden = false;
    backdrop.hidden = false;
    spotlight.hidden = focusedElements.length === 0;
    requestAnimationFrame(updateSpotlight);
    logGuide('PRZEWODNIK_KROK', step.title, 'Numer kroku: ' + (currentStep + 1));
    speakCurrentStep();
  }

  function startGuide(source) {
    if (autoStartTimer) {
      window.clearTimeout(autoStartTimer);
      autoStartTimer = null;
    }
    if (!document.body.contains(card)) {
      document.body.append(backdrop, spotlight, card);
    }
    rememberVisit();
    logGuide('PRZEWODNIK_START', 'Przewodnik aktywny', 'Źródło: ' + source);
    setStep(0);
    nextButton.focus();
  }

  function finishGuide() {
    window.clearTimeout(speechTimer);
    if (supportsSpeech) window.speechSynthesis.cancel();
    clearFocus();
    card.hidden = true;
    backdrop.hidden = true;
    spotlight.hidden = true;
    shades.forEach(function (shade) {
      shade.hidden = true;
    });
    document.body.classList.remove('guide-focus-panel', 'guide-focus-map', 'guide-focus-visibility', 'guide-focus-photo-close');
    document.body.style.removeProperty('--guide-photo-popup-max-width');
    card.style.width = '';
    logGuide('PRZEWODNIK_ZAKOŃCZONY', 'Przewodnik aktywny', 'Ukończono wszystkie kroki');
  }

  function completeAction(details) {
    if (completed) return;
    completed = true;
    setStatus('Zadanie wykonane — brawo!', true);
    status.classList.add('is-success');
    nextButton.disabled = false;
    nextButton.textContent = currentStep === steps.length - 1 ? 'Zakończ' : 'Dalej';
    backdrop.style.opacity = '0.12';
    logGuide('PRZEWODNIK_ZADANIE', steps[currentStep].title, details);
  }

  function updateDrawAndExportProgress() {
    if (drawnShapeCount >= 3 && editedShape && deletedShape && exportCompleted) {
      completeAction('Narysowano co najmniej trzy obiekty, edytowano i usunięto obiekt oraz wyeksportowano mapę do obrazka');
      return;
    }

    const remaining = [];
    if (drawnShapeCount < 3) {
      const shapesLeft = 3 - drawnShapeCount;
      remaining.push('narysuj jeszcze ' + shapesLeft + (shapesLeft === 1 ? ' obiekt' : ' obiekty'));
    }
    if (!editedShape) remaining.push('edytuj narysowany obiekt');
    if (!deletedShape) remaining.push('usuń narysowany obiekt');
    if (!exportCompleted) remaining.push('wyeksportuj mapę do obrazka');
    setStatus('Pozostało: ' + remaining.join(' oraz ') + '.', true);
  }

  function handleDrawEditStarted(event) {
    if (card.hidden || currentStep !== 4) return;
    activeDrawMode = 'edit';
    drawModeCommitted = false;
    setStatus('Tryb edycji: przeciągnij narysowany obiekt lub jego uchwyt, aby go zmienić, a następnie kliknij „Zapisz zmiany”.', true);
    focusDrawnShapes(event.detail.layers, '.leaflet-draw-edit-edit');
    scheduleDrawModeFocus(event.detail.layers, event.detail.map, 'edit', '.leaflet-draw-edit-edit');
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Wskazano obiekty i przycisk zapisu w trybie edycji');
  }

  function handleDrawEditStopped() {
    if (card.hidden || currentStep !== 4 || activeDrawMode !== 'edit') return;
    const wasCommitted = drawModeCommitted;
    activeDrawMode = null;
    drawModeCommitted = false;
    if (wasCommitted) return;

    setStatus(
      editedShape
        ? 'Nie zapisano nowych zmian. Wybierz na pasku narzędzi kolejną czynność.'
        : 'Edycja anulowana lub zakończona bez zmian. Wybierz „Edytuj obiekty” i zapisz zmianę, aby zaliczyć edycję.',
      true
    );
    focusDrawToolbar();
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Tryb edycji zakończony bez zapisanych zmian');
  }

  function handleDrawDeleteStarted(event) {
    if (card.hidden || currentStep !== 4) return;
    activeDrawMode = 'delete';
    drawModeCommitted = false;
    if (!editedShape) {
      setStatus('Najpierw kliknij „Anuluj”, aby wyjść z trybu usuwania. Następnie wybierz „Edytuj obiekty”, zmień obiekt i kliknij „Zapisz zmiany”.', true);
      setDynamicFocus([
        document.querySelector('.leaflet-draw-actions a[title="Cancel editing, discards all changes"]'),
        document.querySelector('.leaflet-draw-edit-edit')
      ]);
      return;
    }

    setStatus('Tryb usuwania: kliknij narysowany obiekt — może to być również obiekt, który edytowano — a następnie kliknij „Zapisz zmiany”.', true);
    focusDrawnShapes(event.detail.layers, '.leaflet-draw-edit-remove');
    scheduleDrawModeFocus(event.detail.layers, event.detail.map, 'delete', '.leaflet-draw-edit-remove');
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Wskazano obiekt do usunięcia i przycisk zapisu');
  }

  function handleDrawDeleteStopped() {
    if (card.hidden || currentStep !== 4 || activeDrawMode !== 'delete') return;
    const wasCommitted = drawModeCommitted;
    activeDrawMode = null;
    drawModeCommitted = false;
    if (wasCommitted) return;

    setStatus(
      deletedShape
        ? 'Nie zapisano kolejnego usunięcia. Wybierz na pasku narzędzi kolejną czynność.'
        : (editedShape
          ? 'Usuwanie anulowane lub zakończone bez wyboru obiektu. Wybierz „Usuń obiekty” i zapisz usunięcie.'
          : 'Usuwanie anulowane. Najpierw wybierz „Edytuj obiekty”, zmień obiekt i kliknij „Zapisz zmiany”.'),
      true
    );
    focusDrawToolbar();
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Tryb usuwania zakończony bez zapisanej zmiany');
  }

  function updateVisibilityProgress() {
    if (visibilityChanges.hidden && visibilityChanges.shown) {
      completeAction('Ukryto warstwę i ponownie włączono jej widoczność');
      return;
    }

    const remaining = [];
    if (!visibilityChanges.hidden) remaining.push('wyłącz widoczność dowolnej warstwy');
    if (!visibilityChanges.shown) remaining.push('włącz ponownie widoczność dowolnej warstwy');
    setStatus('Pozostało: ' + remaining.join(' oraz ') + '.', true);
  }

  function continueGuide() {
    if (currentStep === 0) {
      logGuide('PRZEWODNIK_ZADANIE', steps[currentStep].title, 'Kliknięto „Rozpocznij”');
      setStep(1);
      return;
    }
    if (currentStep === steps.length - 1) {
      finishGuide();
      return;
    }
    if (!completed) return;
    backdrop.style.opacity = '';
    if (currentStep === 3) {
      document.dispatchEvent(new CustomEvent('geoportal:guide-prepare-draw'));
    }
    setStep(currentStep + 1);
  }

  function onRangeChange(event) {
    if (card.hidden || completed || !event.target.matches('input[type="range"]')) return;
    if (
      currentStep === 1 &&
      stepBaseline instanceof Map &&
      stepBaseline.has(event.target.id) &&
      event.target.value !== stepBaseline.get(event.target.id)
    ) {
      completeAction('Zmieniono wartość suwaka ' + event.target.id + ' na ' + event.target.value);
    }
  }

  function onInterfaceClick(event) {
    if (card.hidden || completed) return;
    const target = event.target.closest('button');
    if (!target) return;

    if (currentStep === 2 && target.matches('button[id^="btn-toggle-"]')) {
      if (target.classList.contains('inactive')) {
        visibilityChanges.hidden = true;
      } else {
        visibilityChanges.shown = true;
      }
      updateVisibilityProgress();
    }
  }

  document.getElementById('btn-przewodnik').addEventListener('click', function () {
    startGuide('przycisk pomocy');
  });
  nextButton.addEventListener('click', continueGuide);
  speakButton.addEventListener('click', speakCurrentStep);
  document.addEventListener('input', onRangeChange);
  document.addEventListener('change', onRangeChange);
  document.addEventListener('click', onInterfaceClick);
  document.addEventListener('geoportal:photo-opened', function () {
    if (card.hidden || currentStep !== 3 || completed) return;
    photoOpened = true;
    setStatus('Zdjęcie otwarte. Zamknij popup, aby zaliczyć zadanie.', true);
    document.body.classList.add('guide-focus-photo-close');
    updatePhotoPopupLayout();
    clearFocus();
    const closeButton = document.querySelector('.leaflet-popup-close-button');
    if (closeButton) {
      focusedElements = [closeButton];
      closeButton.classList.add('guide-focus');
      requestAnimationFrame(function () {
        requestAnimationFrame(updateSpotlight);
      });
      window.setTimeout(updateSpotlight, 300);
    }
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Otworzono popup ze zdjęciem');
  });
  document.addEventListener('geoportal:photo-closed', function () {
    if (!card.hidden && currentStep === 3 && photoOpened) {
      document.body.classList.remove('guide-focus-photo-close');
      document.body.style.removeProperty('--guide-photo-popup-max-width');
      card.style.width = '';
      completeAction('Otworzono i zamknięto popup ze zdjęciem archiwalnym');
    }
  });
  document.addEventListener('geoportal:photos-loaded', function (event) {
    if (card.hidden || currentStep !== 3 || completed) return;

    if (event.detail.hasPhotos) {
      setStatus('Zdjęcia z roku ' + event.detail.year + ' są dostępne. Otwórz popup zdjęcia i zamknij go, aby zaliczyć zadanie.', true);
      logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Znaleziono zdjęcie dla roku ' + event.detail.year);
    } else {
      setStatus('Brak zdjęć dla roku ' + event.detail.year + '. Przesuń suwak do roku, dla którego dostępne są zdjęcia.', true);
    }
  });
  document.addEventListener('geoportal:draw-created', function (event) {
    if (card.hidden || currentStep !== 4 || drawnShapeCount >= 3) return;
    drawnShapeCount += 1;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Narysowano obiekt ' + drawnShapeCount + ' z 3: ' + event.detail.layerType);
    updateDrawAndExportProgress();
  });
  document.addEventListener('geoportal:draw-edit-start', handleDrawEditStarted);
  document.addEventListener('geoportal:draw-edit-stop', handleDrawEditStopped);
  document.addEventListener('geoportal:draw-edit-change', scheduleDrawHighlightUpdate);
  document.addEventListener('geoportal:draw-delete-start', handleDrawDeleteStarted);
  document.addEventListener('geoportal:draw-delete-stop', handleDrawDeleteStopped);
  document.addEventListener('geoportal:draw-edited', function (event) {
    if (activeDrawMode === 'edit' && event.detail.count > 0) drawModeCommitted = true;
    if (card.hidden || currentStep !== 4 || editedShape || event.detail.count < 1) return;
    editedShape = true;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Edytowano obiekt');
    updateDrawAndExportProgress();
    if (!completed) {
      setStatus('Edycja zapisana. Teraz kliknij ikonę „Usuń obiekty”, wybierz obiekt do usunięcia i kliknij „Zapisz zmiany”.', true);
      focusDrawToolbar();
    }
  });
  document.addEventListener('geoportal:draw-deleted', function (event) {
    if (activeDrawMode === 'delete' && event.detail.count > 0) drawModeCommitted = true;
    if (card.hidden || currentStep !== 4 || deletedShape || event.detail.count < 1) return;
    deletedShape = true;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Usunięto obiekt');
    updateDrawAndExportProgress();
    if (!completed) {
      setStatus('Usunięto obiekt. Kliknij 🖨️, aby wyeksportować mapę.', true);
      focusDrawToolbar();
    }
  });
  document.addEventListener('geoportal:map-exported', function (event) {
    if (card.hidden || currentStep !== 4 || exportCompleted) return;
    exportCompleted = true;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Wyeksportowano obraz: ' + event.detail.filename);
    updateDrawAndExportProgress();
  });
  window.addEventListener('resize', updateSpotlight);
  window.addEventListener('scroll', updateSpotlight, true);
  document.addEventListener('geoportal:map-view-change', scheduleSpotlightUpdate);
  try {
    if (localStorage.getItem(storageKey) !== 'true') {
      autoStartTimer = window.setTimeout(function () {
        startGuide('pierwsze odwiedziny');
      }, 700);
    }
  } catch (error) {
    console.warn('Nie udało się odczytać stanu przewodnika; przewodnik uruchomi się automatycznie.', error);
    autoStartTimer = window.setTimeout(function () {
      startGuide('pierwsze odwiedziny');
    }, 700);
  }
})();
