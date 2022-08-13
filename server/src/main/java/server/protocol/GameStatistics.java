package server.protocol;

import game.Game;
import game.snake.Snake;
import server.Player;

import java.util.Comparator;
import java.util.List;

public class GameStatistics extends ServerToClientJSONMessage {
    final List<LeaderboardEntry> leaderboard;
    final int numPlayers;
    final int numBots;

    public GameStatistics(Game game) {
        leaderboard = game.streamClients().filter(Player.class::isInstance)
                .map(client -> ((Player) client).snake)
                .filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(10)
                .map(LeaderboardEntry::new)
                .toList();

        numPlayers = (int) game.streamClients().filter(Player.class::isInstance).count();
        numBots = game.getNumberOfBots();
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

