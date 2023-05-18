import { LineChart, XAxis, YAxis, CartesianGrid, Line, Label } from "recharts";
import { useAnalyser } from "../utils/recording";
import useWindowSize from "../utils/windowSize";
import { useState } from "react";
import Select from "./Select";

const RawSound : React.FC = () => {
  const { width, height } = useWindowSize();
  const [bufferSize, setBufferSize] = useState<number>(4096);
  const [sampleRate, setSampleRate] = useState<number>(6000);
  const [frameRate, setFrameRate] = useState<number>(60);

  const { timeData } = useAnalyser({
    bufferSize,
    sampleRate,
    frameRate,
  });

  return (
    <>
      <div className='flex'>
        <Select label="Buffer Size" value={bufferSize} setValue={setBufferSize} options={[512, 1024, 2048, 4096, 8192, 16384]} />
        <Select label="Sample Rate" value={sampleRate} setValue={setSampleRate} options={[3000, 6000, 12000, 24000, 48000, 96000]} />
        <Select label="Frame Rate" value={frameRate} setValue={setFrameRate} options={[5, 10, 30, 60, 100]} />
      </div>
      <LineChart data={timeData} width={width} height={height ? 0.7 * height : 500}>
        <XAxis
          dataKey="time"
          label="Time (s)"
          interval={Math.round(timeData.length / 5)}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <YAxis domain={[0, 255]}>
          <Label angle={-90} position="insideLeft">Intensity</Label>
        </YAxis>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="intensity" stroke="#8884d8" isAnimationActive={false} dot={false} />
      </LineChart>
    </>
  );
};
export default RawSound;
