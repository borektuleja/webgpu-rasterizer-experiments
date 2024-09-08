import { Scene } from "@/Scene";
import { ShaderBase } from "@/ShaderBase";
import { ShaderMemory, ShaderMemoryBuilder } from "@/ShaderMemory";
import { Texture2D } from "@/Texture2D";

import Globals from "@/Globals";

import wgsl from "shader/CookTorrance.wgsl?raw";

type Resources =
{
    albedo: Texture2D,
    roughness: Texture2D,
    scene: Scene,
};

export class CookTorrance extends ShaderBase
{
    private _albedo: Texture2D;

    private _roughness: Texture2D;

    private constructor(device: GPUDevice, initialState: Omit<Resources, "scene">)
    {
        super(device, wgsl);

        this._albedo = initialState.albedo;
        this._roughness = initialState.roughness;
    }

    public UploadCamera(scene: Scene): void
    {
        this._memory.WriteUniform("ViewProjection", scene.ActiveCamera.ViewProjection);
        this._memory.WriteUniform("Eye", scene.ActiveCamera.Eye);
    }

    public UploadObjects(scene: Scene): void
    {
        const transforms = ShaderMemory.AsFloat32Sequence(scene.Transforms, 16);
        const normals = ShaderMemory.AsFloat32Sequence(scene.Normals, 16);
        const colors = ShaderMemory.AsFloat32Sequence(scene.Colors, 4);
        
        this._memory.WriteStorage("Transforms", transforms);
        this._memory.WriteStorage("Normals", normals);
        this._memory.WriteStorage("Colors", colors);
    }

    protected AssembleMemory(): ShaderMemory<string>
    {
        const builder = new ShaderMemoryBuilder(this._device)
            .WithUniform("ViewProjection", 16 * Float32Array.BYTES_PER_ELEMENT)
            .WithUniform("Eye", 4 * Float32Array.BYTES_PER_ELEMENT)
            .WithStorage("Transforms", Globals.SceneObjectsLimit * 16 * Float32Array.BYTES_PER_ELEMENT)
            .WithStorage("Normals", Globals.SceneObjectsLimit * 16 * Float32Array.BYTES_PER_ELEMENT)
            .WithStorage("Colors", Globals.SceneObjectsLimit * 4 * Float32Array.BYTES_PER_ELEMENT)

        return builder.Build();
    }

    protected AssemblePipeline(): GPURenderPipeline
    {
        const layout = this._device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
                { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
                { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
                { binding: 4, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
                { binding: 5, visibility: GPUShaderStage.FRAGMENT, texture: {} },
                { binding: 6, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
                { binding: 7, visibility: GPUShaderStage.FRAGMENT, texture: {} },
                { binding: 8, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            ]
        });

        return this._device.createRenderPipeline({
            layout: this._device.createPipelineLayout({
                bindGroupLayouts: [layout],
            }),
            vertex: {
                module: this._module,
                buffers: [ShaderBase.VertexFormat],
                entryPoint: "vs_entry",
            },
            fragment: {
                module: this._module,
                targets: [{
                    format: Globals.FrameBufferFormat,
                }],
                entryPoint: "fs_entry",
            },
            depthStencil: {
                format: Globals.DepthBufferFormat,
                depthCompare: "less",
                depthWriteEnabled: true,
            },
            multisample: {
                count: Globals.SamplesPerPixel,
            },
            primitive: {
                topology: "triangle-list",
            },
        });
    }

    protected ConfigureResources(pass: GPURenderPassEncoder): void
    {
        const bindGroup = this._device.createBindGroup({
            entries: [
                { binding: 0, resource: { buffer: this._memory.GetUniform("ViewProjection") } },
                { binding: 1, resource: { buffer: this._memory.GetUniform("Eye") } },
                { binding: 2, resource: { buffer: this._memory.GetStorage("Transforms") } },
                { binding: 3, resource: { buffer: this._memory.GetStorage("Normals")} },
                { binding: 4, resource: { buffer: this._memory.GetStorage("Colors")} },
                { binding: 5, resource: this._albedo.Texture.createView() },
                { binding: 6, resource: this._albedo.Sampler },
                { binding: 7, resource: this._roughness.Texture.createView() },
                { binding: 8, resource: this._roughness.Sampler },
            ],
            layout: this._pipeline.getBindGroupLayout(0),
        });

        pass.setBindGroup(0, bindGroup);
    }

    public static Create(device: GPUDevice, initialState: Resources): CookTorrance
    {
        const instance = new CookTorrance(device, initialState);
        instance.UploadCamera(initialState.scene);
        instance.UploadObjects(initialState.scene);
        return instance;
    }
}
