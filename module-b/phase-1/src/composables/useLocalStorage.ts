import { ref, watch } from 'vue'

export function useLocalStorage(key: string, defaultValue: any = '', watchCallback?: () => void) {
    const value = ref(defaultValue)

    // Retrieve stored value from localStorage
    const storedValue = localStorage.getItem(key)
    if (storedValue) {
        value.value = JSON.parse(storedValue)
    } else {
        localStorage.setItem(key, JSON.stringify(defaultValue))
    }

    // Watch for changes in the 'value' and update localStorage
    watch(value, (newValue, oldValue) => {
        localStorage.setItem(key, JSON.stringify(newValue))

        if (watchCallback) {
            watchCallback()
        }
    }, {
        deep: true
    })

    return value
}
