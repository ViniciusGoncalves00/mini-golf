import { level1 } from "../course/courses";
import { main } from "../program";
import { Match } from "../match";

export class UI {
    public currentID: string = "home";
    public previousID: string = "home";

    public constructor() {
    }
    
    public setContext(id: string): void {
        this.previousID = this.currentID;
        this.currentID = id;
        document.getElementById(this.previousID)!.setAttribute("hidden", "");
        document.getElementById(this.currentID)!.removeAttribute("hidden");
    }

    public start(): void {
        this.setContext("game");
        document.getElementById("overlay")!.setAttribute("hidden", "");

        main()
    }

    public back(): void {
        this.setContext(this.previousID);
    }
}