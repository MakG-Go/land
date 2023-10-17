/** Constructor */
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

export class CreateModel {

    constructor(params) {

        this.Init(params)
    }

    Init(params) {
        this.params = params
        this.LoadModels(this.params);
    }


    LoadModels(params) {

        this.params = params

        new GLTFLoader(this.params.preloader).load(this.params.model, (gltf) => {

            let model = gltf.scene
            let clickBox = null
            let clickBoxMaterial = null
            let clickBoxMesh = null
            let clickBoxSize = { x: '', y: '', z: '' }
            let clickBoxId = null

            this.params.meshStore.push(gltf.scene)
            model.children.forEach((child, key) => {
                clickBoxId = key

                if (child.isMesh) {

                    model.userData[child.name] = child.material
                    // child.material.transparent = true
                    child.material.envMap = this.params.material
                    child.material.envMapIntensity = 3
                    child.material.needsUpdate = true
                    child.userData.parentName = this.params.name
                    child.userData.key = key
                    child.userData.originalColor = child.material.color.clone();
                    this.params.materialColor.set(child, child.material.color.clone())

                    this.params.intersecStore[this.params.name].push(child)

                    if (child.name.includes('Landscape')) {
                        clickBoxSize.x = (Math.abs(child.geometry.boundingBox.max.x) + Math.abs(child.geometry.boundingBox.min.x)) * 1.01;
                        clickBoxSize.y = (Math.abs(child.geometry.boundingBox.max.y) + Math.abs(child.geometry.boundingBox.min.y)) * 1.5;
                        clickBoxSize.z = (Math.abs(child.geometry.boundingBox.max.z) + Math.abs(child.geometry.boundingBox.min.z)) * 1.01;
                    }

                }

            })


            model.name = this.params.name

            console.log(this.params.position)

            this.params.position ? model.position.set(this.params.position.x, this.params.position.y, this.params.position.z) : ''

            this.params.scale ? model.scale.set(this.params.scale.x, this.params.scale.y, this.params.scale.z) : ''

            this.params.scene.add(model)

            /** Мешь для стартовго перехода */

            clickBox = new THREE.BoxGeometry(clickBoxSize.x, clickBoxSize.y, clickBoxSize.z)
            clickBoxMaterial = new THREE.MeshStandardMaterial({ visible: false })
            clickBoxMesh = new THREE.Mesh(clickBox, clickBoxMaterial)
            clickBoxMesh.name = this.params.name + 'adasd'
            clickBoxMesh.position.set(this.params.position.x, this.params.position.y, this.params.position.z)
            clickBoxMesh.userData.discripton = this.params.startDiacription
            clickBoxMesh.updateMatrixWorld(true)

            this.params.scene.add(clickBoxMesh)

            this.params.intersecStore.box.push(clickBoxMesh)

            // console.log(clickBoxMesh)
            // console.log(this.params.scene)

        }
        )

    }
}
