// Import Three.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js";

// Create Loading Message Container
const loadingMessage = document.createElement("div");
loadingMessage.className = "position-absolute top-50 start-50 translate-middle bg-dark text-white p-3 rounded text-center d-flex flex-column align-items-center";

// Add Loading Text as h3
const text = document.createElement("h3");
text.innerText = "Loading AI Agent...";
text.className = "mb-2";

// Add Percentage Display
const percentageText = document.createElement("h4");
percentageText.innerText = "0%"; // Initial percentage
percentageText.className = "mt-2";

// Add Spinner
const spinner = document.createElement("span");
spinner.className = "spinner-border spinner-border-sm text-white h3";

// Append Elements
loadingMessage.appendChild(text);
loadingMessage.appendChild(spinner);
loadingMessage.appendChild(percentageText);
document.body.appendChild(loadingMessage);

// Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Lighting
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

// Animation Variables
let object;
let mixer;
let animations = {};
const clock = new THREE.Clock();
const loader = new FBXLoader();

let totalAssets = 7; // Total number of assets to load (1 model + 6 animations)
let assetsLoaded = 0; // Counter for loaded assets

// Function to update the loading percentage
function updateLoadingProgress() {
  assetsLoaded++;
  let progress = Math.round((assetsLoaded / totalAssets) * 100);
  percentageText.innerText = `${progress}%`;

  if (assetsLoaded === totalAssets) {
    setTimeout(() => {
      document.body.removeChild(loadingMessage);
      Alpine.store("appState").isModelLoaded = true;
      object.visible = true;
      positionCamera();
      playAnimation("standingup");
    }, 500);
  }
}

// Function to Load Animations
function loadAnimation(path, name) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      function (fbx) {
        if (fbx.animations.length > 0) {
          animations[name] = mixer.clipAction(fbx.animations[0]);
          updateLoadingProgress();
          resolve();
        } else {
          reject(`No animations found in ${name}`);
        }
      },
      (xhr) => {
        // Update progress per animation file
        let fileProgress = Math.round((xhr.loaded / xhr.total) * 100);
        console.log(`Loading ${name}: ${fileProgress}%`);
      },
      function (error) {
        console.error(`Error loading animation: ${name}`, error);
        reject(error);
      }
    );
  });
}

// Load Models & Animations
async function loadModels() {
  console.log("Loading all animations...");

  // Load character model
  object = await new Promise((resolve, reject) => {
    loader.load(
      "./models/joe/standingup.fbx",
      function (fbx) {
        scene.add(fbx);
        mixer = new THREE.AnimationMixer(fbx);
        fbx.visible = false;
        updateLoadingProgress();
        resolve(fbx);
      },
      (xhr) => {
        let modelProgress = Math.round((xhr.loaded / xhr.total) * 100);
        percentageText.innerText = `Loading Model: ${modelProgress}%`;
      },
      reject
    );
  });

  // Load animations in parallel
  await Promise.all([
    loadAnimation("./models/joe/standingup.fbx", "standingup"),
    loadAnimation("./models/joe/idle.fbx", "idle"),
    loadAnimation("./models/joe/texting.fbx", "texting"),
    loadAnimation("./models/joe/talking.fbx", "talking"),
    loadAnimation("./models/joe/talking2.fbx", "talking2"),
    loadAnimation("./models/joe/jumping.fbx", "jumping"),
  ]);

  console.log("All animations loaded!");
}

// Position Camera
function positionCamera() {
  const bbox = new THREE.Box3().setFromObject(object);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraDistance = maxDim / (2 * Math.tan(fov / 2));

  camera.position.set(center.x, center.y - 50 + maxDim * 0.5, center.z + cameraDistance + 30);
  camera.lookAt(center);
}

// Play Animations
function playAnimation(name) {
  if (animations[name]) {
    const currentAction = Object.values(animations).find(action => action.isRunning());

    if (currentAction) {
      currentAction.fadeOut(0.5);
    }

    animations[name].reset().fadeIn(0.5).play();

    if (name === "jumping") {
      animations[name].setLoop(THREE.LoopRepeat, Infinity);
    } else if (name !== "talking") {
      animations[name].clampWhenFinished = true;
      animations[name].loop = THREE.LoopOnce;
    }

    if (name === "talking") {
      setTimeout(() => {
        playAnimation("talking2");
      }, 2500);
    }

    animations[name].getMixer().addEventListener("finished", () => {
      if (name !== "idle" && animations["idle"]) {
        playAnimation("idle");
      }
    });
  } else {
    console.warn(`Animation "${name}" not found.`);
  }
}

// Keydown Events
document.addEventListener("keydown", (event) => {
  if (event.key === "F9") {
    playAnimation("texting");
  } else if (event.key === "F10") {
    playAnimation("talking");
  } else if (event.key === "F8") {
    playAnimation("jumping");
    zoomOutForBreakdance();
  }
});

function zoomOutForBreakdance() {
  camera.position.z += 300;
  camera.position.z = Math.min(camera.position.z, 200);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}

// Window Resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse Wheel Zoom
document.addEventListener("wheel", (event) => {
  let zoomAmount = event.deltaY * 0.01 * 2;
  camera.position.z += zoomAmount;
  camera.position.z = Math.max(5, Math.min(150, camera.position.z));
});

// Start Everything
loadModels().then(() => animate());
