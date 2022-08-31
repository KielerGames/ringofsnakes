package util;

import lombok.Getter;

import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;

public class Event<T1> {
    private final Set<Consumer<T1>> listeners = new HashSet<>(4);

    private Event() {
    }

    public static <T3> Trigger<T3> create() {
        return new Trigger<>(new Event<>());
    }

    public void addListener(Consumer<T1> callback) {
        assert callback != null;
        listeners.add(callback);
    }

    public void removeListener(Consumer<T1> callback) {
        assert callback != null;
        listeners.remove(callback);
    }

    public boolean hasListener(Consumer<T1> callback) {
        assert callback != null;
        return listeners.contains(callback);
    }

    public void trigger(T1 eventData) {
        listeners.forEach(listener -> listener.accept(eventData));
    }

    public static class Trigger<T2> {
        @Getter private final Event<T2> event;

        private Trigger(Event<T2> event) {
            this.event = event;
        }

        public void triggerImmediately(T2 eventData) {
            event.trigger(eventData);
        }

        public Runnable createRunnableTrigger(T2 eventData) {
            return () -> event.trigger(eventData);
        }
    }
}
