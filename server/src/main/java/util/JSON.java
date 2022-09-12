package util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public final class JSON {
    private static final Gson gson = new Gson();
    private static final Gson prettyGson = new GsonBuilder().setPrettyPrinting().create();

    public static String stringify(Object object, boolean pretty) {
        if (pretty) {
            return prettyGson.toJson(object);
        }

        return gson.toJson(object);
    }

    public static String stringify(Object object) {
        return gson.toJson(object);
    }
}
