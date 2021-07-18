import "./index.scss";
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privateKey = document.getElementById("private-key").value;

  let body = { sender, amount, recipient };
  const msg = JSON.stringify(body);
  const bodyHash = SHA256(msg);
  const key = ec.keyFromPrivate(privateKey);
  const signature = key.sign(bodyHash.toString());
  body.signature = {
    r: signature.r.toString(16),
    s: signature.s.toString(16)
  };
  body.msg = msg;

  const request = new Request(`${server}/send`, { method: 'POST', body: JSON.stringify(body) });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    if (response.status >= 200 && response.status <= 299) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  }).catch((error) => {
    console.log(error);
  })
});
