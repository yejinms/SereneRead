/**
 * Generates white, pink, and brown noise WAV files into assets/sounds/.
 * Run: npm run generate-noise
 * Requires: npm install wavefile (devDependency)
 */
const fs = require('fs');
const path = require('path');

const WaveFile = require('wavefile').WaveFile;

const SAMPLE_RATE = 44100;
const DURATION_SEC = 30;
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function floatTo16(s) {
  const v = Math.max(-1, Math.min(1, s));
  return Math.round(v * 32767);
}

function writeWav(filename, floatSamples) {
  const wav = new WaveFile();
  const int16 = new Int16Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) int16[i] = floatTo16(floatSamples[i]);
  wav.fromScratch(1, SAMPLE_RATE, '16', int16);
  const outPath = path.join(OUT_DIR, filename);
  ensureDir(OUT_DIR);
  fs.writeFileSync(outPath, wav.toBuffer());
  console.log('Written:', outPath);
}

// White noise
const white = new Float32Array(NUM_SAMPLES);
for (let i = 0; i < NUM_SAMPLES; i++) white[i] = (Math.random() * 2 - 1) * 0.3;
writeWav('white.wav', white);

// Pink noise (1/f approx)
let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
const pink = new Float32Array(NUM_SAMPLES);
for (let i = 0; i < NUM_SAMPLES; i++) {
  const white = (Math.random() * 2 - 1) * 0.5;
  b0 = 0.99886 * b0 + white * 0.0555179;
  b1 = 0.99332 * b1 + white * 0.0750759;
  b2 = 0.96900 * b2 + white * 0.1538520;
  b3 = 0.86650 * b3 + white * 0.3104856;
  b4 = 0.55000 * b4 + white * 0.5329522;
  b5 = -0.7616 * b5 - white * 0.0168980;
  pink[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6) * 0.11;
  b6 = white * 0.115926;
}
writeWav('pink.wav', pink);

// Brown noise
let last = 0;
const brown = new Float32Array(NUM_SAMPLES);
for (let i = 0; i < NUM_SAMPLES; i++) {
  const white = (Math.random() * 2 - 1) * 0.5;
  last = (last + 0.02 * white) / 1.02;
  brown[i] = last * 3.5 * 0.2;
}
writeWav('brown.wav', brown);

console.log('Done. Add assets/sounds/*.wav to the app bundle (e.g. require or asset map).');
