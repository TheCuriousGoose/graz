<script setup lang="ts">
import { state as vipState, loadDefaultNames, generateFormattedList } from '@/states/VipState';
import { ref, watch, reactive } from 'vue';

const rows = 4;
const columns = 8;

watch(vipState, () => {
    fileContent.value = generateFormattedList();
}, {deep: true})

let isFullscreen = ref(false);
let showTooltip = ref(false);
let totalIndex = 0;

const fileInput = ref<HTMLInputElement | null>(null);
const fileContent = ref<string>(generateFormattedList());

function toggleFullscreen() {
    const elem = document.documentElement

    if (!isFullscreen.value) {
        elem.requestFullscreen();
        isFullscreen.value = true;
    } else {
        document.exitFullscreen();
        isFullscreen.value = false;
    }
}

function downloadVipList() {
    const textBlob = new Blob([generateFormattedList()], { type: 'text/plain' });
    const url = URL.createObjectURL(textBlob);

    const aElement = document.createElement('a');

    aElement.href = url;    
    aElement.download = 'vip-list.txt';

    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
    URL.revokeObjectURL(url);
}

const draggedOffset = reactive({ x: 0, y: 0 });

const handleDragStart = (event: any) => {
    const id = event.target.closest('.card').dataset.id;
    event.dataTransfer.setData('text/plain', id);

    // Calculate offset from mouse position
    const rect = event.target.getBoundingClientRect();
    draggedOffset.x = event.clientX - rect.left;
    draggedOffset.y = event.clientY - rect.top;
};

// Function to handle drag over event
const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
};

// Function to handle drop event
const handleDrop = (event: any) => {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
    const toIndex = parseInt(event.target.closest('.card').getAttribute('data-id'));

    if (fromIndex !== toIndex) {
        const temp = vipState.value[fromIndex];
        vipState.value[fromIndex] = vipState.value[toIndex] ?? '';
        vipState.value[toIndex] = temp ?? '';
    }
};

function copyToClipboard() {
    navigator.clipboard.writeText(fileContent.value);
    alert('copied to clipboard')
}

const handleFileChange = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
        handleFiles(files);
    }
};

const handleFileDrop = (event: DragEvent) => {
    showTooltip.value = false;
    const files = event.dataTransfer?.files;
    if (files) {
        handleFiles(files);
    }
};

const handleFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                fileContent.value = e.target?.result as string;
                let lines = fileContent.value.split('\r\n');

                lines = lines.slice(2, 100).map(line => line.replace('- ', ''));

                vipState.value = lines;
            };
            reader.readAsText(file);
        } else {
            alert('Please upload a valid text file.');
        }
    }
};

</script>

<template>
    <div class="container row-gap-2 d-flex flex-column">
        <p class="d-none">
            {{ totalIndex = 0 }}
        </p>
        <button class="btn btn-primary w-25" v-show="isFullscreen" @click="toggleFullscreen">Exit fullscreen</button>
        <div v-for="row in rows" :key="row" class="row w-100 d-flex justify-content-evenly">
            <div v-for="column in columns" :key="column" :style="{ width: (100 / columns) + '%', height: '7rem' }"
                class="d-flex">

                <div class="card w-100 bg-white text-dark fs-4" :data-id="totalIndex" draggable="true"
                    @dragstart="handleDragStart" @dragover="handleDragOver" @drop="handleDrop">
                    <div class="card-body d-flex justify-content-center align-items-center">
                        {{ vipState[totalIndex] ?? '' }}
                    </div>
                </div>
                <p class="d-none">
                    {{ totalIndex++ }}
                </p>
            </div>
        </div>
        <div class="card mt-3" v-show="!isFullscreen">
            <div class="card-body">
                <div class="card mb-3">
                    <div class="card-body d-flex gap-2">
                        <button class="btn btn-primary" @click="loadDefaultNames">
                            Load sample data
                        </button>
                        <button class="btn btn-primary" @click="toggleFullscreen">
                            Fullscreen
                        </button>
                        <button class="btn btn-primary" @click="downloadVipList">
                            Download vip list
                        </button>
                        <button class="btn btn-primary" @click="copyToClipboard">
                            copy to clickboard
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <p v-show="showTooltip">Drop the file to upload it</p>
                        <label for="upload-text" :class="{'border-success': showTooltip}" class="dropzone-label" @dragover.prevent @dragenter.prevent="showTooltip = true" @dragleave="showTooltip = false"
                            @drop.prevent="handleFileDrop">
                            <input type="file" id="upload-text" accept="text/plain" class="dropzone-input" 
                                @change="handleFileChange" ref="fileInput">
                            <div class="dropzone-content"  >
                                Drag & drop vip-list here or click to upload
                            </div>
                        </label>
                    </div>
                    <div class="col-6">
                        <textarea name="vip-list" class="w-100 h-100" readonly v-model="fileContent"></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
