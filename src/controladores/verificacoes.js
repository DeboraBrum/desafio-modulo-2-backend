const dados = require("../bancodedados");

function conferirSenhaBanco(senha) {
  return senha === dados.banco.senha ? true : false;
}

function encontrarCpf(cpf) {
  //retorna true se já existir cpf nos dados
  const encontrado = dados.contas.find((item) => item.usuario.cpf === cpf);
  return encontrado ? true : false;
}
function encontrarEmail(email) {
  const encontrado = dados.contas.find((item) => item.usuario.email === email);
  return encontrado ? true : false;
}
function encontrarConta(numero) {
  const indiceConta = dados.contas.findIndex((item) => item.numero === numero);
  return indiceConta;
}
function verficarNumeroValido(numero) {
  //Se for NaN, retorna false
  return Number.isNaN(numero) ? false : true;
}

module.exports = {
  conferirSenhaBanco,
  encontrarCpf,
  encontrarConta,
  encontrarEmail,
  verficarNumeroValido,
};
