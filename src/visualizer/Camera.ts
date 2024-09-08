import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";

type SphericalCoordinates =
{
    phi: number;
    theta: number;
}

function CartesianToSphericalCoordinates(cartesian: Vec3): SphericalCoordinates
{
    const phi = Math.atan2(cartesian[1], cartesian[0]);
    const theta = Math.acos(cartesian[2]);
    return { phi, theta };
}

function SphericalToCartesianCoordinates(spherical: SphericalCoordinates): Vec3
{
    const x = Math.sin(spherical.theta) * Math.cos(spherical.phi);
    const y = Math.sin(spherical.theta) * Math.sin(spherical.phi);
    const z = Math.cos(spherical.theta);
    return vec3.create(x, y, z);
}

export class Camera
{
    private _eye: Vec3;

    private _viewMatrix: Mat4;

    private _projectionMatrix: Mat4;

    private _forward: Vec3;

    private _phi: number;

    private _theta: number;

    public get Eye(): Vec3
    {
        return this._eye;
    }

    public get ViewProjection(): Mat4
    {
        return mat4.multiply(this._projectionMatrix, this._viewMatrix);
    }

    public constructor(builder: CameraBuilder)
    {
        this._eye = builder.Eye;
        this._viewMatrix = builder.ViewMatrix;
        this._projectionMatrix = builder.ProjectionMatrix;

        this._forward = vec3.normalize(vec3.subtract(builder.Target, this._eye));

        const spherical = CartesianToSphericalCoordinates(this._forward);
        this._phi = spherical.phi;
        this._theta = spherical.theta;
    }

    public MoveForwards(velocity: number): void
    {
        this._eye = vec3.add(this._eye, vec3.mulScalar(this._forward, velocity));
        this.CalculateViewMatrix();
    }

    public AdjustPhi(radians: number): void
    {
        this._phi += radians;
        this.CalculateViewMatrix();
    }

    public AdjustTheta(radians: number): void
    {
        this._theta = Math.min(Math.max(this._theta + radians, Math.PI / 32.0), Math.PI - Math.PI / 32.0);
        this.CalculateViewMatrix();
    }

    private CalculateViewMatrix(): void
    {
        this._forward = SphericalToCartesianCoordinates({
            phi: this._phi,
            theta: this._theta
        });

        const target = vec3.add(this._eye, this._forward);

        this._viewMatrix = mat4.lookAt(this._eye, target, [0.0, 0.0, 1.0]);
    }
}

export class CameraBuilder
{
    private _eye: Vec3 = vec3.zero();

    private _target: Vec3 = vec3.zero();

    private _viewMatrix: Mat4 = mat4.identity();

    private _projectionMatrix: Mat4 = mat4.identity();

    public get Eye(): Vec3
    {
        return this._eye;
    }

    public get Target(): Vec3
    {
        return this._target;
    }

    public get ViewMatrix(): Mat4
    {
        return this._viewMatrix;
    }

    public get ProjectionMatrix(): Mat4
    {
        return this._projectionMatrix;
    }

    public WithLookat(eye: Vec3, target: Vec3): CameraBuilder
    {
        this._eye = eye;
        this._target = target;
        this._viewMatrix = mat4.lookAt(eye, target, [0.0, 0.0, 1.0]);

        return this;
    }

    public WithPerspective(aspect: number): CameraBuilder
    {
        const radians = 45.0 * Math.PI / 180.0;
        this._projectionMatrix = mat4.perspective(radians, aspect, 1e-1, 1e4);
        
        return this;
    }

    public Build(): Camera
    {
        return new Camera(this);
    }
}
