import { XAxis, YAxis, Label, BarChart, Bar, TooltipProps, Tooltip, Cell } from "recharts";
import { useAnalyser } from "../utils/recording";
import { frequencyToString, noteOrder, pitchToFrequency, stringToFrequency } from "../utils/musicTheory";
import useWindowSize from "../utils/windowSize";
import { useEffect, useState } from "react";
import analysePitches, { PitchAnalysis } from "../utils/noteDecomposition";
import { flatten } from "lodash";
import Select from "./Select";

const pitchOptions = flatten([2,3,4,5,6].map((octave) => noteOrder.map((note) => `${note}${octave}`)));

const Notes : React.FC = () => {
  const { width, height } = useWindowSize();
  const [analysis, setAnalysis] = useState<PitchAnalysis>({});
  const [selectedNote, setSelectedNote] = useState<string>('E2');
  const [highlightedPitches, setHighlightedPitches] = useState<string[]>([]);

  useEffect(() => {
    const toHighlight = [selectedNote];
    const frequency = stringToFrequency(selectedNote);
    [2,3,4,5,6,7,8,9,10].forEach((overtone) => {
      toHighlight.push(frequencyToString(frequency * overtone));
    });
    setHighlightedPitches(toHighlight);
  }, [selectedNote]);

  const { frequencyData } = useAnalyser({
    // More data = more precision
    bufferSize: 8192,
    // Higher sample rate means less time required
    sampleRate: 48000,
    frameRate: 30,
    minIntensity: 0.2,
    minFrequency: pitchToFrequency('C2'),
    maxFrequency: pitchToFrequency('G6'),
  });

  useEffect(() => {
    setAnalysis(analysePitches(frequencyData));
  }, [frequencyData]);

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
          <span>{Math.round(point.accuracy)}</span>
        </p>
      </div>
    )
  }

  return (
    <>
      <Select label="Listen for Note" value={selectedNote} setValue={setSelectedNote} options={pitchOptions} />
      <BarChart width={width} height={height ? height * 0.7 : 500} data={pitchData}>
        <XAxis dataKey="pitch" interval={0} angle={45}>
          <Label offset={-3} position="insideBottom">Note</Label>
        </XAxis>
        <YAxis>
          <Label angle={-90} position="insideLeft">Intensity</Label>
        </YAxis>
        <Tooltip content={renderTooltip} />
        <Bar dataKey="integral" fill="#82ca9d" isAnimationActive={false}>
          {pitchData.map((entry, index) => {
            return <Cell key={entry.pitch} fill={highlightedPitches.includes(entry.pitch) ? "indigo" : "#82ca9d"} />
          })}
        </Bar>
      </BarChart>
    </>
  );
};
export default Notes;
