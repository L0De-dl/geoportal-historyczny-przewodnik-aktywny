(function () {
  const storageKey = 'geoportal-golancz-guide-seen-v1';
  const steps = [
    {
      title: 'Poznaj historię Gołańczy',
      tool: 'Geoportal Historyczny Gołańczy',
      description: 'Łączy dawne mapy z informacjami o zabudowie, komunikacji i archiwalnych zdjęciach, dzięki czemu możesz odkrywać, jak zmieniało się miasto.',
      instruction: 'Kliknij „Rozpocznij”, aby poznać kolejne narzędzia.',
      action: 'start'
    },
    {
      title: 'Poruszaj się po mapie',
      tool: 'Mapa interaktywna',
      description: 'Przesuwaj mapę, aby oglądać różne miejsca, i zmieniaj przybliżenie, by zobaczyć więcej szczegółów lub szerszy obszar.',
      instruction: 'Przytrzymaj lewy przycisk myszy i przeciągnij mapę co najmniej trzy razy. Następnie przybliż widok kółkiem myszy co najmniej dwa razy. Możesz też użyć przycisku „+”.',
      focus: ['#map', '.leaflet-control-zoom'],
      action: 'navigation'
    },
    {
      title: 'Przełączaj lata na suwakach',
      tool: 'Suwaki czasu',
      description: 'Każdy suwak pozwala wybrać rok dla osobnej warstwy: mapy, zabudowy, komunikacji lub zdjęć. Dzięki temu możesz porównywać różne okresy.',
      instruction: 'Przesuń jeden z suwaków w panelu bocznym, aby wybrać inny rok.',
      focus: ['#suwak-czasu', '#suwak-zabudowa', '#suwak-komunikacja', '#suwak-zdjecia'],
      action: 'sliders'
    },
    {
      title: 'Włączaj i wyłączaj warstwy',
      tool: 'Przyciski widoczności warstw',
      description: 'Ikony oka przy warstwach pozwalają sterować ich widocznością na mapie.',
      instruction: 'Najpierw wyłącz widoczność wybranej warstwy, klikając ikonę oka.',
      focus: ['#btn-toggle-podklad', '#btn-toggle-zabudowa', '#btn-toggle-komunikacja', '#btn-toggle-zdjecia'],
      action: 'visibility'
    },
    {
      title: 'Otwórz archiwalne zdjęcie',
      tool: 'Archiwalne zdjęcia',
      description: 'Zdjęcia są przypisane do konkretnych miejsc i lat. Znaczniki na mapie pokazują, gdzie wykonano fotografie.',
      instruction: 'Wybierz rok ze zdjęciami, kliknij pulsujący znacznik na mapie, a po obejrzeniu fotografii zamknij jej okno.',
      focus: '#suwak-zdjecia',
      action: 'photo'
    },
    {
      title: 'Rysuj, mierz i eksportuj',
      tool: 'Narzędzia rysowania, pomiaru i eksportu',
      description: 'Dzięki nim dodasz własne obiekty, zmierzysz odległości i powierzchnie oraz zapiszesz widok mapy jako obraz.',
      instruction: 'Najpierw wybierz narzędzie rysowania z paska mapy i narysuj jeden obiekt.',
      focus: [
        '.leaflet-draw-draw-polyline',
        '.leaflet-draw-draw-polygon',
        '.leaflet-draw-draw-rectangle',
        '.leaflet-draw-draw-circle',
        '.leaflet-draw-draw-marker',
        '.leaflet-draw-draw-circlemarker'
      ],
      action: 'draw'
    },
    {
      title: 'Wszystko gotowe!',
      tool: 'Przewodnik po Geoportalu Historycznym',
      description: 'Pokazał Ci najważniejsze funkcje mapy. W każdej chwili możesz do niego wrócić, klikając przycisk „?”.',
      instruction: 'Kliknij „Zakończ” i rozpocznij odkrywanie historii Gołańczy.',
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
  card.setAttribute('aria-describedby', 'guide-description guide-instruction-text');
  card.innerHTML = [
    '<div class="guide-card-top">',
    '  <span class="guide-progress"></span>',
    '  <button class="guide-speak" type="button" aria-label="Odtwórz opis kroku" title="Odtwórz opis kroku">🔊</button>',
    '</div>',
    '<div class="guide-progress-track" role="progressbar" aria-label="Postęp przewodnika" aria-valuemin="1" aria-valuemax="' + steps.length + '"><span></span></div>',
    '<h2 id="guide-title"></h2>',
    '<p id="guide-description"></p>',
    '<div class="guide-instruction">',
    '  <strong>Teraz Ty</strong>',
    '  <span id="guide-instruction-text" aria-live="polite"></span>',
    '</div>',
    '<ol class="guide-checklist" aria-label="Postęp zadania" hidden>',
    '  <li data-task="draw">Narysuj jeden obiekt</li>',
    '  <li data-task="edit">Zmień i zapisz obiekt</li>',
    '  <li data-task="delete">Usuń ten sam obiekt</li>',
    '  <li data-task="export">Wyeksportuj mapę</li>',
    '</ol>',
    '<div class="guide-status" aria-live="polite"></div>',
    '<div class="guide-card-actions">',
    '  <button class="guide-next" type="button"></button>',
    '</div>'
  ].join('');
  const progress = card.querySelector('.guide-progress');
  const title = card.querySelector('#guide-title');
  const description = card.querySelector('#guide-description');
  const instruction = card.querySelector('#guide-instruction-text');
  const status = card.querySelector('.guide-status');
  const nextButton = card.querySelector('.guide-next');
  const speakButton = card.querySelector('.guide-speak');
  const progressTrack = card.querySelector('.guide-progress-track');
  const progressBar = progressTrack.querySelector('span');
  const checklist = card.querySelector('.guide-checklist');
  const checklistItems = Array.from(checklist.querySelectorAll('li'));
  const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  let currentStep = -1;
  let completed = false;
  let drawnLayer = null;
  let editedShape = false;
  let deletedShape = false;
  let exportCompleted = false;
  let activeDrawMode = null;
  let drawModeCommitted = false;
  let visibilityChanges = { hidden: false, shown: false };
  let visibilityTarget = null;
  let navigationChanges = { panned: 0, zoomed: 0 };
  let photoOpened = false;
  let focusedElements = [];
  let photoTargetElements = [];
  let drawHighlightGroup = null;
  let drawHighlightMap = null;
  let stepBaseline = null;
  let autoStartTimer = null;
  let speechTimer = null;
  let stepSpeechTimer = null;
  let spotlightFrame = null;
  let drawHighlightFrame = null;
  let stepStartedAt = 0;
  let guideStartedAt = 0;
  let photoFocusTimer = null;
  let stepActionTimer = null;

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

  function speakText(text, onEnd) {
    if (!supportsSpeech || !text) return;

    window.clearTimeout(speechTimer);
    window.clearTimeout(stepSpeechTimer);
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.85;
    const polishVoice = window.speechSynthesis.getVoices().find(function (voice) {
      return voice.lang.toLowerCase().startsWith('pl');
    });
    if (polishVoice) utterance.voice = polishVoice;
    if (onEnd) {
      utterance.onend = function () {
        stepSpeechTimer = window.setTimeout(onEnd, 450);
      };
    }
    utterance.onerror = function (event) {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('Nie udało się odtworzyć polecenia przewodnika.', event.error);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function speakCurrentStep() {
    const step = steps[currentStep];
    const stepIndex = currentStep;
    const instructionText = step.action === 'draw' || step.action === 'navigation'
      ? instruction.textContent
      : step.instruction;
    const spokenText = [step.description, instructionText].filter(Boolean).join(' ');
    speakText(spokenText, function () {
      if (card.hidden || currentStep !== stepIndex) return;
      speakText(spokenText);
    });
  }

  function getSpokenStatus(message) {
    if (message.indexOf('Zadanie wykonane') === 0) return 'Zadanie wykonane. Brawo!';
    if (message.indexOf('Zdjęcie jest otwarte.') === 0) return 'Zamknij okno zdjęcia.';
    if (message.indexOf('Zdjęcia z ') === 0) return 'Zdjęcia są dostępne. Kliknij pulsujący znacznik na mapie, aby otworzyć fotografię, a po obejrzeniu zamknij jej okno.';
    return message;
  }

  function setDrawInstruction(message, announce) {
    instruction.textContent = message;
    setStatus('', false);
    if (announce !== false) speakText(message);
  }

  function updateMapNavigation(announce) {
    if (navigationChanges.panned >= 3 && navigationChanges.zoomed >= 2) {
      completeAction('Przesunięto mapę i zmieniono jej przybliżenie');
      return;
    }

    const pansRemaining = Math.max(0, 3 - navigationChanges.panned);
    const zoomsRemaining = Math.max(0, 2 - navigationChanges.zoomed);
    const panPrompt = pansRemaining
      ? 'Przeciągnij mapę myszką jeszcze ' + pansRemaining + (pansRemaining === 1 ? ' raz.' : ' razy.')
      : 'Mapa została przesunięta.';
    const zoomPrompt = zoomsRemaining
      ? 'Przybliż widok kółkiem myszy jeszcze ' + zoomsRemaining + (zoomsRemaining === 1 ? ' raz.' : ' razy.') + ' Możesz też użyć przycisku „+”.'
      : '';
    setDrawInstruction([panPrompt, zoomPrompt].filter(Boolean).join(' '), announce);
    focusDrawAction(pansRemaining ? '#map' : '.leaflet-control-zoom');
  }

  function setStatus(message, announce) {
    status.textContent = message;
    if (announce && !card.hidden) {
      window.clearTimeout(speechTimer);
      speechTimer = window.setTimeout(function () {
        if (!card.hidden) speakText(getSpokenStatus(message));
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

  function clearPhotoTargets() {
    photoTargetElements.forEach(function (element) {
      element.classList.remove('guide-photo-target');
    });
    photoTargetElements = [];
    document.body.classList.remove('guide-focus-photo-target');
  }

  function highlightPhotoMarkers() {
    if (card.hidden || currentStep !== 4 || completed) return;
    clearPhotoTargets();
    photoTargetElements = Array.from(document.querySelectorAll('.leaflet-marker-icon.photo-marker'));
    photoTargetElements.forEach(function (element) {
      element.classList.add('guide-photo-target');
    });
    if (photoTargetElements.length) {
      document.body.classList.add('guide-focus-photo-target');
      scheduleSpotlightUpdate();
    }
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

  function focusDrawAction(selector) {
    const action = document.querySelector(selector);
    setDynamicFocus(action ? [action] : []);
  }

  function focusDrawTools() {
    setDynamicFocus(steps[4].focus.map(function (selector) {
      return document.querySelector(selector);
    }).filter(Boolean));
  }

  function focusDrawToolbar() {
    if (!drawnLayer) {
      focusDrawTools();
    } else if (!editedShape) {
      focusDrawAction('.leaflet-draw-edit-edit');
    } else if (!deletedShape) {
      focusDrawAction('.leaflet-draw-edit-remove');
    } else if (!exportCompleted) {
      focusDrawAction('.print-button');
    }
  }

  function getVisibleDrawAction(titlePrefix) {
    return Array.from(document.querySelectorAll('.leaflet-draw-actions a')).find(function (action) {
      return action.title.indexOf(titlePrefix) === 0 && (action.offsetWidth || action.offsetHeight);
    });
  }

  function focusDrawnShapes() {
    const saveButton = getVisibleDrawAction('Save changes') ||
      document.querySelector('.leaflet-draw-actions a[title="Save changes"]');
    const cancelButton = getVisibleDrawAction('Cancel') ||
      document.querySelector('.leaflet-draw-actions a[title^="Cancel"]');
    setDynamicFocus([saveButton, cancelButton].filter(Boolean));
  }

  function scheduleDrawModeFocus(layers, map, mode) {
    requestAnimationFrame(function () {
      if (card.hidden || currentStep !== 5 || activeDrawMode !== mode) return;
      focusDrawnShapes();
      highlightDrawnLayers(layers, map);
    });
  }

  function scheduleDrawHighlightUpdate(event) {
    if (card.hidden || currentStep !== 5 || activeDrawMode !== 'edit' || drawHighlightFrame !== null) return;
    drawHighlightFrame = requestAnimationFrame(function () {
      drawHighlightFrame = null;
      if (card.hidden || currentStep !== 5 || activeDrawMode !== 'edit') return;
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
    const maxPhotoHeight = Math.min(Math.floor(window.innerHeight * 0.4), Math.floor(mapRect.height - 180));
    document.body.style.setProperty('--guide-photo-popup-max-height', Math.max(120, maxPhotoHeight) + 'px');

    const panelWidth = window.innerWidth - mapRect.right - 32;
    if (panelWidth >= 220) {
      card.style.width = Math.min(360, panelWidth) + 'px';
    } else {
      card.style.width = '';
    }
  }

  function keepPhotoPopupVisible() {
    if (card.hidden || currentStep !== 4) return;
    requestAnimationFrame(function () {
      const popup = document.querySelector('.leaflet-popup');
      if (!popup) return;

      const mapRect = document.getElementById('map').getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const padding = 12;
      const left = mapRect.left + padding;
      const right = mapRect.right - padding;
      const bottom = mapRect.bottom - padding;
      let top = mapRect.top + padding;
      const titleControl = document.querySelector('.tytul-mapy');
      if (titleControl) {
        const titleRect = titleControl.getBoundingClientRect();
        const overlapsTitle = popupRect.left < titleRect.right && popupRect.right > titleRect.left;
        if (overlapsTitle) {
          top = Math.min(bottom - popupRect.height, Math.max(top, titleRect.bottom + padding));
        }
      }
      const offsetX = popupRect.left < left
        ? popupRect.left - left
        : (popupRect.right > right ? popupRect.right - right : 0);
      const offsetY = popupRect.top < top
        ? popupRect.top - top
        : (popupRect.bottom > bottom ? popupRect.bottom - bottom : 0);

      if (Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
        map.panBy([offsetX, offsetY], { animate: true, duration: 0.2 });
      } else {
        scheduleSpotlightUpdate();
      }
    });
  }

  function schedulePhotoMapFocus(locations) {
    window.clearTimeout(photoFocusTimer);
    photoFocusTimer = window.setTimeout(function () {
      photoFocusTimer = null;
      if (card.hidden || currentStep !== 4 || completed) return;
      map.fitBounds(L.latLngBounds(locations), {
        padding: [40, 40],
        maxZoom: 16,
        animate: true
      });
      requestAnimationFrame(highlightPhotoMarkers);
    }, 250);
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

    const mobileCardRect = card.getBoundingClientRect();
    const mobileCardTop = mapRect.bottom + 16;
    if (mobileCardTop + mobileCardRect.height <= window.innerHeight - 16) {
      card.style.width = '';
      card.style.right = '';
      card.style.bottom = '';
      card.style.left = '16px';
      card.style.top = mobileCardTop + 'px';
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

    if (document.body.classList.contains('guide-focus-map') && window.innerWidth <= 760) {
      const mapRect = document.getElementById('map').getBoundingClientRect();
      card.style.width = Math.min(360, window.innerWidth - 16) + 'px';
      card.style.maxHeight = Math.max(120, window.innerHeight - mapRect.bottom - 16) + 'px';
      card.style.overflowY = 'auto';
      card.style.left = '8px';
      card.style.setProperty('--guide-map-card-top', (mapRect.bottom + 8) + 'px');
      return;
    }

    card.style.maxHeight = '';
    card.style.overflowY = '';
    card.style.removeProperty('--guide-map-card-top');
    const cardRect = card.getBoundingClientRect();
    if (document.body.classList.contains('guide-focus-photo-close')) {
      updatePhotoPopupLayout();
      const popup = document.querySelector('.leaflet-popup');
      const popupRect = popup ? popup.getBoundingClientRect() : focusedElements[0].getBoundingClientRect();
      placePhotoGuideCard(popupRect);
      return;
    }
    if (document.body.classList.contains('guide-focus-photo') && photoTargetElements.length) {
      const markerRect = photoTargetElements.reduce(function (bounds, element) {
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
      placeCardAwayFromPopup(cardRect, markerRect);
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
    window.clearTimeout(stepSpeechTimer);
    if (stepActionTimer) {
      window.clearTimeout(stepActionTimer);
      stepActionTimer = null;
    }
    clearFocus();
    currentStep = index;
    stepStartedAt = Date.now();
    window.clearTimeout(photoFocusTimer);
    photoFocusTimer = null;
    clearPhotoTargets();
    completed = false;
    stepBaseline = null;
    drawnLayer = null;
    editedShape = false;
    deletedShape = false;
    exportCompleted = false;
    activeDrawMode = null;
    drawModeCommitted = false;
    visibilityChanges = { hidden: false, shown: false };
    visibilityTarget = null;
    navigationChanges = { panned: 0, zoomed: 0 };
    photoOpened = false;
    backdrop.style.opacity = '';
    card.style.width = '';
    card.style.maxHeight = '';
    card.style.overflowY = '';
    card.style.removeProperty('--guide-map-card-top');
    document.body.style.removeProperty('--guide-photo-popup-max-width');
    document.body.style.removeProperty('--guide-photo-popup-max-height');
    document.body.classList.remove('guide-focus-panel', 'guide-focus-map', 'guide-focus-visibility', 'guide-focus-photo', 'guide-focus-photo-close');
    const step = steps[currentStep];
    if (step.action === 'sliders' || step.action === 'visibility' || step.action === 'photo') {
      document.body.classList.add('guide-focus-panel');
    }
    if (step.action === 'visibility') {
      document.body.classList.add('guide-focus-visibility');
    } else if (step.action === 'draw') {
      document.body.classList.add('guide-focus-map');
    } else if (step.action === 'photo') {
      document.body.classList.add('guide-focus-photo');
    }

    title.textContent = step.tool;
    description.textContent = step.description;
    instruction.textContent = step.instruction;
    progress.textContent = 'Krok ' + (currentStep + 1) + ' z ' + steps.length;
    progressTrack.setAttribute('aria-valuenow', String(currentStep + 1));
    progressBar.style.width = ((currentStep + 1) / steps.length * 100) + '%';
    checklist.hidden = step.action !== 'draw';
    setStatus('', false);
    status.classList.remove('is-success');
    if (step.action === 'draw') {
      updateDrawChecklist();
    } else if (step.action === 'sliders') {
      stepBaseline = new Map(
        Array.from(document.querySelectorAll('.panel-boczny input[type="range"]')).map(function (slider) {
          return [slider.id, slider.value];
        })
      );
    }

    if (step.focus) {
      const selectors = Array.isArray(step.focus) ? step.focus : [step.focus];
      focusedElements = selectors.map(function (selector) {
        const control = document.querySelector(selector);
        if (step.action === 'visibility' || step.action === 'draw' || step.action === 'navigation') return control;
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
      : (step.action === 'finish' ? 'Zakończ' : 'Wykonaj krok na mapie');
    card.hidden = false;
    backdrop.hidden = false;
    if (step.action === 'photo') {
      document.dispatchEvent(new CustomEvent('geoportal:guide-prepare-photo'));
    }
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
    guideStartedAt = Date.now();
    logGuide('PRZEWODNIK_START', 'Przewodnik aktywny', 'Źródło: ' + source);
    setStep(0);
    nextButton.focus();
  }

  function finishGuide() {
    window.clearTimeout(speechTimer);
    window.clearTimeout(stepSpeechTimer);
    if (stepActionTimer) {
      window.clearTimeout(stepActionTimer);
      stepActionTimer = null;
    }
    if (supportsSpeech) window.speechSynthesis.cancel();
    clearFocus();
    clearPhotoTargets();
    card.hidden = true;
    backdrop.hidden = true;
    spotlight.hidden = true;
    shades.forEach(function (shade) {
      shade.hidden = true;
    });
    document.body.classList.remove('guide-focus-panel', 'guide-focus-map', 'guide-focus-visibility', 'guide-focus-photo', 'guide-focus-photo-close');
    document.body.style.removeProperty('--guide-photo-popup-max-width');
    document.body.style.removeProperty('--guide-photo-popup-max-height');
    card.style.width = '';
    const elapsedSeconds = Math.round((Date.now() - guideStartedAt) / 1000);
    logGuide('PRZEWODNIK_ZAKOŃCZONY', 'Przewodnik aktywny', 'Ukończono wszystkie kroki; czas: ' + elapsedSeconds + ' s');
  }

  function updateDrawChecklist() {
    const done = {
      draw: Boolean(drawnLayer),
      edit: editedShape,
      delete: deletedShape,
      export: exportCompleted
    };
    const activeTask = !done.draw ? 'draw' : (!done.edit ? 'edit' : (!done.delete ? 'delete' : 'export'));

    checklistItems.forEach(function (item) {
      const task = item.dataset.task;
      item.classList.toggle('is-done', done[task]);
      item.classList.toggle('is-current', !completed && task === activeTask);
      item.setAttribute('aria-current', !completed && task === activeTask ? 'step' : 'false');
    });
  }

  function completeAction(details) {
    if (stepActionTimer) {
      window.clearTimeout(stepActionTimer);
      stepActionTimer = null;
    }
    if (completed) return;
    completed = true;
    setStatus('Zadanie wykonane — brawo!', true);
    if (steps[currentStep].action === 'sliders' || steps[currentStep].action === 'visibility' || steps[currentStep].action === 'navigation' || steps[currentStep].action === 'photo') {
      instruction.textContent = 'Kliknij „Dalej”, aby przejść do następnego kroku.';
    }
    if (steps[currentStep].action === 'draw') {
      window.clearTimeout(speechTimer);
      speechTimer = window.setTimeout(function () {
        if (!card.hidden) speakText('Gotowe. Narysowany obiekt został edytowany i usunięty, a widok mapy zapisano jako obraz.');
      }, 350);
    }
    status.classList.add('is-success');
    nextButton.disabled = false;
    nextButton.textContent = currentStep === steps.length - 1 ? 'Zakończ' : 'Dalej';
    backdrop.style.opacity = '0.12';
    updateDrawChecklist();
    const elapsedSeconds = Math.round((Date.now() - stepStartedAt) / 1000);
    logGuide('PRZEWODNIK_ZADANIE', steps[currentStep].title, details + '; czas: ' + elapsedSeconds + ' s');
  }

  function updateDrawAndExportProgress() {
    updateDrawChecklist();
    if (drawnLayer && editedShape && deletedShape && exportCompleted) {
      completeAction('Narysowano, edytowano i usunięto ten sam obiekt oraz wyeksportowano mapę');
      return;
    }

    const nextAction = !drawnLayer
      ? 'Narysuj jeden obiekt na mapie.'
      : (!editedShape
        ? 'Obiekt narysowany. Teraz kliknij podświetloną ikonę edycji, zmień obiekt i kliknij „Zapisz zmiany”.'
        : (!deletedShape
          ? 'Edycja zapisana. Teraz kliknij podświetloną ikonę usuwania, wybierz ten sam obiekt i kliknij „Zapisz zmiany”.'
          : 'Obiekt usunięty. Na koniec kliknij ikonę drukarki, aby wyeksportować widok mapy.'));
    setDrawInstruction(nextAction);
    if (!drawnLayer) {
      focusDrawTools();
    } else if (!editedShape) {
      focusDrawAction('.leaflet-draw-edit-edit');
    } else if (!deletedShape) {
      focusDrawAction('.leaflet-draw-edit-remove');
    } else if (!exportCompleted) {
      focusDrawAction('.print-button');
    }
  }

  function handleDrawEditStarted(event) {
    if (card.hidden || currentStep !== 5) return;
    activeDrawMode = 'edit';
    drawModeCommitted = false;
    if (!drawnLayer) {
      setStatus('Najpierw narysuj obiekt, który chcesz edytować.', true);
      focusDrawToolbar();
      return;
    }
    setDrawInstruction('Przeciągnij obiekt lub jego uchwyty, aby zmienić położenie albo kształt. Następnie kliknij „Zapisz zmiany”.');
    focusDrawnShapes();
    scheduleDrawModeFocus([drawnLayer], event.detail.map, 'edit');
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Wskazano obiekty i przycisk zapisu w trybie edycji');
  }

  function handleDrawEditStopped() {
    if (card.hidden || currentStep !== 5 || activeDrawMode !== 'edit') return;
    const wasCommitted = drawModeCommitted;
    activeDrawMode = null;
    drawModeCommitted = false;
    if (wasCommitted) return;

    setStatus(
      editedShape
        ? 'Nie zapisano nowych zmian. Wybierz kolejne narzędzie z paska.'
        : 'Edycja została anulowana lub zakończona bez zmian. Wybierz „Edytuj obiekty”, zmień obiekt i kliknij „Zapisz zmiany”.',
      true
    );
    focusDrawToolbar();
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Tryb edycji zakończony bez zapisanych zmian');
  }

  function handleDrawDeleteStarted(event) {
    if (card.hidden || currentStep !== 5) return;
    activeDrawMode = 'delete';
    drawModeCommitted = false;
    if (!editedShape) {
      setStatus('Najpierw kliknij „Anuluj”, aby zamknąć tryb usuwania. Następnie wybierz „Edytuj obiekty”, zmień obiekt i kliknij „Zapisz zmiany”.', true);
      setDynamicFocus([
        document.querySelector('.leaflet-draw-actions a[title="Cancel editing, discards all changes"]'),
        document.querySelector('.leaflet-draw-edit-edit')
      ]);
      return;
    }

    setDrawInstruction('Kliknij ten sam obiekt, który przed chwilą edytowano, a następnie wybierz „Zapisz zmiany”.');
    focusDrawnShapes();
    scheduleDrawModeFocus([drawnLayer], event.detail.map, 'delete');
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Wskazano obiekt do usunięcia i przycisk zapisu');
  }

  function handleDrawDeleteStopped() {
    if (card.hidden || currentStep !== 5 || activeDrawMode !== 'delete') return;
    const wasCommitted = drawModeCommitted;
    activeDrawMode = null;
    drawModeCommitted = false;
    if (wasCommitted) return;

    setStatus(
      deletedShape
        ? 'Nie zapisano kolejnego usunięcia. Wybierz następne narzędzie z paska.'
        : (editedShape
          ? 'Usuwanie zostało anulowane lub zakończone bez wyboru obiektu. Wybierz „Usuń obiekty”, zaznacz obiekt i kliknij „Zapisz zmiany”.'
          : 'Usuwanie zostało anulowane. Najpierw wybierz „Edytuj obiekty”, zmień obiekt i kliknij „Zapisz zmiany”.'),
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

    if (visibilityChanges.hidden) {
      setStatus('Warstwa jest ukryta. Teraz kliknij ponownie tę samą ikonę oka, aby ją wyświetlić.', true);
    }
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
    if (currentStep === 4) {
      document.dispatchEvent(new CustomEvent('geoportal:guide-prepare-draw'));
    }
    setStep(currentStep + 1);
  }

  function onRangeChange(event) {
    if (card.hidden || completed || !event.target.matches('input[type="range"]')) return;
    if (
      currentStep === 2 &&
      stepBaseline instanceof Map &&
      stepBaseline.has(event.target.id) &&
      event.target.value !== stepBaseline.get(event.target.id)
    ) {
      const sliderId = event.target.id;
      const newValue = event.target.value;
      const details = 'Zmieniono wartość suwaka ' + sliderId + ' na ' + newValue;
      window.clearTimeout(stepActionTimer);
      stepActionTimer = window.setTimeout(function () {
        if (card.hidden || completed) return;
        const slider = document.getElementById(sliderId);
        if (!slider || slider.value === stepBaseline.get(sliderId)) return;
        completeAction(details);
      }, 650);
    }
  }

  function onInterfaceClick(event) {
    if (card.hidden || completed) return;
    const target = event.target.closest('button');
    if (!target) return;

    if (currentStep === 3 && target.matches('button[id^="btn-toggle-"]')) {
      if (target.classList.contains('inactive')) {
        if (!visibilityChanges.hidden) {
          visibilityChanges.hidden = true;
          visibilityTarget = target.id;
          setDynamicFocus([target]);
          updateVisibilityProgress();
        } else if (target.id !== visibilityTarget) {
          setStatus('Kliknij ponownie ikonę oka przy ukrytej warstwie, aby ją wyświetlić.', true);
          setDynamicFocus([document.getElementById(visibilityTarget)]);
        }
      } else {
        if (visibilityChanges.hidden && target.id === visibilityTarget) {
          visibilityChanges.shown = true;
          updateVisibilityProgress();
        }
      }
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
  document.addEventListener('geoportal:draw-start', function () {
    if (card.hidden || currentStep !== 5 || completed) return;
    setDrawInstruction('Narzędzie wybrane. Kliknij mapę, aby rozpocząć rysowanie obiektu.');
    setDynamicFocus([document.getElementById('map')]);
  });
  document.addEventListener('geoportal:map-panend', function () {
    if (card.hidden || currentStep !== 1 || completed) return;
    navigationChanges.panned += 1;
    updateMapNavigation(navigationChanges.panned === 3);
  });
  document.addEventListener('geoportal:map-zoomend', function (event) {
    if (card.hidden || currentStep !== 1 || completed) return;
    if (event.detail.zoomIn) {
      navigationChanges.zoomed += 1;
      updateMapNavigation(true);
    }
  });
  document.addEventListener('geoportal:photo-opened', function () {
    if (card.hidden || currentStep !== 4 || completed) return;
    photoOpened = true;
    setStatus('Zdjęcie jest otwarte. Zamknij jego okno, aby ukończyć zadanie.', true);
    document.body.classList.add('guide-focus-photo-close');
    updatePhotoPopupLayout();
    const photoImage = document.querySelector('.leaflet-popup-content img');
    if (photoImage) {
      photoImage.addEventListener('load', keepPhotoPopupVisible, { once: true });
      photoImage.addEventListener('error', keepPhotoPopupVisible, { once: true });
    }
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
    window.setTimeout(keepPhotoPopupVisible, 80);
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Otworzono popup ze zdjęciem');
  });
  document.addEventListener('geoportal:photo-closed', function () {
    if (!card.hidden && currentStep === 4 && photoOpened) {
      document.body.classList.remove('guide-focus-photo-close');
      document.body.style.removeProperty('--guide-photo-popup-max-width');
      document.body.style.removeProperty('--guide-photo-popup-max-height');
      card.style.width = '';
      completeAction('Otworzono i zamknięto popup ze zdjęciem archiwalnym');
    }
  });
  document.addEventListener('geoportal:photos-loaded', function (event) {
    if (currentStep !== 4) return;

    clearPhotoTargets();
    if (card.hidden || completed) return;
    if (event.detail.hasPhotos) {
      setStatus('Zdjęcia z ' + event.detail.year + ' roku są dostępne. Kliknij pulsujący znacznik na mapie, aby otworzyć fotografię, a po obejrzeniu zamknij jej okno.', true);
      if (event.detail.locations && event.detail.locations.length) {
        schedulePhotoMapFocus(event.detail.locations);
      }
      logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Znaleziono zdjęcie dla roku ' + event.detail.year);
    } else {
      window.clearTimeout(photoFocusTimer);
      photoFocusTimer = null;
      const availableYears = event.detail.availableYears || [];
      const alternativeYear = availableYears.length
        ? availableYears.reduce(function (closest, year) {
          return Math.abs(year - event.detail.year) < Math.abs(closest - event.detail.year) ? year : closest;
        })
        : null;
      const alternativeHint = alternativeYear ? ' Spróbuj wybrać na przykład rok ' + alternativeYear + '.' : '';
      setStatus('Nie ma zdjęć z ' + event.detail.year + ' roku. Wybierz inny rok za pomocą suwaka.' + alternativeHint, true);
    }
  });
  document.addEventListener('geoportal:draw-created', function (event) {
    if (card.hidden || currentStep !== 5 || drawnLayer) return;
    drawnLayer = event.detail.layer;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Narysowano obiekt: ' + event.detail.layerType);
    updateDrawAndExportProgress();
  });
  document.addEventListener('geoportal:draw-edit-start', handleDrawEditStarted);
  document.addEventListener('geoportal:draw-edit-stop', handleDrawEditStopped);
  document.addEventListener('geoportal:draw-edit-change', scheduleDrawHighlightUpdate);
  document.addEventListener('geoportal:draw-delete-start', handleDrawDeleteStarted);
  document.addEventListener('geoportal:draw-delete-stop', handleDrawDeleteStopped);
  document.addEventListener('geoportal:draw-edited', function (event) {
    if (activeDrawMode === 'edit' && event.detail.count > 0) drawModeCommitted = true;
    if (card.hidden || currentStep !== 5 || event.detail.count < 1) return;
    const guideObjectEdited = event.detail.layers.includes(drawnLayer);
    if (!guideObjectEdited) {
      setStatus('Edytuj obiekt narysowany w tym kroku.', true);
      focusDrawToolbar();
      return;
    }
    if (editedShape) return;
    editedShape = true;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Edytowano obiekt');
    updateDrawAndExportProgress();
  });
  document.addEventListener('geoportal:draw-deleted', function (event) {
    if (activeDrawMode === 'delete' && event.detail.count > 0) drawModeCommitted = true;
    if (card.hidden || currentStep !== 5 || event.detail.count < 1) return;
    const guideObjectDeleted = event.detail.layers.includes(drawnLayer);
    if (!guideObjectDeleted) {
      setStatus('Usuń ten sam obiekt, który edytowano.', true);
      focusDrawToolbar();
      return;
    }
    if (!editedShape) {
      drawnLayer = null;
      setStatus('Najpierw narysuj i edytuj obiekt. Narysuj ponownie usunięty obiekt.', true);
      focusDrawToolbar();
      updateDrawAndExportProgress();
      return;
    }
    if (deletedShape) return;
    deletedShape = true;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Usunięto obiekt');
    updateDrawAndExportProgress();
  });
  document.addEventListener('geoportal:map-exported', function (event) {
    if (card.hidden || currentStep !== 5 || exportCompleted) return;
    exportCompleted = true;
    logGuide('PRZEWODNIK_POSTĘP', steps[currentStep].title, 'Wyeksportowano obraz: ' + event.detail.filename);
    updateDrawAndExportProgress();
  });
  window.addEventListener('resize', function () {
    updateSpotlight();
    keepPhotoPopupVisible();
  });
  window.addEventListener('scroll', updateSpotlight, true);
  document.addEventListener('geoportal:map-view-change', scheduleSpotlightUpdate);
  try {
    if (localStorage.getItem(storageKey) !== 'true') {
      autoStartTimer = window.setTimeout(function () {
        startGuide('pierwsze odwiedziny');
      }, 1800);
    }
  } catch (error) {
    console.warn('Nie udało się odczytać stanu przewodnika; przewodnik uruchomi się automatycznie.', error);
    autoStartTimer = window.setTimeout(function () {
      startGuide('pierwsze odwiedziny');
    }, 1800);
  }
})();
