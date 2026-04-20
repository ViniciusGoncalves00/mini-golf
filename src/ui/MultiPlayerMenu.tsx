import React from "react";
import Button from "./components/Button";

type MainMenuProps = {
    onCreateRoom: () => void;
    onEnterRoom: () => void;
    onBack: () => void;
};

export default function MultiPlayerMenu(props: MainMenuProps) {
    return (
        <div className="bg-grid h-full w-full flex flex-col items-center justify-center relative">
            <div className="flex flex-col space-y-2">
                <Button onClick={props.onCreateRoom}>Create room</Button>
                <Button onClick={props.onEnterRoom}>Enter room</Button>
                <Button onClick={props.onBack}>Back</Button>
            </div>
        </div>
    );
}