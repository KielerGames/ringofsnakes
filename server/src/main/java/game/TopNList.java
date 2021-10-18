package game;

import game.snake.Snake;

import java.util.*;
import java.util.stream.Collectors;

public class TopNList {

    public final List<Short> ids = new LinkedList();
    public final List<Integer> scores = new LinkedList();

    public TopNList(Game game, int n){
        final var topSnakes = game.snakes.stream().filter(Snake::isAlive)
                .sorted(Comparator.comparing(Snake::getLength)
                        .reversed()).collect(Collectors.toList());

        int i = 0;
        for (Snake snake : topSnakes) {
            if(i < n) {
                ids.add(snake.id);
                scores.add((int) snake.getLength());
            }
            i++;
        }
    }

    @Override
    public String toString() {
        return "TopNList{" +
                "ids=" + ids +
                ", scores=" + scores +
                '}';
    }
}
