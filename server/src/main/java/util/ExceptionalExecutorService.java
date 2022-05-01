package util;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.*;
import java.util.function.Consumer;

public class ExceptionalExecutorService implements ScheduledExecutorService {
    private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
    private Consumer<Exception> exceptionHandler;

    public void onExceptionDo(Consumer<Exception> exceptionHandler) {
        this.exceptionHandler = exceptionHandler;
    }

    private Runnable createExceptionalRunnable(Runnable runnable) {
        return () -> {
            try {
                runnable.run();
            } catch (Exception e) {
                executor.shutdown();
                if(exceptionHandler != null) {
                    exceptionHandler.accept(e);
                }
            }
        };
    }

    @Override
    public ScheduledFuture<?> schedule(Runnable runnable, long l, TimeUnit timeUnit) {
        return executor.schedule(runnable, l, timeUnit);
    }

    @Override
    public <V> ScheduledFuture<V> schedule(Callable<V> callable, long l, TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public ScheduledFuture<?> scheduleAtFixedRate(Runnable runnable, long l, long l1, TimeUnit timeUnit) {
        return executor.scheduleAtFixedRate(createExceptionalRunnable(runnable), l, l1, timeUnit);
    }

    @Override
    public ScheduledFuture<?> scheduleWithFixedDelay(Runnable runnable, long l, long l1, TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public void shutdown() {
        executor.shutdown();
    }

    @Override
    public List<Runnable> shutdownNow() {
        return executor.shutdownNow();
    }

    @Override
    public boolean isShutdown() {
        return executor.isShutdown();
    }

    @Override
    public boolean isTerminated() {
        return executor.isTerminated();
    }

    @Override
    public boolean awaitTermination(long l, TimeUnit timeUnit) throws InterruptedException {
        return executor.awaitTermination(l, timeUnit);
    }

    @Override
    public <T> Future<T> submit(Callable<T> callable) {
        return executor.submit(callable);
    }

    @Override
    public <T> Future<T> submit(Runnable runnable, T t) {
        return executor.submit(runnable, t);
    }

    @Override
    public Future<?> submit(Runnable runnable) {
        return executor.submit(runnable);
    }

    @Override
    public <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> collection) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> collection, long l, TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public <T> T invokeAny(Collection<? extends Callable<T>> collection) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public <T> T invokeAny(Collection<? extends Callable<T>> collection, long l, TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public void execute(Runnable runnable) {
        executor.execute(createExceptionalRunnable(runnable));
    }
}
