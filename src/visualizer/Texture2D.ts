export class Texture2D
{
    private readonly _texture: GPUTexture;

    private readonly _sampler: GPUSampler;

    public get Texture(): GPUTexture
    {
        return this._texture;
    }

    public get Sampler(): GPUSampler
    {
        return this._sampler;
    }

    private constructor(texture: GPUTexture, sampler: GPUSampler)
    {
        this._texture = texture;
        this._sampler = sampler;
    }

    public static async Create(device: GPUDevice, url: string): Promise<Texture2D>
    {
        const response = await fetch(url);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        const texture = device.createTexture({
            format: "bgra8unorm",
            size: [bitmap.width, bitmap.height],
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });

        device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [bitmap.width, bitmap.height]);

        const sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
        });

        return new Texture2D(texture, sampler);
    }
}
