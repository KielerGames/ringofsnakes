package util;

import java.util.DoubleSummaryStatistics;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public class TaskMeasurer {
    private static Map<String, DoubleSummaryStatistics> data = new HashMap<>();
    private static boolean measure = false;

    public static Runnable measure(String id, Runnable runnable) {
        if (!data.containsKey(id)) {
            data.put(id, new DoubleSummaryStatistics());
        }

        return () -> {
            final long startTime = System.currentTimeMillis();
            runnable.run();
            final long endTime = System.currentTimeMillis();
            final long elapsedTime = endTime - startTime;

            if (measure) {
                final var stats = data.get(id);
                stats.accept((double) elapsedTime);
            }
        };
    }

    public static void start() {
        measure = true;
        data = new HashMap<>();
    }

    public static void end() {
        measure = false;
    }

    public static DoubleSummaryStatistics getStatistics(String id) {
        if (!data.containsKey(id)) {
            throw new NoSuchElementException("No stats for " + id);
        }
        return data.get(id);
    }
}
