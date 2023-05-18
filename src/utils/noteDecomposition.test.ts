import { stringToFrequency } from "./musicTheory";
import analysePitches from "./noteDecomposition";
import { FrequencyDataPoint } from "./recording";

describe('analysePitches', () => {
  test('Finds the highest point for each pitch', () => {
    const data : FrequencyDataPoint[] = [
      { frequency: stringToFrequency('A4-30'), intensity: 80 },
      { frequency: stringToFrequency('A4-10'), intensity: 120 },
      { frequency: stringToFrequency('A4'), intensity: 100 },
      { frequency: stringToFrequency('A4+10'), intensity: 80 },

      { frequency: stringToFrequency('A#4-20'), intensity: 60 },
      { frequency: stringToFrequency('A#4'), intensity: 80 },
      { frequency: stringToFrequency('A#4+20'), intensity: 60 },
    ]

    const analysis = analysePitches(data);

    expect(Object.keys(analysis)).toEqual(['A4', 'A#4']);

    expect(analysis.A4.max).toEqual(120);
    expect(analysis['A#4'].max).toEqual(80);

    expect(analysis.A4.accuracy).toBeCloseTo(-10);
    expect(analysis['A#4'].accuracy).toBeCloseTo(0);
  });

  test('Computes an integral with the same value for notes of equal intensity', () => {
    const data : FrequencyDataPoint[] = [
      { frequency: stringToFrequency('A4-30'), intensity: 80 },
      { frequency: stringToFrequency('A4-10'), intensity: 120 },
      { frequency: stringToFrequency('A4'), intensity: 100 },
      { frequency: stringToFrequency('A4+10'), intensity: 80 },
      { frequency: stringToFrequency('A4+30'), intensity: 60 },

      { frequency: stringToFrequency('A#4-49'), intensity: 20 },
      { frequency: stringToFrequency('A#4-30'), intensity: 40 },
      { frequency: stringToFrequency('A#4-10'), intensity: 60 },
      { frequency: stringToFrequency('A#4'), intensity: 50 },
      { frequency: stringToFrequency('A#4+10'), intensity: 40 },
      { frequency: stringToFrequency('A#4+30'), intensity: 30 },
      { frequency: stringToFrequency('A#4+49'), intensity: 20 },

      { frequency: stringToFrequency('B4-30'), intensity: 80 },
      { frequency: stringToFrequency('B4-10'), intensity: 120 },
      { frequency: stringToFrequency('B4'), intensity: 100 },
      { frequency: stringToFrequency('B4+10'), intensity: 80 },
      { frequency: stringToFrequency('B4+30'), intensity: 60 },

      { frequency: stringToFrequency('C5-49'), intensity: 20 },
    ]

    const analysis = analysePitches(data);

    expect(Object.keys(analysis)).toEqual(['A4', 'A#4', 'B4', 'C5']);

    expect(analysis.A4.integral).toBeCloseTo(analysis.B4.integral);
  });
});
