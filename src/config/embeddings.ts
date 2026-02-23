export const EXPLORER_CONFIG = {
  dims: { options: [2, 3] as const, default: 2 },
  limit: { options: [250, 500, 750, 1000] as const, default: 1000 },
};
