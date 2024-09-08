export class KeyMap
{
    private _state: Map<string, boolean> = new Map<string, boolean>;

    public constructor()
    {
        window.addEventListener("keydown", (event) => this._state.set(event.code, true));
        window.addEventListener("keyup", (event) => this._state.set(event.code, false));
    }

    public IsKeyDown(code: string): boolean
    {
        const key = this._state.get(code);
        return (key === undefined) ? false : (key === true);
    }

    public IsKeyUp(code: string): boolean
    {
        const key = this._state.get(code);
        return (key === undefined) ? true : (key === false);
    }
}
