import{at as a}from"./Game-iV_9EogN.js";const e="mainUVVaryingDeclaration",t=`#ifdef MAINUV{X}
varying vec2 vMainUV{X};
#endif
`;a.IncludesShadersStore[e]||(a.IncludesShadersStore[e]=t);const i={name:e,shader:t},n="logDepthDeclaration",r=`#ifdef LOGARITHMICDEPTH
uniform float logarithmicDepthConstant;varying float vFragmentDepth;
#endif
`;a.IncludesShadersStore[n]||(a.IncludesShadersStore[n]=r);const s={name:n,shader:r};export{s as l,i as m};
