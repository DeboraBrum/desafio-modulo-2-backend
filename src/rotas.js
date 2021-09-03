const express = require("express");
const router = express();
const {
  listarContas,
  criarConta,
  atualizarUsuarioConta,
  excluirConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
} = require("./controladores/controlador1");

router.get("/contas", listarContas);
router.post("/contas", criarConta);
router.put("/contas/:numeroConta/usuario", atualizarUsuarioConta);
router.delete("/contas/:numeroConta", excluirConta);
router.post("/transacoes/depositar", depositar);
router.post("/transacoes/sacar", sacar);
router.post("/transacoes/transferir", transferir);
router.get("/contas/saldo", saldo);
router.get("/contas/extrato", extrato);

module.exports = router;
