// 1. KONFIGURATION: Hier deine Dateinamen und Anzeigenamen anpassen
const tracksConfig = [
    { name: "Drums / Beat", url: "audio/Break_3.wav" },
    { name: "Bassline", url: "audio/Aeroshaker.wav" },
    { name: "Melodie", url: "audio/Break_3.wav" } // Du kannst einfach mehr hinzufügen!
];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let gainNodes = [];

async function startEngine() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('loadingStatus').innerText = "Lade Audio-Loops...";

    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // Zeitpuffer für den Start (0.5 Sekunden in der Zukunft)
    const startTime = audioCtx.currentTime + 0.5;

    try {
        for (let i = 0; i < tracksConfig.length; i++) {
            await setupTrack(tracksConfig[i], i, startTime);
        }

        document.getElementById('controls').style.display = 'grid';
        document.getElementById('loadingStatus').innerText = "System läuft synchron.";
    } catch (err) {
        console.error(err);
        document.getElementById('loadingStatus').innerText = "Fehler beim Laden. Dateinamen prüfen!";
    }
}

async function setupTrack(config, index, startTime) {
    const response = await fetch(config.url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;

    const gainNode = audioCtx.createGain();
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Mute-Logik initialisieren
    gainNodes[index] = gainNode;

    // UI Element erstellen
    createUIElement(config.name, index);

    // Alle Spuren zum exakt gleichen Zeitpunkt in der Zukunft starten
    source.start(startTime);
}

function createUIElement(name, index) {
    const container = document.getElementById('controls');
    const div = document.createElement('div');
    div.className = 'track-card';
    div.innerHTML = `
        <p style="margin-top:0">${name}</p>
        <button id="btn-${index}" class="mute-btn" onclick="toggleMute(${index})">MUTE</button>
    `;
    container.appendChild(div);
}

function toggleMute(index) {
    const node = gainNodes[index];
    const btn = document.getElementById(`btn-${index}`);

    if (node.gain.value > 0) {
        node.gain.value = 0; // Lautstärke auf 0 (läuft synchron weiter)
        btn.innerText = "UNMUTE";
        btn.classList.add('is-muted');
    } else {
        node.gain.value = 1; // Lautstärke auf 100%
        btn.innerText = "MUTE";
        btn.classList.remove('is-muted');
    }
}