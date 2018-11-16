import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { it, describe, afterEach, beforeEach } from 'mocha';
import ProofManager from '../src/index';
import ethUtil from 'ethereumjs-util';
import MerkleTree from '../src/merkleTree';
import SnapShot from '../src/snapshotMock';

chai.use(sinonChai);
const accounts = ['0xc5cdcd5470aef35fc33bddff3f8ecec027f95b1d', '0x2af47a65da8cd66729b4209c22017d6a5c2d2400'];

const createProofManager = () => {
  const sortedAccounts = [...new Set(accounts)].map(acct => ethUtil.toBuffer(ethUtil.addHexPrefix(acct))).sort(Buffer.compare);
  const merkleTree = new MerkleTree(sortedAccounts);
  return new ProofManager(accounts, merkleTree);
}

describe('SnapShot', () => {
  describe('getAccs()', () => {
    it('should generate 25 random addresses', () => {
      const snap = new SnapShot(25);
      expect(snap.getAccs().length).to.eql(25);
    });
  });
})

describe('Proof Manager', () => {
  describe('getProof()', () => {
    it('should fail on non-contained address', async () => {
      const manager = createProofManager();
      try {
        await manager.getProof('0xffcdcd5470aef35fc33bddff3f8ecec027f95b1d');
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).to.contain('Not Found: ');
      }
    });

    it('should allow to get proof', async () => {
      const manager = createProofManager();
      const rsp = await manager.getProof('0xc5cdcd5470aef35fc33bddff3f8ecec027f95b1d');
      expect(rsp).to.eql({
        address: "0xc5cdcd5470aef35fc33bddff3f8ecec027f95b1d",
        proof: [
          "0x8f43fa5e6a0db8fee2f739ecaa44002b61b67a6d2529e85d3fcb1e6baeefda56",
        ]
      });
    });
  });
  describe('getRoot()', () => {
    it('should allow to get root', async () => {
      const manager = createProofManager();
      const rsp = await manager.getRoot();
      expect(rsp).to.eql("0x9ddbd1b1d032ce57a1a87d243e72ba0ef2282dfbcb575711a29e2bc01776ab7b");
    });
  });
});