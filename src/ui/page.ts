import { User } from "../user";

export abstract class Page {
    public myUser: User;
    public users: User[] = [];

    private parent: HTMLElement;
    private element: HTMLElement;
    
    public constructor(parent: HTMLElement, user: User) {
        this.parent = parent;
        this.myUser = user;

        this.element = this.buildElement();
        this.parent.appendChild(this.element);
        this.element.hidden = true;
    }

    public attach(): void {
        this.element.hidden = false;
    }
    public dettach(): void {
        this.element.hidden = true;
    }

    public setUsers(users: User[]): void {
        this.users.splice(0);
        this.users.push(...users);
    }

    protected abstract buildElement(): HTMLElement;
}