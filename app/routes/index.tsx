import { Form, useSearchParams } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import type { ShellyDevice } from "~/types";
import { fetchWithTimeout } from "~/utils/fetchWithTimeout";

const getIpsRange = () => {
  const ips: string[] = [];
  for (let i = 0; i <= 255; i++) ips.push(`192.168.88.${i}`);
  return ips;
};

const isShellyDevice = (device: ShellyDevice) => Boolean(device.device_id);

const getStoredDevices = () =>
  JSON.parse(localStorage.getItem("shelly-devices") || "[]");

const setStoredDevices = (devices: ShellyDevice[]) =>
  localStorage.setItem("shelly-devices", JSON.stringify(devices));

const fetchShelly = (ip: string): Promise<ShellyDevice> => {
  const url = `http://${ip}/rpc/Shelly.GetInfo`;

  return fetchWithTimeout(url)
    .then((response) => response.json())
    .catch((error) => new Error(error));
};

export default function Shelly() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState<ShellyDevice[]>([]);
  const [isPending, setPending] = useState(false);
  const shouldRefresh = Boolean(searchParams.get("refresh"));

  const scanDevices = useCallback(() => {
    setPending(true);
    const ips = getIpsRange();

    const fetchIpBatch = () => {
      const ipsBatch = ips.splice(0, 10);
      if (ipsBatch.length > 0) {
        Promise.all(ipsBatch.map(fetchShelly))
          .then((responses) => responses.filter(isShellyDevice))
          .then((devices) =>
            setDevices((prevState) => [...prevState, ...devices])
          )
          .finally(fetchIpBatch);
      } else {
        setPending(false);
        setDevices((devices) => {
          setStoredDevices(devices);
          return devices;
        });
      }
    };
    fetchIpBatch();
  }, []);

  useEffect(() => {
    if (shouldRefresh) {
      localStorage.removeItem("shelly-devices");
      setDevices([]);
      setSearchParams({});
      scanDevices();
    }
  }, [shouldRefresh, setSearchParams, scanDevices]);

  useEffect(() => {
    const storedDevices = getStoredDevices();
    if (storedDevices.length) setDevices(storedDevices);
    else scanDevices();
  }, [scanDevices]);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        padding: "2em",
      }}
    >
      <header>
        <h1>Shelly Homekit Dashboard</h1>
      </header>
      <section>
        <ul>
          {devices.map((device) => (
            <li key={device.name}>
              <a
                href={`http://${device.host}`}
                target="_blank"
                rel="noreferrer"
              >
                {device.name}
              </a>
            </li>
          ))}
        </ul>
        <Form action="">
          {isPending && <p>Scanning local network...</p>}
          <input type="hidden" name="refresh" value="true" />
          <button disabled={shouldRefresh}>Refresh</button>
        </Form>
      </section>
    </main>
  );
}
