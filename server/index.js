const express = require('express');
const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const { SHA256 } = require('crypto-js');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const ec = new EC('secp256k1');

const balanceAmounts = [100, 50, 75];
let balances = {};
for (let i=0; i<3; i++) {
  const key = ec.genKeyPair();
  const publicKey = key.getPublic().encode('hex');
  const privateKey = key.getPrivate().toString(16);
  balances[publicKey] = balanceAmounts[i];
  console.log("Public key: ", publicKey);
  console.log("Private key: ", privateKey);
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, msg, signature} = req.body;
  const msgHash = SHA256(msg).toString();
  const key = ec.keyFromPublic(sender, 'hex');
  if (key.verify(msgHash, signature)) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  } else {
    res.status(400).json({error: 'Could not verify signature.'});
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
