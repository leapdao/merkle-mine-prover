import ethUtil from 'ethereumjs-util';
import MerkleTree from './merkleTree';

class ProofManager {
  constructor(accounts, merkleTree) {
    this.leafs = accounts;
    this.merkleTree = merkleTree;
  }

  async getRoot() {
    return this.merkleTree.getHexRoot();
  }

  async getProof(address) {
    const pos = this.leafs.indexOf(address);
    if (pos === -1) {
      return Promise.reject(`Not Found: could not find ${address} in set.`);
    }
    return {
      address: address,
      proof: this.merkleTree.getHexProof(address)
    };
  }
}

export default ProofManager;