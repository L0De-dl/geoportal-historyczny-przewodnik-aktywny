(function() {
  const launchButton = document.getElementById('btn-onboarding');
  const speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const steps = [
    {
      element: '#map',
      title: 'Witaj w Geoportalu Historycznym',
      stage: 1,
      narration: 'Witaj w Geoportalu Historycznym Gołańczy. To miejsce, w którym możesz oglądać dawne mapy i porównywać, jak zmieniała się przestrzeń miasta. W tym krótkim przewodniku samodzielnie sprawdzisz podkłady, warstwy, fotografie i narzędzia mapy. Możesz w każdej chwili zatrzymać instrukcję, powtórzyć narrację albo pominąć bieżące ćwiczenie. Tekst narracji jest cały czas widoczny jako napisy. Ćwiczenia są demonstracyjne — po zakończeniu przywrócę wcześniejsze ustawienia, aby mapa była gotowa do właściwego badania.',
      hint: 'Wybierz „Zaczynamy”, aby przejść do pierwszego ćwiczenia.',
      side: 'over',
      nextLabel: 'Zaczynamy'
    },
    {
      element: '#suwak-czasu',
      title: 'Wybór podkładu mapowego',
      stage: 2,
      action: 'basemap',
      narration: 'Podkład mapowy pokazuje mapę bazową dla wybranego okresu. Przesuń suwak lub użyj strzałek w panelu, aby obejrzeć inny dostępny rok. Podpis pod suwakiem informuje, która mapa jest aktualnie wybrana. Zwróć uwagę, jak zmienia się obraz mapy i jak wybór okresu wpływa na widoczne szczegóły. W badaniu możesz potem samodzielnie wybrać okres istotny dla własnego zadania.',
      hint: 'Przesuń suwak podkładu na dowolny inny rok.',
      side: 'left'
    },
    {
      element: '#btn-toggle-zabudowa',
      title: 'Włącz warstwę zabudowy',
      stage: 3,
      action: 'building-on',
      prepare: 'layers',
      narration: 'Warstwy wektorowe nakładają na mapę dodatkowe informacje. Przycisk z ikoną oka steruje ich widocznością, a suwak pozwala wybrać rok danych. Nazwa pod suwakiem podpowiada, dla jakiego okresu wyświetlane są dane. Warstwy można oglądać niezależnie od podkładu, więc mapa historyczna i informacja wektorowa nie muszą pochodzić z tego samego roku. Na potrzeby ćwiczenia warstwy zostały wyłączone. Włącz teraz warstwę zabudowy.',
      hint: 'Naciśnij ikonę oka przy warstwie zabudowy.',
      side: 'left'
    },
    {
      element: '#btn-toggle-zabudowa',
      title: 'Wyłącz warstwę zabudowy',
      stage: 3,
      action: 'building-off',
      narration: 'Widoczność warstwy można zmieniać w dowolnej chwili, bez zmieniania wybranego podkładu ani wybranego roku danych. Dzięki temu możesz porównywać sam podkład z dodatkowymi informacjami albo oglądać kilka warstw razem. Wyłącz teraz warstwę zabudowy.',
      hint: 'Naciśnij ponownie ikonę oka przy warstwie zabudowy.',
      side: 'left'
    },
    {
      element: '#btn-toggle-komunikacja',
      title: 'Włącz warstwę komunikacji',
      stage: 3,
      action: 'transport-on',
      narration: 'Warstwa komunikacji przedstawia obiekty związane z transportem. Podobnie jak zabudowa, może być włączana i wyłączana niezależnie, a jej rok można wybierać osobnym suwakiem. Włącz ją, aby zobaczyć, jak zestawiać informacje wektorowe z mapą bazową.',
      hint: 'Naciśnij ikonę oka przy warstwie komunikacji.',
      side: 'left'
    },
    {
      element: '#btn-toggle-zdjecia',
      title: 'Włącz warstwę zdjęć',
      stage: 4,
      action: 'photos-on',
      prepare: 'photos',
      narration: 'Warstwa zdjęć zawiera znaczniki powiązane z historycznymi fotografiami. Każdy znacznik wskazuje lokalizację zdjęcia, a dostępność fotografii zależy od wybranego roku. Włącz warstwę, a następnie wybierz na suwaku rok 1910 — to przykład demonstracyjny pozwalający zobaczyć działanie znaczników i okna zdjęcia. Nie musisz zmieniać pozostałych warstw.',
      hint: 'Włącz zdjęcia przyciskiem oka.',
      side: 'left'
    },
    {
      element: '#suwak-zdjecia',
      title: 'Wybierz rok fotografii',
      stage: 4,
      action: 'photos-year',
      narration: 'Suwak zdjęć wybiera rok fotografii niezależnie od podkładu mapowego. Przesuń go do roku 1910, aby wyświetlić znacznik dostępnego zdjęcia. W innych latach liczba i dostępność fotografii mogą być różne, dlatego czasem na mapie nie będzie znacznika. To nie oznacza, że warstwa jest wyłączona — sprawdź wtedy inny okres albo pozostaw warstwę aktywną.',
      hint: 'Ustaw suwak zdjęć na 1910.',
      side: 'left'
    },
    {
      element: '#map',
      title: 'Otwórz fotografię',
      stage: 4,
      action: 'photo-marker',
      narration: 'Znacznik na mapie oznacza miejsce, z którym związano fotografię. Kliknij widoczny znacznik, aby otworzyć zdjęcie i zapoznać się z jego opisem. Okno można zamknąć krzyżykiem, a mapa pozostaje dostępna do dalszego przeglądania. Właściwe zadania badawcze mogą wymagać samodzielnego odnalezienia innych informacji.',
      hint: 'Kliknij znacznik zdjęcia widoczny na mapie.',
      side: 'over'
    },
    {
      element: '.leaflet-draw-draw-marker',
      title: 'Umieść przykładowy marker',
      stage: 5,
      action: 'marker',
      narration: 'Pasek narzędziowy mapy pozwala dodawać własne oznaczenia oraz rysować i mierzyć obiekty. Wybierz narzędzie markera, a następnie kliknij dowolne miejsce na mapie. Położenie nie ma znaczenia — nie szukamy konkretnego obiektu. Pozostałe narzędzia rysowania działają podobnie: wybierasz ikonę, wykonujesz działanie na mapie, a gotowy kształt możesz później edytować lub usunąć. To tylko ćwiczeniowy punkt — zostanie usunięty po przewodniku.',
      hint: 'Wybierz ikonę markera na pasku rysowania, po czym kliknij mapę.',
      side: 'left'
    },
    {
      element: '.print-button',
      title: 'Eksportuj obraz mapy',
      stage: 5,
      action: 'export',
      narration: 'Możesz zapisać aktualny widok mapy jako obraz. Użyj przycisku eksportu na pasku mapy. Eksport obejmuje aktualnie widoczną mapę wraz z jej warstwami i oznaczeniami, dlatego przed zapisaniem możesz wybrać interesujący Cię widok. Pobieranie pliku może potrwać chwilę; po jego przygotowaniu przejdziemy do podsumowania.',
      hint: 'Kliknij przycisk eksportu mapy z ikoną drukarki.',
      side: 'left'
    },
    {
      element: '#map',
      title: 'Gotowe — przewodnik zakończony',
      stage: 6,
      narration: 'To koniec przewodnika. Poznałeś wybór podkładu, widoczność warstw, zdjęcia historyczne, marker i eksport mapy. Ustawienia sprzed ćwiczenia zostały przywrócone, a przykładowy marker usunięty. W kolejnych krokach możesz swobodnie korzystać z poznanych funkcji, ale przewodnik nie wskazuje odpowiedzi na zadania badawcze. Możesz teraz przejść do właściwej części badania.',
      hint: 'Wybierz „Zakończ”, aby zamknąć przewodnik.',
      side: 'over',
      nextLabel: 'Zakończ'
    }
  ];

  let driver;
  let currentIndex = -1;
  let initialState;
  let guideMarker;
  let hintTimer;
  let hintShown = false;
  let narrationPaused = false;
  let pauseButton;
  let prepared = {};

  function getInitialState() {
    const ids = ['suwak-czasu', 'suwak-zabudowa', 'suwak-komunikacja', 'suwak-zdjecia'];
    const values = {};
    ids.forEach(id => {
      values[id] = document.getElementById(id).value;
    });

    return {
      values,
      visibility: {
        podklad: document.getElementById('btn-toggle-podklad').classList.contains('active'),
        zabudowa: document.getElementById('btn-toggle-zabudowa').classList.contains('active'),
        komunikacja: document.getElementById('btn-toggle-komunikacja').classList.contains('active'),
        zdjecia: document.getElementById('btn-toggle-zdjecia').classList.contains('active')
      },
      mapView: {
        center: window.geoportalMap.getCenter(),
        zoom: window.geoportalMap.getZoom()
      }
    };
  }

  function setVisibility(id, visible) {
    const button = document.getElementById(id);
    if (button.classList.contains('active') !== visible) button.click();
  }

  function prepareStep(step) {
    if (!step.prepare || prepared[step.prepare]) return;

    window.geoportalOnboardingRestoring = true;
    if (step.prepare === 'layers') {
      setVisibility('btn-toggle-zabudowa', false);
      setVisibility('btn-toggle-komunikacja', false);
    } else if (step.prepare === 'photos') {
      setVisibility('btn-toggle-zdjecia', false);
    }
    window.geoportalOnboardingRestoring = false;
    prepared[step.prepare] = true;
  }

  function speak(text) {
    if (!speechAvailable) return;
    window.speechSynthesis.cancel();
    narrationPaused = false;
    if (pauseButton) pauseButton.textContent = 'Pauza';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.96;
    const polishVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('pl'));
    if (polishVoice) utterance.voice = polishVoice;
    window.speechSynthesis.speak(utterance);
  }

  function moveNext() {
    clearTimeout(hintTimer);
    if (currentIndex === steps.length - 1) {
      finishGuide();
      return;
    }
    driver.moveNext();
  }

  function addButton(container, label, action, primary) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (primary) button.classList.add('onboarding-primary');
    button.addEventListener('click', action);
    container.appendChild(button);
    return button;
  }

  function renderPopover(popover, state) {
    currentIndex = state.activeIndex;
    const step = steps[currentIndex];
    if (!step) return;

    prepareStep(step);
    hintShown = false;
    popover.description.textContent = step.narration;
    popover.footer.replaceChildren();

    const controls = document.createElement('div');
    controls.className = 'onboarding-controls';
    const replayButton = addButton(controls, speechAvailable ? 'Odtwórz audio' : 'Audio niedostępne — czytaj napisy', () => speak(step.narration), false);
    replayButton.disabled = !speechAvailable;
    if (speechAvailable) {
      pauseButton = addButton(controls, narrationPaused ? 'Wznów' : 'Pauza', () => {
        if (narrationPaused) window.speechSynthesis.resume();
        else window.speechSynthesis.pause();
        narrationPaused = !narrationPaused;
        pauseButton.textContent = narrationPaused ? 'Wznów' : 'Pauza';
      }, false);
    }

    if (step.nextLabel) {
      addButton(controls, step.nextLabel, moveNext, true);
    } else {
      addButton(controls, 'Pomiń krok', moveNext, true);
    }
    addButton(controls, 'Przerwij', finishGuide, false);

    const progress = document.createElement('div');
    progress.className = 'onboarding-progress';
    progress.textContent = `Etap ${step.stage} z 6`;
    const progressBar = document.createElement('progress');
    progressBar.max = 6;
    progressBar.value = step.stage;
    progressBar.setAttribute('aria-label', progress.textContent);
    popover.footer.append(controls, progress, progressBar);

    speak(step.narration);
    clearTimeout(hintTimer);
    if (step.action) {
      const showHint = () => {
        if (currentIndex !== state.activeIndex || hintShown) return;
        if (speechAvailable && window.speechSynthesis.speaking) {
          hintTimer = setTimeout(showHint, 5000);
          return;
        }
        hintShown = true;
        const hint = document.createElement('div');
        hint.className = 'onboarding-hint';
        hint.textContent = `Podpowiedź: ${step.hint}`;
        popover.description.appendChild(hint);
        speak(step.hint);
      };
      hintTimer = setTimeout(showHint, 25000);
    }
  }

  function restoreState() {
    if (!initialState) return;
    window.geoportalOnboardingRestoring = true;

    const baseSlider = document.getElementById('suwak-czasu');
    baseSlider.value = initialState.values['suwak-czasu'];
    baseSlider.dispatchEvent(new Event('change', { bubbles: true }));

    ['suwak-zabudowa', 'suwak-komunikacja', 'suwak-zdjecia'].forEach(id => {
      const slider = document.getElementById(id);
      slider.value = initialState.values[id];
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    setVisibility('btn-toggle-podklad', initialState.visibility.podklad);
    setVisibility('btn-toggle-zabudowa', initialState.visibility.zabudowa);
    setVisibility('btn-toggle-komunikacja', initialState.visibility.komunikacja);
    setVisibility('btn-toggle-zdjecia', initialState.visibility.zdjecia);
    window.geoportalMap.setView(initialState.mapView.center, initialState.mapView.zoom);

    if (guideMarker && window.L) {
      window.dispatchEvent(new CustomEvent('geoportal:remove-onboarding-marker', {
        detail: { layer: guideMarker }
      }));
      guideMarker = null;
    }
    window.dispatchEvent(new CustomEvent('geoportal:close-popup'));
    window.geoportalOnboardingRestoring = false;
    initialState = null;
  }

  function finishGuide() {
    clearTimeout(hintTimer);
    if (speechAvailable) window.speechSynthesis.cancel();
    window.geoportalOnboardingActive = false;
    if (driver) {
      driver.destroy();
      driver = null;
    }
    restoreState();
    window.dispatchEvent(new CustomEvent('geoportal:onboarding-finished'));
    launchButton.textContent = '▶ Uruchom przewodnik ponownie';
    launchButton.focus();
  }

  function startGuide() {
    if (!window.driver || !window.driver.js) {
      launchButton.textContent = 'Nie udało się wczytać przewodnika';
      console.error('Nie udało się załadować biblioteki Driver.js.');
      return;
    }

    initialState = getInitialState();
    guideMarker = null;
    prepared = {};
    window.geoportalOnboardingActive = true;
    driver = window.driver.js.driver({
      animate: true,
      allowClose: false,
      disableActiveInteraction: false,
      overlayOpacity: 0.65,
      showButtons: [],
      popoverClass: 'geoportal-onboarding',
      steps: steps.map(step => ({
        element: step.element,
        popover: {
          title: step.title,
          description: step.narration,
          side: step.side,
          align: 'center'
        }
      })),
      onPopoverRender: renderPopover
    });
    driver.drive();
  }

  launchButton.addEventListener('click', startGuide);

  document.addEventListener('change', event => {
    if (!window.geoportalOnboardingActive) return;
    const step = steps[currentIndex];
    if (!step) return;

    if (step.action === 'basemap' && event.target.id === 'suwak-czasu' &&
        event.target.value !== initialState.values['suwak-czasu']) {
      moveNext();
    } else if (step.action === 'photos-year' && event.target.id === 'suwak-zdjecia' &&
        event.target.value === '1910') {
      moveNext();
    }
  });

  document.addEventListener('click', event => {
    if (!window.geoportalOnboardingActive) return;
    const step = steps[currentIndex];
    if (!step) return;
    const target = event.target.closest('button');
    if (!target) return;

    if (step.action === 'building-on' && target.id === 'btn-toggle-zabudowa' && target.classList.contains('active')) {
      moveNext();
    } else if (step.action === 'building-off' && target.id === 'btn-toggle-zabudowa' && !target.classList.contains('active')) {
      moveNext();
    } else if (step.action === 'transport-on' && target.id === 'btn-toggle-komunikacja' && target.classList.contains('active')) {
      moveNext();
    } else if (step.action === 'photos-on' && target.id === 'btn-toggle-zdjecia' && target.classList.contains('active')) {
      moveNext();
    }
  });

  window.addEventListener('geoportal:photo-opened', () => {
    if (window.geoportalOnboardingActive && steps[currentIndex].action === 'photo-marker') moveNext();
  });

  window.addEventListener('geoportal:marker-created', event => {
    if (!window.geoportalOnboardingActive || steps[currentIndex].action !== 'marker') return;
    if (event.detail.layerType !== 'marker') return;
    guideMarker = event.detail.layer;
    moveNext();
  });

  window.addEventListener('geoportal:map-exported', () => {
    if (window.geoportalOnboardingActive && steps[currentIndex].action === 'export') moveNext();
  });
})();
