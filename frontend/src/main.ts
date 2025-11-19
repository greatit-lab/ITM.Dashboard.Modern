import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import "./style.css";

// ▼▼▼ [수정] 아래 줄을 지우거나 앞에 //를 붙여 주석 처리하세요! ▼▼▼
// import "primevue/resources/themes/aura-light-green/theme.css";

const app = createApp(App);

app.use(router);
app.use(PrimeVue, { ripple: true });

app.mount("#app");
