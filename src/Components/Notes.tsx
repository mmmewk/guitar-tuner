import { XAxis, YAxis, Label, BarChart, Bar, TooltipProps, Tooltip, Cell } from "recharts";
import { useAnalyser } from "../utils/recording";
import { frequencyToString, noteOrder, pitchToFrequency, stringToFrequency } from "../utils/musicTheory";
import useWindowSize from "../utils/windowSize";
import { useEffect, useState } from "react";
import analysePitches, { PitchAnalysis } from "../utils/noteDecomposition";
import { flatten } from "lodash";
import Select from "./Select";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const pitchOptions = ['Auto', ...flatten([2,3,4,5,6].map((octave) => noteOrder.map((note) => `${note}${octave}`)))];
const overtonesToUse = [2,3,4,5,6];

const Notes : React.FC = () => {
  const { width, height } = useWindowSize();
  const [analysis, setAnalysis] = useState<PitchAnalysis>({});
  const [detectedNote, setDetectedNote] = useState<string>('E2');
  const [selectedNote, setSelectedNote] = useState<string>('Auto');
  const [highlightedPitches, setHighlightedPitches] = useState<string[]>([]);
  const { bufferSize, sampleRate, frameRate } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    const note = selectedNote === 'Auto' ? detectedNote : selectedNote;
    const toHighlight = [note];
    const frequency = stringToFrequency(note);
    overtonesToUse.forEach((overtone) => {
      toHighlight.push(frequencyToString(frequency * overtone));
    });
    setHighlightedPitches(toHighlight);
  }, [selectedNote, detectedNote]);

  const { frequencyData } = useAnalyser({
    // More data = more precision
    bufferSize,
    // Higher sample rate means less time required
    sampleRate,
    frameRate,
    minIntensity: 0.2,
    minFrequency: pitchToFrequency('C2'),
    maxFrequency: pitchToFrequency('G7'),
  });

  useEffect(() => {
    setAnalysis(analysePitches(frequencyData));
  }, [frequencyData]);

  useEffect(() => {
    let detectedPitch : string = 'E2';
    let maxNoteIntegral = 0;

    pitchOptions.forEach((pitch) => {
      if (pitch === 'Auto') return;

      const frequency = stringToFrequency(pitch);
      const overtones = [frequency];
      overtonesToUse.forEach((overtone) => overtones.push(frequency * overtone));

      const noteIntegral = overtones.reduce((integral, frequency) => {
        const pitch = frequencyToString(frequency);
        const foundPeak = analysis[pitch];

        if (!foundPeak) return integral;

        return integral + analysis[pitch].integral;
      }, 0);

      if (noteIntegral > maxNoteIntegral) {
        maxNoteIntegral = noteIntegral;
        detectedPitch = pitch;
      }
    });

    setDetectedNote(detectedPitch);
  }, [analysis]);

  const pitchData = Object.values(analysis);
  

  const renderTooltip : TooltipProps<number[], number>['content'] = ({ active, payload }) => {
    if (!payload || !active) return null;

    const point = payload[0].payload;

    return (
      <div className="border-2 border-indigo-400 p-2 bg-white">
        <p>
          <b>Note:{' '}</b>
          <span>{point.pitch}</span>
        </p>
        <p>
          <b>Intensity:{' '}</b>
          <span>{Math.round(point.integral)}</span>
        </p>
        <p>
          <b>Accuracy:{' '}</b>
          <span>{point.accuracy.toFixed(2)}</span>
        </p>
      </div>
    )
  }

  return (
    <>
      <Select label="Listen for Note" value={selectedNote} setValue={setSelectedNote} options={pitchOptions} />
      {selectedNote === 'Auto' && (<div className='m-2'><label>Detected Note: </label><span>{detectedNote}</span></div>)}
      <BarChart width={width} height={height ? height * 0.7 : 500} data={pitchData}>
        <XAxis dataKey="pitch" interval={0} angle={45}>
          <Label offset={-3} position="insideBottom">Note</Label>
        </XAxis>
        <YAxis>
          <Label angle={-90} position="insideLeft">Intensity</Label>
        </YAxis>
        <Tooltip content={renderTooltip} />
        <Bar dataKey="integral" fill="#82ca9d" isAnimationActive={false}>
          {pitchData.map((entry) => {
            return <Cell key={entry.pitch} fill={highlightedPitches.includes(entry.pitch) ? "indigo" : "#82ca9d"} />
          })}
        </Bar>
      </BarChart>
    </>
  );
};
export default Notes;
