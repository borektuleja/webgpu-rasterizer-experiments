class Globals
{
    public get FrameBufferFormat(): GPUTextureFormat
    {
        return navigator.gpu.getPreferredCanvasFormat();
    }

    public get DepthBufferFormat(): GPUTextureFormat
    {
        return "depth24plus";
    }

    public get SamplesPerPixel(): number
    {
        return 4;
    }

    public get SceneObjectsLimit(): number
    {
        return 128;
    }

    public get SceneBackground(): GPUColor
    {
        return [12.0 / 255.0, 32.0 / 255.0, 55.0 / 255.0, 1.0];
    }
};

export default new Globals();
