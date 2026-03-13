export type NetworkMessage =
  | {
      type: "ball-hit";
      direction: number[];
      power: number;
    }
  | {
      type: "ball-position";
      position: number[];
    }
  | {
      type: "join";
    };