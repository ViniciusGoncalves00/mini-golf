export enum Page {
    SINGLEPLAYER = "singleplayer",
    MULTIPLAYER = "multiplayer",
    ROOM = "room",
    SETTINGS = "settings",
    MAIN = "main",
    GAME = "game",
}

export class PageManager {
    public get page(): Page { return this._page }

    private _page: Page = Page.MAIN;
    private static _instance: PageManager | null = null;

    private constructor() {}

    public static instance(): PageManager {
        if (!this._instance) this._instance = new PageManager();
        return this._instance;
    }

    public setPage(page: Page): void {
        this._page = page;
    }
}

// export abstract class Page {
//     public myUser: User;
//     public users: User[] = [];

//     private parent: HTMLElement;
//     private element: HTMLElement;
    
//     public constructor(parent: HTMLElement, user: User) {
//         this.parent = parent;
//         this.myUser = user;

//         this.element = this.buildElement();
//         this.parent.appendChild(this.element);
//         this.element.hidden = true;
//     }

//     public attach(): void {
//         this.element.hidden = false;
//     }
//     public dettach(): void {
//         this.element.hidden = true;
//     }

//     public setUsers(users: User[]): void {
//         this.users.splice(0);
//         this.users.push(...users);
//     }

//     protected abstract buildElement(): HTMLElement;
// }