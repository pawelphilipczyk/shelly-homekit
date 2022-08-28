import { Form, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ShellyDevice } from "~/types";

const fetchShelly = (ip: string): Promise<ShellyDevice> =>
  fetch(`/api/shelly/${ip}`).then((response) => response.json());

export default function Shelly() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState<ShellyDevice[]>([]);
  const [isPending, setPending] = useState(false);
  const shouldRefresh = Boolean(searchParams.get("refresh"));

  useEffect(() => {
    if (shouldRefresh) {
      localStorage.removeItem("shelly-devices");
      setDevices([]);
      setSearchParams({});
    }
  }, [shouldRefresh, setSearchParams]);

  useEffect(() => {
    const storedDevices = JSON.parse(
      localStorage.getItem("shelly-devices") || "[]"
    );
    if (storedDevices.length) setDevices(storedDevices);
    else {
      setPending(true);
      const requests = [];
      for (let i = 1; i < 255; i++) {
        requests.push(
          fetchShelly(`192.168.88.${i}`).then((json) => {
            if (json?.device_id) {
              setDevices((prev) => [...prev, json]);
            }
          })
        );
      }

      Promise.all(requests).then(() => {
        setPending(false);
        setDevices((devices) => {
          localStorage.setItem("shelly-devices", JSON.stringify(devices));
          return devices;
        });
      });
    }
  }, []);

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
          {isPending && <li>Searching local network...</li>}
        </ul>
        <Form action="">
          <input type="hidden" name="refresh" value="true" />
          <button disabled={shouldRefresh}>Refresh</button>
        </Form>
      </section>
    </main>
  );
}
