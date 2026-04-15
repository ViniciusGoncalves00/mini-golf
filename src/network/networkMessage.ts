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

    USER_NEXT = "user-next",
    USER_LIST = "users-list",
}

export type NetworkServerMessage = 
  | { type: NetworkMessagesTypes.CONNECTED; }
  | { type: NetworkMessagesTypes.DISCONNECTED; }
  | { type: NetworkMessagesTypes.MATCH_START; }
  | { type: NetworkMessagesTypes.MATCH_FINISH; }
  | { type: NetworkMessagesTypes.COURSE_NEXT; }
  | { type: NetworkMessagesTypes.SHOT_RESULT; payload: { position: [number, number, number] }}
  | { type: NetworkMessagesTypes.USER_NEXT; payload: { user: { ID: string; name: string } }}
  | { type: NetworkMessagesTypes.USER_LIST; payload: { users: { ID: string; name: string }[] }}

export type NetworkHostMessage = 
  | NetworkServerMessage
  | { type: NetworkMessagesTypes.SHOT_FIRE; payload: { vector: [number, number, number] }}

export type NetworkClientMessage =
  | { type: NetworkMessagesTypes.MATCH_LOADED; }
  | { type: NetworkMessagesTypes.COURSE_LOADED; }

  | { type: NetworkMessagesTypes.SHOT_FIRE; payload: { vector: [number, number, number] }}

export type NetworkMessage = 
  | NetworkServerMessage
  | NetworkHostMessage
  | NetworkClientMessage