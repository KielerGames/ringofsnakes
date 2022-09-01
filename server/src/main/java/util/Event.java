package util;

import lombok.Getter;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;

public class Event<T1> {
    private final Set<Consumer<T1>> listeners = new HashSet<>(4);

    private Event() {
    }

    public static <T3> Trigger<T3> create() {
        return new Trigger<>(new Event<>());
    }

    /**
     * The callback will be immediately executed when the event gets triggered.
     */
    public void addListener(Consumer<T1> callback) {
        assert callback != null;
        listeners.add(callback);
    }

    /**
     * When the event gets triggered a new task that will call the callback
     * gets submitted to the executor service.
     */
    public void addListener(ExecutorService executor, Consumer<T1> callback) {
        addListener(new Listener<>(executor, callback));
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

        public void trigger(T2 eventData) {
            event.trigger(eventData);
        }
    }

    private record Listener<T4>(ExecutorService executorService, Consumer<T4> callback) implements Consumer<T4> {
        @Override
        public void accept(T4 eventData) {
            executorService.submit(() -> callback.accept(eventData));
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (Objects.equals(this.callback, o)) {
                return true;
            }
            if (o instanceof final Event.Listener<?> listener) {
                return this.callback.equals(listener.callback);
            }
            return false;
        }

        @Override
        public int hashCode() {
            return Objects.hash(callback);
        }
    }
}
