import * as THREE from "three";

/*
  Hero scene: a length of heavy cotton hanging from a steel rod, with the shop's name
  printed down it. The cloth is a subdivided plane bent in the vertex shader (wind, drape
  folds and a dent where the pointer presses); normals are rebuilt from the same height
  function so the folds light correctly. The fragment shader adds a twill weave, a worn
  print and a soft sheen.
*/

export type Fabric = { color: string; ink: string };

export type ClothHandle = {
  setFabric(fabric: Fabric): void;
  dispose(): void;
};

const W = 2.5;
const H = 3.7;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGust;
  uniform float uDrop;
  uniform vec2 uMouse;
  uniform float uPush;
  uniform vec2 uSize;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vH;

  // 0 at the rod, 1 at the hem: the free end moves most.
  float freedom(vec2 uv) {
    return pow(1.0 - uv.y, 1.2);
  }

  float height(vec2 uv) {
    float t = uTime;
    float k = freedom(uv);
    float wind =
        sin(uv.x * 4.6 + t * 1.05 + uv.y * 2.4) * 0.12
      + sin(uv.x * 10.5 - t * 1.6 + uv.y * 5.5) * 0.045
      + sin(uv.y * 8.0 + t * 0.85 + uv.x * 2.6) * 0.05;
    // Vertical drape folds, deeper toward the hem.
    float folds = sin(uv.x * 21.0 + sin(uv.y * 2.6 + t * 0.35) * 1.4) * 0.03 * (0.35 + k);
    vec2 d = (uv - uMouse) * uSize;
    float dent = exp(-dot(d, d) / 0.12) * uPush * 0.32;
    return wind * k * uGust + folds - dent * (0.25 + k);
  }

  void main() {
    vUv = uv;
    float e = 1.0 / 160.0;
    float h = height(uv);
    float hx = height(uv + vec2(e, 0.0));
    float hy = height(uv + vec2(0.0, e));
    vec3 n = normalize(vec3(-(hx - h) / (e * uSize.x), -(hy - h) / (e * uSize.y), 1.0));

    vec3 pos = position;
    pos.z += h;
    pos.x += sin(uTime * 0.6 + uv.y * 2.0) * 0.05 * freedom(uv) * uGust;
    pos.y += uDrop;

    vH = h;
    vNormal = normalize(normalMatrix * n);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uInk;
  uniform sampler2D uPrint;
  uniform vec2 uSize;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vH;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;

    // Twill: fine diagonal ribs, roughly 38 per scene unit.
    vec2 p = vUv * uSize * 38.0;
    float twill = sin((p.x + p.y) * 3.14159);
    n = normalize(n + vec3(twill * 0.05, twill * 0.05, 0.0));

    vec3 V = normalize(-vViewPos);
    vec3 key = normalize(vec3(-0.55, 0.7, 0.9));
    vec3 fill = normalize(vec3(0.9, -0.2, 0.45));
    float diffuse = max((dot(n, key) + 0.35) / 1.35, 0.0);
    float bounce = max(dot(n, fill), 0.0) * 0.22;
    float rim = pow(1.0 - max(dot(n, V), 0.0), 2.4);
    float spec = pow(max(dot(n, normalize(key + V)), 0.0), 20.0) * 0.08;

    // Screen-printed lettering: the weave shows through and the ink is slightly uneven.
    float print = texture(uPrint, vUv).r;
    print *= 0.84 + 0.1 * twill + 0.06 * hash(floor(vUv * vec2(420.0, 620.0)));

    vec3 base = mix(uColor, uInk, print * 0.9);
    base *= 0.95 + 0.05 * twill;
    float occlusion = 0.7 + 0.3 * smoothstep(-0.2, 0.12, vH);

    vec3 col = base * (diffuse * 0.95 + bounce + 0.1) * occlusion + rim * 0.2 * (base + 0.12) + spec;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function drawPrint(family: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round(1024 * (H / W));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";

  // The name runs down the cloth, read bottom-to-top like a spine.
  ctx.save();
  ctx.translate(canvas.width * 0.36, canvas.height * 0.93);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `800 400px ${family}`;
  ctx.textBaseline = "middle";
  const word = "ОДЯГ";
  const width = ctx.measureText(word).width;
  const scale = (canvas.height * 0.86) / width;
  ctx.scale(scale, scale);
  ctx.fillText(word, 0, 0);
  ctx.restore();

  // Care label in the lower corner.
  ctx.font = `600 34px ${family}`;
  ctx.textBaseline = "alphabetic";
  const x = canvas.width * 0.7;
  const y = canvas.height * 0.82;
  ctx.fillText("№ 01", x, y);
  ctx.font = `400 26px ${family}`;
  ctx.fillText("бавовна 100%", x, y + 44);
  ctx.fillText("360 г/м²", x, y + 80);
  ctx.fillText("30 °C", x, y + 116);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export function createCloth(canvas: HTMLCanvasElement, initial: Fabric, reduced: boolean): ClothHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-unbounded").trim() || "sans-serif";
  const printTexture = drawPrint(family);
  // Fonts may still be loading on first paint; redraw once they are in.
  void document.fonts.load(`800 100px ${family}`).then(() => {
    const fresh = drawPrint(family);
    material.uniforms.uPrint.value = fresh;
    printTexture.dispose();
    renderOnce();
  });

  const color = new THREE.Color(initial.color);
  const ink = new THREE.Color(initial.ink);
  const targetColor = color.clone();
  const targetInk = ink.clone();

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uGust: { value: reduced ? 1 : 2.4 },
      uDrop: { value: reduced ? 0 : 4.5 },
      uMouse: { value: new THREE.Vector2(-5, -5) },
      uPush: { value: 0 },
      uSize: { value: new THREE.Vector2(W, H) },
      uColor: { value: color },
      uInk: { value: ink },
      uPrint: { value: printTexture as THREE.Texture },
    },
  });

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.PlaneGeometry(W, H, 110, 160);
  const cloth = new THREE.Mesh(geometry, material);
  group.add(cloth);

  const rodGeometry = new THREE.CylinderGeometry(0.028, 0.028, W + 0.5, 24);
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x9a9b9e, metalness: 0.85, roughness: 0.3 });
  const rod = new THREE.Mesh(rodGeometry, rodMaterial);
  rod.rotation.z = Math.PI / 2;
  rod.position.y = H / 2 + 0.02;
  group.add(rod);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-3, 4, 5);
  scene.add(sun);

  group.rotation.y = -0.32;
  group.rotation.z = 0.02;

  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visibleW = visibleH * camera.aspect;
    if (camera.aspect > 1.1) {
      // Desktop: cloth hangs in the right half, top edge just under the header.
      const scale = Math.min(1.08, (visibleH * 0.86) / H);
      group.scale.setScalar(scale);
      group.position.set(visibleW * 0.22, visibleH / 2 - (H / 2) * scale - visibleH * 0.1, 0);
    } else {
      // Narrow screens: the hero is taller than the text; the cloth hangs in the free space below it.
      const scale = Math.min((visibleW * 0.62) / W, (visibleH * 0.3) / H);
      group.scale.setScalar(scale);
      group.position.set(visibleW * 0.04, -visibleH / 2 + (H / 2) * scale + visibleH * 0.05, 0);
    }
  }

  const resize = new ResizeObserver(() => {
    layout();
    renderOnce();
  });
  resize.observe(canvas);
  layout();

  // Pointer: find where it touches the (undisplaced) plane and press a dent there.
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointerInside = false;
  const pushTarget = { value: 0 };
  const mouseTarget = new THREE.Vector2(-5, -5);
  const onPointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    pointerInside = event.clientY >= rect.top && event.clientY <= rect.bottom;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  function renderOnce() {
    renderer.render(scene, camera);
  }

  const timer = new THREE.Timer();
  timer.connect(document);
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);

  const start = performance.now();
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  function frame() {
    timer.update();
    if (!visible) return;
    const dt = Math.min(timer.getDelta(), 0.05);
    const u = material.uniforms;
    u.uTime.value += dt;

    // Intro: the cloth drops onto the rod and its flutter settles.
    const intro = Math.min((performance.now() - start) / 1800, 1);
    u.uDrop.value = 4.5 * (1 - easeOut(intro));
    u.uGust.value = 1 + 1.4 * (1 - easeOut(Math.min((performance.now() - start) / 3600, 1)));

    if (pointerInside) {
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(cloth)[0];
      pushTarget.value = hit?.uv ? 1 : 0;
      if (hit?.uv) mouseTarget.copy(hit.uv);
    } else {
      pushTarget.value = 0;
    }
    u.uPush.value += (pushTarget.value - u.uPush.value) * 0.08;
    (u.uMouse.value as THREE.Vector2).lerp(mouseTarget, 0.18);

    color.lerp(targetColor, 0.08);
    ink.lerp(targetInk, 0.08);

    renderOnce();
  }

  if (reduced) {
    material.uniforms.uTime.value = 2.3;
    renderOnce();
  } else {
    renderer.setAnimationLoop(frame);
  }

  return {
    setFabric(fabric) {
      targetColor.set(fabric.color);
      targetInk.set(fabric.ink);
      if (reduced) {
        color.copy(targetColor);
        ink.copy(targetInk);
        renderOnce();
      }
    },
    dispose() {
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointer);
      resize.disconnect();
      io.disconnect();
      timer.dispose();
      geometry.dispose();
      material.dispose();
      (material.uniforms.uPrint.value as THREE.Texture).dispose();
      rodGeometry.dispose();
      rodMaterial.dispose();
      renderer.dispose();
    },
  };
}
