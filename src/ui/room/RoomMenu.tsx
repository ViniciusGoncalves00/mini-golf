import React from "react";
import Button from "../components/Button";
import { useRoom } from "./RoomContext";
import { useSession } from "../SessionContext";

type RoomProps = {
    onStart: () => void;
    onLeave: () => void;
    onBack: () => void;
};

export default function RoomMenu(props: RoomProps) {
    const session = useSession();
    const isHost = session.room?.hostID.value === session.user.getID().value;

    return (
      <div className="bg-grid h-full w-full flex flex-col items-center justify-center relative">
          <div className="flex flex-col space-y-2">
                <div className="w-full flex px-8 py-4 space-x-4">
                  {session.room?.users.map((user) => (
                    <div
                      key={user.getID().value}
                      className="flex skew-x-[-15deg] border-2 border-amber-500"
                    >
                      <div className="h-16 aspect-square flex items-center justify-center bg-zinc-200/80">
                        <i className="text-5xl text-amber-500/80 bi bi-person-fill"></i>
                      </div>
                
                      <div className="w-64 flex flex-col text-white">
                        <div className="h-1/2 w-full bg-amber-600/80 flex items-center justify-between px-2">
                          <div>
                            {session.user.getID().value === user.getID().value ? `${user.getName().get()} (you)` : user.getName().get()}
                          </div>
                          <div>{user.getID().value}</div>
                        </div>
                
                        <div className="h-1/2 w-full bg-amber-500/80 flex items-center px-2">
                          Stroke 1
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isHost && (
                    <Button onClick={props.onStart}>Start</Button>
                )}
                {!isHost && (
                    <Button onClick={props.onLeave}>Leave</Button>
                )}
              <Button onClick={props.onBack}>Close</Button>
          </div>
      </div>
    );
}