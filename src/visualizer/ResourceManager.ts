import { Mesh } from "./Mesh";
import { Texture2D } from "./Texture2D";

export class ResourceManager<TKey = string>
{
    private readonly _meshes: ReadonlyMap<TKey, Mesh>;

    private readonly _textures: ReadonlyMap<TKey, Texture2D>;

    public constructor(builder: ResourceBuilder<TKey>)
    {
        this._meshes = builder.Meshes;
        this._textures = builder.Textures;
    }

    public GetMesh(key: TKey): Mesh
    {
        return this.GetResource(this._meshes, key);
    }

    public GetTexture(key: TKey): Texture2D
    {
        return this.GetResource(this._textures, key);
    }

    private GetResource<T>(collection: ReadonlyMap<TKey, T>, key: TKey): T
    {
        const resource = collection.get(key);

        if (resource === undefined)
            throw new Error(`Resource under the key of value '${key}' doesn't exist.`);

        return resource;
    }
}

export class ResourceBuilder<TKey = string>
{
    private readonly _device: GPUDevice;

    private readonly _meshes = new Map<TKey, Mesh>();

    private readonly _textures = new Map<TKey, Texture2D>();

    private readonly _queue = new Map<TKey, Promise<Texture2D>>();

    public get Meshes(): ReadonlyMap<TKey, Mesh>
    {
        return this._meshes;
    }

    public get Textures(): ReadonlyMap<TKey, Texture2D>
    {
        return this._textures;
    }

    public constructor(device: GPUDevice)
    {
        this._device = device;
    }

    public WithMesh(key: TKey, vertices: BufferSource): ResourceBuilder<TKey>
    {
        const mesh = Mesh.Create(this._device, vertices);

        this._meshes.set(key, mesh);
        return this;
    }

    public WithTexture(key: TKey, url: string): ResourceBuilder<TKey>
    {
        const promise = Texture2D.Create(this._device, url);

        this._queue.set(key, promise);
        return this;
    }

    public async BuildAsync(): Promise<ResourceManager<TKey>>
    {
        for (const [key, promise] of this._queue.entries())
        {
            const texture = await promise;

            this._textures.set(key, texture);
        }

        return new ResourceManager<TKey>(this);
    }
}
