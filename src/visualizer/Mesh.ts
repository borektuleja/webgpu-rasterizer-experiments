import { ShaderBase } from "./ShaderBase";

export class Mesh
{
    private readonly _vertexBuffer: GPUBuffer;

    private readonly _vertexCount: number;

    public get VertexBuffer(): GPUBuffer
    {
        return this._vertexBuffer;
    }

    public get VertexCount(): number
    {
        return this._vertexCount;
    }

    private constructor(vertexBuffer: GPUBuffer, vertexCount: number)
    {
        this._vertexBuffer = vertexBuffer;
        this._vertexCount = vertexCount;
    }

    public static Create(device: GPUDevice, vertices: BufferSource)
    {
        const buffer = device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        });

        device.queue.writeBuffer(buffer, 0, vertices);

        return new Mesh(buffer, vertices.byteLength / ShaderBase.VertexFormat.arrayStride);
    }
}
