// frontend/src/api/http.ts
import axios from "axios";

// [수정] 배포 시 Nginx Proxy를 타도록 상대 경로 혹은 환경변수 사용
// const baseURL = 'http://localhost:3000/api'; // (X) 개발용
const baseURL = import.meta.env.VITE_API_URL || "/api"; // (O) 배포용 권장

const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
