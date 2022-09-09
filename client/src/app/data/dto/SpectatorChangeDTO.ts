export type SpectatorChangeDTO =
    | {
          followSnake: true;
          targetSnakeId: number;
      }
    | {
          followSnake: false;
          position: { x: number; y: number };
      };
