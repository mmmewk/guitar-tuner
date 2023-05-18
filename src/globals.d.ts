declare module 'slayer' {
  export interface SlayerConfig {
    // Disreguard all points within this distance of a peak
    minPeakDistance: number,

    // Disreguard all points with height less than this value
    minPeakHeight: number,
  }

  export interface SlayerPoint<X, Y> {
    // X value of the peak
    x: X;
    // Y value of the peak
    y: Y;
  }

  export type NumbericSlayerPoint = SlayerPoint<number, Number>;

  export type Slayer<D, T = NumbericSlayerPoint> = {
    x: (func: (item: D) => X) => Slayer<D, T>;
    y: (func: (item: D) => Y) => Slayer<D, T>;
    transform: (func: (spike: SlayerPoint<X, Y>, item: D, index: number) => T) => Slayer<D, T>;
    fromArray: (data: D[]) => Promise<T[]>;
  }
  export default <D, T>(config?: SlayerConfig) => Slayer<D, T>;
}
