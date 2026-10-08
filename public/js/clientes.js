let clientes = [];


// ================================
// CARREGAR CLIENTES
// ================================

async function carregarClientes() {

    try {

        const resposta =
            await fetch("/api/clientes");

        clientes =
            await resposta.json();

        mostrarClientes(clientes);

    } catch (erro) {

        console.error(
            "Erro ao carregar clientes:",
            erro
        );

    }

}


// ================================
// MOSTRAR CLIENTES
// ================================

function mostrarClientes(lista) {

    const tabela =
        document.getElementById(
            "clientesTabela"
        );

    const vazio =
        document.getElementById(
            "vazio"
        );

    const total =
        document.getElementById(
            "totalClientes"
        );


    tabela.innerHTML = "";


    total.textContent =
        lista.length === 1
            ? "1 cliente"
            : `${lista.length} clientes`;


    if (lista.length === 0) {

        vazio.style.display = "flex";

        return;

    }


    vazio.style.display = "none";


    lista.forEach(cliente => {

        const linha =
            document.createElement("tr");


        const primeiraLetra =
            cliente.nome
                ? cliente.nome
                    .charAt(0)
                    .toUpperCase()
                : "?";


        const data =
            cliente.criadoEm
                ? new Date(
                    cliente.criadoEm
                ).toLocaleDateString(
                    "pt-BR"
                )
                : "-";


        linha.innerHTML = `

            <td>
                #${cliente.id}
            </td>

            <td>

                <div class="cliente-nome">

                    <div class="avatar">
                        ${primeiraLetra}
                    </div>

                    ${cliente.nome}

                </div>

            </td>

            <td>
                ${cliente.telefone}
            </td>

            <td class="email">
                ${cliente.email || "-"}
            </td>

            <td class="data">
                ${data}
            </td>

        `;


        tabela.appendChild(linha);

    });

}


// ================================
// BUSCA
// ================================

document
    .getElementById("busca")
    .addEventListener(
        "input",
        function () {

            const texto =
                this.value
                    .toLowerCase()
                    .trim();


            const filtrados =
                clientes.filter(cliente =>

                    cliente.nome
                        .toLowerCase()
                        .includes(texto)

                    ||

                    cliente.telefone
                        .toLowerCase()
                        .includes(texto)

                    ||

                    (cliente.email || "")
                        .toLowerCase()
                        .includes(texto)

                );


            mostrarClientes(filtrados);

        }
    );


// ================================
// MODAL
// ================================

function abrirModal() {

    document
        .getElementById("modal")
        .classList.add("show");


    document
        .getElementById("overlay")
        .classList.add("show");


    document
        .getElementById("nome")
        .focus();

}


function fecharModal() {

    document
        .getElementById("modal")
        .classList.remove("show");


    document
        .getElementById("overlay")
        .classList.remove("show");


    document
        .getElementById("clienteForm")
        .reset();


    document
        .getElementById("mensagem")
        .textContent = "";

}


// ================================
// CADASTRAR CLIENTE
// ================================

document
    .getElementById("clienteForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nome =
                document
                    .getElementById("nome")
                    .value
                    .trim();


            const telefone =
                document
                    .getElementById("telefone")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const mensagem =
                document
                    .getElementById("mensagem");


            mensagem.textContent =
                "Cadastrando...";


            try {

                const resposta =
                    await fetch(
                        "/api/clientes",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    nome,
                                    telefone,
                                    email
                                })
                        }
                    );


                const cliente =
                    await resposta.json();


                if (!resposta.ok) {

                    mensagem.textContent =
                        "Não foi possível cadastrar.";

                    return;

                }


                console.log(
                    "Cliente cadastrado:",
                    cliente
                );


                fecharModal();

                carregarClientes();


            } catch (erro) {

                console.error(erro);

                mensagem.textContent =
                    "Erro ao conectar com o servidor.";

            }

        }
    );


// ================================
// MENU MOBILE
// ================================

function abrirMenu() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const overlay =
        document.getElementById(
            "overlay"
        );


    sidebar.classList.toggle(
        "open"
    );


    overlay.classList.toggle(
        "show"
    );

}


// ================================
// SAIR
// ================================

function sair() {

    window.location.href = "/";

}


// ================================
// INICIAR
// ================================

carregarClientes();