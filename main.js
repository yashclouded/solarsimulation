import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000510);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.getElementById('app').appendChild(renderer.domElement);
// stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

function createSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.5, '#ff8800');
    gradient.addColorStop(1, '#ff3300');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    return new THREE.CanvasTexture(canvas);
}

function createPlanetTexture(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.fillStyle = color2;
    for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * 512,
            Math.random() * 512,
            Math.random() * 30 + 10,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
}
function createRingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(256, 256, 100, 256, 256, 256);
    gradient.addColorStop(0, 'rgba(200, 200, 150, 0.8)');
    gradient.addColorStop(0.5, 'rgba(180, 180, 130, 0.5)');
    gradient.addColorStop(1, 'rgba(150, 150, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    return new THREE.CanvasTexture(canvas);
}
// Sun

const sunGeometry = new THREE.SphereGeometry(14, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    map: createSunTexture(),
    emissive: 0xffaa00,
    emissiveIntensity: 1
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const glowGeometry = new THREE.SphereGeometry(16, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
});
const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
sun.add(sunGlow);

const sunLight = new THREE.PointLight(0xffffff, 2, 500);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Planetss
const planets = [
    { name: 'Mercury', size: 2, distance: 40, color1: '#8c7853', color2: '#6b5a42', glowColor: 0x8c7853, speed: 0.04, info: 'Smallest planet, closest to the Sun' },
    { name: 'Venus', size: 3.5, distance: 50, color1: '#ffc649', color2: '#e6a83a', glowColor: 0xffc649, speed: 0.03, info: 'Hottest planet with thick atmosphere' },
    { name: 'Earth', size: 4, distance: 54, color1: '#4169e1', color2: '#228b22', glowColor: 0x4169e1, speed: 0.02, info: 'Our home planet, the blue marble' },
    { name: 'Mars', size: 3, distance: 59, color1: '#cd5c5c', color2: '#8b3a3a', glowColor: 0xcd5c5c, speed: 0.018, info: 'The Red Planet, future human destination' },
    { name: 'Jupiter', size: 8, distance: 85, color1: '#daa520', color2: '#b8860b', glowColor: 0xdaa520, speed: 0.012, info: 'Largest planet with a massive storm' },
    { name: 'Saturn', size: 7, distance: 95, color1: '#f4a460', color2: '#daa520', glowColor: 0xf4a460, speed: 0.01, hasRings: true, info: 'Beautiful planet with spectacular rings' },
    { name: 'Uranus', size: 5, distance: 115, color1: '#4fd0e0', color2: '#3ba8b5', glowColor: 0x4fd0e0, speed: 0.008, info: 'Ice giant tilted on its side' },
    { name: 'Neptune', size: 5, distance: 135, color1: '#4169e1', color2: '#1e3a8a', glowColor: 0x2a52be, speed: 0.006, info: 'Windy blue ice giant, furthest planet' }
];

const planetObjects = [];
const orbitLines = [];

planets.forEach(planetData => {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(
            Math.cos(angle) * planetData.distance,
            0,
            Math.sin(angle) * planetData.distance
        );
    }
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    orbitLines.push(orbitLine);
    
    const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ 
        map: createPlanetTexture(planetData.color1, planetData.color2),
        roughness: 0.7,
        metalness: 0.3,
        emissive: planetData.glowColor,
        emissiveIntensity: 0.2
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.castShadow = true;
    planet.receiveShadow = true;
    
    const glowSize = planetData.size * 1.15;
    const planetGlowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
    const planetGlowMaterial = new THREE.MeshBasicMaterial({
        color: planetData.glowColor,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const planetGlow = new THREE.Mesh(planetGlowGeometry, planetGlowMaterial);
    planet.add(planetGlow);
    
    const planetContainer = new THREE.Object3D();
    planet.position.x = planetData.distance;
    planetContainer.add(planet);
    scene.add(planetContainer);
    
    if (planetData.hasRings) {
        const ringGeometry = new THREE.RingGeometry(planetData.size * 1.5, planetData.size * 2.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            map: createRingTexture(),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }
    
    planetObjects.push({
        container: planetContainer,
        mesh: planet,
        data: planetData,
        angle: Math.random() * Math.PI * 2
    });
});

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let isDragging = false;
let dragStarted = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraRotation = { x: 0, y: 0 };
let speedMultiplier = 1;
let targetPlanet = null;
let isZoomedIn = false;
let targetCameraPosition = new THREE.Vector3(0, 50, 100);
let currentRadius = 100;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    if (isDragging) {
        dragStarted = true;
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        cameraRotation.y += deltaX * 0.005;
        cameraRotation.x += deltaY * 0.005;
        cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
    }
    
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

window.addEventListener('mousedown', () => {
    isDragging = true;
    dragStarted = false;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    setTimeout(() => { dragStarted = false; }, 50);
});

window.addEventListener('click', (event) => {
    if (dragStarted) return;
    
    raycaster.setFromCamera(mouse, camera);
    const planetMeshes = planetObjects.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(planetMeshes);
    
    if (intersects.length > 0) {
        const clickedPlanet = planetObjects.find(p => p.mesh === intersects[0].object);
        if (clickedPlanet) {
            const infoDiv = document.getElementById('planet-info');
            infoDiv.innerHTML = `
                <h2>${clickedPlanet.data.name}</h2>
                <p>${clickedPlanet.data.info}</p>
                <p><strong>Distance from Sun:</strong> ${clickedPlanet.data.distance} units</p>
                <p><strong>Size:</strong> ${clickedPlanet.data.size} units</p>
                <p style="color: #4fd0e0; margin-top: 10px;">Click again to zoom out</p>
            `;
            infoDiv.style.background = 'rgba(0, 0, 0, 0.8)';
            
            if (targetPlanet === clickedPlanet) {
                targetPlanet = null;
                isZoomedIn = false;
                currentRadius = 100;
            } else {
                targetPlanet = clickedPlanet;
                isZoomedIn = true;
            }
        }
    } else if (isZoomedIn) {
        targetPlanet = null;
        isZoomedIn = false;
        currentRadius = 100;
        const infoDiv = document.getElementById('planet-info');
        infoDiv.innerHTML = `
            <h2>Welcome to the Solar System</h2>
            <p>Click on any planet to learn more</p>
        `;
        infoDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    }
});

window.addEventListener('wheel', (event) => {
    event.preventDefault();
    
    if (isZoomedIn && targetPlanet) {
        currentRadius += event.deltaY * 0.02;
        currentRadius = Math.max(targetPlanet.data.size * 3, Math.min(targetPlanet.data.size * 15, currentRadius));
    } else {
        // Global zoom
        currentRadius += event.deltaY * 0.1;
        currentRadius = Math.max(30, Math.min(250, currentRadius));
    }
}, { passive: false });

// UI Controls
document.getElementById('resetCamera').addEventListener('click', () => {
    camera.position.set(0, 50, 100);
    cameraRotation = { x: 0, y: 0 };
    targetPlanet = null;
    isZoomedIn = false;
    currentRadius = 100;
    const infoDiv = document.getElementById('planet-info');
    infoDiv.innerHTML = `
        <h2>Welcome to the Solar System</h2>
        <p>Click on any planet to learn more!</p>
    `;
    infoDiv.style.background = 'rgba(0, 0, 0, 0.7)';
});

document.getElementById('toggleSpeed').addEventListener('click', (e) => {
    if (speedMultiplier === 1) {
        speedMultiplier = 5;
    } else if (speedMultiplier === 5) {
        speedMultiplier = 20;
    } else if (speedMultiplier === 20) {
        speedMultiplier = 0.4;
    } else {
        speedMultiplier = 1;
    }
    
    const speedLabel = speedMultiplier === 1 ? 'Normal' : 
                      speedMultiplier === 3 ? 'Fast' : 
                      speedMultiplier === 20 ? 'Super Fast' : 'Slow';
    e.target.textContent = `Speed: ${speedLabel}`;
});
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
function animate() {
    requestAnimationFrame(animate);
    sun.rotation.y += 0.002;
    
    planetObjects.forEach((planetObj) => {
        planetObj.angle += planetObj.data.speed * 0.01 * speedMultiplier;
        planetObj.container.rotation.y = planetObj.angle;
        planetObj.mesh.rotation.y += 0.02;
    });
    stars.rotation.y += 0.0001;
    
    if (isZoomedIn && targetPlanet) {
        const planetWorldPos = new THREE.Vector3();
        targetPlanet.mesh.getWorldPosition(planetWorldPos);
        targetCameraPosition.copy(planetWorldPos);
        targetCameraPosition.y += currentRadius * 0.3;
        targetCameraPosition.z += currentRadius;   
        camera.position.lerp(targetCameraPosition, 0.05);
        camera.lookAt(planetWorldPos);
    } else {
        camera.position.x = currentRadius * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
        camera.position.y = currentRadius * Math.sin(cameraRotation.x) + 50;
        camera.position.z = currentRadius * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
        camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
}
animate();
