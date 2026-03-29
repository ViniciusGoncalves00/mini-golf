export type NetworkMessage =
  | {
        type: "connected";
    }
  | {
        type: "disconnected";
    }
  | {
        type: "start";
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
  | {
        type: "shotResult";
        payload: {
            vector: [number, number, number];
        };
    }