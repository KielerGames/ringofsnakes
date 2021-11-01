package debugview;

import game.Game;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class DebugGame extends Game {
    public ScheduledExecutorService getExecutorService() {
        return this.executor;
    }

    public void awaitExecution(Runnable runnable) {
        try {
            executor.schedule(runnable, 0, TimeUnit.MILLISECONDS).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}
