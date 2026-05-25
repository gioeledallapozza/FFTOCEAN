varying float vHeight;

const vec3 DEEP_COLOR = vec3(0.01, 0.05, 0.15); 
const vec3 SURFACE_COLOR = vec3(0.0, 0.25, 0.5); 
const vec3 CREST_COLOR = vec3(0.0, 0.6, 0.8);     
const vec3 FOAM_COLOR = vec3(0.9, 0.95, 1.0);     

void main()
{
    //HARDCODED COLOR BASED ON HEIGHT (VISUALIZATION PURPOSES)
    float troughLevel = -12.0; 
    float seaLevel = 0.0;
    float crestLevel = 20.0;

    float deepMix = smoothstep(troughLevel, seaLevel, vHeight);
    vec3 color = mix(DEEP_COLOR, SURFACE_COLOR, deepMix);

    float crestMix = smoothstep(seaLevel, crestLevel, vHeight);
    color = mix(color, CREST_COLOR, crestMix);

    float foamMix = smoothstep(crestLevel * 0.7, crestLevel * 1.2, vHeight);
    color = mix(color, FOAM_COLOR, foamMix);

    gl_FragColor = vec4(color, 1.0);
}