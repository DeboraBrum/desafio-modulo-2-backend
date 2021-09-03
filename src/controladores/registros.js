const dados = require("../bancodedados");
const { format } = require("date-fns");

function registro(data, numeroConta, valor) {
  const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss");

  const registroFeito = {
    data: dataFormatada,
    numero_conta: numeroConta,
    valor: Number(valor),
  };
  return registroFeito;
}
function registroTransferencia(data, contaOrigem, contaDestino, valor) {
  const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss");

  const registroFeito = {
    data: dataFormatada,
    numero_conta_origem: contaOrigem,
    numero_conta_destino: contaDestino,
    valor: Number(valor),
  };
  return registroFeito;
}

function filtroPelaConta(array, numero_conta) {
  return array.filter((item) => item.numero_conta === numero_conta);
}
function filtroPelaContaOrig(array, numero_conta) {
  return array.filter((item) => item.numero_conta_origem === numero_conta);
}
function filtroPelaContaDest(array, numero_conta) {
  return array.filter((item) => item.numero_conta_destino === numero_conta);
}
module.exports = {
  registro,
  registroTransferencia,
  filtroPelaConta,
  filtroPelaContaOrig,
  filtroPelaContaDest,
};
