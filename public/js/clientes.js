
const modal = document.getElementById("modal");
const form = document.getElementById("formCliente");
const tabela = document.getElementById("tabelaClientes");
const pesquisa = document.getElementById("pesquisa");
const mensagem = document.getElementById("mensagem");

let clientes = [];

async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            ...opcoes.headers
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.mensagem || "Ocorreu um erro.");
    }

    return dados;
}

async function carregarClientes() {
    try {
        clientes = await requisicao("/api/clientes");
        renderizarClientes();
    } catch (erro) {
        tabela.innerHTML = `
            <tr><td colspan="5">Não foi possível carregar os clientes.</td></tr>
        `;
        console.error(erro);
    }
}

function abrirModal(cliente = null) {
    form.reset();
    mensagem.textContent = "";

    document.getElementById("clienteId").value =
        cliente ? cliente.id : "";

    document.getElementById("tituloModal").textContent =
        cliente ? "Editar cliente" : "Novo cliente";

    document.getElementById("nome").value =
        cliente?.nome || "";

    document.getElementById("telefone").value =
        cliente?.telefone || "";

    document.getElementById("email").value =
        cliente?.email || "";

    document.getElementById("observacoes").value =
        cliente?.observacoes || "";

    modal.classList.add("aberto");
}

function fecharModal() {
    modal.classList.remove("aberto");
    form.reset();
    mensagem.textContent = "";
}

document.getElementById("botaoNovoCliente")
    .addEventListener("click", () => abrirModal());

document.getElementById("fecharModal")
    .addEventListener("click", fecharModal);

document.getElementById("cancelar")
    .addEventListener("click", fecharModal);

form.addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("clienteId").value;

    const cliente = {
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        observacoes: document.getElementById("observacoes").value
    };

    const botaoSalvar = document.getElementById("salvar");
    botaoSalvar.disabled = true;
    mensagem.textContent = "";

    try {
        await requisicao(
            id ? `/api/clientes/${id}` : "/api/clientes",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(cliente)
            }
        );

        fecharModal();
        await carregarClientes();
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botaoSalvar.disabled = false;
    }
});

function renderizarClientes() {
    const termo = pesquisa.value.trim().toLowerCase();

    const filtrados = clientes.filter(cliente =>
        [cliente.nome, cliente.telefone, cliente.email]
            .some(valor => (valor || "").toLowerCase().includes(termo))
    );

    tabela.replaceChildren();

    if (!filtrados.length) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.className = "sem-dados";
        celula.textContent = termo
            ? "Nenhum cliente encontrado."
            : "Nenhum cliente cadastrado.";

        linha.appendChild(celula);
        tabela.appendChild(linha);
        return;
    }

    filtrados.forEach(cliente => {
        const linha = document.createElement("tr");

        function adicionarCelula(valor) {
            const celula = document.createElement("td");
            celula.textContent = valor || "-";
            linha.appendChild(celula);
        }

        adicionarCelula(cliente.nome);
        adicionarCelula(cliente.telefone);
        adicionarCelula(cliente.email);
        adicionarCelula(cliente.data);

        const celulaAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const editar = document.createElement("button");
        editar.className = "botao-editar";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => abrirModal(cliente));

        const excluir = document.createElement("button");
        excluir.className = "botao-excluir";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirCliente(cliente));

        acoes.append(editar, excluir);
        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);
        tabela.appendChild(linha);
    });
}

async function excluirCliente(cliente) {
    if (!confirm(`Deseja excluir o cliente ${cliente.nome}?`)) {
        return;
    }

    try {
        await requisicao(`/api/clientes/${cliente.id}`, {
            method: "DELETE"
        });

        await carregarClientes();
    } catch (erro) {
        alert(erro.message);
    }
}

pesquisa.addEventListener("input", renderizarClientes);

document.getElementById("menuMobile")
    .addEventListener("click", () => {
        document.getElementById("sidebar")
            .classList.toggle("aberta");
    });

document.getElementById("botaoSair")
    .addEventListener("click", () => {
        window.location.href = "/";
    });

carregarClientes();