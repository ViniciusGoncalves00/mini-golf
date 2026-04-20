import React from "react";
import Button from "./components/Button";

export default function SettingsMenu({ onBack }: { onBack: () => void }) {
    return (
      <div className="bg-grid h-full w-full flex flex-col items-center justify-center relative">
          <div className="flex flex-col space-y-2">
              <Button onClick={onBack}>Back</Button>
          </div>
      </div>
    );
}