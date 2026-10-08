let aparelhos = [];

let clientes = [];


// ================================
// CARREGAR DADOS
// ================================

async function carregarDados() {

    await carregarClientes();

    await carregarAparelhos();

}


// ================================
// CARREGAR CLIENTES
// ================================

async function carregarClientes() {

    try {

        const resposta =
            await fetch("/api/clientes");


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar clientes."
            );

        }


        clientes =
            await resposta.json();


        preencherClientes();

    } catch (erro) {

        console.error(
            "Erro ao carregar clientes:",
            erro
        );

    }

}


// ================================
// PREENCHER SELECT DE CLIENTES
// ================================

function preencherClientes() {

    const select =
        document.getElementById(
            "clienteId"
        );


    select.innerHTML = `

        <option value="">
            Selecione um cliente
        </option>

    `;


    clientes.forEach(cliente => {

        const option =
            document.createElement("option");


        option.value =
            cliente.id;


        option.textContent =
            `${cliente.nome} — ${cliente.telefone}`;


        select.appendChild(option);

    });

}


// ================================
// CARREGAR APARELHOS
// ================================

async function carregarAparelhos() {

    try {

        const resposta =
            await fetch("/api/aparelhos");


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar aparelhos."
            );

        }


        aparelhos =
            await resposta.json();


        mostrarAparelhos(
            aparelhos
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar aparelhos:",
            erro
        );

    }

}


// ================================
// ENCONTRAR CLIENTE
// ================================

function encontrarCliente(id) {

    return clientes.find(
        cliente =>
            Number(cliente.id) === Number(id)
    );

}


// ================================
// MOSTRAR APARELHOS
// ================================

function mostrarAparelhos(lista) {

    const tabela =
        document.getElementById(
            "aparelhosTabela"
        );


    const vazio =
        document.getElementById(
            "vazio"
        );


    const total =
        document.getElementById(
            "totalAparelhos"
        );


    tabela.innerHTML = "";


    total.textContent =
        lista.length === 1
            ? "1 aparelho"
            : `${lista.length} aparelhos`;


    if (lista.length === 0) {

        vazio.style.display =
            "flex";

        return;

    }


    vazio.style.display =
        "none";


    lista.forEach(aparelho => {

        const linha =
            document.createElement("tr");


        const cliente =
            encontrarCliente(
                aparelho.clienteId
            );


        const nomeCliente =
            cliente
                ? cliente.nome
                : "Cliente não encontrado";


        const primeiraLetra =
            nomeCliente
                .charAt(0)
                .toUpperCase();


        const defeito =
            aparelho.defeito ||
            "Não informado";


        linha.innerHTML = `

            <td>
                #${aparelho.id}
            </td>


            <td>

                <div class="cliente">

                    <div class="avatar">
                        ${primeiraLetra}
                    </div>

                    ${nomeCliente}

                </div>

            </td>


            <td>

                <div class="aparelho">

                    <strong>
                        ${aparelho.modelo}
                    </strong>

                    <span>
                        ${aparelho.marca}
                    </span>

                </div>

            </td>


            <td>

                <span class="imei">

                    ${aparelho.imei || "-"}

                </span>

            </td>


            <td>

                <div class="defeito">

                    ${defeito}

                </div>

            </td>


            <td>

                <span class="status">

                    <span class="status-dot"></span>

                    ${aparelho.status}

                </span>

            </td>

        `;


        tabela.appendChild(
            linha
        );

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
                aparelhos.filter(
                    aparelho => {

                        const cliente =
                            encontrarCliente(
                                aparelho.clienteId
                            );


                        const nomeCliente =
                            cliente
                                ? cliente.nome
                                : "";


                        return (

                            nomeCliente
                                .toLowerCase()
                                .includes(texto)

                            ||

                            (aparelho.marca || "")
                                .toLowerCase()
                                .includes(texto)

                            ||

                            (aparelho.modelo || "")
                                .toLowerCase()
                                .includes(texto)

                            ||

                            (aparelho.imei || "")
                                .toLowerCase()
                                .includes(texto)

                        );

                    }
                );


            mostrarAparelhos(
                filtrados
            );

        }
    );


// ================================
// ABRIR MODAL
// ================================

function abrirModal() {

    if (clientes.length === 0) {

        alert(
            "Cadastre pelo menos um cliente antes de cadastrar um aparelho."
        );

        return;

    }


    document
        .getElementById("modal")
        .classList.add("show");


    document
        .getElementById("overlay")
        .classList.add("show");


    document
        .getElementById("modelo")
        .focus();

}


// ================================
// FECHAR MODAL
// ================================

function fecharModal() {

    document
        .getElementById("modal")
        .classList.remove("show");


    document
        .getElementById("overlay")
        .classList.remove("show");


    document
        .getElementById("aparelhoForm")
        .reset();


    document
        .getElementById("mensagem")
        .textContent = "";

}


// ================================
// CADASTRAR APARELHO
// ================================

document
    .getElementById("aparelhoForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const clienteId =
                document
                    .getElementById(
                        "clienteId"
                    )
                    .value;


            const marca =
                document
                    .getElementById(
                        "marca"
                    )
                    .value;


            const modelo =
                document
                    .getElementById(
                        "modelo"
                    )
                    .value
                    .trim();


            const imei =
                document
                    .getElementById(
                        "imei"
                    )
                    .value
                    .trim();


            const defeito =
                document
                    .getElementById(
                        "defeito"
                    )
                    .value
                    .trim();


            const mensagem =
                document
                    .getElementById(
                        "mensagem"
                    );


            mensagem.textContent =
                "Cadastrando aparelho...";


            try {

                const resposta =
                    await fetch(
                        "/api/aparelhos",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    clienteId:
                                        Number(
                                            clienteId
                                        ),

                                    marca,

                                    modelo,

                                    imei,

                                    defeito

                                })

                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    mensagem.textContent =
                        dados.mensagem ||
                        "Não foi possível cadastrar o aparelho.";

                    return;

                }


                fecharModal();


                await carregarAparelhos();


            } catch (erro) {

                console.error(
                    "Erro ao cadastrar aparelho:",
                    erro
                );


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

carregarDados();