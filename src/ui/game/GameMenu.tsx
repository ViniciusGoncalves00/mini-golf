import { useState } from "react";
import React from "react";
import { User } from "../../core/user";

type Props = {
  users: User[];
  currentUserId?: string;
};

export default function GamePage({ users, currentUserId }: Props) {
  const [showHelp, setShowHelp] = useState(true);

  const currentUser = users.find(user => user.getID().value === currentUserId);

  return (
    <div className="h-full w-full">
      <div className="fixed w-full h-full flex flex-col pointer-events-none">

        {showHelp && (
          <div className="absolute w-full h-full bg-zinc-200/80 flex items-center justify-center">
            <div className="bg-zinc-200 border rounded-lg border-amber-500 p-4 flex flex-col pointer-events-auto">
              
              <div
                className="w-full h-4 flex items-end cursor-pointer"
                onClick={() => setShowHelp(false)}
              >
                <div className="h-full aspect-square">X</div>
              </div>

              <div className="w-full h-4">How to play</div>
              <div className="w-full h-4">Mouse Left: Orbit Camera</div>
              <div className="w-full h-4">Mouse Right: Shot the ball</div>
              <div className="w-full h-4">T: Toggle free camera</div>
            </div>
          </div>
        )}

        <div className="w-full flex px-8 py-4 space-x-4">
          {users.map((user) => (
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
                    {currentUser?.getID().value === user.getID().value ? `${user.getName().get()} (you)` : user.getName().get()}
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

        <div className="w-full h-full flex items-center justify-end p-4">
          <div className="h-128 w-4 border rounded-lg bg-white/10 relative">

            {
                [10, 20, 30, 40, 50, 60, 70, 80, 90].map((percent) => (
                    <div
                        key={percent}
                        className="absolute w-full h-px bg-black text-xs text-center opacity-80 z-10"
                        style={{ top: `${100 - percent}%` }}
                    >{percent}</div>
                ))
            }

            <div className="w-full h-full rotate-180">
                <div id="power-bar" className="w-full rounded-lg opacity-80"></div>
            </div>
          </div>
        </div>

        <div className="w-full"></div>
      </div>

      <canvas id="game" className="h-full w-full"></canvas>
    </div>
  );
}