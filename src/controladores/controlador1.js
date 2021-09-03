const dados = require("../bancodedados");
const { depositos, saques, transferencias } = dados;

const {
  conferirSenhaBanco,
  encontrarCpf,
  encontrarConta,
  encontrarEmail,
  verficarNumeroValido,
} = require("./verificacoes");

const {
  registro,
  registroTransferencia,
  filtroPelaConta,
  filtroPelaContaOrig,
  filtroPelaContaDest,
} = require("./registros");

let numeroConta = dados.contas.length;

async function listarContas(req, res) {
  if (!req.query.senha_banco) {
    return res
      .status(400)
      .json({ mensagem: "Acesso apenas para pessoas permitidas" });
  }
  if (conferirSenhaBanco(req.query.senha_banco)) {
    res.status(200).json(dados.contas);
  } else {
    res.status(400).json({ mensagem: "Você informou a senha incorreta" });
  }
}

async function criarConta(req, res) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }

  if (encontrarCpf(cpf)) {
    return res
      .status(400)
      .json({ mensagem: "Já existe uma conta registrada com esse cpf" });
  }
  if (encontrarEmail(email)) {
    return res
      .status(400)
      .json({ mensagem: "Já existe uma conta registrada com esse email" });
  }
  numeroConta++;

  const novaConta = {
    numero: numeroConta.toString(),
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    },
  };

  dados.contas.push(novaConta);

  res.status(201).json(novaConta);
}

async function atualizarUsuarioConta(req, res) {
  const { numeroConta } = req.params;
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  //Verificações
  if (!verficarNumeroValido(Number(numeroConta))) {
    return res
      .status(400)
      .json({ mensagem: "Esse número de conta não é válido" });
  }

  if (encontrarConta(numeroConta) === -1) {
    return res.status(404).json({
      mensagem: "Não encontramos essa conta em nosso banco de dados.",
    });
  }
  if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha) {
    return res.status(400).json({
      mensagem:
        "É necessário informar algum dado do usuário para realizar a atualização.",
    });
  }

  if (
    cpf !== dados.contas[encontrarConta(numeroConta)].usuario.cpf &&
    encontrarCpf(cpf)
  ) {
    return res
      .status(400)
      .json({ mensagem: "Já existe uma conta registrada com esse cpf" });
  }
  if (
    email !== dados.contas[encontrarConta(numeroConta)].usuario.email &&
    encontrarEmail(email)
  ) {
    return res
      .status(400)
      .json({ mensagem: "Já existe uma conta registrada com esse email" });
  }
  //Alterações
  const usuarioAtualizado = {
    nome: nome || dados.contas[encontrarConta(numeroConta)].usuario.nome,
    cpf: cpf || dados.contas[encontrarConta(numeroConta)].usuario.cpf,
    data_nascimento:
      data_nascimento ||
      dados.contas[encontrarConta(numeroConta)].usuario.data_nascimento,
    telefone:
      telefone || dados.contas[encontrarConta(numeroConta)].usuario.telefone,
    email: email || dados.contas[encontrarConta(numeroConta)].usuario.email,
    senha: senha || dados.contas[encontrarConta(numeroConta)].usuario.senha,
  };

  dados.contas[encontrarConta(numeroConta)].usuario = usuarioAtualizado;

  //Resposta Final
  res.status(200).json({ mensagem: "Conta atualizada com sucesso" });
}

async function excluirConta(req, res) {
  const { numeroConta } = req.params;
  //Verificações
  if (!verficarNumeroValido(Number(numeroConta))) {
    return res
      .status(400)
      .json({ mensagem: "Esse número de conta não é válido" });
  }
  const indiceConta = encontrarConta(numeroConta);
  if (indiceConta === -1) {
    return res
      .status(404)
      .json({ mensagem: "Não encontramos essa conta em nossos dados." });
  }

  if (dados.contas[indiceConta].saldo > 0) {
    return res.status(400).json({
      mensagem:
        "Essa conta possui saldo positivo, por isso não é possível excluí-la",
    });
  }
  // Exclusão
  dados.contas.splice(indiceConta, 1);

  res.status(200).json({ mensagem: "Conta excluída com sucesso!" });
}

async function depositar(req, res) {
  const { numero_conta, valor } = req.body;
  //Verificações
  if (!numero_conta || !valor) {
    return res
      .status(400)
      .json({ mensagem: "É necessário preencher todos os campos" });
  }
  const indiceConta = encontrarConta(numero_conta);
  if (indiceConta === -1) {
    return res
      .status(404)
      .json({ mensagem: "Não encontramos essa conta em nossos dados." });
  }
  if (Number(valor) <= 0) {
    return res.status(400).json({
      mensagem:
        "O valor precisa ser maior que zero para o depósito ser efetuado",
    });
  }
  //Adição no saldo
  dados.contas[indiceConta].saldo += Number(valor);

  //Registro - A função retorna o objeto do exemplo
  const dateNow = new Date();
  depositos.push(registro(dateNow, numero_conta, valor));

  return res.status(200).json({ mensagem: "Depósito realizado com sucesso!" });
}

async function sacar(req, res) {
  const { numero_conta, valor, senha } = req.body;
  //Verificações
  if (!numero_conta || !valor || !senha) {
    return res
      .status(400)
      .json({ mensagem: "É necessário preencher todos os campos" });
  }
  const indiceConta = encontrarConta(numero_conta);
  if (indiceConta === -1) {
    return res
      .status(404)
      .json({ mensagem: "Não encontramos essa conta em nossos dados." });
  }
  if (senha !== dados.contas[indiceConta].usuario.senha) {
    return res.status(400).json({ mensagem: "Senha incorreta" });
  }
  if (Number(valor) <= 0) {
    return res.status(400).json({
      mensagem: "O valor precisa ser maior ou igual a zero",
    });
  }
  if (dados.contas[indiceConta].saldo < Number(valor)) {
    return res.status(400).json({ mensagem: "Saldo insuficiente" });
  }
  //Saque no saldo
  dados.contas[indiceConta].saldo -= Number(valor);

  //Registro
  const dateNow = new Date();
  saques.push(registro(dateNow, numero_conta, valor));

  return res.status(200).json({ mensagem: "Saque realizado com sucesso!" });
}

async function transferir(req, res) {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
  //Verificações
  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return res
      .status(400)
      .json({ mensagem: "É necessário preencher todos os campos" });
  }

  const indiceContaOrigem = encontrarConta(numero_conta_origem);
  const indiceContaDestino = encontrarConta(numero_conta_destino);

  if (indiceContaOrigem === -1) {
    return res
      .status(404)
      .json({ mensagem: "Não encontramos a conta de origem em nossos dados." });
  }
  if (indiceContaDestino === -1) {
    return res.status(404).json({
      mensagem: "Não encontramos a conta de destino em nossos dados.",
    });
  }
  if (Number(valor) <= 0) {
    return res.status(400).json({
      mensagem: "O valor precisa ser maior ou igual a zero",
    });
  }
  if (dados.contas[indiceContaOrigem].usuario.senha !== senha) {
    return res.status(400).json({ mensagem: "Senha incorreta" });
  }
  if (dados.contas[indiceContaOrigem].saldo < Number(valor)) {
    return res.status(400).json({ mensagem: "Saldo insuficiente" });
  }

  //Saque e depósito nas contas
  dados.contas[indiceContaOrigem].saldo -= Number(valor);
  dados.contas[indiceContaDestino].saldo += Number(valor);

  //Registro
  const dateNow = new Date();

  transferencias.push(
    registroTransferencia(
      dateNow,
      numero_conta_origem,
      numero_conta_destino,
      valor
    )
  );

  return res
    .status(200)
    .json({ mensagem: "Transferência realizada com sucesso!" });
}

async function saldo(req, res) {
  const { numero_conta, senha } = req.query;
  //Verificações
  if (!numero_conta || !senha) {
    return res
      .status(400)
      .json({ mensagem: "É necessário preencher todos os campos" });
  }
  const indiceConta = encontrarConta(numero_conta);
  if (indiceConta === -1) {
    return res
      .status(404)
      .json({ mensagem: "Não encontramos essa conta em nossos dados." });
  }
  if (senha !== dados.contas[indiceConta].usuario.senha) {
    return res.status(400).json({ mensagem: "Senha incorreta." });
  }
  return res.status(200).json({ saldo: dados.contas[indiceConta].saldo });
}

async function extrato(req, res) {
  const { numero_conta, senha } = req.query;
  //Verificações
  if (!numero_conta || !senha) {
    return res
      .status(400)
      .json({ mensagem: "É necessário preencher todos os campos" });
  }
  const indiceConta = encontrarConta(numero_conta);
  if (indiceConta === -1) {
    return res
      .status(404)
      .json({ mensagem: "Não encontramos essa conta em nossos dados." });
  }
  if (senha !== dados.contas[indiceConta].usuario.senha) {
    return res.status(400).json({ mensagem: "Senha incorreta." });
  }

  const depositosConta = filtroPelaConta(depositos, numero_conta);
  const saquesConta = filtroPelaConta(saques, numero_conta);
  const transferenciasEnviadasConta = filtroPelaContaOrig(
    transferencias,
    numero_conta
  );
  const transferenciasRecebidasConta = filtroPelaContaDest(
    transferencias,
    numero_conta
  );

  return res.status(200).json({
    depositos: depositosConta,
    saques: saquesConta,
    transferenciasEnviadas: transferenciasEnviadasConta,
    transferenciasRecebidas: transferenciasRecebidasConta,
  });
}

module.exports = {
  listarContas,
  criarConta,
  atualizarUsuarioConta,
  excluirConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
};
