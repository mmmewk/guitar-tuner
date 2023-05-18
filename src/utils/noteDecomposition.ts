import { frequencyToPitch, pitchToString } from "./musicTheory";
import { FrequencyDataPoint } from "./recording";

export type PitchAnalysis = {
  [pitch: string]: {
    // The string form of the pitch
    pitch: string;
    // Integral of all intensities between note+-50 cents.
    // Subtracted off the mean value in the bounds to reduce noise.
    integral: number,
    // Accuracy in cents of the highest peak for this note
    accuracy: number,
    // Max intensity of the highest peak for this note
    max: number,
  }
}

const analysePitches = (data: FrequencyDataPoint[]) => {
  const minValueForOctave : { [key: number]: number } = {};
  const analysis : PitchAnalysis = {};

  data.forEach((point) => {
    const pitch = frequencyToPitch(point.frequency);
    minValueForOctave[pitch.octave] ||= Infinity;
    minValueForOctave[pitch.octave] = Math.min(minValueForOctave[pitch.octave], point.intensity);
  });

  data.forEach((point, index) => {
    const nextPoint = data[index + 1];
    const pitch = frequencyToPitch(point.frequency);
    const key = pitchToString(pitch);
    analysis[key] ||= { pitch: key, integral: 0, accuracy: 0, max: -Infinity };

    if (point.intensity > analysis[key].max) {
      analysis[key].max = point.intensity;
      analysis[key].accuracy = pitch.cents;
    }

    if (nextPoint) {
      // Use log of frequency as X so that each note has a consistent X span
      const dx = Math.log2(nextPoint.frequency) - Math.log2(point.frequency);
      // 
      const y = point.intensity - minValueForOctave[pitch.octave];
      analysis[key].integral += y * dx;
    }
  });

  return analysis;
};

export default analysePitches;
