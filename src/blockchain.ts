import { Block } from "./block";

export class Blockchain {
  chain: Block[];

  constructor() {
    let genesisBlock = new Block("0", "Genesis");
    this.chain = [genesisBlock];
  }

  getLatestHash(): string {
    return this.chain[this.chain.length - 1].hash;
  }

  addBlock(block: Block) {
    this.chain.push(block);
  }

  getLength(): number {
    return this.chain.length;
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (currentBlock.hash != currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash != previousBlock.hash) return false;
    }
    return true;
  }

  isValidBlock(block: Block) {
    const pending = [...this.chain, block];
    for (let i = 1; i < pending.length; i++) {
      const currentBlock = pending[i];
      const previousBlock = pending[i - 1];
      if (currentBlock.hash != currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash != previousBlock.hash) return false;
    }
    return true;
  }

  toJson(): string {
    const blocks = this.chain.map(b => b.toObject());
    return JSON.stringify(blocks);
  }

  static fromObjects(data: any[]): Blockchain {
    const blocks = data.map(d => Block.fromObject(d));
    const blockChain = new Blockchain();
    blockChain.chain = blocks;
    return blockChain;
  }

}