export type ShellyDevice = {
  device_id: string;
  name: string;
  app: string;
  model: string;
  stock_fw_model: string;
  host: string;
  version: string;
  fw_build: string;
  uptime: number;
  failsafe_mode: boolean;
  auth_en: boolean;
};