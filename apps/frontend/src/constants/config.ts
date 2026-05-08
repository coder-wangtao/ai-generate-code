export const PORTS = {
  FRONTEND: 3000,
  SERVER: 7001,
};

export const API_BASE_URL = `http://localhost:${PORTS.SERVER}`;

export const IMG_UPLOAD_URL = `${API_BASE_URL}/api/upload/image`;
