let medicamentos = JSON.parse(localStorage.getItem("medicamentos")) || [];
let vendas = JSON.parse(localStorage.getItem("vendasFarmacia")) || [];

function salvarNoStorage() {
  localStorage.setItem("medicamentos", JSON.stringify(medicamentos));
  localStorage.setItem("vendasFarmacia", JSON.stringify(vendas));
}

function salvarMedicamento() {
  const nome = document.getElementById("medNome").value;
  const lote = document.getElementById("medLote").value;
  const validade = document.getElementById("medValidade").value;
  const preco = Number(document.getElementById("medPreco").value);
  const quantidade = Number(document.getElementById("medQuantidade").value);

  if (!nome || !validade || !preco || !quantidade) {
    alert("Preencha todos os campos do medicamento.");
    return;
  }

  medicamentos.push({
    id: Date.now(),
    nome,
    lote,
    validade,
    preco,
    quantidade
  });

  salvarNoStorage();
  limparCamposMedicamento();
  atualizarTabela();
  atualizarSelectVenda();
  atualizarResumo();
}

function limparCamposMedicamento() {
  document.getElementById("medNome").value = "";
  document.getElementById("medLote").value = "";
  document.getElementById("medValidade").value = "";
  document.getElementById("medPreco").value = "";
  document.getElementById("medQuantidade").value = "";
}

function diasParaVencer(dataValidade) {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diffTime = validade - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function atualizarTabela() {
  const tbody = document.querySelector("#tabelaMedicamentos tbody");
  tbody.innerHTML = "";

  medicamentos.forEach(med => {
    const dias = diasParaVencer(med.validade);
    const classeAlerta = dias <= 30 ? "validade-proxima" : "";
    const validadeFormatada = new Date(med.validade + "T00:00:00").toLocaleDateString("pt-BR");

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${med.nome}</td>
      <td>${med.lote}</td>
      <td class="${classeAlerta}">${validadeFormatada}${dias <= 30 ? " ⚠️" : ""}</td>
      <td>${formatarMoeda(med.preco)}</td>
      <td>${med.quantidade}</td>
      <td><button class="btn-excluir" onclick="excluirMedicamento(${med.id})">Excluir</button></td>
    `;
    tbody.appendChild(linha);
  });
}

function excluirMedicamento(id) {
  medicamentos = medicamentos.filter(m => m.id !== id);
  salvarNoStorage();
  atualizarTabela();
  atualizarSelectVenda();
  atualizarResumo();
}

function atualizarSelectVenda() {
  const select = document.getElementById("vendaMedicamento");
  select.innerHTML = "";

  medicamentos.forEach(med => {
    const opcao = document.createElement("option");
    opcao.value = med.id;
    opcao.textContent = `${med.nome} (estoque: ${med.quantidade})`;
    select.appendChild(opcao);
  });
}

function registrarVenda() {
  const idMed = Number(document.getElementById("vendaMedicamento").value);
  const quantidade = Number(document.getElementById("vendaQuantidade").value);

  const med = medicamentos.find(m => m.id === idMed);

  if (!med) {
    alert("Selecione um medicamento.");
    return;
  }

  if (!quantidade || quantidade <= 0) {
    alert("Informe uma quantidade válida.");
    return;
  }

  if (quantidade > med.quantidade) {
    alert("Quantidade maior que o estoque disponível.");
    return;
  }

  med.quantidade -= quantidade;

  vendas.push({
    id: Date.now(),
    medicamento: med.nome,
    quantidade,
    total: med.preco * quantidade
  });

  salvarNoStorage();
  document.getElementById("vendaQuantidade").value = "";
  atualizarTabela();
  atualizarSelectVenda();
  atualizarResumo();
}

function atualizarResumo() {
  const totalVendas = vendas.reduce((soma, v) => soma + v.total, 0);
  const totalEstoque = medicamentos.reduce((soma, m) => soma + m.quantidade, 0);

  document.getElementById("totalVendas").innerHTML =
    `Total vendido: ${formatarMoeda(totalVendas)} (${vendas.length} vendas)`;

  document.getElementById("totalEstoque").innerHTML =
    `Total de itens em estoque: ${totalEstoque} unidades em ${medicamentos.length} medicamentos`;

  const vencendoEmBreve = medicamentos.filter(m => diasParaVencer(m.validade) <= 30);

  if (vencendoEmBreve.length > 0) {
    document.getElementById("alertaValidade").innerHTML =
      `⚠️ ${vencendoEmBreve.length} medicamento(s) vencendo em até 30 dias!`;
  } else {
    document.getElementById("alertaValidade").innerHTML = "";
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Inicialização
atualizarTabela();
atualizarSelectVenda();
atualizarResumo();