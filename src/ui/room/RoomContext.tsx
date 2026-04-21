import React from "react";
import { Room } from "../../core/room";

const RoomContext = React.createContext<Room | null>(null);

export function RoomProvider({ room, children }: { room: Room; children: React.ReactNode }) {
    return (
        <RoomContext.Provider value={room}>
            {children}
        </RoomContext.Provider>
    );
}

export function useRoom() {
    const context = React.useContext(RoomContext);
    if (!context) throw new Error("useRoom must be used inside RoomProvider");
    return context;
}