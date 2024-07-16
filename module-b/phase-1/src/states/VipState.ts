import { useLocalStorage } from "@/composables/useLocalStorage";

const defaultVips = [
    'Andrew',
    'Robert',
    'Steve'
]

const state = useLocalStorage('vips', []);

function loadDefaultNames(){
    state.value = defaultVips
}

function generateFormattedList(): string {
    const formattedList = state.value.map((item: string) => {
        if (item.trim() !== '') {
            return `- ${item}`
        } else {
            return ''
        }
    }).join('\r\n');

    return `# Vip list \r\n \r\n ${formattedList}`;
}

export {
    state,
    loadDefaultNames,
    generateFormattedList
}