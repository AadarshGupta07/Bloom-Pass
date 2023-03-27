import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

/**
 * Base
 */
// GLTF loader
const gltfLoader = new GLTFLoader()

// Debug
const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/***
 *  Lights
 */
// Ambient Light
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.dampingFactor = 0.04
// controls.minDistance = 5
// controls.maxDistance = 60
// controls.enableRotate = true
// controls.enableZoom = true
// controls.maxPolarAngle = Math.PI /2.5

/**
 * Cube
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
scene.add(cube)


/**
 *  Model
 */

// // Texture Loader
// const textureLoader = new THREE.TextureLoader()
// const bakedTexture = textureLoader.load('any.jpg')
// bakedTexture.flipY = false
// bakedTexture.encoding = THREE.sRGBEncoding


// // Material
// const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})

// let model;
// gltfLoader.load(
//     'DeskTop.glb',
//     (gltf) => {

//         //for singular object scene only
//         // gltf.scene.traverse((child) => {
//         //     child.material = bakedMaterial
//         // })

//         // Target's specific object only to apply textures
//         screenMesh = gltf.scene.children.find((child) => {
//             return child.name === 'any'
//         })

//         model = gltf.scene
//         model.scale.set(0.5, 0.5, 0.5) 

//         model = gltf.scene;
//         scene.add(model)
//     }
// )

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x18142c, 1);


/**
 *  Gui 
 */
// For Tweaking Background COlor
const params = { color: '#ffffff' };

// add a folder for the scene background color
const folder = pane.addFolder({ title: 'Background Color' });

folder.addInput(params, 'color').on('change', () => {
    const color = new THREE.Color(params.color);
    scene.background = color;
});

// For Tweaking Numbers

// // add a number input to the pane
// const params2 = {value: 1};
// const numberInput = pane.addInput(params2, 'value', {
//   min: 1,
//   max: 5,
//   step: 0.001,
// });

// // update the number value when the input value changes
// numberInput.on('change', () => {
//   console.log(`Number value updated to ${params2.value}`);
// });



/**
 *  Set up the bloom effect
 */
// renderer.toneMapping = THREE.LinearToneMapping ;
// renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.toneMapping = THREE.CineonToneMapping ;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMapping = THREE.NoToneMapping ;

const params2 = {
    exposure: 1,
    bloomThreshold: 0,
    bloomStrength: 1.5,
    bloomRadius: 0
};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.exposure = params2.exposure;
bloomPass.threshold = params2.bloomThreshold;
bloomPass.strength = params2.bloomStrength;
bloomPass.radius = params2.bloomRadius;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

/**
 *  Gui Controls
 */

// add a number input to the pane

const exposure = pane.addInput(params2, 'exposure', {
    min: 0.1,
    max: 2,
    step: 0.0001,
});
exposure.on('change', (value) => {
    renderer.toneMappingExposure = Math.pow(params2.exposure, 4.0);
    console.log(renderer.toneMappingExposure);
});

const bloomThreshold = pane.addInput(params2, 'bloomThreshold', {
    min: 0,
    max: 0.25,
    step: 0.0000001,
});
bloomThreshold.on('change', () => {
    bloomPass.threshold = params2.bloomThreshold
});

const bloomStrength = pane.addInput(params2, 'bloomStrength', {
    min: 0,
    max: 3,
    step: 0.0001,
});
bloomStrength.on('change', () => {
    bloomPass.strength = params2.bloomStrength
});

const numberInput = pane.addInput(params2, 'bloomRadius', {
    min: 0,
    max: 1,
    step: 0.0001,
});
numberInput.on('change', () => {
    bloomPass.radius = params2.bloomRadius
});

const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime
    
    // if(model){

        //     // group.rotation.y = elapsedTime 
        // }
        
        // Update controls
        controls.update()
        
        fpsGraph.begin()
    // Render
    renderer.render(scene, camera)
    composer.render();
    // Call tick again on the next frame
    fpsGraph.end()
    window.requestAnimationFrame(tick)
}

tick()