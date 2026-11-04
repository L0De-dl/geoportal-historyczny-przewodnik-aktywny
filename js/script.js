const map = L.map('map', { 
  zoomControl: false, 
  zoomSnap: 0.5,
  preferCanvas: true
}).setView([52.95173327595248, 17.300419185219326], 13.5);

const PrintControl = L.Control.extend({
    options: { position: 'topleft' },

    onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'print-button', container);
        
        button.innerHTML = '🖨️'; 
        button.title = "Eksport mapy";

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(button, 'click', (e) => {
            L.DomEvent.stop(e);
            exportMap();
        });

        return container;
    }
});
  
const kontrolkaTytulu = L.control({ position: "topleft" });
kontrolkaTytulu.onAdd = function() {
  const div = L.DomUtil.create("div", "tytul-mapy");
  div.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <img src="assets/icon/logo.png" alt="Logo" style="height:60px;">
      <span>Geoportal Historyczny Gołańczy</span>
    </div>
  `;
  return div;
};
kontrolkaTytulu.addTo(map);

L.control.zoom({ position: "topleft" }).addTo(map);
L.control.locate({ position: "topleft" }).addTo(map);
new PrintControl().addTo(map);
L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

const kontrolkaWspolrzednych = L.control({ position: 'bottomleft' });
kontrolkaWspolrzednych.onAdd = function() {
  const div = L.DomUtil.create('div', 'wspolrzedne-myszki');
  div.innerHTML = "X: - | Y: -";
  return div;
};
kontrolkaWspolrzednych.addTo(map);

map.on('mousemove', function(e) {
  const coords = e.latlng;
  const y = coords.lng.toFixed(5);
  const x = coords.lat.toFixed(5);
  document.querySelector('.wspolrzedne-myszki').innerHTML = `X: ${x} &nbsp;&nbsp; Y: ${y}`;
});

const layer1890 = L.imageOverlay('assets/map/1890.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1911 = L.imageOverlay('assets/map/1911.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1924 = L.imageOverlay('assets/map/1924.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1933 = L.imageOverlay('assets/map/1933-a.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1934 = L.imageOverlay('assets/map/1934.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1935 = L.imageOverlay('assets/map/1935.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1940 = L.imageOverlay('assets/map/1940.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1941 = L.imageOverlay('assets/map/1941.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1942_a = L.imageOverlay('assets/map/1942-a.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1942_b = L.imageOverlay('assets/map/1942-b.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1944 = L.imageOverlay('assets/map/1944.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1966 = L.imageOverlay('assets/map/1966.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1976 = L.imageOverlay('assets/map/1976.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer1981 = L.imageOverlay('assets/map/1981.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2000 = L.imageOverlay('assets/map/2000.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2002 = L.imageOverlay('assets/map/2002.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2014 = L.imageOverlay('assets/map/2014.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2015 = L.imageOverlay('assets/map/2015.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2016 = L.imageOverlay('assets/map/2016.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2017 = L.imageOverlay('assets/map/2017.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2018 = L.imageOverlay('assets/map/2018.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2019 = L.imageOverlay('assets/map/2019.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2020 = L.imageOverlay('assets/map/2020.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2021 = L.imageOverlay('assets/map/2021.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2022 = L.imageOverlay('assets/map/2022.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2023 = L.imageOverlay('assets/map/2023.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);
const layer2026 = L.imageOverlay('assets/map/2026.png', [[52.970939, 17.265868], [52.929265, 17.343682]]);

const layerTable = [
  layer1890, layer1911, layer1924, layer1933, layer1934, layer1935, 
  layer1940, layer1941, layer1942_a, layer1942_b, layer1944, layer1966, 
  layer1976, layer1981, layer2000, layer2002, layer2014, layer2015, 
  layer2016, layer2017, layer2018, layer2019, layer2020, layer2021, 
  layer2022, layer2023, layer2026
];

const layerNames = [
  "Mapa z 1890 roku", "Mapa z 1911 roku", "Mapa z 1924 roku", "Mapa z 1933 roku", 
  "Mapa z 1934 roku", "Mapa z 1935 roku", "Mapa z 1940 roku", "Mapa z 1941 roku", 
  "Mapa z 1942_a roku", "Mapa z 1942_b roku", "Mapa z 1944 roku", "Mapa z 1966 roku", 
  "Mapa z 1976 roku", "Mapa z 1981 roku", "Mapa z 2000 roku", "Mapa z 2002 roku", 
  "Mapa z 2014 roku", "Mapa z 2015 roku", "Mapa z 2016 roku", "Mapa z 2017 roku", 
  "Mapa z 2018 roku", "Mapa z 2019 roku", "Mapa z 2020 roku", "Mapa z 2021 roku", 
  "Mapa z 2022 roku", "Mapa z 2023 roku", "Mapa z 2026 roku"
];

// Stany widoczności poszczególnych warstw
let widocznyPodklad = true;
let widocznaZabudowa = true;
let widocznaKomunikacja = true;

let ostatniaZmiana = 0;
const opoznienieMs = 120;

function zmienPodkladMapy(indeks) {
  layerTable.forEach(p => { if (map.hasLayer(p)) map.removeLayer(p); });
  
  if (widocznyPodklad && layerTable[indeks]) {
    layerTable[indeks].addTo(map);
  }
  document.getElementById('nazwa-podkladu').textContent = layerNames[indeks];
  document.getElementById('suwak-czasu').value = indeks;
}

document.getElementById('suwak-czasu').addEventListener('input', function(e) {
  const indeks = parseInt(e.target.value);
  document.getElementById('nazwa-podkladu').textContent = layerNames[indeks];

  const teraz = Date.now();
  if (teraz - ostatniaZmiana > opoznienieMs) {
    ostatniaZmiana = teraz;
    layerTable.forEach(p => { if (map.hasLayer(p)) map.removeLayer(p); });
    if (widocznyPodklad && layerTable[indeks]) {
      layerTable[indeks].addTo(map);
    }
  }
});

document.getElementById('suwak-czasu').addEventListener('change', function(e) {
  const indeks = parseInt(e.target.value);
  zmienPodkladMapy(indeks);
});

document.getElementById('btn-suwak-lewy').addEventListener('click', function() {
  let aktualnyIndeks = parseInt(document.getElementById('suwak-czasu').value);
  if (aktualnyIndeks > 0) {
    aktualnyIndeks--;
    zmienPodkladMapy(aktualnyIndeks);
  }
});

document.getElementById('btn-suwak-prawy').addEventListener('click', function() {
  let aktualnyIndeks = parseInt(document.getElementById('suwak-czasu').value);
  if (aktualnyIndeks < layerTable.length - 1) {
    aktualnyIndeks++;
    zmienPodkladMapy(aktualnyIndeks);
  }
});

// Przycisk toggle dla podkładu
document.getElementById('btn-toggle-podklad').addEventListener('click', function() {
  widocznyPodklad = !widocznyPodklad;
  this.classList.toggle('inactive', !widocznyPodklad);
  this.classList.toggle('active', widocznyPodklad);
  
  const indeks = parseInt(document.getElementById('suwak-czasu').value);
  layerTable.forEach(p => { if (map.hasLayer(p)) map.removeLayer(p); });
  if (widocznyPodklad && layerTable[indeks]) {
    layerTable[indeks].addTo(map);
  }
});

// Ustawienie domyślne na najnowszy podkład (2026)
const suwak = document.getElementById('suwak-czasu');
suwak.value = 26;
layer2026.addTo(map);
document.getElementById('nazwa-podkladu').textContent = "Mapa z 2026 roku";

// Przywrócenie narzędzi rysowania i pomiaru (Leaflet Draw)
const drawnElements = new L.FeatureGroup();
map.addLayer(drawnElements);

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnElements, 
    remove: true                     
  },
  draw: {
    polyline: { showMeasurements: true, showLength: true, metric: true },
    polygon: { showMeasurements: true, showArea: true, metric: true, allowIntersection: false },
    rectangle: { showMeasurements: true, metric: true },
    circle: true,
    marker: true
  }
});
map.addControl(drawControl);

function formatDistance(dystans) {
  if (dystans >= 1000) return (dystans / 1000).toFixed(2) + ' km';
  return dystans.toFixed(2) + ' m';
}

function formatujPowierzchnie(pole) {
  if (pole >= 1000000) return (pole / 1000000).toFixed(2) + ' km²';
  return pole.toFixed(2) + ' m²';
}

function updateMeasurements(layer, type) {
  let opcjeTooltipa = {
    permanent: true,
    direction: "center",
    className: "etykieta-promienia"
  };

  if (type === 'polyline' || type === 'marker') {
    opcjeTooltipa.direction = 'top';
    opcjeTooltipa.offset = [0, -10];
  }

  if (!layer.getTooltip()) {
    layer.bindTooltip("", opcjeTooltipa);
  } else {
    L.extend(layer.getTooltip().options, opcjeTooltipa);
  }

  if (type === 'polyline') {
    const latlngs = layer.getLatLngs();
    let calkowitaDlugosc = 0;
    
    for (let i = 0; i < latlngs.length - 1; i++) {
      calkowitaDlugosc += latlngs[i].distanceTo(latlngs[i+1]);
    }
    
    layer.setTooltipContent("Długość: " + formatDistance(calkowitaDlugosc));
    
  } else if (type === 'polygon' || type === 'rectangle') {
    const latlngs = layer.getLatLngs()[0];
    const pole = L.GeometryUtil.geodesicArea(latlngs);
    layer.setTooltipContent("Powierzchnia: " + formatujPowierzchnie(pole));
    
  } else if (type === 'circle') {
    const radius = layer.getRadius();
    layer.setTooltipContent("Promień: " + formatDistance(radius));
    
  } else if (type === 'marker') {
    const coords = layer.getLatLng();
    layer.setTooltipContent(`Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`);
  }
}

map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnElements.addLayer(layer);
  updateMeasurements(layer, e.layerType);
});

map.on(L.Draw.Event.EDITED, function (e) {
  e.layers.eachLayer(function (layer) {
    let type = 'marker';
    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) type = 'polyline';
    else if (layer instanceof L.Polygon) type = 'polygon';
    else if (layer instanceof L.Circle) type = 'circle';
    
    updateMeasurements(layer, type);
  });
});

function exportMap() {
    const starePrzesuniecie = map.options.fadeAnimation;
    map.options.fadeAnimation = false;

    // Pobieramy bezpośrednio kontener mapy
    const element = document.getElementById('map');

    setTimeout(() => {
        html2canvas(element, {
            useCORS: true,       // Zmieniono na true, aby obsługiwało zasoby
            allowTaint: false,   // Wyłączone taint, wymaga CORS dla obrazków
            backgroundColor: "#ffffff",
            scale: 2,
            logging: true,       // Włącz konsolę, jeśli chcesz zobaczyć ewentualne błędy w F12
            scrollX: 0,
            scrollY: 0
        }).then(function(canvas) {
            const link = document.createElement("a");
            link.download = "mapa-golancza.png";
            link.href = canvas.toDataURL("image/png");
            link.click();

            map.options.fadeAnimation = starePrzesuniecie;
        }).catch(function(error) {
            console.error("Błąd podczas eksportu mapy:", error);
            alert("Nie udało się wyeksportować mapy. Sprawdź konsolę przeglądarki.");
            map.options.fadeAnimation = starePrzesuniecie;
        });
    }, 250); // Zwiększono lekko opóźnienie, aby upewnić się, że warstwy się wyrenderowały
}

// --- OBSŁUGA WARSTW WEKTOROWYCH (Zabudowa i Komunikacja) ---

// Tablica lat odpowiadająca indeksom suwaków (tak sama jak przy podkładach)
const wektoroweLata = [
  "1890", "1911", "1924", "1933", "1934", "1935", 
  "1940", "1941", "1942_a", "1942_b", "1944", "1966", 
  "1976", "1981", "2000", "2002", "2014", "2015", 
  "2016", "2017", "2018", "2019", "2020", "2021", 
  "2022", "2023", "2026"
];

let aktualnaWarstwaZabudowy = null;
let aktualnaWarstwaKomunikacji = null;

// Cache do przechowywania pobranych warstw GeoJSON, aby nie pobierać ich ponownie
const cacheGeoJSON = {};

// Styly dla obiektów wektorowych
const stylZabudowy = {
  color: "#d9534f",
  weight: 1,
  fillColor: "#f0ad4e",
  fillOpacity: 0.6
};

const stylDrogi = {
  color: "#337ab7",
  weight: 3,
  opacity: 0.8
};

const stylKolei = {
  color: "#000000",
  weight: 2,
  dashArray: "5, 5",
  opacity: 0.9
};

// Funkcja wczytująca zabudowę dla danego indeksu
function wczytajZabudowę(indeks) {
  if (aktualnaWarstwaZabudowy) {
    map.removeLayer(aktualnaWarstwaZabudowy);
    aktualnaWarstwaZabudowy = null;
  }

  const rokStr = wektoroweLata[indeks];
  const nazwaPliku = `assets/vector/zabudowa_${rokStr}.geojson`;
  const etykieta = `Zabudowa z roku ${layerNames[indeks].replace('Mapa z ', '')}`;

  document.getElementById('nazwa-zabudowa').textContent = etykieta;
  document.getElementById('suwak-zabudowa').value = indeks;

  if (cacheGeoJSON[nazwaPliku]) {
    aktualnaWarstwaZabudowy = cacheGeoJSON[nazwaPliku];
    if (widocznaZabudowa) {
      map.addLayer(aktualnaWarstwaZabudowy);
    }
  } else {
    fetch(nazwaPliku)
      .then(response => {
        if (!response.ok) throw new Error("Brak pliku");
        return response.json();
      })
      .then(data => {
        const layer = L.geoJSON(data, { style: stylZabudowy });
        cacheGeoJSON[nazwaPliku] = layer;
        if (parseInt(document.getElementById('suwak-zabudowa').value) === indeks) {
          aktualnaWarstwaZabudowy = layer;
          if (widocznaZabudowa) {
            map.addLayer(aktualnaWarstwaZabudowy);
          }
        }
      })
      .catch(() => {
        document.getElementById('nazwa-zabudowa').textContent = `Brak zabudowy (${rokStr})`;
      });
  }
}

// Funkcja wczytująca komunikację dla danego indeksu
function wczytajKomunikację(indeks) {
  if (aktualnaWarstwaKomunikacji) {
    map.removeLayer(aktualnaWarstwaKomunikacji);
    aktualnaWarstwaKomunikacji = null;
  }

  const rokStr = wektoroweLata[indeks];
  const plikDrogi = `assets/vector/komunikacja_${rokStr}.geojson`;
  const plikKolej = `assets/vector/komunikacja2_${rokStr}.geojson`;
  const etykieta = `Komunikacja z roku ${layerNames[indeks].replace('Mapa z ', '')}`;

  document.getElementById('nazwa-komunikacja').textContent = etykieta;
  document.getElementById('suwak-komunikacja').value = indeks;

  Promise.all([
    cacheGeoJSON[plikDrogi] ? Promise.resolve(cacheGeoJSON[plikDrogi]) : fetch(plikDrogi).then(r => r.ok ? r.json() : null).catch(() => null),
    cacheGeoJSON[plikKolej] ? Promise.resolve(cacheGeoJSON[plikKolej]) : fetch(plikKolej).then(r => r.ok ? r.json() : null).catch(() => null)
  ]).then(([daneDrogi, daneKolej]) => {
    const group = L.layerGroup();
    let hasData = false;

    if (daneDrogi) {
      const lDrogi = daneDrogi.type ? L.geoJSON(daneDrogi, { style: stylDrogi }) : daneDrogi;
      if (!cacheGeoJSON[plikDrogi]) cacheGeoJSON[plikDrogi] = lDrogi;
      group.addLayer(lDrogi);
      hasData = true;
    }

    if (daneKolej) {
      const lKolej = daneKolej.type ? L.geoJSON(daneKolej, { style: stylKolei }) : daneKolej;
      if (!cacheGeoJSON[plikKolej]) cacheGeoJSON[plikKolej] = lKolej;
      group.addLayer(lKolej);
      hasData = true;
    }

    if (hasData && parseInt(document.getElementById('suwak-komunikacja').value) === indeks) {
      aktualnaWarstwaKomunikacji = group;
      if (widocznaKomunikacja) {
        map.addLayer(aktualnaWarstwaKomunikacji);
      }
    } else if (!hasData) {
      document.getElementById('nazwa-komunikacja').textContent = `Brak komunikacji (${rokStr})`;
    }
  });
}

// Event Listeners: Suwak Zabudowy
document.getElementById('suwak-zabudowa').addEventListener('input', function(e) {
  wczytajZabudowę(parseInt(e.target.value));
});
document.getElementById('btn-zabudowa-lewy').addEventListener('click', function() {
  let idx = parseInt(document.getElementById('suwak-zabudowa').value);
  if (idx > 0) wczytajZabudowę(--idx);
});
document.getElementById('btn-zabudowa-prawy').addEventListener('click', function() {
  let idx = parseInt(document.getElementById('suwak-zabudowa').value);
  if (idx < wektoroweLata.length - 1) wczytajZabudowę(++idx);
});

// Przycisk toggle dla zabudowy
document.getElementById('btn-toggle-zabudowa').addEventListener('click', function() {
  widocznaZabudowa = !widocznaZabudowa;
  this.classList.toggle('inactive', !widocznaZabudowa);
  this.classList.toggle('active', widocznaZabudowa);

  if (aktualnaWarstwaZabudowy) {
    if (widocznaZabudowa) {
      map.addLayer(aktualnaWarstwaZabudowy);
    } else {
      map.removeLayer(aktualnaWarstwaZabudowy);
    }
  }
});

// Event Listeners: Suwak Komunikacji
document.getElementById('suwak-komunikacja').addEventListener('input', function(e) {
  wczytajKomunikację(parseInt(e.target.value));
});
document.getElementById('btn-komunikacja-lewy').addEventListener('click', function() {
  let idx = parseInt(document.getElementById('suwak-komunikacja').value);
  if (idx > 0) wczytajKomunikację(--idx);
});
document.getElementById('btn-komunikacja-prawy').addEventListener('click', function() {
  let idx = parseInt(document.getElementById('suwak-komunikacja').value);
  if (idx < wektoroweLata.length - 1) wczytajKomunikację(++idx);
});

// Przycisk toggle dla komunikacji
document.getElementById('btn-toggle-komunikacja').addEventListener('click', function() {
  widocznaKomunikacja = !widocznaKomunikacja;
  this.classList.toggle('inactive', !widocznaKomunikacja);
  this.classList.toggle('active', widocznaKomunikacja);

  if (aktualnaWarstwaKomunikacji) {
    if (widocznaKomunikacja) {
      map.addLayer(aktualnaWarstwaKomunikacji);
    } else {
      map.removeLayer(aktualnaWarstwaKomunikacji);
    }
  }
});

// Uruchomienie domyślne na najnowszy rok (indeks 26 / 2026)
wczytajZabudowę(26);
wczytajKomunikację(26);


//oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
//oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
//oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
//oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
//oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo

// --- OBSŁUGA WARSTWY ZE ZDJĘCIAMI DLA KAŻDEGO ROKU (1890 - 2026) ---

let widoczneZdjecia = true;
let aktualnaWarstwaZdjec = null;

// Baza markerów przypisana do konkretnych lat
const bazyZdjecDlaLat = {
    // dworzec
    1910: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-1910.jpg" }
    ],
    1911: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-1911.jpg" }
    ],
    1927: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-1927.jpg" }
    ],
    2010: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-2010.jpg" }
    ],
    2014: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-2014.jpg" }
    ],
    2020: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-2020.jpg" }
    ],
    2024: [
      { lat: 52.94732122181164, lng: 17.30609284386365, tytul: "Dworzec", url: "assets/foto/dworzec-2024.jpg" }
    ]
};

function wczytajZdjeciaDlaRoku(rok) {
  if (aktualnaWarstwaZdjec) {
    map.removeLayer(aktualnaWarstwaZdjec);
    aktualnaWarstwaZdjec = null;
  }

  const etykieta = `Zdjęcia z roku ${rok}`;
  document.getElementById('nazwa-zdjecia').textContent = etykieta;
  document.getElementById('suwak-zdjecia').value = rok;

  const group = L.layerGroup();
  let znalezionoMarkerow = false;

  // Sprawdzamy, czy dla podanego roku istnieją zdjęcia w bazie
  if (bazyZdjecDlaLat[rok]) {
    const ikonaZdjecia = L.icon({
      iconUrl: 'assets/icon/icon-01.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    bazyZdjecDlaLat[rok].forEach(item => {
      const marker = L.marker([item.lat, item.lng], { icon: ikonaZdjecia });
      
const popupContent = `
  <div style="text-align: center; width: 650px; max-width: 100%;">
    <b>${item.tytul}</b><br><br>
    <img src="${item.url}" alt="${item.tytul}" loading="lazy" style="width: 100%; height: auto; max-height: 600px; object-fit: contain; border-radius: 4px;" onerror="this.onerror=null; this.src='assets/icon/logo.png';">
  </div>
`;
      
      marker.bindPopup(popupContent);
      group.addLayer(marker);
      znalezionoMarkerow = true;
    });
  }

  aktualnaWarstwaZdjec = group;
  if (widoczneZdjecia) {
    map.addLayer(aktualnaWarstwaZdjec);
  }

  if (!znalezionoMarkerow) {
    document.getElementById('nazwa-zdjecia').textContent = `Brak zdjęć (${rok})`;
  }
}

// Event Listeners: Suwak Zdjęć
document.getElementById('suwak-zdjecia').addEventListener('input', function(e) {
  wczytajZdjeciaDlaRoku(parseInt(e.target.value));
});

document.getElementById('btn-zdjecia-lewy').addEventListener('click', function() {
  let rok = parseInt(document.getElementById('suwak-zdjecia').value);
  if (rok > 1890) {
    wczytajZdjeciaDlaRoku(rok - 1);
  }
});

document.getElementById('btn-zdjecia-prawy').addEventListener('click', function() {
  let rok = parseInt(document.getElementById('suwak-zdjecia').value);
  if (rok < 2026) {
    wczytajZdjeciaDlaRoku(rok + 1);
  }
});

// Przycisk toggle dla zdjęć (👁️)
document.getElementById('btn-toggle-zdjecia').addEventListener('click', function() {
  widoczneZdjecia = !widoczneZdjecia;
  this.classList.toggle('inactive', !widoczneZdjecia);
  this.classList.toggle('active', widoczneZdjecia);

  if (aktualnaWarstwaZdjec) {
    if (widoczneZdjecia) {
      map.addLayer(aktualnaWarstwaZdjec);
    } else {
      map.removeLayer(aktualnaWarstwaZdjec);
    }
  }
});

// Uruchomienie domyślne suwaka zdjęć na rok 2026
wczytajZdjeciaDlaRoku(2026);

// --- SYSTEM LOGOWANIA AKTYWNOŚCI UŻYTKOWNIKA DO CSV ---

const startTime = performance.now();
let lastClickTime = startTime;
const userLogs = [];

// Obiekt do zliczania kliknięć w poszczególne elementy
const elementClickCounts = {};

function logEvent(actionType, targetName, additionalInfo = '') {
  const now = performance.now();
  
  const timeFromStart = ((now - startTime) / 1000).toFixed(2).replace('.', ',');
  const timeFromPrev = ((now - lastClickTime) / 1000).toFixed(2).replace('.', ',');
  
  lastClickTime = now;

  if (!elementClickCounts[targetName]) {
    elementClickCounts[targetName] = 0;
  }
  elementClickCounts[targetName]++;
  const clickCountForElement = elementClickCounts[targetName];

  userLogs.push({
    czas_od_startu_s: timeFromStart,
    czas_od_poprzedniego_s: timeFromPrev,
    numer_klikniecia_w_element: clickCountForElement,
    typ_akcji: actionType,
    obiekt_cel: targetName,
    szczegoly: additionalInfo
  });
}

// 1. Ogólne nasłuchiwanie kliknięć w interfejsie
document.addEventListener('click', function(e) {
  const target = e.target.closest('button, input, a, .leaflet-control');
  if (!target) return;
  if (target.id === 'btn-pobierz-logi') return;

  let nazwa = target.id || target.className || (target.innerText ? target.innerText.trim() : '') || 'Element UI';
  if (target.tagName === 'INPUT') {
    nazwa = `Input (${target.id || target.type}): ${target.value}`;
  }
  
  logEvent('KLIKNIĘCIE', nazwa, target.title || '');
});

// 2. Przechwytywanie kontrolek Leafleta
const leafletButtons = document.querySelectorAll('.leaflet-control button, .leaflet-bar a, .print-button');
if (leafletButtons && leafletButtons.length > 0) {
  leafletButtons.forEach(el => {
    el.addEventListener('click', function() {
      logEvent('KONTROLKA_MAPY', this.title || this.className || 'Przycisk mapy', '');
    });
  });
}

// 3. Śledzenie zmian na suwakach
const rangeInputs = document.querySelectorAll('input[type="range"]');
if (rangeInputs && rangeInputs.length > 0) {
  rangeInputs.forEach(suwak => {
    suwak.addEventListener('change', function(e) {
      logEvent('ZMIANA_SUWAKA', e.target.id, `Wartość: ${e.target.value}`);
    });
  });
}

// 4. Kliknięcia w mapę i rysowanie
if (typeof map !== 'undefined' && map) {
  map.on('click', function(e) {
    logEvent('MAPA_KLIKNIĘCIE', 'Mapa', `Lat: ${e.latlng.lat.toFixed(5).replace('.', ',')}, Lng: ${e.latlng.lng.toFixed(5).replace('.', ',')}`);
  });

  if (typeof L !== 'undefined' && L.Draw && L.Draw.Event) {
    map.on(L.Draw.Event.CREATED, function(e) {
      logEvent('NARZĘDZIE_DRAW', `Utworzono: ${e.layerType}`, '');
    });

    map.on(L.Draw.Event.DELETED, function(e) {
      logEvent('NARZĘDZIE_DRAW', 'Usunięto elementy rysunku', '');
    });
  }

  // 5. Tworzenie dyskretnego przycisku w prawym dolnym rogu (bez obramowania)
  const LogControl = L.Control.extend({
      options: { position: 'bottomright' },

      onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-control');
		  container.style.border = 'none';
container.style.boxShadow = 'none';
container.style.background = 'transparent';
          const button = L.DomUtil.create('a', '', container);
          
          button.id = 'btn-pobierz-logi';
          button.innerHTML = '📊'; 
          button.title = "Pobierz logi badawcze (CSV)";
button.style.backgroundColor = 'transparent';
button.style.border = 'none';
button.style.boxShadow = 'none';
          button.style.width = '24px';
          button.style.height = '24px';
          button.style.display = 'flex';
          button.style.alignItems = 'center';
          button.style.justifyContent = 'center';
          button.style.fontSize = '12px';
          button.style.textDecoration = 'none';
          button.style.color = 'black';
          button.style.opacity = '0.08';
          button.style.cursor = 'pointer';

          button.addEventListener('mouseenter', () => { button.style.opacity = '1'; });
          button.addEventListener('mouseleave', () => { button.style.opacity = '0.08'; });

          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.on(button, 'click', (e) => {
              L.DomEvent.stop(e);
              
              if (userLogs.length === 0) {
                alert("Brak zebranych logów do pobrania.");
                return;
              }

              let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
              csvContent += "Czas od startu (s);Czas od poprzedniego (s);Nr kliknięcia w element;Typ akcji;Obiekt / Cel;Szczegóły\n";

              userLogs.forEach(row => {
                const escapedSzczegoly = `"${(row.szczegoly || '').replace(/"/g, '""')}"`;
                const escapedCel = `"${(row.obiekt_cel || '').replace(/"/g, '""')}"`;
                
                // Użycie formatu ="" wymusza na Excelu traktowanie wartości jako czysty tekst/liczba bez zgadywania dat
                const formatCzasStart = `="${row.czas_od_startu_s}"`;
                const formatCzasPrev = `="${row.czas_od_poprzedniego_s}"`;

                csvContent += `${formatCzasStart};${formatCzasPrev};${row.numer_klikniecia_w_element};${row.typ_akcji};${escapedCel};${escapedSzczegoly}\n`;
              });

              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `geoportal_logi_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          });

          return container;
      }
  });

  new LogControl().addTo(map);
}