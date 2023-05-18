import { useEffect, useState } from "react";
import { pitchToFrequency } from "./musicTheory";

export type WorkletName = 'recorder-worklet' | 'frequency-worklet';

export type RecorderMessages = 'START' | 'STOP';

export type createAnalyserOptions = {
  bufferSize?: number,
  sampleRate?: number,
}

const defaultCreateAnalyserOptions = {
  bufferSize: 4096,
  sampleRate: 48000,
}

export const createAnalyser = async (options: createAnalyserOptions = {}) => {
  const { bufferSize, sampleRate } = { ...defaultCreateAnalyserOptions, ...options }
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
  }

  const audioContext = new AudioContext({
    sampleRate,
  });

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = bufferSize;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const inputSource = audioContext.createMediaStreamSource(stream);

  inputSource.connect(analyser);

  return {
    analyser,
    audioContext,
    inputSource,
    stream,
  };
};

export type TimeDataPoint = { intensity: number; time: number; };
export type FrequencyDataPoint = { intensity: number; frequency: number; };

export type useAnalyserOptions = {
  // Frequency analysis won't update unless absolute value of intensity
  //   for some part of the graph is above this value
  // By default frequency updates real time
  // Values are between 0 and 1
  minIntensity?: number;
  // Discard all frequency data below this frequency
  minFrequency?: number;
  // Discard all frequency data above this frequency
  maxFrequency?: number;
  // Number of times per second the data updates
  frameRate?: number;
  // Number of total datapoints in the intensity vs time data
  bufferSize?: number;
  // Number of data points collected per second
  sampleRate?: number;
}

const defaultAnalyserOptions = {
  minFrequency: pitchToFrequency('D2'),
  maxFrequency: pitchToFrequency('F5'),
  frameRate: 60,
  bufferSize: 4096,
  sampleRate: 48000,
}

export const useAnalyser = (options: useAnalyserOptions = {}) => {
  const { minIntensity, minFrequency, maxFrequency, frameRate, bufferSize, sampleRate } = { ...defaultAnalyserOptions, ...options };
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [timeData, setTimeData] = useState<TimeDataPoint[]>([]);
  const [frequencyData, setFrequencyData] = useState<FrequencyDataPoint[]>([]);

  useEffect(() => {
    // Remove the current audio context if one exists
    const promiseChain = new Promise((resolve) => resolve(true));
    if (audioContext) promiseChain.then(() => audioContext.close());

    promiseChain.then(() => {
      createAnalyser({ bufferSize, sampleRate }).then(({ analyser, audioContext }) => {
        setAudioContext(audioContext);
        setAnalyser(analyser);
      });
    });

  // Re-initialize the audio analyser if buffer size or frame rate changes
  // Don't include audioContext in the dependencies because it will change after buffer size and sample rate are set
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bufferSize, sampleRate]);

  useEffect(() => {
    if (!analyser || !audioContext) return;

    const interval = setInterval(() => {
      // Parse time data from analyser
      const rawTimeData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(rawTimeData);
      const timeStep = 1 / audioContext.sampleRate;
      setTimeData(
        Array.from(rawTimeData).map((value, index) => ({
          intensity: value,
          time: timeStep * index,
        }))
      )

      // Don't update frequency data unless we detected a sufficiently large sound
      const maxFoundIntensity = rawTimeData.reduce((maxValue, value) => {
        const intensity = Math.abs(value - 127.5) / 127.5;
        return Math.max(maxValue, intensity);
      }, 0);
      if (minIntensity && maxFoundIntensity < minIntensity) return;

      // Update frequency data
      const rawFrequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(rawFrequencyData);
      // @see: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
      const frequencyStep = (audioContext.sampleRate / 2) / analyser.frequencyBinCount;
      setFrequencyData(
        Array.from(rawFrequencyData).map((value, index) => ({
          intensity: value,
          frequency: frequencyStep * index,
        })).filter((data) => data.frequency >= minFrequency && data.frequency <= maxFrequency)
      )
    }, 1000 / frameRate);

    return () => {
      clearInterval(interval);
    }

  }, [analyser, audioContext, frameRate, minFrequency, maxFrequency]);

  return {
    timeData,
    frequencyData,
  }
}
