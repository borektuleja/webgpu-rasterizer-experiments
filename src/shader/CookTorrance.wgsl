@group(0) @binding(0) var<uniform> ViewProjection: mat4x4f;
@group(0) @binding(1) var<uniform> Eye: vec3f;

@group(0) @binding(2) var<storage> Transforms: array<mat4x4f>;
@group(0) @binding(3) var<storage> Normals: array<mat4x4f>;
@group(0) @binding(4) var<storage> Colors: array<vec4f>;

@group(0) @binding(5) var AlbedoTexture: texture_2d<f32>;
@group(0) @binding(6) var AlbedoSampler: sampler;
@group(0) @binding(7) var RoughnessTexture: texture_2d<f32>;
@group(0) @binding(8) var RoughnessSampler: sampler;

const PI: f32 = radians(180.0);

struct Attributes
{
    @location(0) Position: vec3f,
    @location(1) Normal: vec3f,
    @location(2) Coordinates: vec2f,
};

struct VertexOutput
{
    @builtin(position) InClipSpace: vec4f,
    @location(0) InWorldSpace: vec3f,
    @location(1) Color: vec3f,
    @location(2) Normal: vec3f,
    @location(3) Coordinates: vec2f,
};

@vertex
fn vs_entry(@builtin(instance_index) index: u32, attributes: Attributes) -> VertexOutput
{
    var output: VertexOutput;

    output.InClipSpace = ViewProjection * Transforms[index] * vec4f(attributes.Position, 1.0);
    output.InWorldSpace = (Transforms[index] * vec4f(attributes.Position, 1.0)).xyz;
    output.Color = Colors[index].rgb;
    output.Normal = (Normals[index] * vec4f(attributes.Normal, 1.0)).xyz;
    output.Coordinates = attributes.Coordinates;

    return output;
}

struct FragmentOutput
{
    @location(0) Color: vec4f,
};

fn ThrowbridgeReitz(NdotH: f32, roughness: f32) -> f32
{
    var alpha: f32 = roughness * roughness;
    var alphaSqr: f32 = alpha * alpha;
    var distribution: f32 = NdotH * NdotH * (alphaSqr - 1.0) + 1.0;
    return alphaSqr / max(PI * distribution * distribution, 1e-4);
}

fn SchlickBeckmann(NdotX: f32, roughness: f32) -> f32
{
    var alpha: f32 = roughness * roughness;
    var k: f32 = alpha / 2.0;
    return NdotX / max(NdotX * (1.0 - k) + k, 1e-4);
}

fn Smith(NdotL: f32, NdotV: f32, roughness: f32) -> f32
{
    return SchlickBeckmann(NdotL, roughness) * SchlickBeckmann(NdotV, roughness);
}

fn FresnelSchlick(VdotH: f32, F0: vec3f) -> vec3f
{
    return F0 + (vec3f(1.0) - F0) * pow(max(1.0 - VdotH, 0.0), 5.0);
}

@fragment
fn fs_entry(input: VertexOutput) -> FragmentOutput
{
    var bulb: vec3f = vec3f(-10.0, -10.0, 10.0);
    var bulbIntensity: f32 = 8.0;

    var albedo: vec3f = input.Color * textureSample(AlbedoTexture, AlbedoSampler, input.Coordinates).rgb;
    var roughness: f32 = textureSample(RoughnessTexture, RoughnessSampler, input.Coordinates).r;

    var N: vec3f = normalize(input.Normal);
    var L: vec3f = normalize(bulb - input.InWorldSpace);
    var V: vec3f = normalize(Eye - input.InWorldSpace);
    var H: vec3f = normalize(L + V);

    var NdotL: f32 = max(dot(N, L), 0.0);
    var NdotV: f32 = max(dot(N, V), 0.0);
    var NdotH: f32 = max(dot(N, H), 0.0);
    var VdotH: f32 = max(dot(V, H), 0.0);

    var D: f32 = ThrowbridgeReitz(NdotH, roughness);
    var G: f32 = Smith(NdotL, NdotV, roughness);
    var F: vec3f = FresnelSchlick(VdotH, vec3f(0.04));

    var ks: vec3f = F;
    var kd: vec3f = vec3f(1.0) - ks;

    var lambert: vec3f = albedo / PI;

    var cookTorrance: vec3f = (D * G * F) / max(4.0 * NdotL * NdotV, 1e-4);

    var brdf: vec3f = kd * lambert + cookTorrance;

    var radiance: vec3f = bulbIntensity * brdf * NdotL;
    radiance += vec3f(2.0) * lambert;

    var output: FragmentOutput;

    output.Color = vec4f(radiance / (radiance + vec3f(1.0)), 1.0);
    return output;
}
