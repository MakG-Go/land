

<template>
    <div>
        <div class="wrapper">
            <!-- <div v-for="(qurrentModel, key) in models" :key="qurrentModel.name">
        <webGl
          v-if="showModel(key)"
          :qurrent-model="qurrentModel"
          :descripton="show"
          @show-description="showDescription"
        >
          <button class="btn btn-primary" @click="prevModel">Prev</button>
          <button class="btn btn-primary" @click="nextModel">Next</button>
        </webGl>
      </div> -->

            <webGl
                :models-data="models"
                :qurrent-model-key="qurrentModelKey"
                :descripton="show"
                @show-description="showDescription"
                @model-loaded="modelLoaded"
            >
                <!-- <button
                    class="btn btn-primary webGl__btn_prev"
                    :disabled="show || !loaded || !prevDisable"
                    @click="prevModel"
                >
                    Prev
                </button>
                <button
                    class="btn btn-primary webGl__btn_next"
                    :disabled="show || !loaded || !nextDisable"
                    @click="nextModel"
                >
                    Next
                </button> -->
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

            models: [
                {
                    model: "models/ground.glb",
                    scale: 1,
                    position: { x: 0, y: 0.8, z: 0 },
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
                    model: "models/ground_3.glb",
                    scale: 1,
                    position: { x: 0, y: -0.8, z: 0 },
                    name: "land_3",
                    startDiacription: "Слой 3",
                },
            ],
        };
    },
    methods: {
        showDescription(key, name) {
            console.log(key, name);

            this.show = true;
            this.descriptionKey = key;
            this.descriptionName = name;
        },

        closeDescripton() {
            this.show = false;
        },

        // nextModel() {
        //     if (this.qurrentModelKey < this.models.length - 1) {
        //         this.qurrentModelKey++;
        //         this.loaded = false;
        //         return;
        //     }
        // },
        // prevModel() {
        //     if (this.qurrentModelKey > 0) {
        //         this.qurrentModelKey--;
        //         this.loaded = false;
        //         return;
        //     }
        // },
        // modelLoaded(state) {
        //     this.loaded = state;
        // },
    },
    computed: {
        // showModel() {
        //     return (key) => {
        //         return key === this.qurrentModelKey;
        //     };
        // },
        nextDisable() {
            return this.qurrentModelKey < this.models.length - 1;
        },
        prevDisable() {
            return this.qurrentModelKey > 0;
        },
    },
};
</script>

<style scoped>
</style>
