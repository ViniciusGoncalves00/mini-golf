import * as Component from "./component";
import { StorageLoader } from "@/core/storageLoader";

export class Pages {
    private static base(): HTMLElement {
        const root = document.getElementById("root")!;
        const base = document.createElement("div");
        base.className = "bg-grid h-full w-full flex flex-col gap-4 items-center relative";
        root.appendChild(base);
        return base;
    }

    public static mainMenu(): void {
        const base = this.base();
        
        const section1 = document.createElement("div");
        const section2 = document.createElement("div");
        const section3 = document.createElement("div");
        section1.className = "h-1/3 flex flex-col items-center justify-end text-white";
        section2.className = "h-1/3 flex-none flex flex-col space-y-2";
        section3.className = "w-full h-1/3 p-4 text-white flex items-end justify-between";
        base.appendChild(section1);
        base.appendChild(section2);
        base.appendChild(section3);
        
        const version = document.createElement("div");
        version.textContent = "v.0.0.1";
        const links = document.createElement("a");
        links.href = "https://www.linkedin.com/in/viniciusgonçalves00";
        links.target = "_blank";
        links.rel = "noopener noreferrer";
        links.textContent = "LinkedIn";
        
        Component.Button.create({text: "SinglePlayer", onClick: () => {}, parent: section2});
        Component.Button.create({text: "MultiPlayer", onClick: () => {}, parent: section2});
        Component.Button.create({text: "Settings", onClick: () => {}, parent: section2});
        Component.Button.create({text: "Credits", onClick: () => {}, parent: section2, disabled: true});
        Component.Button.create({text: "Quit", onClick: () => {}, parent: section2, disabled: true});
        
        section3.appendChild(version);
        Component.Button.create({text: "Reset", onClick: () => StorageLoader.instance().clear(), parent: section3, variant: "danger", holdToConfirm: true});
        section3.appendChild(links);
    }

    public static multiplayerMenu(): void {
        const base = this.base();

        const section1 = document.createElement("div");
        const section2 = document.createElement("div");
        const section3 = document.createElement("div");
        section1.className = "h-1/3 flex flex-col items-center justify-end text-white";
        section2.className = "h-1/3 flex-none flex flex-col space-y-2";
        section3.className = "w-full h-1/3 p-4 text-white flex items-end justify-between";
        base.appendChild(section1);
        base.appendChild(section2);
        base.appendChild(section3);
        
        const version = document.createElement("div");
        version.textContent = "v.0.0.1";
        const links = document.createElement("a");
        links.href = "https://www.linkedin.com/in/viniciusgonçalves00";
        links.target = "_blank";
        links.rel = "noopener noreferrer";
        links.textContent = "LinkedIn";
        
        Component.Button.create({text: "SinglePlayer", onClick: () => {}, parent: section2});
        Component.Button.create({text: "MultiPlayer", onClick: () => {}, parent: section2});
        Component.Button.create({text: "Settings", onClick: () => {}, parent: section2});
        Component.Button.create({text: "Credits", onClick: () => {}, parent: section2, disabled: true});
        Component.Button.create({text: "Quit", onClick: () => {}, parent: section2, disabled: true});
        
        section3.appendChild(version);
        Component.Button.create({text: "Reset", onClick: () => StorageLoader.instance().clear(), parent: section3, variant: "danger", holdToConfirm: true});
        section3.appendChild(links);
    }
}