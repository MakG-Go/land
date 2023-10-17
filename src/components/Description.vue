<script>
export default {
    props: {
        descriptionKey: {
            type: Number,
            default: 0,
        },
        descriptionName: {
            type: String,
        },
    },
    data() {
        return {
            description: {
                land: [
                    {
                        name: "1",
                        definition: "1",
                    },
                    {
                        name: "2",
                        definition: "2",
                    },
                    {
                        name: "3",
                        definition: "3",
                    },
                    {
                        name: "4",
                        definition: "4",
                    },
                    {
                        name: "5",
                        definition: "5",
                    },
                    {
                        name: "6",
                        definition: "6",
                    },
                ],
                land_2: [
                    {
                        name: "1_2",
                        definition: "1",
                    },
                    {
                        name: "2_2",
                        definition: "2",
                    },
                    {
                        name: "3_2",
                        definition: "3",
                    },
                    {
                        name: "4_2",
                        definition: "4",
                    },
                    {
                        name: "5_2",
                        definition: "5",
                    },
                    {
                        name: "6_2",
                        definition: "6",
                    },
                ],
                land_3: [
                    {
                        name: "1_2",
                        definition: "1",
                    },
                    {
                        name: "2_2",
                        definition: "2",
                    },
                    {
                        name: "3_2",
                        definition: "3",
                    },
                    {
                        name: "4_2",
                        definition: "4",
                    },
                    {
                        name: "5_2",
                        definition: "5",
                    },
                    {
                        name: "6_2",
                        definition: "6",
                    },
                ],
            },
        };
    },

    computed: {
        getData() {
            if (this.descriptionName !== null) {
                return {
                    name: this.description[this.descriptionName][
                        this.descriptionKey
                    ].name,
                    definition:
                        this.description[this.descriptionName][
                            this.descriptionKey
                        ].definition,
                    image: this.description[this.descriptionName][
                        this.descriptionKey
                    ].image,
                };
            } else {
                return {
                    name: "",
                    definition: "",
                    image: "",
                };
            }
        },
        checkData() {
            return this.descriptionName !== null;
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

        <div class="discriotion__img-container">
            <img class="discriotion__img" :src="getData.image" alt="" />
        </div>

        <slot name="close"></slot>
    </div>
</template>



<style>
</style>
