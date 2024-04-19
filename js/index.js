import * as THREE from 'three';
// 导入dat.gui
import * as dat from "dat.gui";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer, CSS2DObject} from 'three/addons/renderer/CSS2DRenderer.js';
// import face from "assets/face.png"

const canvas = document.getElementById('three');
// 设置画布元素的位置和大小。
canvas.style.position = 'fixed';
canvas.style.left = '0';
canvas.style.top = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';

// 将画布元素的溢出属性设置为“隐藏”，以防止其显示滚动条。
canvas.style.overflow = 'hidden';

// 获取屏幕宽高
const width = window.innerWidth;
const height = window.innerHeight;

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.x = 3.6
camera.position.z = 139
camera.position.y = 39

// 创建场景
const scene = new THREE.Scene();


// 辅助坐标
// const axesHelper = new THREE.AxesHelper(500);
// scene.add(axesHelper);

// 设置渲染器
let renderer = new THREE.WebGLRenderer({antialias: true});
// 设置像素比例
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
const css2DRenderer = new CSS2DRenderer();
css2DRenderer.domElement.style.position = "absolute";
css2DRenderer.domElement.style.top = "0px";
css2DRenderer.domElement.style.pointerEvents = "none";
css2DRenderer.setSize(width, height);
canvas.appendChild(css2DRenderer.domElement);

// 轨道控制器
let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = true;
orbitControls.enableDamping = true;

// 创建GUI
const gui = new dat.GUI();

// 花的配置
const flowerConfig = {
    three: {
        // 花瓣
        petal: {
            color: 0xf0f700,
            radius: 5,
            count: 8,
            speed: 0.01,
            rotationSpeed: 0.005
        },
        // 花蕾
        flowerBud: {
            color: 0xA760FA,
            radius: 6,
            speed: 0.01,
            rotationSpeed: 0.005
        },
        // 叶子
        leaf: {
            color: 0x00ff00,
            speed: 0.01,
            radius: 6,
            count: 5,
        },
        // 花梗
        stalk: {
            color: 0x00702E,
            height: 30,
            radius: 5
        }
    }
}

let leafRing = new THREE.Object3D();
let petalRing = new THREE.Object3D();


let petalList = [];
let leafList = [];

let flowerBud = null;

let stalk = null;

function init() {
    createLight();

    Object.keys(flowerConfig).forEach((key, index) => {
        createStalk(flowerConfig[key], index);
        createFlowerBud(flowerConfig[key], index);
        createPetal(flowerConfig[key], index);
        createLeaf(flowerConfig[key], index);
    });

    // 花瓣数量
    gui.add(flowerConfig.three.petal, "count", flowerConfig.three.petal.count, 12)
        .name("petalCount")
        .step(1)
        .onFinishChange(() => {
            // 重新获取数据
            createPetal(flowerConfig.three, 0);
        });

    // 花瓣颜色
    gui.addColor(flowerConfig.three.petal, "color").name("petalColor").onFinishChange(function (value) {
        petalList.forEach((item) => {
            item.material.color.set(value);
        })
    });
    // 花瓣半径
    gui.add(flowerConfig.three.petal, "radius", flowerConfig.three.petal.radius, 10).name("petalRadius").step(1).onFinishChange(function (value) {
        petalList.forEach((item) => {
            item.geometry.dispose();
            item.geometry = new THREE.SphereGeometry(value, 32, 32);
        });
    });

    // 花蕾颜色
    gui.addColor(flowerConfig.three.flowerBud, "color").name("flowerBudColor").onFinishChange(function (value) {
        flowerBud.material.color.set(value);
    });

    // 花瓣半径
    gui.add(flowerConfig.three.flowerBud, "radius", flowerConfig.three.flowerBud.radius, 10).name("flowerBudRadius").step(1).onFinishChange(function (value) {
        flowerBud.geometry.dispose();
        flowerBud.geometry = new THREE.SphereGeometry(value, 32, 32);
    });

    // 花梗颜色
    gui.addColor(flowerConfig.three.stalk, "color").name("stalkColor").onFinishChange(function (value) {
        stalk.material.color.set(value);
    });

    // 花叶颜色
    gui.addColor(flowerConfig.three.leaf, "color").name("leafColor").onFinishChange(function (value) {
        leafList.forEach((item) => {
            item.material.color.set(value);
        })
    });
    // 叶子数量
    gui.add(flowerConfig.three.leaf, "count", flowerConfig.three.leaf.count, 8)
        .name("leafCount")
        .step(1)
        .onFinishChange(() => {
            // 重新获取数据
            createLeaf(flowerConfig.three, 0);
        });

    // 叶子旋转速度
    gui.add(flowerConfig.three.leaf, "speed", flowerConfig.three.leaf.speed, 0.1).name("leaf-speed").step(0.005);

}

/**
 * 创建灯光
 */
function createLight() {
    const light = new THREE.DirectionalLight(0xffffff, 10); // soft white light
    const light1 = new THREE.AmbientLight(0xffffff)
    light.position.set(200, 200, 300)
    scene.add(light);
    scene.add(light1);
}

/**
 * 创建花梗
 * @param config
 * @param count
 */
function createStalk(config, count) {
    let geometry, material = null;
    geometry = new THREE.ConeGeometry(config.stalk.radius, config.stalk.height, 26, 26);

    material = new THREE.MeshPhongMaterial({color: config.stalk.color});

    stalk = new THREE.Mesh(geometry, material);
    stalk.scale.set(1, 1, 1)
    stalk.position.x = count * 100;
    scene.add(stalk)
}

/**
 * 花蕾创建
 * @param config
 * @param count
 */
function createFlowerBud(config, count) {

    // 设置材质
    const geom = new THREE.SphereGeometry(config.flowerBud.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({
        color: config.flowerBud.color,
    });
    // 开始创建
    flowerBud = new THREE.Mesh(geom, mat);
    // 设置位置
    flowerBud.position.x = count * 100;
    flowerBud.position.y = config.stalk.height / 2 + config.flowerBud.radius - 1;
    flowerBud.position.z = 0;
    flowerBud.rotation.x = Math.PI / 2

    const faceImg = document.createElement("img");
    faceImg.src = "../assets/face.png";
    faceImg.style.zIndex = "0";
    faceImg.setAttribute("style", "width: 3vw; height: 3vw;");
    const obj = new CSS2DObject(faceImg);
    obj.position.y = config.stalk.height / 2 + config.flowerBud.radius - 1;
    scene.add(obj);
    scene.add(flowerBud);
}

/**
 *  花瓣创建
 * @param config
 * @param count
 */
function createPetal(config, count) {
    // 将场景中原有的球删除
    petalList?.forEach((item) => {
        petalRing.remove(item);
    });
    // 清空球
    petalList = [];
    petalRing.name = 'petalRing' + count;
    petalRing.rotation.x = Math.PI / 1.3;
    let slice = Math.PI * 2 / config.petal.count;
    for (let i = 0; i < config.petal.count; i++) {
        let posx = Math.cos(slice * i) * (config.petal.radius + config.flowerBud.radius - 2);
        let posy = Math.sin(slice * i) * (config.petal.radius + config.flowerBud.radius - 2);
        let petal = getSphereObject(config.petal.radius, config.petal.color, posx, posy, 0);
        petalRing.add(petal);
        petalList.push(petal)
    }

    petalRing.position.x = count * 100;
    petalRing.position.y = config.stalk.height / 2 + config.flowerBud.radius - 1;
    scene.add(petalRing);
}

/**
 * 创建叶子
 * @param config
 * @param count
 */
function createLeaf(config, count) {
    // 将场景中原有的球删除
    leafList?.forEach((item) => {
        leafRing.remove(item);
    });
    // 清空球
    leafList = [];
    leafRing.rotation.x = Math.PI / 2;
    let slice = Math.PI * 2 / config.leaf.count;
    for (let i = 0; i < config.leaf.count; i++) {
        let posx = Math.cos(slice * i) * (config.leaf.radius + config.stalk.radius);
        let posy = Math.sin(slice * i) * (config.leaf.radius + config.stalk.radius);
        let posz = Math.tan(slice * i)  ;
        let leaf = getFanShapedBody(config.leaf.radius, 4, 32, config.leaf.color, posx, posy, 0, i+1);
        leafRing.add(leaf);
        leafList.push(leaf)

    }
    leafRing.position.x = count * 100;
    leafRing.position.y = -4;
    scene.add(leafRing);
}

/**
 * 创建球体
 * @param radius
 * @param color
 * @param x
 * @param y
 * @param z
 * @returns {*}
 */
function getSphereObject(radius = 0.2, color, x = 0, y = 0, z = 0) {
    // 设置材质
    const geom = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshMatcapMaterial({
        color,
    });
    // 开始创建
    const sphere = new THREE.Mesh(geom, mat);
    // 设置位置
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    return sphere;
}

/**
 * 创建扇形体
 * @param radius
 * @param height
 * @param segments
 * @param color
 * @param x
 * @param y
 * @param z
 * @returns {*}
 */
function getFanShapedBody(radius = 0.2, height = 4, segments = 32, color, x = 0, y = 0, z = 0, i) {
    const curve = new THREE.EllipseCurve(
        0, 0,            // ax, aY
        radius, radius,           // xRadius, yRadius
        0, Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );

    const points = curve.getPoints(50);
    const shape = new THREE.Shape(points)
    shape.moveTo(0, 0);
    shape.lineTo(0, 0);
    const extrudeSettings = {
        steps: 0,
        depth:height,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 1
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mat = new THREE.MeshMatcapMaterial({color});

    const sphere = new THREE.Mesh(geom, mat);
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = 0;

    sphere.rotateZ( Math.PI * i);
    sphere.rotateY( Math.PI / 1.4);
    // sphere.rotation.y = Math.PI
    // sphere.rotateX( Math.PI  / (i * 2));

    return sphere;
}


function render() {
    // console.log(camera.position);
    leafRing.rotation.z += flowerConfig.three.leaf.speed;
}

function animation() {
    requestAnimationFrame(animation);
    render();
    orbitControls.update();
    renderer.render(scene, camera);
    css2DRenderer.render(scene, camera);
}

init();
animation();
