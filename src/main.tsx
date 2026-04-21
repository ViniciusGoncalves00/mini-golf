import React from "react";
import { StrictMode } from 'react';
import ReactDOM from "react-dom/client";
import "./style.css";
import PageState from "./ui/PageState";
import { Session } from "./core/session";
import { SessionProvider } from "./ui/SessionContext";
import { RoomProvider } from "./ui/room/RoomContext";

const session = new Session();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SessionProvider session={session}>
            <RoomProvider room={session.room!}>
                <PageState />
            </RoomProvider>
        </SessionProvider>
    </StrictMode>
);