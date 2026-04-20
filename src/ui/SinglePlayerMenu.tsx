import React from "react";
import Button from "./components/Button";

type Props = {
    onStart: () => void;
    onBack: () => void;
};

export default function SinglePlayerMenu(props: Props) {
    return (
      <div className="bg-grid h-full w-full flex flex-col items-center justify-center relative">
          <div className="flex flex-col space-y-2">
              <Button onClick={props.onStart}>Start</Button>
              <Button onClick={props.onBack}>Back</Button>
          </div>
      </div>
    );
}