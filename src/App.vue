<template>
  <div id="app">
    <div>
      <input v-model="task" type="radio" id="task1" name="task1" :value="1" />
      <label for="task1">1</label>
      <input v-model="task" type="radio" id="task2" name="task2" :value="2" />
      <label for="task2">2</label>
    </div>
    <First v-if="task === 1" />
    <Second v-if="task === 2" />
  </div>
</template>

<script>
import First from './views/First.vue';
import Second from './views/Second.vue';

export default {
  name: "App",
  components: {
    First, Second
  },
  data() {
    return {
      loading: false,
      file: null,
      task: 1,
      fourierLoading: false,
      options: {
        animation: false,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                maxTicksLimit: 5,
              },
            },
          ],
        },
        tooltips: false,
        hover: false,
      },
      dataset: {
        x: [],
        y: [],
      },
      datasetEnhanced: {
        x: [],
        y: [],
      },
      fourierDatasets: [],
      convDatasets: [],
      filterDataset: {
        x: [],
        y: [],
      },
    };
  },
  computed: {
    isChartDisplayed() {
      return this.dataset.x.length && this.dataset.y.length;
    },
    isFourierDisplayed() {
      return this.fourierDatasets.every(
        (fourier) => fourier.x.length && fourier.y.length
      );
    },
    isConvDisplayed() {
      return this.convDatasets.every((conv) => conv.x.length && conv.y.length);
    },
  },
  mounted() {
  },
  methods: {
    templateChartData(title, { x, y }, color = "red") {
      return {
        labels: x,
        datasets: [
          {
            label: title,
            data: y,
            fill: false,
            borderColor: color,
            tension: 0,
            lineTension: 0,
            borderCapStyle: "round",
            borderJoinStyle: "round",
            pointRadius: 0,
          },
        ],
      };
    },
    doesConvExist(name) {
      return this.convDatasets.some((conv) => conv.name === name);
    },
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  background-color: #222;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  padding: 0.5rem 1rem;
  margin: 1rem 0.5rem;
  background-color: #01c39e;
  border: none;
  border-radius: 0.2rem;
  color: white;
}

button:disabled {
  background: gray;
}

canvas #line-chart {
  height: 400px !important;
  width: 500px !important;
}
</style>
