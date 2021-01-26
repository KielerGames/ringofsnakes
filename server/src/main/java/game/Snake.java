package game;

import java.util.LinkedList;
import java.util.List;

public class Snake {
    private double length = 1.0;
    private Vector headPosition = new Vector(0, 0);
    private List<SnakePart> parts = new LinkedList<>();
}

class SnakePart {
    SnakePart(List<Vector> points) {
        final int n = points.size();
        assert n >= 2;

        // start & end point
        P0 = points.get(0);
        P3 = points.get(n - 1);

        // control points (TODO)
        P1 = P2 = Vector.lerp(P0, P3, 0.5);
        //http://read.pudn.com/downloads217/sourcecode/graph/1023386/cubicbezierlsufit/cubicbezierlsufit/cubicbezierleastsquarefit.pdf

        length = approximateLength(32);
    }

    Vector P0, P1, P2, P3;
    double length;

    Vector getPointAt(double t) {
        final double p = t / this.length;
        final double r = 1.0 - p;
        assert 0 <= p && p <= 1.0;

        // cubic Bézier coefficients
        final double a = r * r * r,
                b = 3.0 * r * r * p,
                c = 3.0 * r * p * p,
                d = p * p * p;

        return new Vector(
                a * P0.x + b * P1.x + c * P2.x + d * P3.x,
                a * P0.y + b * P1.y + c * P2.y + d * P3.y
        );
    }

    Vector getDerivativeAt(double t) {
        final double p = t / this.length;
        final double r = 1.0 - p;
        assert 0 <= p && p <= 1.0;

        // cubic Bézier coefficients (1st derivative)
        final double a = 3.0 * r * r,
                b = 6.0 * r * p,
                c = 3.0 * p * p;

        return new Vector(
            a * (P1.x - P0.x) + b * (P2.x - P1.x) + c * (P3.x - P2.x),
            a * (P1.y - P0.y) + b * (P2.y - P1.y) + c * (P3.y - P2.y)
        );
    }

    Vector getNormalAt(double t) {
        final Vector d = getDerivativeAt(t);
        //noinspection SuspiciousNameCombination
        return new Vector(d.y, -d.x);
    }

    //https://raphlinus.github.io/curves/2018/12/28/bezier-arclength.html
    //https://www.sciencedirect.com/science/article/pii/0925772195000542
    double approximateLength(final int n) {
        assert n >= 2;
        final double step = 1.0 / n;

        double length = 0.0;
        Vector last = P0;

        for(int i=1; i<=n; i++) {
            // compute new point
            final double t = i * step;
            final Vector p = getPointAt(t);

            // update
            length += Vector.distance(last, p);
            last = p;
        }

        return length;
    }
}