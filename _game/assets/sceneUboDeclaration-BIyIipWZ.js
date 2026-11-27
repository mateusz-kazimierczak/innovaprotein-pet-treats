import{at as t}from"./Game-QfoQVnKX.js";const e="sceneUboDeclaration",o=`struct Scene {viewProjection : mat4x4<f32>,
#ifdef MULTIVIEW
viewProjectionR : mat4x4<f32>,
#endif 
view : mat4x4<f32>,
projection : mat4x4<f32>,
vEyePosition : vec4<f32>,
inverseProjection : mat4x4<f32>,
previousViewProjection : mat4x4<f32>,
taaJitter : vec2<f32>,};
#define SCENE_UBO
var<uniform> scene : Scene;
`;t.IncludesShadersStoreWGSL[e]||(t.IncludesShadersStoreWGSL[e]=o);const r={name:e,shader:o};export{r as s};
