
<script>
import _ from "lodash";
import { acceleratedRaycast } from "three-mesh-bvh";
import { gsap } from "gsap";
import * as dat from "lil-gui";
import * as THREE from "three";
import { LoadingManager } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CreateModel } from "@/scripts/model_constructor.js";

export default {
    props: {
        startState: { type: Boolean, default: false },
        descripton: { type: Boolean, default: false },
        modelsData: { type: Array, required: true },
    },
    data() {
        return {
            startTargetCamera: new THREE.Vector3(0, 0, 0),
            startCameraPosition: new THREE.Vector3(4, 2, 5),

            laersCameraPosition: null,
            laersTargetPosition: null,

            startParalax: true,
            cursor: {
                x: 0,
                y: 0,
            },

            loadPercetn: 0,

            emissiveOff: { r: 0, g: 0, b: 0 },
            emissiveOn: { r: 0.1, g: 0.1, b: 0.6 },

            hover: true,
            meshes: [],
            bvhMeshes: [],

            intersects: {
                box: [],
                land: [],
                land_2: [],
                land_3: [],
            },

            boxIntersec: false,
            currentCollection: null,
            currentCollectionName: null,
            currentModelName: null,

            hoveredObject: null,
            tooltipText: "",

            selectedPart: null,
            originalColors: new Map(),
        };
    },

    mounted() {
        this.canvas = this.$refs.webGl;
        this.tooltip = this.$refs.tooltip;
        this.init();
        this.throttledHoverModel = _.throttle(this.hoverModel, 1000);
        this.resize();
        this.tick();

        this.canvas.addEventListener("mousedown", () => {
            this.startParalax = false;
        });
        if (this.startParalax) {
            window.addEventListener("mousemove", (event) => {
                this.cursor.x = event.clientX / this.getSizes.width - 0.5;
                this.cursor.y = -(event.clientY / this.getSizes.height - 0.5);
            });
        }

        console.log(this.bvhMeshes);
    },
    beforeUnmount() {
        this.destroyScene();
    },
    unmounted() {
        cancelAnimationFrame(this.animationFrameId);
    },

    methods: {
        init() {
            this.scene = new THREE.Scene();
            this.raycaster = new THREE.Raycaster();
            this.raycaster.firstHitOnly = true;
            THREE.Mesh.prototype.raycast = acceleratedRaycast;

            this.mouse = new THREE.Vector2();

            this.getCameraParams();
            this.getRendererParams();
            this.getEnvierment();
            this.getControlsParams(true, 4, 6);

            this.scene.add(this.camera);

            // this.createTestMesh();
            this.createLight();
            this.getModelData.forEach((model) => {
                this.getModel(model);
            });

            // this.axesHelper = new THREE.AxesHelper(5);
            // this.scene.add(this.axesHelper);

            //   this.createGuiParams();
        },
        getCameraParams() {
            this.camera = new THREE.PerspectiveCamera(
                45,
                this.getSizes.width / this.getSizes.height,
                0.01,
                10
            );

            this.camera.position.copy(this.startCameraPosition);
        },

        getRendererParams() {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
            });

            this.renderer.setSize(this.getSizes.width, this.getSizes.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.canvas.appendChild(this.renderer.domElement);
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.setClearColor(0x000000, 0);
        },

        getControlsParams(demp, min, max) {
            let demping, mindist, maxdist;

            demp === undefined ? (demping = true) : (demping = demp);
            min === undefined ? (mindist = 1) : (mindist = min);
            max === undefined ? (maxdist = 2) : (maxdist = max);

            this.controls = new OrbitControls(this.camera, this.canvas);

            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: null,
                RIGHT: null,
            };

            if (!this.startParalax) {
                this.controls.enableZoom = THREE.MOUSE.DOLLY;
            }

            this.controls.enableDamping = demping;
            this.controls.dampingFactor = 0.1;

            this.controls.minDistance = mindist;
            this.controls.maxDistance = maxdist;

            // this.controls.target = this.targetCamera;

            this.controls.minPolarAngle = Math.PI * 0.2;
            this.controls.maxPolarAngle = Math.PI * 0.5;

            // this.controls.minAzimuthAngle = 0;
            // this.controls.maxAzimuthAngle = Math.PI * 0.5;

            this.controls.zoomSpeed = 0.5;
            this.controls.panSpeed = 0.5;

            this.controls.rotateSpeed = 0.15;
            this.controls.enableKeys = false;

            this.controls.autoRotateSpeed = 0.5;
        },

        getRaycaster(event) {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
        },

        createLight() {
            this.ambientLight = new THREE.AmbientLight(0x404040, 15);
            this.scene.add(this.ambientLight);

            this.pointLight = new THREE.PointLight(0x404040, 10, 100);
            this.pointLight.position.x = 0.8;
            this.pointLight.position.y = 0.8;
            this.pointLight.position.z = 0.8;
            this.sphereSize = 1;
            // this.pointLightHelper = new THREE.PointLightHelper(
            //   this.pointLight,
            //   this.sphereSize
            // );

            //   this.scene.add(this.pointLight);
            // this.scene.add(this.pointLightHelper);
        },

        getPreloader() {
            return new LoadingManager(
                () => {
                    gsap.to(this.canvas, {
                        opacity: 1,
                    });
                    this.$emit("model-loaded", true);

                    this.$refs.preloader.classList.remove("active");
                    this.loadPercetn = 0;
                    console.log("Loaded");
                },
                (itemUrl, itemsLoaded, itemsTotal) => {
                    let loadProc = itemsLoaded / itemsTotal;
                    this.loadPercetn = Math.floor(loadProc * 100);

                    itemsLoaded / itemsTotal !== 1
                        ? (this.canvas.style.opacity = 0)
                        : "";
                }
            );
        },

        getModel({ model, scale, position, name, startDiacription }) {
            let newModel = new CreateModel({
                scene: this.scene,
                scale: new THREE.Vector3(scale, scale, scale),
                material: this.environmentMap,
                meshStore: this.meshes,
                bvhStore: this.bvhMeshes,
                materialColor: this.originalColors,
                preloader: this.getPreloader(),
                intersecStore: this.intersects,
                model: model,
                name: name,
                position: position,
                startDiacription: startDiacription,
            });
            return newModel;
        },

        getEnvierment() {
            let path = "environmentMaps/4/";
            this.cubeTextureLoader = new THREE.CubeTextureLoader();
            this.environmentMap = this.cubeTextureLoader.load([
                path + "px.jpg",
                path + "nx.jpg",
                path + "py.jpg",
                path + "ny.jpg",
                path + "pz.jpg",
                path + "nz.jpg",
            ]);

            this.environmentMap.minFilter = THREE.NearestFilter;
            this.environmentMap.magFilter = THREE.NearestFilter;
            this.environmentMap.generateMipmaps = false;

            this.environmentMap.colorSpace = THREE.SRGBColorSpace;
        },

        handleIntersect(intersects, event) {
            const object = intersects[0].object;

            // if (object.name.includes("clickBox")) {
            //     console.log(object.name);
            //     return;
            // }

            // if (object.material && object.material.emissive) {
            //     if (
            //         this.hoveredObject !== null &&
            //         this.hoveredObject !== object
            //     ) {
            //         this.smoothHoverOff(this.hoveredObject.material.emissive);
            //     }

            //     this.hoveredObject = object;

            //     this.smoothHoverOn(this.hoveredObject.material.emissive);

            //     this.tooltipText = object.name || "";

            //     const tooltipPosition = this.calculateTooltipPosition(
            //         event,
            //         this.hoveredObject.position
            //     );
            //     this.updateTooltipPosition(tooltipPosition);
            // }
        },

        hoverModel(event) {
            this.getRaycaster(event);
            let intersects;

            this.bvhMeshes.forEach((item) => {
                intersects = this.raycaster.intersectObject(item);

                if (intersects.length > 0) {
                    console.log(intersects[0]);
                }
            });

            // if (intersects.length > 0 && this.hover) {
            //     this.handleIntersect(intersects, event);
            // } else {
            //     if (this.hoveredObject !== null) {
            //         this.smoothHoverOff(this.hoveredObject.material.emissive);

            //         this.hoveredObject = null;
            //         this.tooltipText = "";

            //         this.hideTooltip();
            //     }
            // }
        },

        smoothHoverOff(object) {
            this.canvas.style.cursor = "default";
            return gsap.to(object, {
                ...this.emissiveOff,
            });
        },

        smoothHoverOn(object) {
            this.canvas.style.cursor = "pointer";
            return gsap.to(object, {
                ...this.emissiveOn,
            });
        },

        calculateTooltipPosition(event, objectPosition) {
            const offsetX = -200;
            const offsetY = -300;

            const vector = new THREE.Vector3();

            vector.project(this.camera);

            const x = ((vector.x + 1) * window.innerWidth) / 2 + offsetX;
            const y = (-(vector.y - 1) * window.innerHeight) / 2 + offsetY;

            return { x, y };
        },

        updateTooltipPosition(position) {
            this.tooltip.style.left = position.x + "px";
            this.tooltip.style.top = position.y + "px";
            this.tooltip.style.opacity = "1";
        },

        hideTooltip() {
            this.tooltip.style.opacity = "0";
        },

        clickModel(event) {
            this.getRaycaster(event);

            let boxIntersects, landItersects;

            if (!this.boxIntersec) {
                boxIntersects = this.raycaster.intersectObjects(
                    this.intersects.box
                );

                if (boxIntersects.length > 0) {
                    this.$emit("start-state-off", false);
                    this.boxIntersec = true;

                    const box = boxIntersects[0];

                    this.currentCollectionName = box.object.name;

                    this.zoomModel(box, 3.5, 1, 3.5, -0.4);

                    /** Прячем все стартовые слои, кроме выбранного */

                    this.getLaersInvisible(this.currentCollectionName);
                }
            } else {
                landItersects = this.raycaster.intersectObjects(
                    this.scene.children
                );

                if (landItersects.length > 1) {
                    const model = landItersects[1];

                    this.currentCollection =
                        this.intersects[this.currentCollectionName];

                    console.log(this.currentCollection);

                    if (
                        this.intersects[this.currentCollectionName].some(
                            (mash) => mash.name === model.object.name
                        ) &&
                        !model.object.name.includes("Land")
                    ) {
                        this.currentModelName = model.object.name;

                        /** Приближаем выбранную модель */

                        this.zoomModel(model, 0, 1, 1, 0);

                        /** Прячем все модели текущей коллекции, кроме выбранной */

                        this.getModelsInvisible(
                            this.intersects[this.currentCollectionName], // Выбранная коллекция
                            model.object.name // Имя выбранной модели
                        );

                        this.showDescription(
                            model,
                            "modelsDescription",
                            model.object.name
                        );

                        this.controls.autoRotate = true;
                    }
                }

                this.controls.minDistance = 1;
            }

            // if (this.hoveredObject !== null) {
            //     gsap.to(this.hoveredObject.material.emissive, {
            //         r: 0,
            //         g: 0,
            //         b: 0,
            //     });
            //     this.hoveredObject = null;
            //     this.tooltipText = "";
            //     this.hideTooltip();
            // }

            // Find intersected objects

            // intersects = this.raycaster.intersectObjects(this.scene.children);

            // if (!this.descripton) {
            //     this.canvas.style.cursor = "default";

            //     if (intersects.length > 0) {
            //         this.hover = false;

            //         let clickedPart;

            //         if (intersects[0].object.name.includes("clickBox")) {
            //             clickedPart = intersects[1].object;
            //         }

            //         if (this.selectedPart === clickedPart) {
            //             this.originalColors.forEach((color, part) => {
            //                 part.visible = true;
            //             });

            //             this.selectedPart = null;
            //         } else {
            //             this.scene.traverse((child) => {
            //                 if (
            //                     child.isMesh &&
            //                     child.name !== clickedPart.name
            //                 ) {
            //                     child.material.transparent = true;

            //                     gsap.to(
            //                         child.material,
            //                         {
            //                             opacity: 0,
            //                             duration: 0.8,
            //                             onComplete: () => {
            //                                 child.visible = false;
            //                             },
            //                         },
            //                         "<"
            //                     );
            //                 }
            //             });

            //             clickedPart.material.opacity = 1;

            //             clickedPart.visible = true;

            //             this.selectedPart = clickedPart;
            //         }

            //         let target = clickedPart.position.clone();

            //         console.log(clickedPart);

            //         this.moveCameraPosition(target, this.showCameraPosition);

            //         this.$emit(
            //             "show-description",
            //             clickedPart.userData.key,
            //             clickedPart.userData.parentName
            //         );
            //     }
            // }
        },

        showDescription(object, modelsDescr, key) {
            if (!this.descripton) {
                this.canvas.style.cursor = "default";

                this.hover = false;

                // if (this.selectedPart === clickedPart) {
                //     this.originalColors.forEach((color, part) => {
                //         part.visible = true;
                //     });

                //     this.selectedPart = null;
                // } else {
                //     this.scene.traverse((child) => {
                //         if (
                //             child.isMesh &&
                //             child.name !== clickedPart.name
                //         ) {
                //             child.material.transparent = true;

                //             gsap.to(
                //                 child.material,
                //                 {
                //                     opacity: 0,
                //                     duration: 0.8,
                //                     onComplete: () => {
                //                         child.visible = false;
                //                     },
                //                 },
                //                 "<"
                //             );
                //         }
                //     });

                //     clickedPart.material.opacity = 1;

                //     clickedPart.visible = true;

                //     this.selectedPart = clickedPart;
                // }

                // let target = clickedPart.position.clone();

                // console.log(clickedPart);

                // this.moveCameraPosition(target, this.showCameraPosition);

                this.$emit("show-description", modelsDescr, key);
            }
        },

        zoomModel(model, x, y, z, up) {
            const targetClone = model.object.position.clone();
            targetClone.x = targetClone.x + x;
            targetClone.y = targetClone.y + y;
            targetClone.z = targetClone.z + z;

            const targetWathcherClone = model.object.position.clone();
            targetWathcherClone.y = targetWathcherClone.y + up;

            if (model.object.name.includes("land")) {
                this.laersCameraPosition = targetClone;
                this.laersTargetPosition = targetWathcherClone;
            }

            this.moveCameraPosition(targetWathcherClone, targetClone);
        },

        getLaersInvisible(layer) {
            this.scene.traverse((child) => {
                if (child.isMesh && child.userData.parentName !== layer) {
                    child.material.transparent = true;
                    gsap.to(child.material, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            child.visible = false;
                        },
                    });
                }
            });
        },

        getLaersVisible(layer) {
            this.scene.traverse((child) => {
                if (child.isMesh && child.userData.parentName !== layer) {
                    child.visible = true;
                    gsap.to(child.material, {
                        opacity: 1,
                        duration: 0.3,
                        onComplete: () => {
                            child.material.transparent = false;
                        },
                    });
                }
            });
        },

        getModelsInvisible(collection, model) {
            collection.forEach((mash, key) => {
                if (mash.name != model) {
                    mash.material.transparent = true;
                    gsap.to(mash.material, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            mash.visible = false;
                        },
                    });
                }
            });
        },

        getModelsVisible(collection, model) {
            collection.forEach((mash, key) => {
                if (mash.name != model) {
                    mash.visible = true;
                    gsap.to(mash.material, {
                        opacity: 1,
                        duration: 0.3,
                        onComplete: () => {
                            mash.material.transparent = false;
                        },
                    });
                }
            });
        },

        moveCameraPosition(target, position, distance) {
            let tl = gsap.timeline();

            tl.to(this.controls.target, {
                ...target,
                duration: 1.5,
            }).to(
                this.camera.position,
                {
                    ...position,
                    duration: 1.5,
                    onComplete: () => {
                        distance ? (this.controls.minDistance = distance) : "";
                    },
                },
                "<"
            );
        },

        destroyScene() {
            gsap.killTweensOf(this.targetCamera);
            window.removeEventListener("resize", this.resize);
            window.removeEventListener("mousemove", this.throttledHoverModel);
            window.removeEventListener("click", this.clickModel);

            this.meshes.forEach((mesh) => {
                mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        child.geometry = null;
                        if (child.material.map) {
                            child.material.map.dispose();
                            child.material.map = null;
                        }
                        child.material.dispose();
                        child.material = null;

                        child.userData.parentName = NaN;
                        child.userData.key = NaN;
                        child.userData.originalColor = NaN;
                        if (child instanceof THREE.Texture) {
                            child.dispose();
                            child = null;
                        }
                    }
                });
            });

            this.meshes = [];
            this.originalColors = [];
            this.environmentMap = null;

            this.renderer.forceContextLoss();
            this.renderer.renderLists.dispose();
            this.renderer.dispose();

            this.canvas.removeChild(this.renderer.domElement);

            this.renderer = null;
            this.camera = null;
            this.scene = null;
        },

        destroyModel() {
            this.scene.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.geometry = null;
                    if (child.material.map) {
                        child.material.map.dispose();
                        child.material.map = null;
                    }
                    child.material.dispose();
                    child.material = null;

                    child.userData.parentName = NaN;
                    child.userData.key = NaN;
                    child.userData.originalColor = NaN;
                    if (child instanceof THREE.Texture) {
                        child.dispose();
                        child = null;
                    }
                }
                if (child.isGroup) {
                    this.scene.remove(child);
                }
            });

            this.meshes = [];
            this.originalColors = new Map();
        },

        stopParalax() {
            this.startParalax = false;
        },

        tick() {
            if (
                this.startParalax &&
                (this.cursor.x !== 0 || this.cursor.y !== 0)
            ) {
                const initialCameraPosition = this.camera.position.clone();

                const targetX = initialCameraPosition.x + this.cursor.x * 0.03;
                const targetY = initialCameraPosition.y + this.cursor.y * 0.03;

                gsap.to(this.camera.position, {
                    duration: 0.2,
                    x: targetX,
                    y: targetY,
                });
            }

            // Controls
            this.controls.update();
            // Render
            this.renderer !== null
                ? this.renderer.render(this.scene, this.camera)
                : "";

            requestAnimationFrame(this.tick);
        },

        resize() {
            window.addEventListener("resize", () => {
                // Update sizes
                this.getSizes.width = window.innerWidth;
                this.getSizes.height = window.innerHeight;

                // Update camera
                this.camera.aspect = this.getSizes.width / this.getSizes.height;
                this.camera.updateProjectionMatrix();

                // Update renderer
                this.renderer.setSize(
                    this.getSizes.width,
                    this.getSizes.height
                );
                this.renderer.setPixelRatio(
                    Math.min(window.devicePixelRatio, 2)
                );
            });
        },

        createGuiParams() {
            // Debug;
            this.gui = new dat.GUI({
                width: 500,
            });

            this.gui
                .add(this.camera.position, "x")
                .min(0)
                .max(5)
                .step(0.001)
                .name("Camera X");
            this.gui
                .add(this.camera.position, "y")
                .min(0)
                .max(5)
                .step(0.001)
                .name("Camera Y");
            this.gui
                .add(this.camera.position, "z")
                .min(0)
                .max(5)
                .step(0.001)
                .name("Camera Z");

            this.gui
                .add(this.targetCamera, "x")
                .min(0)
                .max(5)
                .step(0.001)
                .name("target x");
            this.gui
                .add(this.targetCamera, "y")
                .min(0)
                .max(5)
                .step(0.001)
                .name("target y");
            this.gui
                .add(this.targetCamera, "z")
                .min(0)
                .max(5)
                .step(0.001)
                .name("target z");

            //   this.gui
            //     .add(this.pointLight.position, "x")
            //     .min(-1)
            //     .max(5)
            //     .step(0.001)
            //     .name("P_Light X");
            //   this.gui
            //     .add(this.pointLight.position, "y")
            //     .min(-1)
            //     .max(5)
            //     .step(0.001)
            //     .name("P_Light Y");
            //   this.gui
            //     .add(this.pointLight.position, "z")
            //     .min(-1)
            //     .max(5)
            //     .step(0.001)
            //     .name("P_Light Z");
            //   this.gui
            //     .add(this.pointLight, "intensity")
            //     .min(-1)
            //     .max(10)
            //     .step(0.001)
            //     .name("P_Light intensity");
            //   this.gui
            //     .add(this.ambientLight, "intensity")
            //     .min(-1)
            //     .max(5)
            //     .step(0.001)
            //     .name("A_Light intensity");
        },
    },
    computed: {
        getSizes() {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
        getActiveClass() {
            return {
                active: this.descripton,
            };
        },
        getModelData() {
            return this.modelsData;
        },
    },
    watch: {
        descripton() {
            if (!this.descripton && this.meshes.length > 0) {
                // this.meshes.forEach((item) => {
                //     item.traverse((child) => {
                //         if (child.isMesh && child.userData.originalColor) {
                //             gsap.to(child.material, {
                //                 opacity: 1,
                //                 duration: 0.8,
                //                 ease: "Circ.inOut",
                //                 onComplete: () => {
                //                     child.material.transparent = false;
                //                     this.hover = true;
                //                 },
                //             });

                //             child.visible = true;
                //         }
                //     });
                // });
                this.moveCameraPosition(
                    this.laersTargetPosition,
                    this.laersCameraPosition
                );

                this.getModelsVisible(
                    this.intersects[this.currentCollectionName],
                    this.currentModelName
                );
                this.controls.autoRotate = false;
            }
        },

        qurrentModelKey() {
            this.changeModel();
        },

        startState() {
            if (this.startState) {
                this.boxIntersec = false;
                this.controls.autoRotate = false;

                this.$nextTick(() => {
                    this.moveCameraPosition(
                        this.startTargetCamera,
                        this.startCameraPosition,
                        4
                    );
                });
                this.getLaersVisible(this.currentCollectionName);
            }
        },
    },
};
</script>


<template >
    <div @click="stopParalax">
        <div ref="preloader" class="lds-roller preloader active">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <p class="preloader_percent">{{ loadPercetn }}%</p>
        </div>
        <div
            ref="webGl"
            class="webGl"
            @mousedown="clickModel"
            :class="getActiveClass"
        ></div>
        <div class="tooltip" ref="tooltip">{{ tooltipText }}</div>
        <div class="webGl__btn_container">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.tooltip {
    position: absolute;
    pointer-events: none;
    background-color: rgba(145, 152, 215, 0.8);
    color: white;
    padding: 5px;
    font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
    border-radius: 3px;
    font-weight: 600;
    font-size: 25px;
    z-index: 3;
}
</style>