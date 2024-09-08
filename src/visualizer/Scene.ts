import { mat4, Mat4, Vec3 } from "wgpu-matrix";

import { Camera } from "./Camera";
import { Mesh } from "./Mesh";
import { ResourceManager } from "./ResourceManager";

export class Scene
{
    private readonly _cameras: ReadonlyArray<Camera>;

    private readonly _meshes: ReadonlyArray<Mesh>;

    private readonly _transforms: ReadonlyArray<Mat4>;

    private readonly _normals: ReadonlyArray<Mat4>;

    private readonly _colors: ReadonlyArray<Vec3>;

    public get ActiveCamera(): Camera
    {
        return this._cameras[0];
    }

    public get Meshes(): ReadonlyArray<Mesh>
    {
        return this._meshes;
    }

    public get Transforms(): ReadonlyArray<Mat4>
    {
        return this._transforms;
    }

    public get Normals(): ReadonlyArray<Mat4>
    {
        return this._normals;
    }

    public get Colors(): ReadonlyArray<Vec3>
    {
        return this._colors
    }

    public constructor(builder: SceneBuilder)
    {
        this._cameras = builder.Cameras;
        this._meshes = builder.Meshes;
        this._transforms = builder.Transforms;
        this._normals = builder.Normals;
        this._colors = builder.Colors;
    }
}

export class SceneBuilder
{
    private readonly _resources: ResourceManager;

    private readonly _cameras = new Array<Camera>();

    private readonly _meshes = new Array<Mesh>();

    private readonly _transforms = new Array<Mat4>();

    private readonly _normals = new Array<Mat4>();

    private readonly _colors = new Array<Vec3>();

    public get Cameras(): ReadonlyArray<Camera>
    {
        return this._cameras;
    }

    public get Meshes(): ReadonlyArray<Mesh>
    {
        return this._meshes;
    }

    public get Transforms(): ReadonlyArray<Mat4>
    {
        return this._transforms;
    }

    public get Normals(): ReadonlyArray<Mat4>
    {
        return this._normals;
    }

    public get Colors(): ReadonlyArray<Vec3>
    {
        return this._colors;
    }

    public constructor(resources: ResourceManager)
    {
        this._resources = resources;
    }

    public WithCamera(camera: Camera): SceneBuilder
    {
        this._cameras.push(camera);

        return this;
    }

    public WithObject(key: string, color: Vec3, transform: Mat4 = mat4.identity()): SceneBuilder
    {
        this._meshes.push(this._resources.GetMesh(key));
        this._transforms.push(transform);

        let normal = transform;
        normal = mat4.invert(normal);
        normal = mat4.transpose(normal);
        this._normals.push(normal);

        this._colors.push(color);
        return this;
    }

    public Build(): Scene
    {
        return new Scene(this);
    }
}
