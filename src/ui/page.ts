export abstract class Page {
    private parent: HTMLElement;
    private element: HTMLElement;

    public constructor(parent: HTMLElement) {
        this.parent = parent;
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

    protected abstract buildElement(): HTMLElement;
}