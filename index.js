import ProofManager from './src/index';
import ethUtil from 'ethereumjs-util';
import MerkleTree from './src/merkleTree';
//import SnapShot from './src/snapshotMock';
import SnapShot from './src/snapshot';

const accounts = new SnapShot(1500000).getAccs();
let sortedAccounts;
let merkleTree;

exports.handler = async function handler(event, context, callback) {
  const path = event.context['resource-path'];
  try {
    if (!sortedAccounts) {
      sortedAccounts = [...new Set(accounts)].map(acct => ethUtil.toBuffer(ethUtil.addHexPrefix(acct))).sort(Buffer.compare);
    }
    if (!merkleTree) {
      merkleTree = new MerkleTree(sortedAccounts);
    }
  } catch (err) {
    conosle.log('err');
    callback(err);
  }
  const manager = new ProofManager(accounts, merkleTree);
  const getRequestHandler = () => {
    if (path.indexOf('address') > -1) {
      return manager.getProof(event.params.path.address);
    }
    if (path.indexOf('root') > -1) {
      return manager.getRoot();
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
