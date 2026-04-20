import React from "react";
import { Session } from "../session";

const SessionContext = React.createContext<Session | null>(null);

export function SessionProvider({ session, children }: { session: Session; children: React.ReactNode }) {
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const session = React.useContext(SessionContext);
    if (!session) throw new Error("useSession must be used inside SessionProvider");
    return session;
}