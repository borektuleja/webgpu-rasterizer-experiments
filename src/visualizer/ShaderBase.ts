import { ShaderMemory } from "./ShaderMemory";

export abstract class ShaderBase
{
    protected readonly _device: GPUDevice;

    protected readonly _module: GPUShaderModule;

    protected readonly _memory: ShaderMemory<string>;

    protected readonly _pipeline: GPURenderPipeline;

    public constructor(device: GPUDevice, code: string)
    {
        this._device = device;
        this._module = device.createShaderModule({ code });
        this._memory = this.AssembleMemory();
        this._pipeline = this.AssemblePipeline();
    }

    public ConfigurePass(pass: GPURenderPassEncoder): void
    {
        pass.setPipeline(this._pipeline);
        this.ConfigureResources(pass);
    }

    protected abstract AssembleMemory(): ShaderMemory<string>;

    protected abstract AssemblePipeline(): GPURenderPipeline;

    protected abstract ConfigureResources(pass: GPURenderPassEncoder): void;

    public static get VertexFormat(): GPUVertexBufferLayout
    {
        return {
            arrayStride: 8 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    format: "float32x3",
                    offset: 0 * Float32Array.BYTES_PER_ELEMENT,
                    shaderLocation: 0,
                },
                {
                    format: "float32x3",
                    offset: 3 * Float32Array.BYTES_PER_ELEMENT,
                    shaderLocation: 1,
                },
                {
                    format: "float32x2",
                    offset: 6 * Float32Array.BYTES_PER_ELEMENT,
                    shaderLocation: 2,
                }
            ],
            stepMode: "vertex",
        };
    }
}
