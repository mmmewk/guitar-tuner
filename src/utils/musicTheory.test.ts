import { frequencyToPitch, frequencyToString, pitchToFrequency, pitchToString, stringToPitch } from "./musicTheory";

describe('stringToPitch', () => {
  test('Can detect a note and an octave', () => {
    expect(stringToPitch('A4')).toEqual({ note: 'A', octave: 4, cents: 0 });
  });

  test('Can detect a sharp note', () => {
    expect(stringToPitch('C#3')).toEqual({ note: 'C#', octave: 3, cents: 0 });
  });

  test('Can detect a positive number of cents', () => {
    expect(stringToPitch('A3+20')).toEqual({ note: 'A', octave: 3, cents: 20 });
  });

  test('Can detect a negative number of cents', () => {
    expect(stringToPitch('A3-10')).toEqual({ note: 'A', octave: 3, cents: -10 });
  });

  test('Throws an error with a negative octave', () => {
    expect(() => stringToPitch('D-3')).toThrow(Error);
  });

  test('Throws an error with an invalid note', () => {
    expect(() => stringToPitch('H3')).toThrow(Error);
  });
});

describe('pitchToString', () => {
  test('Can convert a pitch to a simple string', () => {
    expect(pitchToString({ note: 'A', octave: 4, cents: 10 })).toEqual('A4');
  });

  test('Can include number of cents', () => {
    expect(pitchToString({ note: 'A', octave: 4, cents: 20 }, { cents: true })).toEqual('A4+20');
    expect(pitchToString({ note: 'B', octave: 4, cents: 0 }, { cents: true })).toEqual('B4+0');
    expect(pitchToString({ note: 'A', octave: 3, cents: -20 }, { cents: true })).toEqual('A3-20');
  });

  test('Can exclude the octave', () => {
    expect(pitchToString({ note: 'A', octave: 4 }, { octave: false })).toEqual('A');
    expect(pitchToString({ note: 'B', octave: 2 }, { octave: false })).toEqual('B');
    expect(pitchToString({ note: 'C', octave: 3 }, { octave: false })).toEqual('C');
  });
});

describe('pitchToFrequency', () => {
  test('converts string to object pitch then finds the frequency', () => {
    expect(pitchToFrequency('A0')).toEqual(27.5);
  });

  test('converts an object pitch to a frequency', () => {
    expect(pitchToFrequency({ note: 'A', octave: 0 })).toEqual(27.5);
  });

  test('Multiplies the frequency by 2 ^ octave', () => {
    expect(pitchToFrequency({ note: 'A', octave: 1 })).toBeCloseTo(55);
    expect(pitchToFrequency({ note: 'A', octave: 2 })).toBeCloseTo(110);
    expect(pitchToFrequency({ note: 'A', octave: 3 })).toBeCloseTo(220);
    expect(pitchToFrequency({ note: 'A', octave: 4 })).toBeCloseTo(440);
  });

  test('Multiplies the frequency by 2 ^ 1/12 for every note beyond A', () => {
    expect(pitchToFrequency({ note: 'C', octave: 0 })).toBeCloseTo(16.35);
    expect(pitchToFrequency({ note: 'C#', octave: 0 })).toBeCloseTo(16.35 * Math.pow(2, 1/12));
    expect(pitchToFrequency({ note: 'E', octave: 0 })).toBeCloseTo(16.35 * Math.pow(2, 4/12));
    expect(pitchToFrequency({ note: 'G', octave: 0 })).toBeCloseTo(16.35 * Math.pow(2, 7/12));
    expect(pitchToFrequency({ note: 'B', octave: 0 })).toBeCloseTo(16.35 * Math.pow(2, 11/12));
  });

  test('Multiplies the frequency by 2 ^ 1/1200 for cent', () => {
    expect(pitchToFrequency({ note: 'A', octave: 0, cents: -50 })).toBeCloseTo(27.5 * Math.pow(2, -50/1200));
    expect(pitchToFrequency({ note: 'A', octave: 0, cents: -10 })).toBeCloseTo(27.5 * Math.pow(2, -10/1200));
    expect(pitchToFrequency({ note: 'A', octave: 0, cents: 0 })).toBeCloseTo(27.5);
    expect(pitchToFrequency({ note: 'A', octave: 0, cents: 10 })).toBeCloseTo(27.5 * Math.pow(2, 10/1200));
    expect(pitchToFrequency({ note: 'A', octave: 0, cents: 50 })).toBeCloseTo(27.5 * Math.pow(2, 50/1200));
  });

  test('Finds the frequency of an arbitrary pitch', () => {
    expect(pitchToFrequency('D2+30')).toBeCloseTo(73.42 * Math.pow(2, 30/1200));
    expect(pitchToFrequency('A4')).toBeCloseTo(440);
    expect(pitchToFrequency('A4-20')).toBeCloseTo(440 * Math.pow(2, -20/1200));
    expect(pitchToFrequency('B6')).toBeCloseTo(1975.53);
  });
});

describe('frequencyToPitch', () => {
  test('Identifies the lowest pitch C0', () => {
    expect(frequencyToPitch(16.35)).toEqual(expect.objectContaining({ note: 'C', octave: 0 }));
  });

  test('Rounds to the nearest note', () => {
    expect(frequencyToPitch(220 * Math.pow(2, -51/1200))).toEqual(expect.objectContaining({ note: 'G#', octave: 3 }));
    expect(frequencyToPitch(220 * Math.pow(2, -49/1200))).toEqual(expect.objectContaining({ note: 'A', octave: 3 }));
    expect(frequencyToPitch(220 * Math.pow(2, 49/1200))).toEqual(expect.objectContaining({ note: 'A', octave: 3 }));
    expect(frequencyToPitch(220 * Math.pow(2, 51/1200))).toEqual(expect.objectContaining({ note: 'A#', octave: 3 }));
  });

  test('Correctly identifies the octave', () => {
    expect(frequencyToPitch(220)).toEqual(expect.objectContaining({ note: 'A', octave: 3 }));
    expect(frequencyToPitch(261.62)).toEqual(expect.objectContaining({ note: 'C', octave: 4 }));
    expect(frequencyToPitch(440)).toEqual(expect.objectContaining({ note: 'A', octave: 4 }));
    expect(frequencyToPitch(523.24)).toEqual(expect.objectContaining({ note: 'C', octave: 5 }));
  });

  test('Returns how many cents off the note the frequency is', () => {
    expect(frequencyToPitch(220 * Math.pow(2, -20/1200)).cents).toBeCloseTo(-20);
    expect(frequencyToPitch(220).cents).toBeCloseTo(0);
    expect(frequencyToPitch(220 * Math.pow(2, 10/1200)).cents).toBeCloseTo(10);
  });
});

describe('frequencyToString', () => {
  test('Identifies the lowest pitch C0', () => {
    expect(frequencyToString(16.35)).toEqual('C0');
  });

  test('Rounds to the nearest note', () => {
    expect(frequencyToString(220 * Math.pow(2, -51/1200))).toEqual('G#3');
    expect(frequencyToString(220 * Math.pow(2, -49/1200))).toEqual('A3');
    expect(frequencyToString(220 * Math.pow(2, 49/1200))).toEqual('A3');
    expect(frequencyToString(220 * Math.pow(2, 51/1200))).toEqual('A#3');
  });

  test('Correctly identifies the octave', () => {
    expect(frequencyToString(220)).toEqual('A3');
    expect(frequencyToString(261.62)).toEqual('C4');
    expect(frequencyToString(440)).toEqual('A4');
    expect(frequencyToString(523.24)).toEqual('C5');
  });
});
