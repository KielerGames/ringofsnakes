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
        @SuppressWarnings("unchecked") final var exceptionConsumer = (Consumer<Exception>) Mockito.spy(Consumer.class);
        service.onExceptionDo(exceptionConsumer);

        service.execute(() -> {
            throw new IllegalStateException("test error");
        });

        service.shutdown();
        assertTrue(service.awaitTermination(100, TimeUnit.MILLISECONDS));

        // expect exception:
        Mockito.verify(exceptionConsumer).accept(Mockito.any(Exception.class));
    }
}
