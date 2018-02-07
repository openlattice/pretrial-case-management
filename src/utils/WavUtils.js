function interleave(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index] = inputL[inputIndex];
    result[index] = inputR[inputIndex];
    index += 1;
    inputIndex += 1;
  }
  return result;
}

function writeFloat32(output, offsetInit, input) {
  let offset = offsetInit;
  for (let i = 0; i < input.length; i += 1, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function floatTo16BitPCM(output, offsetInit, input) {
  let offset = offsetInit;
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offsetInit, string) {
  const offset = offsetInit;
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples, format, sampleRate, numChannels, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + (samples.length * bytesPerSample));
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + (samples.length * bytesPerSample), true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);
  if (format === 1) {
    floatTo16BitPCM(view, 44, samples);
  }
  else {
    writeFloat32(view, 44, samples);
  }

  return buffer;
}

const audioBufferToWav = (buffer, optVal) => {
  const opt = optVal || {};

  const { numberOfChannels, sampleRate } = buffer;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result;
  if (numberOfChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  }
  else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, format, sampleRate, numberOfChannels, bitDepth);

};

export default audioBufferToWav;
