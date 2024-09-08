import Globals from "./Globals";

export class Context3D
{
    private readonly _device: GPUDevice;

    private readonly _context: GPUCanvasContext;

    public get Device(): GPUDevice
    {
        return this._device;
    }

    public get Context(): GPUCanvasContext
    {
        return this._context;
    }

    public get Width(): number
    {
        return this._context.canvas.width;
    }
    
    public get Height(): number
    {
        return this._context.canvas.height;
    }

    public get OutputSize(): [number, number]
    {
        return [this.Width, this.Height];
    }

    public get Aspect(): number
    {
        return this.Width / this.Height;
    }

    private constructor(device: GPUDevice, context: GPUCanvasContext)
    {
        this._device = device;
        this._context = context;

        context.configure({
            device,
            format: Globals.FrameBufferFormat
        });
    }

    public static async Create(context: GPUCanvasContext): Promise<Context3D>
    {
        if (!navigator.gpu)
            throw new Error("The running environment doesn't support WebGPU.");

        const adapter = await navigator.gpu.requestAdapter();

        if (adapter === null)
            throw new Error("Failed to request a WebGPU adapter.");

        const device = await adapter.requestDevice();

        return new Context3D(device, context);
    }
}
