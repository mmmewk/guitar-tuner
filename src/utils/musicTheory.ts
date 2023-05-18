// Definitions:
//   For the given frequency A4 = 440hz
//   Frequency: Numberic specific frequency (e.g. 440)
//   Pitch: Specific frequency (e.g. A4)
//   Note: Musical note in the scale (e.g. A)
//   Octave: Octave of the specific note (e.g. 4)

// Frequency of lowest note on Piano
export const A0 = 27.5;

export const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type Note = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#';

export type Pitch = {
  note: Note;
  octave: number;
  cents?: number;
};

export const octaveMultiplier = (octave: number) => {
  return Math.pow(2, octave);
}

export const halfstepMultiplier = (halfsteps: number) => {
  return Math.pow(2, halfsteps / 12);
}

export const centsMultiplier = (cents: number) => {
  return Math.pow(2, cents / 1200);
}

export const stringToPitch = (str: string) => {
  if (!str.match(/^[A-G]#?[0-9][+-]?[0-9]*$/)) throw Error(`Invalid Notation: ${str}`);

  const noteMatch = str.match(/^[A-G]#?/);
  const octaveMatch = str.match(/[0-9][+-]?/);
  const centsMatch = str.match(/[+-][0-9]+$/);

  const cents = centsMatch ? parseFloat(centsMatch[0]) : 0;

  if (!noteMatch || !octaveMatch) throw Error(`Invalid Notation: ${str}`);

  return { note: noteMatch[0] as Note, octave: parseInt(octaveMatch[0]), cents };
}

type PitchToStringOptions = {
  note?: boolean;
  octave?: boolean;
  cents?: boolean;
}

const defaultPitchToStringOptions = {
  note: true,
  octave: true,
  cents: false,
};

export const pitchToString = (pitch: Pitch, options: PitchToStringOptions = { note: true, octave: true }) => {
  const { note, octave, cents } = { ...defaultPitchToStringOptions, ...options };
  let str = '';
  if (note) str += pitch.note;
  if (octave) str += pitch.octave;
  if (cents && pitch.cents !== undefined) {
    if (pitch.cents >= 0) str += '+';

    str += pitch.cents;
  }

  return str;
};

const isPitch = (pitch: Pitch | string) : pitch is Pitch => {
  return typeof pitch !== 'string';
}

const pitchToObject = (pitch: Pitch | string) => isPitch(pitch) ? pitch : stringToPitch(pitch);

export const pitchToFrequency = (pitch: Pitch | string) => {
  const objectPitch = pitchToObject(pitch);

  // A0 is our base pitch where we have an exact round number
  let halfstepsAboveA = noteOrder.findIndex((note) => note === objectPitch.note) - 9;

  return A0 * octaveMultiplier(objectPitch.octave) * halfstepMultiplier(halfstepsAboveA) * centsMultiplier(objectPitch.cents || 0);
};

export const C0 = pitchToFrequency('C0');

export const frequencyToPitch = (frequency: number) => {
  const relativeFrequency = frequency / C0;
  const exponent = Math.log2(relativeFrequency);
  let octave = Math.floor(exponent);
  let halfstepsAboveC = Math.round((exponent - octave) * 12);

  if (halfstepsAboveC === 12) {
    octave += 1;
    halfstepsAboveC = 0;
  }

  let cents = ((exponent - octave) - (halfstepsAboveC / 12)) * 1200;

  const note = noteOrder[halfstepsAboveC];

  return {
    note,
    octave,
    cents,
  };
};

export const frequencyToString = (frequency: number) => {
  return pitchToString(frequencyToPitch(frequency));
}

export const stringToFrequency = (str: string) => {
  return pitchToFrequency(stringToPitch(str));
}
