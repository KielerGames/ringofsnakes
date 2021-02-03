export type ClientToServerMessage = UpdatePlayerName;

export type UpdatePlayerName = {
    tag: "UpdatePlayerName",
    name: string,
};
