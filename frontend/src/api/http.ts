import axios from 'axios';

// [수정] C# API(7278) 대신 NestJS API(3000) 주소로 변경합니다.
const baseURL = 'http://localhost:3000/api';

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default http;
