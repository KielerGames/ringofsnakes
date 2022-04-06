package util;

import javax.annotation.Nonnull;
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
    public ScheduledFuture<?> schedule(@Nonnull Runnable runnable, long l, @Nonnull TimeUnit timeUnit) {
        return executor.schedule(runnable, l, timeUnit);
    }

    @Override
    public <V> ScheduledFuture<V> schedule(@Nonnull Callable<V> callable, long l, @Nonnull TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public ScheduledFuture<?> scheduleAtFixedRate(@Nonnull Runnable runnable, long l, long l1, @Nonnull TimeUnit timeUnit) {
        return executor.scheduleAtFixedRate(createExceptionalRunnable(runnable), l, l1, timeUnit);
    }

    @Override
    public ScheduledFuture<?> scheduleWithFixedDelay(@Nonnull Runnable runnable, long l, long l1, @Nonnull TimeUnit timeUnit) {
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
    public boolean awaitTermination(long l, @Nonnull TimeUnit timeUnit) throws InterruptedException {
        return executor.awaitTermination(l, timeUnit);
    }

    @Override
    public <T> Future<T> submit(@Nonnull Callable<T> callable) {
        return executor.submit(callable);
    }

    @Override
    public <T> Future<T> submit(@Nonnull Runnable runnable, T t) {
        return executor.submit(runnable, t);
    }

    @Override
    public Future<?> submit(@Nonnull Runnable runnable) {
        return executor.submit(runnable);
    }

    @Override
    public <T> List<Future<T>> invokeAll(@Nonnull Collection<? extends Callable<T>> collection) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public <T> List<Future<T>> invokeAll(@Nonnull Collection<? extends Callable<T>> collection, long l, @Nonnull TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public <T> T invokeAny(@Nonnull Collection<? extends Callable<T>> collection) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public <T> T invokeAny(@Nonnull Collection<? extends Callable<T>> collection, long l, @Nonnull TimeUnit timeUnit) {
        throw new UnsupportedOperationException("Method not implemented.");
    }

    @Override
    public void execute(@Nonnull Runnable runnable) {
        executor.execute(createExceptionalRunnable(runnable));
    }
}
