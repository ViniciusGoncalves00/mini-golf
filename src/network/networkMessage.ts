export type NetworkMessage =
  | {
        type: "connected";
        payload: {};
    }
  | {
        type: "disconnected";
        payload: {};
    }
  | {
        type: "start";
        payload: {};
    }
  | {
        type: "playersList";
        payload: {
            players: string[];
        };
    }
  | {
        type: "shot";
        payload: {
            vector: [number, number, number];
        };
    }