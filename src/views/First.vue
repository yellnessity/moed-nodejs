<template>
  <div>
    <div>
      <input type="file" @change="onFileLoad" id="image" name="image" />
    </div>
    <div v-if="file && !loading">
      <div v-for="(image, index) in images" :key="image.name + ' ' + index">
        <p>{{ image.name }}</p>
        <img :src="image.value" alt="" />
      </div>
    </div>
    <p v-else-if="loading">Loading...</p>
  </div>
</template>

<script>
let { ipcRenderer } = window.require("electron");

export default {
  name: "First",
  data() {
    return {
      loading: false,
      file: null,
      images: [],
      task: 1,
    };
  },
  mounted() {
    ipcRenderer.on("on-image-process", (event, arg) => {
      const [amplified, restored] = arg;

      let blobAmplified = new Blob([amplified.buffer], { type: "image/jpeg" });
      let blobRestored = new Blob([restored.buffer], { type: "image/jpeg" });

      this.createImage(blobAmplified, "Amplified picture");
      this.createImage(blobRestored, "Restored picture");
      
      this.loading = false;
    });
  },
  methods: {
    onFileLoad(event) {
      this.loading = true;
      const file = event.target.files[0];
      if (file) {
        this.createImage(file, "The original picture");
        this.readFile(file).then(buffer => {
          ipcRenderer.send("process-image", buffer);
        });
        this.file = file;
      }
    },
    createImage(file, name) {
      var reader = new FileReader();

      reader.onload = () => {
        console.log(reader.result);
        this.images.push({
          name: name,
          value: reader.result,
        });
      };
      reader.readAsDataURL(file);
    },
    readFile(file) {
      let reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            var buffer = new Buffer.from(reader.result);
            resolve(buffer);
        };
        reader.onerror = (ev) => reject(ev);
      });
    }
  },
};
</script>