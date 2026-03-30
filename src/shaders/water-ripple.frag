precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTimeUniform;
uniform vec2 uResolutionUniform;
uniform vec2 uRipplePosUniform;
uniform float uRippleStartTimeUniform;
uniform float uRippleDurationUniform;
uniform float uRippleIntensityUniform;
uniform bool uHasRippleUniform;

#define PI 3.14159265359

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main(void) {
    vec2 uv = vTextureCoord;
    vec2 pixelCoord = uv * uResolutionUniform;
    
    if (!uHasRippleUniform) {
        gl_FragColor = texture2D(uSampler, uv);
        return;
    }
    
    vec2 rippleCenter = uRipplePosUniform;
    float dist = distance(pixelCoord, rippleCenter);
    
    float elapsed = uTimeUniform - uRippleStartTimeUniform;
    float progress = elapsed / uRippleDurationUniform;
    
    if (progress > 1.0 || progress < 0.0) {
        gl_FragColor = texture2D(uSampler, uv);
        return;
    }
    
    float waveSpeed1 = 300.0;
    float waveSpeed2 = 450.0;
    
    float waveRadius1 = elapsed * waveSpeed1;
    float waveRadius2 = elapsed * waveSpeed2;
    
    float waveWidth1 = 80.0;
    float waveWidth2 = 120.0;
    
    float distFromWave1 = abs(dist - waveRadius1);
    float distFromWave2 = abs(dist - waveRadius2);
    
    float waveIntensity1 = 1.0 - smoothstep(0.0, waveWidth1, distFromWave1);
    float waveIntensity2 = 1.0 - smoothstep(0.0, waveWidth2, distFromWave2);
    
    float amplitude1 = uRippleIntensityUniform * waveIntensity1 * (1.0 - progress);
    float amplitude2 = uRippleIntensityUniform * 0.6 * waveIntensity2 * (1.0 - progress);
    
    float frequency1 = 0.08;
    float frequency2 = 0.12;
    
    float wave1 = sin(dist * frequency1 * PI * 2.0 - elapsed * 8.0) * amplitude1;
    float wave2 = sin(dist * frequency2 * PI * 2.0 - elapsed * 12.0) * amplitude2;
    
    float noiseScale = 0.003;
    float noiseValue = fbm(pixelCoord * noiseScale + elapsed * 0.5) * 2.0 - 1.0;
    float noiseAmplitude = 0.3 * (1.0 - progress);
    
    float totalWave = wave1 + wave2 + noiseValue * noiseAmplitude;
    
    float decay = 1.0 / (1.0 + dist * 0.001);
    totalWave *= decay;
    
    vec2 dir = normalize(pixelCoord - rippleCenter);
    vec2 displacement = dir * totalWave * 15.0;
    
    vec2 distortedUV = uv + displacement / uResolutionUniform;
    
    distortedUV = clamp(distortedUV, 0.0, 1.0);
    
    vec4 color = texture2D(uSampler, distortedUV);
    
    float specular = pow(max(0.0, totalWave * 2.0), 3.0) * 0.4 * (1.0 - progress);
    color.rgb += vec3(specular);
    
    float caustics = pow(max(0.0, abs(totalWave)), 2.0) * 0.2 * (1.0 - progress);
    color.rgb += vec3(caustics);
    
    float edgeGlow = waveIntensity1 * 0.15 * (1.0 - progress);
    color.rgb += vec3(edgeGlow);
    
    gl_FragColor = color;
}
