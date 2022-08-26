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
        leaderboard = game.streamClients()
                .filter(Player.class::isInstance)
                .map(Player.class::cast)
                .map(Player::getSnake)
                .filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(10)
                .map(LeaderboardEntry::new)
                .toList();

        numBots = game.getNumberOfBots();
        final int numNPCs = numBots + 1; // NPCs: bots and boundary snake
        numPlayers = game.snakes.size() - numNPCs;
    }

    private static class LeaderboardEntry {
        final int id;
        final String name;
        final int length;
        final int kills;

        private LeaderboardEntry(Snake snake) {
            name = snake.name;
            length = (int) snake.getLength();
            id = snake.id;
            kills = snake.getKills();
        }
    }
}

