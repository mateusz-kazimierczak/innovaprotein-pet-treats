import{at as e}from"./Game-KDrqTf3y.js";import{h as n}from"./helperFunctions-BUN9gzGf.js";import"./index-CzmgJ0_m.js";const o="rgbdEncodePixelShader",t=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=toRGBD(texture2D(textureSampler,vUV).rgb);}`;e.ShadersStore[o]||(e.ShadersStore[o]=t);const a=[n];for(const r of a)e.IncludesShadersStore[r.name]||(e.IncludesShadersStore[r.name]=r.shader);const S={name:o,shader:t};export{S as rgbdEncodePixelShader};
