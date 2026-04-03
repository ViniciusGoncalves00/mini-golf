export enum NetworkMessagesTypes {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",

    MATCH_START = "match-start",
    MATCH_FINISH = "match-finish",
    MATCH_LOADED = "match-loaded",

    COURSE_NEXT = "course-next",
    COURSE_LOADED = "course-loaded",

    SHOT_FIRE = "shot-fire",
    SHOT_RESULT = "shot-result",

    PLAYER_NEXT = "player-next",
    PLAYERS_LIST = "players-list",
}

export type NetworkServerMessage = 
  | { type: NetworkMessagesTypes.MATCH_START; }
  | { type: NetworkMessagesTypes.MATCH_FINISH; }
  | { type: NetworkMessagesTypes.COURSE_NEXT; }
  | { type: NetworkMessagesTypes.PLAYER_NEXT; player: string }
  | { type: NetworkMessagesTypes.SHOT_RESULT; payload: { position: [number, number, number] }}
  | { type: NetworkMessagesTypes.PLAYERS_LIST; payload: { players: string[] }}

export type NetworkHostMessage = 
  | NetworkServerMessage
  | { type: NetworkMessagesTypes.SHOT_FIRE; payload: { force: [number, number, number] }}

export type NetworkClientMessage =
  | { type: NetworkMessagesTypes.MATCH_LOADED; }
  | { type: NetworkMessagesTypes.COURSE_LOADED; }

  | { type: NetworkMessagesTypes.SHOT_FIRE; payload: { force: [number, number, number] }}

export type NetworkMessage = 
  | NetworkServerMessage
  | NetworkHostMessage
  | NetworkClientMessage