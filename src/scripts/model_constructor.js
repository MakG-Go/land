import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

export class CreateModel {

    constructor(params) {
        this.Init(params);
    }

    Init(params) {
        this.params = params;
        this.LoadModels(this.params);
    }

    LoadModels(params) {
        this.params = params;
        this.clickBoxSize = { x: '', y: '', z: '' };

        new GLTFLoader(this.params.preloader).load(this.params.model, (gltf) => {
            this.model = gltf.scene;
            this.model.updateMatrixWorld(true);
            this.params.meshStore.push(gltf.scene);

            this.model.children.forEach((child, key) => {
                if (child.isMesh) {
                    this.model.userData[child.name] = child.material;
                    child.material.envMap = this.params.material;
                    child.material.envMapIntensity = 3;
                    child.material.needsUpdate = true;
                    child.userData.parentName = this.params.name;
                    child.userData.key = key;
                    child.userData.originalColor = child.material.color.clone();
                    this.params.materialColor.set(child, child.material.color.clone());
                    this.params.intersecStore[this.params.name].push(child);

                    if (child.name.includes('Landscape')) {
                        this.clickBoxSize.x = (Math.abs(child.geometry.boundingBox.max.x) + Math.abs(child.geometry.boundingBox.min.x)) * 1.01;
                        this.clickBoxSize.y = (Math.abs(child.geometry.boundingBox.max.y) + Math.abs(child.geometry.boundingBox.min.y)) * 1.2;
                        this.clickBoxSize.z = (Math.abs(child.geometry.boundingBox.max.z) + Math.abs(child.geometry.boundingBox.min.z)) * 1.01;
                    }
                }
            });

            this.model.name = this.params.name;


            if (this.params.scale) {
                this.model.scale.set(this.params.scale.x, this.params.scale.y, this.params.scale.z);
            }

            this.params.scene.add(this.model);

            this.CreateIntersecBox(this.params, this.clickBoxSize, this.model);
        });
    }

    CreateIntersecBox(params, size, model) {
        this.params = params;
        this.clickBox = null;
        this.clickBoxMaterial = null;
        this.clickBoxMesh = null;

        this.clickBox = new THREE.BoxGeometry(size.x, size.y, size.z);
        this.clickBoxMaterial = new THREE.MeshStandardMaterial({ visible: false, transparent: true, opacity: 0.5 });
        this.clickBoxMesh = new THREE.Mesh(this.clickBox, this.clickBoxMaterial);
        this.clickBoxMesh.name = this.params.name;
        this.clickBoxMesh.position.set(this.params.position.x, this.params.position.y, this.params.position.z);


        // this.clickBoxMesh.position.copy(model.position);
        this.clickBoxMesh.userData.discripton = this.params.startDiacription;
        this.clickBoxMesh.updateMatrixWorld(true);

        this.params.scene.add(this.clickBoxMesh);
        this.params.intersecStore.box.push(this.clickBoxMesh);
    }
}