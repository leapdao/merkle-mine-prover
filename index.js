import ProofManager from './src/index';
import ethUtil from 'ethereumjs-util';
import MerkleTree from './src/merkleTree';

const accounts = ['0xc5cdcd5470aef35fc33bddff3f8ecec027f95b1d', '0x2af47a65da8cd66729b4209c22017d6a5c2d2400', '0x2eE5ADa0d47EC41e4C1c8dE55a83469825974A26'];
let sortedAccounts;
let merkleTree;

exports.handler = async function handler(event, context, callback) {
  const path = event.context['resource-path'];
  if (!sortedAccounts) {
    sortedAccounts = [...new Set(accounts)].map(acct => ethUtil.toBuffer(ethUtil.addHexPrefix(acct))).sort(Buffer.compare);
  }
  if (!merkleTree) {
    merkleTree = new MerkleTree(sortedAccounts);
  }
  const manager = new ProofManager(accounts, merkleTree);
  const getRequestHandler = () => {
    if (path.indexOf('address') > -1) {
      return manager.getProof(event.params.path.address);
    }
    return Promise.reject(`Not Found: unexpected path: ${path}`);
  };
  try {
    getRequestHandler()
      .then(data => callback(null, data))
      .catch(err => {console.log(err); callback(err);});
  } catch (err) {
    conosle.log('err');
    callback(err);
  }
};
