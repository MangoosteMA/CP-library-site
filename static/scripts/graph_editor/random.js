export class RandomInt {
    constructor(seed=228) {
        this.setSeed(seed);
        for (let i = 0; i < 10; i++) {
            this.random();
        }
    }

    setSeed(seed) {
        this.#seed = seed;
    }

    // random float from [0, 1]
    random() {
        const K = 134775813;
        const B = 1;
        const MOD = (1 << 30);
        this.#seed = (K * this.#seed + B) % MOD;
        return this.#seed / (MOD - 1);
    }

// Private:
    #seed; // int
};
