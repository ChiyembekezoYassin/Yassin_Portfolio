import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedProps,
  Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const HEIGHT = 150;
const NODE_RADIUS = 5;

// Neural layers
const layers = [
  [0.2, 0.4, 0.6, 0.8],
  [0.3, 0.5, 0.7],
  [0.4, 0.6],
  [0.5],
];

export default function NeuralNetwork() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 2500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Generate connections
  const connections: any[] = [];

  layers.forEach((layer, i) => {
    if (i < layers.length - 1) {
      layer.forEach((y1, j) => {
        layers[i + 1].forEach((y2, k) => {
          connections.push({
            x1: i * (width / layers.length) + 40,
            y1: y1 * HEIGHT,
            x2: (i + 1) * (width / layers.length) + 40,
            y2: y2 * HEIGHT,
            key: `${i}-${j}-${k}`,
          });
        });
      });
    }
  });

  return (
    <Svg width={width} height={HEIGHT}>
      {/* CONNECTION LINES */}
      {connections.map((c, index) => {
        const animatedProps = useAnimatedProps(() => ({
          strokeOpacity: 0.15 + progress.value * 0.5,
        }));

        return (
          <AnimatedLine
            key={`line-${index}`}
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke="#ff7a18"
            strokeWidth={1}
            animatedProps={animatedProps}
          />
        );
      })}

      {/* MOVING SIGNAL PARTICLES 🔥 */}
      {connections.map((c, index) => {
        const animatedProps = useAnimatedProps(() => {
          const x = c.x1 + (c.x2 - c.x1) * progress.value;
          const y = c.y1 + (c.y2 - c.y1) * progress.value;

          return {
            cx: x,
            cy: y,
          };
        });

        return (
          <AnimatedCircle
            key={`signal-${index}`}
            r={2.5}
            fill="#32d2aa"
            animatedProps={animatedProps}
          />
        );
      })}

      {/* NODES */}
      {layers.map((layer, i) =>
        layer.map((y, j) => (
          <Circle
            key={`node-${i}-${j}`}
            cx={i * (width / layers.length) + 40}
            cy={y * HEIGHT}
            r={NODE_RADIUS}
            fill="#ffffff"
          />
        ))
      )}
    </Svg>
  );
}
