import { LineChart, XAxis, YAxis, CartesianGrid, Line, Label, Tooltip, TooltipProps, LineProps } from "recharts";
import { FrequencyDataPoint, useAnalyser } from "../utils/recording";
import { frequencyToString, pitchToFrequency } from "../utils/musicTheory";
import useWindowSize from "../utils/windowSize";
import { useEffect } from "react";
import slayer, { Slayer } from 'slayer';

const Peaks : React.FC = () => {
  const { width, height } = useWindowSize();

  const { frequencyData } = useAnalyser({
    minIntensity: 0.15,
    bufferSize: 8192,
    sampleRate: 48000,
    frameRate: 20,
    minFrequency: pitchToFrequency('E1'),
    maxFrequency: pitchToFrequency('G6'),
  });

  const logData = frequencyData.map((point) => {
    return {
      intensity: point.intensity,
      frequency: Math.log2(point.frequency),
    }
  });

  useEffect(() => {
    const peakAnalyser = slayer() as Slayer<FrequencyDataPoint>;
    peakAnalyser
      .x((item) => item.frequency)
      .y((item) => item.intensity)
      .fromArray(logData)
      .then((spikes) => {
        console.log(spikes);
      });
  }, [logData]);

  const ticks = [
    'E2', 'A2', 'D3', 'G3', 'B3',
    'E4', 'A4', 'D5', 'G5', 'B5',
    'E6',
  ].map((pitch) => {
    const frequency = pitchToFrequency(pitch);
    return Math.log2(frequency);
  });

  const formatter = (value: number) => {
    const frequency = Math.pow(2, value);
    return frequencyToString(frequency);
  }

  const renderTooltip : TooltipProps<number[], number>['content'] = ({ active, payload }) => {
    if (!payload || !active) return null;

    const point = payload[0].payload;
    return (
      <div className="border-2 border-indigo-400 p-2 background-white">
        <p>
          <b>Note:{' '}</b>
          <span>{formatter(point.frequency)}</span>
        </p>
        <p>
          <b>Intensity:{' '}</b>
          <span>{point.intensity}</span>
        </p>
      </div>
    )
  }

  const renderDot : LineProps['dot'] = (props) => {
    const point = props.payload;
    if (Math.pow(2, point.frequency) > pitchToFrequency('E3')) return <svg />;
  
    return (
      <svg>
        <circle
          cx={props.cx}
          cy={props.cy}
          r={props.r}
          fillOpacity={0}
          strokeWidth={1}
          stroke='indigo'
        />
      </svg>
    );
  }

  return (
    <>
      <div className='flex'>

      </div>

      <LineChart width={width} height={height ? height * 0.7 : 500} data={logData}>
        <XAxis
          dataKey="frequency"
          scale='linear'
          ticks={ticks}
          interval={0}
          tickFormatter={formatter}
        >
          <Label offset={-3} position="insideBottom">Note</Label>
        </XAxis>
        <YAxis domain={[0, 255]}>
          <Label angle={-90} position="insideLeft">Intensity</Label>
        </YAxis>
        <Tooltip content={renderTooltip} />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line
          type="monotone"
          dataKey="intensity"
          stroke="#8884d8"
          isAnimationActive={false}
          dot={renderDot}
        />
      </LineChart>
    </>
  );
};
export default Peaks;
