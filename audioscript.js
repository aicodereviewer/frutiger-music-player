const fileInput = document.getElementById('fileInput');
const audio = document.getElementById('audio');
const spectrum = document.getElementById('spectrum');
const playButton = document.getElementById('playButton');
const playPauseIcon = document.getElementById('playPauseIcon');

// Define target frequencies for each column
const targetFrequencies = [40000, 20000, 10000, 5000, 2000, 1000, 800, 700, 600, 500, 300, 200, 100, 80, 40, 20];

// Create 16 columns with 8 dots each
targetFrequencies.reverse().forEach(() => {
    const column = document.createElement('div');
    column.classList.add('column');
    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        column.appendChild(dot);
    }
    spectrum.appendChild(column);
});

const columns = document.querySelectorAll('.column');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audio.src = url;
        analyzeAudio(url);
    }
});

// Play button functionality
playButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play(); // Start playing the audio
        playPauseIcon.src = "images/pause-button.png"; // Change to pause icon
    } else {
        audio.pause(); // Pause the audio
        playPauseIcon.src = "images/play-button.png"; // Change back to play icon
    }
});

function analyzeAudio(url) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 8192;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    function updateSpectrum() {
        analyser.getByteFrequencyData(frequencyData);

        targetFrequencies.forEach((targetFrequency, columnIndex) => {
            const binIndex = Math.floor((targetFrequency / (audioContext.sampleRate / 2)) * analyser.frequencyBinCount);
            const amplitude = frequencyData[binIndex];

            // Convert amplitude to dBFS
            const dBFS = 130 * Math.log10(amplitude / 255);

            // Update dots in the column
            const dots = Array.from(columns[columnIndex].children);

            dots.forEach((dot, i) => {
                const threshold = -8 * (i + 1); // Adjusted for 8 pixels

                if (dBFS >= threshold) {
                    // Apply colors based on row position from top to bottom
                    if (i === 0) {
                        dot.style.backgroundColor = 'red';
                    } else if (i === 1 || i === 2) {
                        dot.style.backgroundColor = 'yellow';
                    } else {
                        dot.style.backgroundColor = 'lime';
                    }
                } else {
                    dot.style.backgroundColor = 'black';
                }
            });
        });

        requestAnimationFrame(updateSpectrum);
    }

    audio.addEventListener('play', () => {
        audioContext.resume();
        updateSpectrum();
    });
}
