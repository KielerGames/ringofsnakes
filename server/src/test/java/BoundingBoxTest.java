import math.BoundingBox;
import math.Vector;
import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

public class BoundingBoxTest {

    @Test
    void testPointInside() {
        var box = new BoundingBox(-1.0, 1.0, -1.0, 1.0);

        var origin = new Vector(0.0, 0.0);
        assertEquals(0.0, box.distance(origin));
        assertEquals(0.0, box.distance2(origin));
        assertTrue(box.isWithinRange(origin, 0.2));

        var point = new Vector(-0.5, 0.73);
        assertEquals(0.0, box.distance(point));
        assertEquals(0.0, box.distance2(point));
        assertTrue(box.isWithinRange(point, 0.25));

        var corner = new Vector(1.0, 1.0);
        assertEquals(0.0, box.distance(corner), 1e-8);
        assertEquals(0.0, box.distance2(corner), 1e-8);
        assertTrue(box.isWithinRange(corner, 0.2));
    }

    @Test
    void testPointOutside() {
        var box = new BoundingBox(-1.0, 1.0, -1.0, 1.0);

        var point = new Vector(2.0, 2.0);
        assertTrue(box.distance(point) > 0.0);
        assertTrue(box.distance2(point) > 0.0);
    }

    @Test
    void testNonNegative() {
        var box = new BoundingBox(-1.0, 2.0, -3.0, 4.0);
        var rand = new Random(1337);

        for (int i = 0; i < 100; i++) {
            var point = new Vector(rand, 10.0);
            assertTrue(box.distance(point) >= 0.0);
            assertTrue(box.distance2(point) >= 0.0);
        }
    }

    @Test
    void testIntersection() {
        var a = new BoundingBox(-1.0, 1.0, -1.0, 1.0);
        var b = new BoundingBox(-0.5, 0.5, -0.5, 0.5);
        assertTrue(BoundingBox.intersect(a, b));
    }

    @Test
    void testNonIntersection() {
        var a = new BoundingBox(-1.0, -0.25, -1.0, 1.0);
        var b = new BoundingBox(0.25, 1.0, -1.0, 1.0);
        assertFalse(BoundingBox.intersect(a, b));
    }

    @Test
    void testEmptyBoxIntersection() {
        var a = new BoundingBox(-1.0, 1.0, -1.0, 1.0);
        var b = new BoundingBox(0, 0, 0, 0);
        assertTrue(BoundingBox.intersect(a, b));
    }

    @Test
    void testCommutativity() {
        var rand = new Random(6969);

        for (int i = 0; i < 100; i++) {
            var a = new BoundingBox(rand);
            var b = new BoundingBox(rand);

            var ab = BoundingBox.intersect(a, b);
            var ba = BoundingBox.intersect(b, a);

            assertEquals(ab, ba);
        }
    }
}
