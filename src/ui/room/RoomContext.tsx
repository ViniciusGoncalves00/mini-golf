import React from "react";
import { User } from "../../user";

type Room = {
    players: User[];
    hostID: string | null;
};

type RoomContextType = {
  room: Room;
  setRoom: React.Dispatch<React.SetStateAction<Room>>;
};

const RoomContext = React.createContext<RoomContextType | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
    const [room, setRoom] = React.useState<Room>({
        players: [],
        hostID: null,
    });

    return (
        <RoomContext.Provider value={{ room, setRoom }}>
            {children}
        </RoomContext.Provider>
    );
}

export function useRoom() {
    const context = React.useContext(RoomContext);
    if (!context) throw new Error("useRoom must be used inside RoomProvider");
    return context;
}