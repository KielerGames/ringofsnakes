package server.protocol;

import java.io.Serializable;

public abstract class ServerToClientJSONMessage implements Serializable {
    public final String tag;

    protected ServerToClientJSONMessage() {
        tag = this.getClass().getSimpleName();
    }
}
