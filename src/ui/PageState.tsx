import React from "react";
import MainMenu from "./MainMenu";
import SinglePlayerMenu from "./SinglePlayerMenu";
import MultiPlayerMenu from "./MultiPlayerMenu";
import SettingsMenu from "./Settings";
import RoomMenu from "./room/RoomMenu";
import GameMenu from "./game/GameMenu";
import { useSession } from "./SessionContext";

type Screen = "MainMenu" | "SinglePlayerMenu" | "MultiPlayerMenu" | "RoomMenu"| "GameMenu" | "SettingsMenu";

export default function PageState() {
  const [screen, setScreen] = React.useState<Screen>("MainMenu");

  const session = useSession();

  switch (screen) {
    case "MainMenu": return <MainMenu
        onSelectSinglePlayerMenu={() => setScreen("SinglePlayerMenu")}
        onSelectMultiPlayerMenu={() => setScreen("MultiPlayerMenu")}
        onSelectSettingsMenu={() => setScreen("SettingsMenu")}
        />;
    case "SinglePlayerMenu": return <SinglePlayerMenu onBack={() => setScreen("MainMenu")} onStart={() => {setScreen("GameMenu"); session.startSinglePlayerMatch()}} />;
    case "GameMenu": return <GameMenu users={[session.user]} currentUserId={session.user.getID().value} />;
    case "MultiPlayerMenu": return <MultiPlayerMenu onBack={() => setScreen("MainMenu")} onCreateRoom={() => setScreen("RoomMenu")} onEnterRoom={() => setScreen("RoomMenu")} />;
    case "RoomMenu": return <RoomMenu onBack={() => setScreen("MultiPlayerMenu")} onStart={() => setScreen("GameMenu")} onLeave={() => setScreen("MultiPlayerMenu")} />;
    case "SettingsMenu": return <SettingsMenu onBack={() => setScreen("MainMenu")} />;
  }
}