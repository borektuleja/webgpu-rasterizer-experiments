import { Context3D } from "./Context3D";
import { Scene } from "./Scene";
import { ShaderBase } from "./ShaderBase";

import Globals from "./Globals";

export class Renderer
{
    private readonly _gpu: Context3D;

    private readonly _frameBuffer: GPUTexture;

    private readonly _depthBuffer: GPUTexture;

    public constructor(gpu: Context3D)
    {
        this._gpu = gpu;
        this._frameBuffer = this.CreateFrameBuffer(gpu.OutputSize);
        this._depthBuffer = this.CreateDepthBuffer(gpu.OutputSize);
    }

    public Run(scene: Scene, shader: ShaderBase): void
    {
        const encoder = this._gpu.Device.createCommandEncoder();

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                clearValue: Globals.SceneBackground,
                loadOp: "clear",
                storeOp: "discard",
                view: this._frameBuffer.createView(),
                resolveTarget: this._gpu.Context.getCurrentTexture().createView(),
            }],
            depthStencilAttachment: {
                view: this._depthBuffer.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store",
            }
        });

        shader.ConfigurePass(pass);

        for (const [index, mesh] of scene.Meshes.entries())
        {
            pass.setVertexBuffer(0, mesh.VertexBuffer);
            pass.draw(mesh.VertexCount, 1, 0, index);
        }

        pass.end();

        const commandBuffer = encoder.finish();
        this._gpu.Device.queue.submit([commandBuffer]);
    }

    private CreateFrameBuffer(size: [number, number]): GPUTexture
    {
        return this._gpu.Device.createTexture({
            format: Globals.FrameBufferFormat,
            size,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            sampleCount: Globals.SamplesPerPixel,
        });
    }

    private CreateDepthBuffer(size: [number, number]): GPUTexture
    {
        return this._gpu.Device.createTexture({
            format: Globals.DepthBufferFormat,
            size,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            sampleCount: Globals.SamplesPerPixel,
        });
    }
}
