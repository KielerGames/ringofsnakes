import { loadJSON } from "../../util/JSONLoader";

export type ClientConfig = {
    server: {
        wss: boolean;
        host: string;
        port: number;
    };
};

const HTTPS = window.location.protocol === "https:";

const defaultConfig: ClientConfig = {
    server: {
        wss: HTTPS,
        host: "127.0.0.1",
        port: HTTPS ? 8443 : 8080
    }
};

const configPromise: Promise<ClientConfig> = loadJSON<ClientConfig>("client-config.json", {
    guard: isValidClientConfig
}).then((cfg) => {
    if (HTTPS && !cfg.server.wss) {
        throw new Error("Cannot use insecure websocket connection.");
    }
    return cfg;
}, (error) => {
    console.warn("Loading client config failed: " + error);
    return defaultConfig;
});

export function get(): Promise<Readonly<ClientConfig>> {
    return configPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidClientConfig(data: any): data is ClientConfig {
    if (!data || !data.server) {
        return false;
    }

    const server = data.server;

    return server.wss !== undefined && server.host && server.port;
}
