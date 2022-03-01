<template>
  <div>
    <p v-if="loading">File reading...</p>
    <div v-else>
      <input type="file" @change="onFileLoad" id="image" name="image" />
    </div>
    <p v-if="file">
      The file length: {{ fileLength ? fileLength : "Calculating..." }}
    </p>
    <canvas v-if="!images.length" id="canvas" height="1024" width="1024"></canvas>
    <div v-if="images.length">
      <div v-for="(image, index) in images" :key="image.name + ' ' + index">
        <p>{{ image.name }}</p>
        <img width="512" height="512" :src="image.value" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
let { ipcRenderer } = window.require("electron");

export default {
  name: "Second",
  data() {
    return {
      loading: false,
      file: null,
      fileLength: null,
      images: []
    };
  },
  mounted() {
    // ipcRenderer.send("read-file-from-fs");
    // ipcRenderer.on("on-read-file-from-fs", () => {
    //   this.loading = false;
    // });
    ipcRenderer.on("on-read-file", (event, arg) => {
      this.fileLength = arg.length;
      console.log(arg);
      this.fillCanvas(arg);
    });
  },
  methods: {
    onFileLoad(event) {
      this.loading = true;
      const file = event.target.files[0];
      if (file) {
        // this.createImage(file, "The original picture");
        this.readFile(file).then((buffer) => {
          ipcRenderer.send("read-file", buffer);
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
          const typedArray = new Uint16Array(reader.result);
          resolve(typedArray);
        };
        reader.onerror = (ev) => reject(ev);
      });
    },
    fillCanvas(buffer) {
      var canvas = document.getElementById("canvas");
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;
      var ctx = canvas.getContext("2d");
      var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

      var data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        data[i] = buffer[i/4] % 255; // red
        data[i + 1] = buffer[i/4] % 255; // green
        data[i + 2] = buffer[i/4] % 255; // blue
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);

      this.images.push({
        name: "original",
        value: canvas.toDataURL(),
      });
    },
  },
};
</script>
