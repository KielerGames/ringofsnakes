import { loadJSON } from "../../util/JSONLoader";

export type ClientConfig = {
    server: {
        wss: boolean;
        host: string;
        port: number;
    };
};

const defaultConfig: ClientConfig = {
    server: {
        wss: false,
        host: "127.0.0.1",
        port: 8080
    }
};

const configPromise: Promise<ClientConfig> = loadJSON<ClientConfig>("client-config.json", {
    guard: isValidClientConfig
}).catch((error) => {
    console.warn("Loading client config failed: " + error);
    return defaultConfig;
});

export function get(): Promise<Readonly<ClientConfig>> {
    return configPromise;
}

function isValidClientConfig(data: any): data is ClientConfig {
    if (!data || !data.server) {
        return false;
    }

    const server = data.server;

    return server.wss !== undefined && server.host && server.port;
}
