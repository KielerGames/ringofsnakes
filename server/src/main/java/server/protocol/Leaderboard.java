package server.protocol;

import game.Game;
import game.snake.Snake;
import server.Player;

import java.util.*;

public class Leaderboard extends ServerToClientJSONMessage {
    private static final int LIMIT = 10;

    final List<LeaderboardSnake> list;

    public Leaderboard(Game game) {
        list = game.streamClients().filter(Player.class::isInstance)
                .map(client -> ((Player) client).snake)
                .filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength).reversed())
                .limit(LIMIT)
                .map(LeaderboardSnake::new)
                .toList();
    }

    private static class LeaderboardSnake {
        final int id;
        final String name;
        final int score;

        private LeaderboardSnake(Snake snake) {
            this.name = snake.name;
            this.score = (int) snake.getLength();
            this.id = snake.id;
        }
    }
}

