package server.protocol;

public abstract class ServerToClientJSONMessage {
    public final String tag;

    protected ServerToClientJSONMessage() {
        tag = this.getClass().getSimpleName();
    }
}
