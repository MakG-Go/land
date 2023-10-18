<script>
export default {
    props: {
        descriptionKey: {
            type: String,
        },
        descriptionName: {
            type: String,
        },
    },
    data() {
        return {
            description: {
                placeholder: {
                    land: {
                        name: "Верхний слой",
                        definition: "Верхний слой",
                    },

                    land_2: {
                        name: "Средний слой",
                        definition: "Средний слой",
                    },

                    land_3: {
                        name: "Нижний слой",
                        definition: "Нижний слой",
                    },
                },
                modelsDescription: {
                    Cube001: {
                        name: "Простой куб",
                        definition: "Тот самый куб",
                    },
                    Cube002: {
                        name: "Другой простой куб",
                        definition: "Тот самый куб",
                    },
                    Cube003: {
                        name: "Другой простой куб",
                        definition: "Тот самый куб",
                    },
                    Cube004: {
                        name: "Другой простой куб",
                        definition: "Тот самый куб",
                    },
                },
            },
        };
    },

    computed: {
        getData() {
            if (this.descriptionName !== null) {
                return this.description[this.descriptionKey][
                    this.descriptionName
                ];

                // return {
                //     name: this.description[this.descriptionName][
                //         this.descriptionKey
                //     ].name,
                //     definition:
                //         this.description[this.descriptionName][
                //             this.descriptionKey
                //         ].definition,
                //     image: this.description[this.descriptionName][
                //         this.descriptionKey
                //     ].image,
                // };
            } else {
                return {
                    name: "",
                    definition: "",
                    image: "",
                };
            }
        },
    },
};
</script>


<template>
    <div>
        <h1 class="discriotion__title">
            {{ getData.name }}
        </h1>

        <h3 class="discriotion__text">
            {{ getData.definition }}
        </h3>

        <!-- <div class="discriotion__img-container">
            <img class="discriotion__img" :src="getData.image" alt="" />
        </div> -->

        <slot name="close"></slot>
    </div>
</template>



<style>
</style>
