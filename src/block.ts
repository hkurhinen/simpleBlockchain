import * as crypto from "crypto";

export class Block {

  data: any;
  hash: string;
  previousHash: any;
  timestamp: number;
  nonce: number;

  constructor(previousHash: string, data: any) {
    this.data = data;
    this.hash = this.calculateHash();
    this.previousHash = previousHash;
    this.timestamp = new Date().getTime();
    this.nonce = 0;
  }

  calculateHash(): string {
    const hashValue = [
      this.previousHash,
      JSON.stringify(this.data),
      this.timestamp,
      this.nonce
    ].join();

    return crypto.createHash('sha256').update(hashValue).digest('hex');
  }

  mine(difficulty: number): boolean {
    this.nonce++;
    this.hash = this.calculateHash();
    return this.hash.startsWith("0".repeat(difficulty));
  }

  toJson(): string {
    return JSON.stringify(this.toObject());
  }

  toObject(): Object {
    return {
      data: this.data,
      hash: this.hash,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
      nonce: this.nonce
    };
  }

  static fromObject(data: any): Block {
    const block = new Block(data.previousHash, data.data);
    block.hash = data.hash;
    block.timestamp = data.timestamp;
    block.nonce = data.nonce;
    return block;
  }
}