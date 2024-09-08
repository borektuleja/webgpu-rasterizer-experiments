import { Mat4, mat4 } from "wgpu-matrix";

export class TransformBuilder
{
    private _transform: Mat4 = mat4.identity();

    public WithTranslation(x: number, y: number, z: number): TransformBuilder
    {
        this._transform = mat4.translate(this._transform, [x, y, z]);
        return this;
    }

    public WithScale(x: number, y: number, z: number): TransformBuilder
    {
        this._transform = mat4.scale(this._transform, [x, y, z]);
        return this;
    }

    public WithRotationX(radians: number): TransformBuilder
    {
        this._transform = mat4.rotateX(this._transform, radians);
        return this;
    }

    public WithRotationY(radians: number): TransformBuilder
    {
        this._transform = mat4.rotateZ(this._transform, radians);
        return this;
    }

    public WithRotationZ(radians: number): TransformBuilder
    {
        this._transform = mat4.rotateZ(this._transform, radians);
        return this;
    }

    public Build(): Mat4
    {
        return this._transform;
    }
}
