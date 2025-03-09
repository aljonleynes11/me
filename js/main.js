// Import Three.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// Import FBXLoader for loading FBX files
import { FBXLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js";

// Create Loading Message Container
const loadingMessage = document.createElement("div");
loadingMessage.className = "position-absolute top-50 start-50 translate-middle bg-dark text-white p-3 rounded text-center d-flex flex-column align-items-center";

// Add Loading Text as h3
const text = document.createElement("h3");
text.innerText = "Loading AI Agent";
text.className = "mb-2"; // Adds bottom margin for spacing

// Add Spinner
const spinner = document.createElement("span");
spinner.className = "spinner-border spinner-border-sm text-white h3"; // Bootstrap spinner

// Append Elements
loadingMessage.appendChild(text);
loadingMessage.appendChild(spinner);
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
let animations = {}; // Store multiple animations
const clock = new THREE.Clock(); // Required for animation timing
const loader = new FBXLoader();

// ✅ Function to Load Additional Animations (Returns a Promise)
function loadAnimation(path, name) {
  return new Promise((resolve, reject) => {
    // Check if animation is cached in localStorage
    const cachedAnimation = localStorage.getItem(`animation_${name}`);
    if (cachedAnimation) {
      try {
        const animationData = JSON.parse(cachedAnimation);
        animations[name] = mixer.clipAction(THREE.AnimationClip.parse(animationData));
        console.log(`Loaded animation "${name}" from cache.`);
        resolve();
        return;
      } catch (error) {
        console.warn(`Failed to parse cached animation for "${name}". Fetching from server...`);
        localStorage.removeItem(`animation_${name}`); // Remove corrupted cache
      }
    }

    // If not cached, fetch animation from server
    loader.load(
      path,
      function (fbx) {
        if (fbx.animations.length > 0) {
          const animationClip = fbx.animations[0];
          animations[name] = mixer.clipAction(animationClip);

          // Save animation to localStorage
          try {
            const animationJSON = JSON.stringify(animationClip.toJSON());
            localStorage.setItem(`animation_${name}`, animationJSON);
            console.log(`Cached animation: ${name}`);
          } catch (error) {
            console.warn(`Failed to cache animation "${name}":`, error);
          }

          resolve();
        } else {
          reject(`No animations found in ${name}`);
        }
      },
      undefined,
      function (error) {
        console.error(`Error loading animation: ${name}`, error);
        reject(error);
      }
    );
  });
}


// ✅ Load All Models Before Showing Character
async function loadModels() {
  console.log("Loading all animations...");

  // Load character model but do not show it yet
  object = await new Promise((resolve, reject) => {
    loader.load(
      "./models/joe/standingup.fbx",
      function (fbx) {
        scene.add(fbx);
        mixer = new THREE.AnimationMixer(fbx);
        fbx.visible = false; // Hide until all animations are loaded
        resolve(fbx);
      },
      undefined,
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

  document.body.removeChild(loadingMessage);
  Alpine.store("appState").isModelLoaded = true;
  // Show character & Play Initial Animation
  object.visible = true;
  positionCamera(); // ✅ Position camera after model is loaded
  playAnimation("standingup");
}

// ✅ Function to Set Camera Position Correctly
function positionCamera() {
  const bbox = new THREE.Box3().setFromObject(object);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());

  // Ensure camera is facing the model directly
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraDistance = maxDim / (2 * Math.tan(fov / 2));

  camera.position.set(center.x, center.y - 50 + maxDim * 0.5, center.z + cameraDistance + 30);
  camera.lookAt(center);

  console.log("Camera positioned at:", camera.position);
}

// ✅ Function to Switch Animations
function playAnimation(name) {
  if (animations[name]) {
    const currentAction = Object.values(animations).find(action => action.isRunning());

    if (currentAction) {
      // Smoothly transition from current animation to the new one
      currentAction.fadeOut(0.5); // 0.5 seconds fade-out time
    }

    // Start new animation with fade-in
    animations[name].reset().fadeIn(0.5).play();

    // console.log(`Switched to animation: ${name}`);

    if (name === "jumping") {
      animations[name].setLoop(THREE.LoopRepeat, Infinity); // Loop forever
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
      // console.log(`Animation ${name} finished. Returning to idle.`);
      if (name !== "idle" && animations["idle"]) {
        playAnimation("idle");
      }
    });
  } else {
    console.warn(`Animation "${name}" not found.`);
  }
}


// ✅ Add Keydown Event Listener
document.addEventListener("keydown", (event) => {
  if (event.key === "F9") {
    playAnimation("texting");
  } else if (event.key === "F10") {
    playAnimation("talking");
  }
  else if (event.key === "F8") {
    playAnimation("jumping");
    zoomOutForBreakdance();
    
  }

});

function zoomOutForBreakdance() {
  const zoomOutDistance = 300; // Adjust as needed
  camera.position.z += zoomOutDistance;

  // Limit max zoom-out to avoid losing the model
  camera.position.z = Math.min(camera.position.z, 200); 

  console.log("Zoomed out for breakdance!");
}

// ✅ Animation Loop
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✅ Mouse Wheel Zoom In & Out
document.addEventListener("wheel", (event) => {
  const zoomSpeed = 2;
  let zoomAmount = event.deltaY * 0.01 * zoomSpeed;
  camera.position.z += zoomAmount;
  camera.position.z = Math.max(5, Math.min(150, camera.position.z));
});

// Start Everything
loadModels().then(() => animate());


