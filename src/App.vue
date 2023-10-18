<template>
    <div>
        <div class="wrapper">
            <webGl
                :models-data="models"
                :qurrent-model-key="qurrentModelKey"
                :descripton="show"
                :start-state="startState"
                @show-description="showDescription"
                @model-loaded="modelLoaded"
                @start-state-off="startStateOff"
            >
                <button
                    v-if="startStateBtn"
                    class="btn btn-primary"
                    @click="turnStartState"
                >
                    Назад
                </button>
            </webGl>

            <description
                class="discriotion"
                :description-key="descriptionKey"
                :description-name="descriptionName"
                :class="{ active: show }"
            >
                <template v-slot:close>
                    <button
                        class="btn btn-primary discriotion__close"
                        @click="closeDescripton"
                    >
                        Закрыть
                    </button>
                </template>
            </description>
        </div>
    </div>
</template>

<script >
import webGl from "@/components/webGl.vue";
import description from "@/components/Description.vue";
export default {
    components: {
        webGl,
        description,
    },
    data() {
        return {
            show: false,
            loaded: false,
            qurrentModelKey: 0,
            descriptionKey: 0,
            descriptionName: null,
            startStateBtn: false,
            startState: true,

            models: [
                {
                    model: "models/ground_1_1.glb",
                    scale: 1,
                    position: { x: 0, y: 1.2, z: 0 },
                    name: "land",
                    startDiacription: "Слой 1",
                },
                {
                    model: "models/ground_2.glb",
                    scale: 1,
                    position: { x: 0, y: 0, z: 0 },
                    name: "land_2",
                    startDiacription: "Слой 2",
                },
                {
                    model: "models/ground_3_1.glb",
                    scale: 1,
                    position: { x: 0, y: -1.2, z: 0 },
                    name: "land_3",
                    startDiacription: "Слой 3",
                },
            ],
        };
    },
    methods: {
        turnStartState() {
            this.startState = true;
            this.startStateBtn = false;
        },

        startStateOff() {
            this.startStateBtn = true;
            this.startState = false;
        },

        showDescription(key, name) {
            console.log(key, name);

            this.show = true;
            this.descriptionKey = key;
            this.descriptionName = name;
        },

        modelLoaded(state) {
            this.loaded = state;
        },

        closeDescripton() {
            this.show = false;
        },
    },
    computed: {},
};
</script>

<style scoped>
</style>

