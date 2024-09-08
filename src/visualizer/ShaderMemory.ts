export class ShaderMemory<TKey = string>
{
    private readonly _device: GPUDevice;

    private readonly _uniformBuffers: ReadonlyMap<TKey, GPUBuffer>;

    private readonly _storageBuffers: ReadonlyMap<TKey, GPUBuffer>;

    public constructor(device: GPUDevice, builder: ShaderMemoryBuilder<TKey>)
    {
        this._device = device;
        this._uniformBuffers = builder.UniformBuffers;
        this._storageBuffers = builder.StorageBuffers;
    }

    public WriteUniform(key: TKey, data: BufferSource): void
    {
        this.WriteBuffer(this._uniformBuffers, key, data);
    }

    public WriteStorage(key: TKey, data: BufferSource): void
    {
        this.WriteBuffer(this._storageBuffers, key, data);
    }

    public GetUniform(key: TKey): GPUBuffer
    {
        return this.GetBuffer(this._uniformBuffers, key);
    }

    public GetStorage(key: TKey): GPUBuffer
    {
        return this.GetBuffer(this._storageBuffers, key);
    }

    private WriteBuffer(collection: ReadonlyMap<TKey, GPUBuffer>, key: TKey, data: BufferSource): void
    {
        const buffer = collection.get(key);

        if (buffer === undefined)
            throw new Error(`Resource under the key of value '${key}' doesn't exist.`);

        this._device.queue.writeBuffer(buffer, 0, data);
    }

    private GetBuffer(collection: ReadonlyMap<TKey, GPUBuffer>, key: TKey): GPUBuffer
    {
        const buffer = collection.get(key);

        if (buffer === undefined)
            throw new Error(`Resource under the key of value '${key}' doesn't exist.`);

        return buffer;
    }

    public static AsFloat32Sequence(objects: ReadonlyArray<Float32Array>, count: number): Float32Array
    {
        const buffer = new Float32Array(objects.length * count);

        for (const [index, object] of objects.entries())
            buffer.set(object, index * count);
        
        return buffer;
    }
}

export class ShaderMemoryBuilder<TKey = string>
{
    private readonly _device: GPUDevice;

    private readonly _uniformBuffers = new Map<TKey, GPUBuffer>();

    private readonly _storageBuffers = new Map<TKey, GPUBuffer>();

    public get UniformBuffers(): ReadonlyMap<TKey, GPUBuffer>
    {
        return this._uniformBuffers;
    }

    public get StorageBuffers(): ReadonlyMap<TKey, GPUBuffer>
    {
        return this._storageBuffers;
    }

    public constructor(device: GPUDevice)
    {
        this._device = device;
    }

    public WithUniform(key: TKey, size: number): ShaderMemoryBuilder<TKey>
    {
        const buffer = this._device.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM });

        this._uniformBuffers.set(key, buffer);
        return this;
    }

    public WithStorage(key: TKey, size: number): ShaderMemoryBuilder<TKey>
    {
        const buffer = this._device.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE });

        this._storageBuffers.set(key, buffer);
        return this;
    }

    public Build(): ShaderMemory<TKey>
    {
        return new ShaderMemory<TKey>(this._device, this);
    }
}
