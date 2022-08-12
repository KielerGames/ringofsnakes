package util;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class ExceptionalExecutorServiceTest {
    @Test
    void testExceptionGetsReported() throws InterruptedException {
        final var service = new ExceptionalExecutorService();
        @SuppressWarnings("unchecked") final var throwableConsumer = (Consumer<Throwable>) Mockito.spy(Consumer.class);
        service.onExceptionOrErrorDo(throwableConsumer);

        service.execute(() -> {
            throw new IllegalStateException("test error");
        });

        service.shutdown();
        assertTrue(service.awaitTermination(100, TimeUnit.MILLISECONDS));

        // expect exception:
        Mockito.verify(throwableConsumer).accept(Mockito.any(Exception.class));
    }
}
