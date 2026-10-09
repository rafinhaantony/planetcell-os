
const tabela = document.getElementById("tabelaAparelhos");
const totalAparelhos = document.getElementById("totalAparelhos");
const pesquisa = document.getElementById("pesquisa");
const modal = document.getElementById("modal");
const form = document.getElementById("formAparelho");
const selectCliente = document.getElementById("clienteId");
const mensagem = document.getElementById("mensagem");
const vazio = document.getElementById("vazio");
const botaoSalvar = document.getElementById("salvar");

let aparelhos = [];
let clientes = [];

const campo = id => document.getElementById(id);

function mostrarMensagem(texto, tipo = "sucesso") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;

    if (tipo === "sucesso") {
        setTimeout(() => {
            mensagem.className = "mensagem";
        }, 4000);
    }
}

function criarCelula(texto, classe = "") {
    const td = document.createElement("td");
    td.textContent = texto || "—";

    if (classe) {
        td.className = classe;
    }

    return td;
}

async function carregarClientes() {
    try {
        const resposta = await fetch("/api/clientes");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os clientes.");
        }

        clientes = await resposta.json();

        selectCliente.replaceChildren();

        const opcaoInicial = document.createElement("option");
        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione um cliente";
        selectCliente.appendChild(opcaoInicial);

        clientes.forEach(cliente => {
            const opcao = document.createElement("option");
            opcao.value = cliente.id;
            opcao.textContent = cliente.nome;
            selectCliente.appendChild(opcao);
        });

        if (clientes.length === 0) {
            mostrarMensagem(
                "Cadastre um cliente antes de cadastrar um aparelho.",
                "erro"
            );
        }
    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    }
}

async function carregarAparelhos() {
    try {
        const resposta = await fetch("/api/aparelhos");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os aparelhos.");
        }

        aparelhos = await resposta.json();
        renderizarAparelhos();
    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    }
}

function renderizarAparelhos() {
    const termo = pesquisa.value.trim().toLowerCase();

    const filtrados = aparelhos.filter(aparelho => {
        const texto = [
            aparelho.marca,
            aparelho.modelo,
            aparelho.clienteNome,
            aparelho.defeito
        ].join(" ").toLowerCase();

        return texto.includes(termo);
    });

    tabela.replaceChildren();
    totalAparelhos.textContent = aparelhos.length;
    vazio.style.display = filtrados.length === 0 ? "block" : "none";

    if (aparelhos.length > 0 && filtrados.length === 0) {
        vazio.querySelector("h3").textContent = "Nenhum resultado encontrado";
        vazio.querySelector("p").textContent = "Tente pesquisar com outro termo.";
    } else {
        vazio.querySelector("h3").textContent = "Nenhum aparelho cadastrado";
        vazio.querySelector("p").textContent =
            "Cadastre o primeiro aparelho para começar.";
    }

    filtrados.forEach(aparelho => {
        const tr = document.createElement("tr");

        const tdAparelho = document.createElement("td");
        const nome = document.createElement("span");
        nome.className = "aparelho-nome";
        nome.textContent = aparelho.modelo;

        const marca = document.createElement("span");
        marca.className = "aparelho-marca";
        marca.textContent = aparelho.marca;

        tdAparelho.append(nome, marca);
        tr.appendChild(tdAparelho);

        tr.appendChild(criarCelula(aparelho.clienteNome));
        tr.appendChild(criarCelula(aparelho.defeito));

        const data = aparelho.dataCadastro
            ? new Date(aparelho.dataCadastro).toLocaleDateString("pt-BR")
            : "—";

        tr.appendChild(criarCelula(data));

        const tdAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.className = "acao";
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", () => abrirEdicao(aparelho.id));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.className = "acao excluir";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", () => excluirAparelho(aparelho.id));

        tdAcoes.append(botaoEditar, botaoExcluir);
        tr.appendChild(tdAcoes);

        tabela.appendChild(tr);
    });
}

function abrirModal() {
    modal.classList.add("aberto");
}

function fecharModal() {
    modal.classList.remove("aberto");
}

function abrirNovo() {
    form.reset();
    campo("aparelhoId").value = "";
    campo("tituloModal").textContent = "Novo aparelho";
    botaoSalvar.textContent = "Salvar aparelho";
    abrirModal();
}

function abrirEdicao(id) {
    const aparelho = aparelhos.find(item => item.id === id);

    if (!aparelho) return;

    form.reset();
    campo("aparelhoId").value = aparelho.id;
    selectCliente.value = aparelho.clienteId;
    campo("marca").value = aparelho.marca;
    campo("modelo").value = aparelho.modelo;
    campo("defeito").value = aparelho.defeito;

    campo("tituloModal").textContent = "Editar aparelho";
    botaoSalvar.textContent = "Salvar alterações";

    abrirModal();
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();

    const id = campo("aparelhoId").value;

    const dados = {
        clienteId: selectCliente.value,
        marca: campo("marca").value,
        modelo: campo("modelo").value.trim(),
        defeito: campo("defeito").value.trim()
    };

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        const resposta = await fetch(
            id ? `/api/aparelhos/${encodeURIComponent(id)}` : "/api/aparelhos",
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Não foi possível salvar.");
        }

        fecharModal();
        await carregarAparelhos();

        mostrarMensagem(
            id ? "Aparelho atualizado com sucesso!" : "Aparelho cadastrado com sucesso!"
        );
    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = campo("aparelhoId").value
            ? "Salvar alterações"
            : "Salvar aparelho";
    }
});

async function excluirAparelho(id) {
    const aparelho = aparelhos.find(item => item.id === id);

    if (!aparelho) return;

    const confirmar = window.confirm(
        `Deseja excluir o aparelho ${aparelho.marca} ${aparelho.modelo}?`
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(
            `/api/aparelhos/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Não foi possível excluir.");
        }

        await carregarAparelhos();
        mostrarMensagem("Aparelho excluído com sucesso!");
    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    }
}

campo("botaoNovo").addEventListener("click", abrirNovo);
campo("fecharModal").addEventListener("click", fecharModal);
campo("cancelar").addEventListener("click", fecharModal);

modal.addEventListener("click", evento => {
    if (evento.target === modal) fecharModal();
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharModal();
});

pesquisa.addEventListener("input", renderizarAparelhos);

campo("menuMobile").addEventListener("click", () => {
    campo("sidebar").classList.toggle("aberta");
});

campo("botaoSair").addEventListener("click", () => {
    window.location.href = "/";
});

carregarClientes();
carregarAparelhos();