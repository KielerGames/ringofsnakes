package server.protocol;

import game.Game;
import game.snake.Snake;
import server.Player;

import java.util.*;

public class GameStatistics extends ServerToClientJSONMessage {
    final List<LeaderboardEntry> leaderboard;

    public GameStatistics(Game game) {
        leaderboard = game.streamClients().filter(Player.class::isInstance)
                .map(client -> ((Player) client).snake)
                .filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(10)
                .map(LeaderboardEntry::new)
                .toList();
    }

    private static class LeaderboardEntry {
        final int id;
        final String name;
        final int score;

        private LeaderboardEntry(Snake snake) {
            this.name = snake.name;
            this.score = (int) snake.getLength();
            this.id = snake.id;
        }
    }
}

