package game;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Snake {
    private double length = 1.0;
    private Vector headPosition = new Vector(0, 0);
    private double headDirection = 0.0;
    private double lastDirection = headDirection;
    private Vector lastCCPosition = headPosition.clone();
    private List<SnakePart> parts = new LinkedList<>();
    private double speed = 1.0;
    private ChainCodeCoder coder = new ChainCodeCoder();
    public boolean fast = false;

    public static final double deltaTime = 1.0/60.0;
    public static final double ccStepLength = 1.0 * deltaTime;

    private List<Byte> currentChainCodes = new ArrayList<>(64);

    public void updateDirection(double x, double y) {
        this.headDirection = Math.atan2(y, x);
    }

    public void tick() {
        headPosition.add(new Vector(headDirection), ccStepLength);
        int direction = coder.sampleDirection(headDirection, lastDirection);
        currentChainCodes.add(coder.encode(direction, fast, 1));
        lastDirection = headDirection;
    }

    public void debug() {
        System.out.println("Snake data:");
        for(Byte code : currentChainCodes) {
            var dir = coder.decode(code).direction;
            var angle = Math.round(coder.decodeDirection(dir) * 180/Math.PI);
            System.out.println(" " + code + " (direction " + angle + "°)");
        }
    }

    class SnakePart {
        Vector end;
        byte[] chainCodes;

        // bounding box
        Vector topLeft, bottomRight;

        SnakePart(List<Byte> chainCodes, Vector end, double width) {
            this.chainCodes = new byte[chainCodes.size()];
            this.end = end;

            int i = 0;
            Vector position = end.clone();
            double minX, maxX, minY, maxY;
            minX = maxX = end.x;
            minY = maxY = end.y;

            for (Byte b : chainCodes) {
                this.chainCodes[i] = (byte) b;
                final int direction = coder.decode(b).direction;
                position.addAlpha(coder.decodeDirection(direction), ccStepLength);
                minX = Math.min(minX, position.x);
                minY = Math.min(minY, position.y);
                maxX = Math.max(maxX, position.x);
                maxY = Math.max(maxY, position.y);
                i++;
            }

            topLeft = new Vector(minX + 0.5 * width, maxY + 0.5 * width);
            bottomRight = new Vector(maxX + 0.5 * width, minY + 0.5 * width);
        }
    }
}
