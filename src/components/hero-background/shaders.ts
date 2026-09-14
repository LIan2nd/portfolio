const HASH_FUNCTION = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
}`;

const SHOOTING_STAR_DIRECTION = "const vec2 shootingStarDirection = normalize(vec2(1.0, -0.6));";

export const SKY_VERTEX_SHADER = `#version 300 es
out vec2 textureUv;
flat out vec4 shootingStar;
uniform vec2 res;
uniform float t;
uniform float dayMix;
uniform bool motionEnabled;

${HASH_FUNCTION}
${SHOOTING_STAR_DIRECTION}

// Schedule and trajectory run per vertex, instead of at every sky pixel.
vec4 shootingStarFrame() {
  if (!motionEnabled || dayMix == 1.0) return vec4(0.0);
  const float cycleLength = 11.0;
  const float delayStart = 3.0;
  const float delayRange = 1.0;
  const float duration = 1.15;
  float cycle = floor(t / cycleLength);
  float eventStart = cycle * cycleLength
    + delayStart + hash(vec2(cycle, 12.7)) * delayRange;
  float age = t - eventStart;
  if (age <= 0.0 || age >= duration) return vec4(0.0);

  float progress = age / duration;
  float aspect = res.x / res.y;
  float travel = min(0.34, aspect * 0.45);
  vec2 start = vec2(
    mix(-0.5 * aspect, 0.5 * aspect - travel, hash(vec2(cycle, 31.4))),
    mix(0.22, 0.4, hash(vec2(cycle, 67.1)))
  );
  vec2 head = start + shootingStarDirection * travel * progress;
  float opacity = smoothstep(0.0, 0.18, progress)
    * (1.0 - smoothstep(0.6, 1.0, progress)) * 0.65;
  return vec4(head, opacity, min(0.1, aspect * 0.14));
}

const vec2 positions[3] = vec2[3](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
void main() {
  textureUv = positions[gl_VertexID] * 0.5 + 0.5;
  shootingStar = shootingStarFrame();
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}`;

// Aurora field from docs/WebGL-Experience/liand-portfolio-webgl.html.
export const SKY_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 textureUv;
out vec4 color;
uniform vec2 res;
uniform float t;
uniform vec2 mouse;
uniform float dayMix;

${HASH_FUNCTION}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

vec3 nightSky(vec2 pw, vec2 q, vec2 r) {
  float f = fbm(pw * 1.9 + r);
  vec3 deep = vec3(0.008, 0.082, 0.149);
  vec3 lift = vec3(0.05, 0.14, 0.28);
  vec3 base = mix(deep, lift, clamp(f * f * 2.4, 0.0, 1.0));
  float band = pow(clamp(length(r) - 0.28, 0.0, 1.0), 2.4);
  float veil = pow(clamp(q.y, 0.0, 1.0), 3.0);
  vec3 emerald = vec3(0.18, 0.95, 0.48);
  vec3 teal = vec3(0.08, 0.78, 0.65);
  vec3 night = base + emerald * band * 0.95 + teal * veil * 0.45;
  night += vec3(0.55, 1.0, 0.7) * pow(clamp(f - 0.45, 0.0, 1.0), 2.0) * 0.35;
  return night;
}

vec3 daySky(vec2 uv, vec2 pw, vec2 r, vec2 m, float time) {
  float horizon = pow(clamp(0.55 - uv.y, 0.0, 1.0), 1.2);
  vec3 day = mix(vec3(0.18, 0.57, 0.92), vec3(0.65, 0.85, 0.99), horizon);
  float cloudField = fbm(pw * vec2(2.8, 4.0) + r * 0.35 + vec2(-time * 0.3, 3.7));
  float clouds = smoothstep(0.5, 0.68, cloudField);
  vec3 cloudColor = mix(vec3(0.83, 0.92, 1.0), vec3(1.0),
                       smoothstep(0.48, 0.65, cloudField));
  day = mix(day, cloudColor, clouds * 0.52);
  vec2 sunPosition = vec2(res.x / res.y * 0.30, 0.28);
  float sunDistance = length(uv - sunPosition - m * 0.12);
  float sunDisc = 1.0 - smoothstep(0.046, 0.052, sunDistance);
  float sunGlow = exp(-pow(sunDistance / 0.14, 2.0)) * 0.32;
  float shimmerPulse = 0.5 + 0.5 * sin(time * 0.7 + 1.3);
  float sunShimmer = exp(-pow(sunDistance / 0.24, 2.0)) * shimmerPulse * 0.08;
  vec3 sunlight = vec3(1.0, 0.84, 0.42);
  vec3 sunColor = mix(sunlight, vec3(1.0, 0.95, 0.72),
                     1.0 - smoothstep(0.0, 0.052, sunDistance));
  day = mix(day, sunlight, sunGlow);
  day += vec3(1.0, 0.92, 0.68) * sunShimmer;
  day = mix(day, sunColor, sunDisc * (1.0 - clouds * 0.25));
  return day;
}

void main() {
  vec2 uv = (textureUv - 0.5) * vec2(res.x / res.y, 1.0);
  vec2 m = (mouse - 0.5) * 0.45;
  float time = t * 0.05;
  vec2 pw = uv + m * (0.4 + 0.6 * uv.y);
  vec2 q = vec2(fbm(pw * 1.5 + time), fbm(pw * 1.5 - time + 5.2));
  vec2 r = vec2(fbm(pw * 2.3 + q + vec2(1.7, 9.2) + 0.12 * time - m * 0.6),
                fbm(pw * 2.3 + q + vec2(8.3, 2.8) - 0.12 * time + m * 0.6));
  vec3 sky;
  if (dayMix == 0.0) {
    sky = nightSky(pw, q, r);
  } else if (dayMix == 1.0) {
    sky = daySky(uv, pw, r, m, time);
  } else {
    sky = mix(nightSky(pw, q, r), daySky(uv, pw, r, m, time), dayMix);
  }
  color = vec4(sky, 1.0);
}`;

export const SKY_COMPOSITE_SHADER = `#version 300 es
precision highp float;
in vec2 textureUv;
flat in vec4 shootingStar;
out vec4 color;
uniform sampler2D skyTexture;
uniform vec2 res;
uniform float t;
uniform float dayMix;

${HASH_FUNCTION}
${SHOOTING_STAR_DIRECTION}

float stars(vec2 uv) {
  vec2 grid = uv * 90.0;
  float seed = hash(floor(grid));
  if (seed < 0.92) return 0.0;
  float distance = length(fract(grid) - 0.5);
  float twinkle = 0.6 + 0.4 * sin(t * (1.0 + seed * 3.0) + seed * 40.0);
  return (1.0 - smoothstep(0.0, 0.09, distance)) * twinkle
    * smoothstep(0.1, 0.6, uv.y + 0.6);
}

float shootingStarLight(vec2 uv) {
  if (shootingStar.z <= 0.0) return 0.0;
  vec2 offset = uv - shootingStar.xy;
  float alongTail = clamp(-dot(offset, shootingStarDirection), 0.0, shootingStar.w);
  float distance = length(offset + shootingStarDirection * alongTail);
  // Match the existing stars' radius, with subpixel coverage on short viewports.
  float radius = max(0.09 / 90.0, 0.65 / res.y);
  float taper = 1.0 - alongTail / shootingStar.w;
  return (1.0 - smoothstep(0.0, radius, distance)) * taper * taper * shootingStar.z;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;
  vec3 sky = texture(skyTexture, textureUv).rgb;
  if (dayMix < 1.0) {
    sky += vec3((stars(uv) + shootingStarLight(uv)) * 0.8 * (1.0 - dayMix));
  }
  float vignette = 1.0 - smoothstep(0.35, 1.6, length(uv * vec2(0.8, 1.0)));
  sky *= mix(mix(0.75, 1.0, vignette), mix(0.92, 1.0, vignette), dayMix);
  color = vec4(pow(max(sky, vec3(0.0)), vec3(0.85)), 1.0);
}`;
