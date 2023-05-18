import { frequencyToPitch, pitchToString } from "./musicTheory";
import { FrequencyDataPoint } from "./recording";

type pitchAnalysis = {
  [pitch: string]: {
    // Integral of all points between note +-50 cents
    integral: number,
    // Accuracy in cents of the highest peak for this note
    accuracy: number,
    // Max intensity of the highest peak for this note
    max: number,
  }
}

const analysePitches = (data: FrequencyDataPoint[]) => {
  const analysis : pitchAnalysis = {};

  data.forEach((point, index) => {
    const nextPoint = data[index + 1];
    const pitch = frequencyToPitch(point.frequency);
    const noteName = pitchToString(pitch);
    analysis[noteName] ||= { integral: 0, accuracy: 0, max: 0 };
    if (nextPoint) {
      // Use log of frequency as X so that each note has a consistent X span
      const dx = Math.log2(nextPoint.frequency) - Math.log2(point.frequency);
      analysis[noteName].integral += point.intensity * dx;
    }

    if (point.intensity > analysis[noteName].max) {
      analysis[noteName].max = point.intensity;
      analysis[noteName].accuracy = pitch.cents;
    }
  });

  return analysis;
};

export default analysePitches;
