import { LineChart, XAxis, YAxis, CartesianGrid, Line, Label, Tooltip, TooltipProps } from "recharts";
import { useAnalyser } from "../utils/recording";
import { frequencyToString, pitchToFrequency } from "../utils/musicTheory";
import useWindowSize from "../utils/windowSize";
import { useState } from "react";
import Toggle from './Toggle';

const Frequency : React.FC = () => {
  const { width, height } = useWindowSize();
  const [scale, setScale] = useState<'linear' | 'log'>('linear');
  const [format, setFormat] = useState<'hz' | 'note'>('hz');

  const { frequencyData } = useAnalyser({
    // More data = more precision
    bufferSize: 8192,
    // Higher sample rate means less time required
    sampleRate: 48000,
    frameRate: 30,
    minIntensity: 0.1,
    minFrequency: pitchToFrequency('C2'),
    maxFrequency: pitchToFrequency('G6'),
  });

  const logData = frequencyData.map((point) => {
    return {
      intensity: point.intensity,
      frequency: Math.log2(point.frequency),
    }
  });

  const data = scale === 'log' ? logData : frequencyData;

  const ticks = [
    'E2', 'A2', 'D3', 'G3', 'B3',
    'E4', 'A4', 'D5', 'G5', 'B5',
    'E6',
  ].map((pitch) => {
    const frequency = pitchToFrequency(pitch);
    if (scale === 'log') return Math.log2(frequency);
    return Math.round(frequency);
  });

  const formatter = (value: number) => {
    const frequency = scale === 'linear' ? value : Math.pow(2, value);
    if (format === 'hz') return frequency.toFixed(0);
    if (format === 'note') return frequencyToString(frequency);
    return value.toString();
  }

  let xlabel = format === 'note' ? 'Note' : 'Frequency (hz)';

  const renderTooltip : TooltipProps<number[], number>['content'] = ({ active, payload }) => {
    if (!payload || !active) return null;

    const point = payload[0].payload;
    return (
      <div className="border-2 border-indigo-400 p-2 bg-white">
        <p>
          <b>{xlabel}:{' '}</b>
          <span>{formatter(point.frequency)}</span>
        </p>
        <p>
          <b>Intensity:{' '}</b>
          <span>{point.intensity}</span>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='flex'>
        <Toggle label="Scale" value={scale} setValue={setScale} left="linear" right="log" />
        <Toggle label="Format" value={format} setValue={setFormat} left="hz" right="note" />
      </div>

      <LineChart width={width} height={height ? height * 0.7 : 500} data={data}>
        <XAxis
          dataKey="frequency"
          scale='linear'
          ticks={ticks}
          interval={0}
          tickFormatter={formatter}
        >
          <Label offset={-3} position="insideBottom">{xlabel}</Label>
        </XAxis>
        <YAxis domain={[0, 255]}>
          <Label angle={-90} position="insideLeft">Intensity</Label>
        </YAxis>
        <Tooltip content={renderTooltip} />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="intensity" stroke="#8884d8" isAnimationActive={false} dot={false} />
      </LineChart>
    </>
  );
};
export default Frequency;
