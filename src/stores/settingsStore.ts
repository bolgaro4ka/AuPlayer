import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export const useSettingsStore = defineStore("settingsStore", () => {
    const amoledMode : Ref<boolean> = ref(localStorage.getItem('settingsAmoledMode') == 'true');
    const preferImage : Ref<boolean> = ref(localStorage.getItem('settingsPreferImage') == 'true');

    function apply() {
        if (amoledMode.value) {document.documentElement.style.setProperty('--full-song-page-background-color', '#000000');} 
        else {document.documentElement.style.setProperty('--full-song-page-background-color', '#121212');}
        localStorage.setItem('settingsAmoledMode', String(amoledMode.value))
        localStorage.setItem('settingsPreferImage', String(preferImage.value))

    }

    return {
        amoledMode,
        preferImage,
        apply
    }
})