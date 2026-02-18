declare module "tsne-js" {
  export interface TSNEOptions {
    dim?: number;
    perplexity?: number;
    earlyExaggeration?: number;
    learningRate?: number;
    nIter?: number;
    metric?: string;
  }

  export interface TSNEInput {
    data: number[][];
    type: "dense" | "sparse";
  }

  export default class TSNE {
    constructor(options?: TSNEOptions);
    init(input: TSNEInput): void;
    run(): [number, number];
    rerun(): [number, number];
    getOutput(): number[][];
    getOutputScaled(): number[][];
  }
}
