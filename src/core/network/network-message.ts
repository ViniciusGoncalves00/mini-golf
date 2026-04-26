export enum NetworkMessagesType {
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
  | { type: NetworkMessagesType.CONNECTED; }
  | { type: NetworkMessagesType.DISCONNECTED; }
  | { type: NetworkMessagesType.MATCH_START; }
  | { type: NetworkMessagesType.MATCH_FINISH; }
  | { type: NetworkMessagesType.COURSE_NEXT; }
  | {
        type: NetworkMessagesType.SHOT_RESULT;
        payload: {
            position: [number, number, number]
        }
    }
  | {
        type: NetworkMessagesType.USER_NEXT;
        payload: {
            user: {
                ID: string;
                name: string
            }
        }
    }
  | {
        type: NetworkMessagesType.USER_LIST;
        payload: {
            users: {
                ID: string;
                name: string
            }[]
        }
    }

export type NetworkHostMessage = 
  | NetworkServerMessage
  | { type: NetworkMessagesType.SHOT_FIRE; payload: { vector: [number, number, number] }}

export type NetworkClientMessage =
  | { type: NetworkMessagesType.MATCH_LOADED; }
  | { type: NetworkMessagesType.COURSE_LOADED; }

  | { type: NetworkMessagesType.SHOT_FIRE; payload: { vector: [number, number, number] }}

export type NetworkMessage = 
  | NetworkServerMessage
  | NetworkHostMessage
  | NetworkClientMessage