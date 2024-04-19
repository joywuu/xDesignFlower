var camera = void 0,
    glScene = void 0,
    glRenderer = void 0,
    composer = void 0;

var gui = new dat.GUI();

var angle = 0,
    speed = 0.03,
    radius = 1,
    numLights = 5,
    slice = Math.PI * 2 / numLights,
    lights = [];

var coreData = {
    radius: 0.8,
    detail: 3
};


var lightData = {
    radius: 0.05,
    intensity: 0.2
};


var isMouseMoving = false;

///////////////////////////////////////////////////////////////////
// Creates WebGL Renderer
//
///////////////////////////////////////////////////////////////////

function createGlRenderer() {

    var glRenderer = new THREE.WebGLRenderer({
        antialias: true
    });

    glRenderer.setSize(window.innerWidth, window.innerHeight);
    glRenderer.setPixelRatio(window.devicePixelRatio);
    glRenderer.setClearColor('#222222');

    return glRenderer;

}

///////////////////////////////////////////////////////////////////
// Initializes scene
//
///////////////////////////////////////////////////////////////////

function initialize() {

    console.log('initialize');

    // Camera ---------------------------
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000);
    camera.position.z = 3;

    // Renderer -------------------------
    glRenderer = createGlRenderer();
    document.body.appendChild(glRenderer.domElement);

    // Scene -------------------------
    glScene = new THREE.Scene();


    // do stuff

    // CORE GEOM
    var coreGeom = new THREE.IcosahedronGeometry(coreData.radius, coreData.detail);
    var coreMat = new THREE.MeshPhongMaterial({
        flatShading: true
    });

    var core = new THREE.Mesh(coreGeom, coreMat);
    core.name = 'core';
    glScene.add(core);

    // MAKE LIGHTS RING
    var lightsRing = new THREE.Object3D();
    lightsRing.name = 'lightsRing';
    glScene.add(lightsRing);

    for (var i = 0; i < numLights; i++) {
        var color = new THREE.Color(Math.random(), Math.random(), Math.random());
        var posx = Math.cos(slice * i) * radius;
        var posy = Math.sin(slice * i) * radius;

        var light = getPointLightObject(posx, posy, 0, lightData.radius, color);
        lights.push(light);
        lightsRing.add(light);
    }

    // MAKE CONTROLS
    var coreFolder = gui.addFolder('Core');
    coreFolder.add(coreData, 'radius', 0.1, 0.8).onChange(function() {
        updateGroupGeometry(core, new THREE.IcosahedronGeometry(
            coreData.radius, coreData.detail));

    });
    coreFolder.add(coreData, 'detail', 0, 3).step(1).onChange(function() {
        updateGroupGeometry(core, new THREE.IcosahedronGeometry(
            coreData.radius, coreData.detail));

    });
    coreFolder.open();

    var lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(lightData, 'radius', 0.01, 0.1).step(0.01).onChange(function() {
        for (var _i = 0; _i < numLights; _i++) {
            updateGroupGeometry(lights[_i].children[0], new THREE.SphereGeometry(lightData.radius, 30, 30));
        }
    });
    lightsFolder.add(lightData, 'intensity', 0.1, 1).onChange(function() {
        for (var _i2 = 0; _i2 < numLights; _i2++) {
            lights[_i2].intensity = lightData.intensity;
        }
    });
    lightsFolder.open();

    // DIRECTIONAL ILLUMINATION
    var directional = [];
    directional[0] = new THREE.DirectionalLight(0xffffff, 0.1);
    directional[0].position.set(1, 0, 0);
    directional[1] = new THREE.DirectionalLight(0xffffff, 0.1);
    directional[1].position.set(0.75, 1, 0.5);
    directional[2] = new THREE.DirectionalLight(0xffffff, 0.1);
    directional[2].position.set(-0.75, -1, 0.5);

    glScene.add(directional[0]);
    glScene.add(directional[1]);
    glScene.add(directional[2]);

    // Loop ------------------------
    update();

}

///////////////////////////////////////////////////////////////////
// Loop updates scene
//
///////////////////////////////////////////////////////////////////

function update() {

    glRenderer.render(glScene, camera);

    var lightsRing = glScene.getObjectByName('lightsRing');
    lightsRing.rotation.x += speed;
    lightsRing.rotation.y += speed;
    lightsRing.rotation.z += speed;

    var core = glScene.getObjectByName('core');

    if (isMouseMoving) {
        core.rotation.x += speed;
        core.rotation.y += speed;
        core.rotation.z += speed;
    }

    angle += speed;
    isMouseMoving = false;

    window.requestAnimationFrame(update);

}

///////////////////////////////////////////////////////////////////
// Bind events
//
///////////////////////////////////////////////////////////////////

window.addEventListener('resize', function() {

    var width = window.innerWidth;
    var height = window.innerHeight;
    glRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

});

window.addEventListener('mousemove', function() {
    isMouseMoving = true;
});

///////////////////////////////////////////////////////////////////
// On document ready
//
///////////////////////////////////////////////////////////////////

window.addEventListener('DOMContentLoaded', initialize, false);

///////////////////////////////////////////////////////////////////
// Makers
//
///////////////////////////////////////////////////////////////////

function getLightObject(x, y, z, color) {
    var light = new THREE.PointLight(
        color,
        lightData.intensity);

    light.position.x = x;
    light.position.y = y;

    return light;
}

function getSphereObject(radius, color) {
    var geom = new THREE.SphereGeometry(radius, 30, 30);
    var mat = new THREE.MeshBasicMaterial({
        color: color
    });

    var sphere = new THREE.Mesh(geom, mat);

    return sphere;
}

function getPointLightObject(x, y, z, radius, color) {
    var light = getLightObject(x, y, z, color);
    var point = getSphereObject(radius, color);

    light.add(point);

    return light;
}

///////////////////////////////////////////////////////////////////
// Helpers
//
///////////////////////////////////////////////////////////////////

function updateGroupGeometry(mesh, geometry) {
    mesh.geometry.dispose();
    mesh.geometry = geometry;
}
