import React from "react";
import Button from "./components/Button";
import { useSession } from "./SessionContext";
import { StorageLoader } from "../core/storageLoader";

type MainMenuProps = {
    onSelectSinglePlayerMenu: () => void;
    onSelectMultiPlayerMenu: () => void;
    onSelectSettingsMenu: () => void;
};

export default function MainMenu(props : MainMenuProps) {
    const session = useSession();
    
    return (
      <div className="bg-grid h-full w-full flex flex-col gap-4 items-center relative">
            <div className="h-1/3 flex-none flex flex-col items-center justify-end text-white">
                <h1 className="flex text-4xl font-bold space-x-2">
                    <p className="line-through">Mini</p>
                    <p>Golf</p>
                </h1>
                <p className="text-sm text-center">Logged in as {session.user.getName().get()}</p>
            </div>
            <div className="h-1/3 flex flex-col space-y-2">
                <Button onClick={props.onSelectSinglePlayerMenu}>Singleplayer</Button>
                <Button onClick={props.onSelectMultiPlayerMenu}>Multiplayer</Button>
                <Button onClick={props.onSelectSettingsMenu}>Settings</Button>
                <Button onClick={() => {}} disabled>Credits</Button>
                <Button onClick={() => {}} disabled>Quit</Button>
            </div>
            <div className="w-full h-1/3 p-4 text-white flex-none flex items-end justify-between">
                <div>v.1.0.0</div>
                <Button holdToConfirm variant="danger" onClick={() => StorageLoader.instance().clear()}>Reset</Button>
                <div>
                    <a href="https://www.linkedin.com/in/viniciusgonçalves00" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
            </div>
      </div>
    );
}