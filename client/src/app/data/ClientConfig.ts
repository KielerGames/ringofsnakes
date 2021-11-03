import { loadJSON } from "../utilities/JSONLoader";

export type ClientConfig = {
    server: {
        wss: boolean;
        host: string;
        port: number;
    }
};

const defaultConfig: ClientConfig = {
    server: {
        wss: false,
        host: "127.0.0.1",
        port: 8080
    }
};

const configPromise: Promise<ClientConfig> = loadJSON<ClientConfig>("client-config.json").catch(error => {
    console.error("Loading client config failed: " + error);
    return defaultConfig;
});

export function get(): Promise<ClientConfig> {
    return configPromise;
};
