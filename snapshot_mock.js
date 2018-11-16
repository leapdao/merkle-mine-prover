const crypto = require('crypto');

class SnapShot {
  constructor(length) {
    this.accounts = [];
    for (let i = 0; i < length; i++) {
      this.accounts.push(`0x${crypto.randomBytes(20).toString('hex')}`);
    }
  }

  getAccs() {
    return this.accounts
  }
}

export default SnapShot;


