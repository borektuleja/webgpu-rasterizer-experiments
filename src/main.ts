import { vec3 } from "wgpu-matrix";

import { CameraBuilder } from "@/Camera";
import { Context3D } from "@/Context3D";
import { Renderer } from "@/Renderer";
import { ResourceBuilder } from "@/ResourceManager";
import { SceneBuilder } from "@/Scene";
import { TransformBuilder } from "@/TransformBuilder";

import { CookTorrance } from "./CookTorrance";
import { KeyMap } from "./KeyMap";

import { VERTEX_ARRAY_BOX, VERTEX_ARRAY_CONE } from "vertex";

async function RunApp(context: GPUCanvasContext)
{
    const gpu = await Context3D.Create(context);

    const resources = await new ResourceBuilder(gpu.Device)
        .WithMesh("BOX", VERTEX_ARRAY_BOX)
        .WithMesh("CONE", VERTEX_ARRAY_CONE)
        .WithTexture("ALBEDO", "assets/albedo.png")
        .WithTexture("ROUGHNESS", "assets/roughness.png")
        .BuildAsync();

    const scene = new SceneBuilder(resources)
        .WithCamera(
            new CameraBuilder()
                .WithLookat(
                    vec3.create(4.0, 4.0, 4.0),
                    vec3.create(0.0, 0.0, 0.0))
                .WithPerspective(gpu.Aspect)
                .Build())
        .WithObject("BOX", vec3.create(0.8, 0.2, 0.4),
            new TransformBuilder()
                .WithTranslation(-1.0, -1.0, 0.0)
                .Build())
        .WithObject("BOX", vec3.create(0.4, 0.8, 0.2),
            new TransformBuilder()
                .WithTranslation(-1.0, +1.0, 0.0)
                .Build())
        .WithObject("CONE", vec3.create(0.2, 0.4, 0.8),
            new TransformBuilder()
                .WithTranslation(0.0, 0.0, 0.5)
                .WithScale(1.0, 1.0, 2.0)
                .WithRotationX(Math.PI)
                .Build())
        .Build();
    
    const shader = CookTorrance.Create(gpu.Device, {
        albedo: resources.GetTexture("ALBEDO"),
        roughness: resources.GetTexture("ROUGHNESS"),
        scene,
    });

    const renderer = new Renderer(gpu);
    const input = new KeyMap();

    function Frame(index: number)
    {
        if (input.IsKeyDown("KeyE")) scene.ActiveCamera.MoveForwards(+0.1);
        if (input.IsKeyDown("KeyQ")) scene.ActiveCamera.MoveForwards(-0.1);
        if (input.IsKeyDown("KeyA")) scene.ActiveCamera.AdjustPhi(+0.04);
        if (input.IsKeyDown("KeyD")) scene.ActiveCamera.AdjustPhi(-0.04);
        if (input.IsKeyDown("KeyS")) scene.ActiveCamera.AdjustTheta(+0.04);
        if (input.IsKeyDown("KeyW")) scene.ActiveCamera.AdjustTheta(-0.04);

        shader.UploadCamera(scene);
        renderer.Run(scene, shader);

        window.requestAnimationFrame(() => Frame(index + 1));
    }

    window.requestAnimationFrame(() => Frame(0));
}

const canvas = document.createElement("canvas");
canvas.width = 1920;
canvas.height = 1080;

document.body.appendChild(canvas);

const context = canvas.getContext("webgpu");

if (context === null)
    throw new Error("Couldn't request WebGPU context from a canvas element.");

RunApp(context);
