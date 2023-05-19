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
    // Point with max intensity
    max: FrequencyDataPoint,
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
    analysis[key] ||= { pitch: key, integral: 0, accuracy: 0, max: { frequency: -Infinity, intensity: -Infinity } };

    if (point.intensity > analysis[key].max.intensity) {
      analysis[key].max = point;
      analysis[key].accuracy = pitch.cents;
    }

    if (nextPoint) {
      // Use log of frequency as X so that each note has a consistent X span
      const dx = nextPoint.frequency - point.frequency;
      // 
      const y = point.intensity;
      analysis[key].integral += y * dx;
    }
  });

  return analysis;
};

export default analysePitches;
