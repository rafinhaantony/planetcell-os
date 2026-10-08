let ordens = [];
let clientes = [];
let aparelhos = [];


// ================================
// CARREGAR DADOS
// ================================

async function carregarDados() {

    try {

        await carregarClientes();

        await carregarAparelhos();

        await carregarOrdens();

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

    }

}


// ================================
// CLIENTES
// ================================

async function carregarClientes() {

    const resposta =
        await fetch("/api/clientes");

    clientes =
        await resposta.json();

    const select =
        document.getElementById("clienteId");

    select.innerHTML =
        '<option value="">Selecione o cliente</option>';

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
// APARELHOS
// ================================

async function carregarAparelhos() {

    const resposta =
        await fetch("/api/aparelhos");

    aparelhos =
        await resposta.json();

}


// ================================
// APARELHOS DO CLIENTE
// ================================

function carregarAparelhosDoCliente() {

    const clienteId =
        Number(
            document.getElementById(
                "clienteId"
            ).value
        );

    const select =
        document.getElementById(
            "aparelhoId"
        );

    select.innerHTML =
        '<option value="">Selecione o aparelho</option>';


    if (!clienteId) {

        select.innerHTML =
            '<option value="">Selecione primeiro o cliente</option>';

        return;

    }


    const aparelhosCliente =
        aparelhos.filter(
            aparelho =>
                Number(aparelho.clienteId) ===
                clienteId
        );


    if (
        aparelhosCliente.length === 0
    ) {

        select.innerHTML =
            '<option value="">Nenhum aparelho cadastrado</option>';

        return;

    }


    aparelhosCliente.forEach(aparelho => {

        const option =
            document.createElement("option");

        option.value =
            aparelho.id;

        option.textContent =
            `${aparelho.marca} ${aparelho.modelo}`;

        select.appendChild(option);

    });

}


// ================================
// ORDENS
// ================================

async function carregarOrdens() {

    const resposta =
        await fetch("/api/ordens");

    ordens =
        await resposta.json();

    atualizarResumo();

    renderizarOrdens();

}


// ================================
// RESUMO
// ================================

function atualizarResumo() {

    document.getElementById(
        "totalOS"
    ).textContent =
        ordens.length;


    const andamento =
        ordens.filter(ordem =>
            ordem.status !== "Finalizado" &&
            ordem.status !== "Entregue"
        ).length;


    const finalizadas =
        ordens.filter(ordem =>
            ordem.status === "Finalizado" ||
            ordem.status === "Entregue"
        ).length;


    document.getElementById(
        "emAndamento"
    ).textContent =
        andamento;


    document.getElementById(
        "finalizadas"
    ).textContent =
        finalizadas;

}


// ================================
// RENDERIZAR
// ================================

function renderizarOrdens(lista = ordens) {

    const tabela =
        document.getElementById(
            "listaOrdens"
        );

    const vazio =
        document.getElementById(
            "vazio"
        );


    tabela.innerHTML = "";


    if (lista.length === 0) {

        vazio.style.display =
            "block";

        return;

    }


    vazio.style.display =
        "none";


    lista
        .slice()
        .reverse()
        .forEach(ordem => {

            const cliente =
                clientes.find(
                    c =>
                        Number(c.id) ===
                        Number(ordem.clienteId)
                );


            const aparelho =
                aparelhos.find(
                    a =>
                        Number(a.id) ===
                        Number(ordem.aparelhoId)
                );


            const tr =
                document.createElement("tr");

            tr.style.cursor = "pointer";

            tr.onclick = function() {

                abrirDetalhesOS(ordem.id);

            };
            
            tr.innerHTML = `

                <td>
                    <strong>
                        #${ordem.id}
                    </strong>
                </td>

                <td>
                    ${cliente
                        ? cliente.nome
                        : "Cliente não encontrado"
                    }
                </td>

                <td>
                    ${
                        aparelho
                            ? `${aparelho.marca} ${aparelho.modelo}`
                            : "Aparelho não encontrado"
                    }
                </td>

                <td>
                    ${ordem.descricao || "-"}
                </td>

                <td>
                    R$ ${formatarValor(ordem.valor)}
                </td>

                <td>
                    ${criarStatus(ordem.status)}
                </td>

                <td>
                    ${formatarData(ordem.criadoEm)}
                </td>

            `;


            tabela.appendChild(tr);

        });

}


// ================================
// STATUS
// ================================

function criarStatus(status) {

    let classe =
        "status-recebido";


    if (status === "Em análise") {

        classe =
            "status-analise";

    }


    if (status === "Em manutenção") {

        classe =
            "status-manutencao";

    }


    if (
        status === "Finalizado" ||
        status === "Entregue"
    ) {

        classe =
            "status-finalizado";

    }


    return `
        <span class="status ${classe}">
            ${status}
        </span>
    `;

}


// ================================
// BUSCA
// ================================

function filtrarOrdens() {

    const termo =
        document.getElementById(
            "busca"
        ).value
        .toLowerCase()
        .trim();


    if (!termo) {

        renderizarOrdens();

        return;

    }


    const filtradas =
        ordens.filter(ordem => {

            const cliente =
                clientes.find(
                    c =>
                        Number(c.id) ===
                        Number(ordem.clienteId)
                );


            const aparelho =
                aparelhos.find(
                    a =>
                        Number(a.id) ===
                        Number(ordem.aparelhoId)
                );


            const texto = `

                ${ordem.id}

                ${ordem.descricao}

                ${ordem.status}

                ${cliente?.nome || ""}

                ${cliente?.telefone || ""}

                ${aparelho?.marca || ""}

                ${aparelho?.modelo || ""}

            `.toLowerCase();


            return texto.includes(
                termo
            );

        });


    renderizarOrdens(
        filtradas
    );

}


// ================================
// MODAL
// ================================

function abrirModal() {

    const mensagem =
        document.getElementById(
            "mensagem"
        );

    mensagem.textContent = "";


    document.getElementById(
        "formOS"
    ).reset();


    document.getElementById(
        "aparelhoId"
    ).innerHTML =
        '<option value="">Selecione primeiro o cliente</option>';


    document.getElementById(
        "modal"
    ).classList.add("ativo");

}


function fecharModal() {

    document.getElementById(
        "modal"
    ).classList.remove("ativo");

}


// ================================
// CRIAR OS
// ================================

document
    .getElementById("formOS")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const clienteId =
                Number(
                    document.getElementById(
                        "clienteId"
                    ).value
                );


            const aparelhoId =
                Number(
                    document.getElementById(
                        "aparelhoId"
                    ).value
                );


            const descricao =
                document.getElementById(
                    "descricao"
                ).value;


            const diagnostico =
                document.getElementById(
                    "diagnostico"
                ).value;


            const valor =
                Number(
                    document.getElementById(
                        "valor"
                    ).value
                ) || 0;


            const observacoes =
                document.getElementById(
                    "observacoes"
                ).value;


            const mensagem =
                document.getElementById(
                    "mensagem"
                );


            if (
                !clienteId ||
                !aparelhoId ||
                !descricao
            ) {

                mensagem.textContent =
                    "Preencha todos os campos obrigatórios.";

                return;

            }


            mensagem.style.color =
                "#2563eb";

            mensagem.textContent =
                "Criando ordem de serviço...";


            try {

                const resposta =
                    await fetch(
                        "/api/ordens",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                             body:
                            JSON.stringify({

                                clienteId:
                                    clienteId,

                                aparelhoId:
                                    aparelhoId,

                                descricao:
                                    descricao,

                                diagnostico:
                                    diagnostico,

                                valor:
                                    valor,

                                observacoes:
                                    observacoes

                            })
                        }
                    );


                const novaOrdem =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        "Erro ao criar OS."
                    );

                }


                ordens.push(
                    novaOrdem
                );


                atualizarResumo();

                renderizarOrdens();


                fecharModal();


            } catch (erro) {

                console.error(
                    erro
                );

                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "Não foi possível criar a OS.";

            }

        }
    );


// ================================
// FORMATAR VALOR
// ================================

function formatarValor(valor) {

    return Number(valor || 0)
        .toFixed(2)
        .replace(".", ",");

}


// ================================
// FORMATAR DATA
// ================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const dataObj =
        new Date(data);


    return dataObj.toLocaleDateString(
        "pt-BR"
    );

}


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

// ================================
// DETALHES DA OS
// ================================

let ordemSelecionada = null;


function abrirDetalhesOS(id) {

    const ordem =
        ordens.find(
            ordem =>
                Number(ordem.id) ===
                Number(id)
        );


    if (!ordem) {

        alert(
            "Ordem não encontrada."
        );

        return;

    }


    ordemSelecionada =
        ordem;


    const cliente =
        clientes.find(
            cliente =>
                Number(cliente.id) ===
                Number(ordem.clienteId)
        );


    const aparelho =
        aparelhos.find(
            aparelho =>
                Number(aparelho.id) ===
                Number(ordem.aparelhoId)
        );


    document.getElementById(
        "detalhesTitulo"
    ).textContent =
        `OS #${ordem.id}`;


    document.getElementById(
        "detalhesCliente"
    ).textContent =
        cliente
            ? cliente.nome
            : "Não encontrado";


    document.getElementById(
        "detalhesAparelho"
    ).textContent =
        aparelho
            ? `${aparelho.marca} ${aparelho.modelo}`
            : "Não encontrado";


    document.getElementById(
        "detalhesData"
    ).textContent =
        formatarData(
            ordem.criadoEm
        );


    document.getElementById(
        "detalhesValor"
    ).textContent =
        `R$ ${formatarValor(ordem.valor)}`;


    document.getElementById(
        "detalhesDescricao"
    ).textContent =
        ordem.descricao ||
        "Nenhuma descrição";


    document.getElementById(
        "editarDiagnostico"
    ).value =
        ordem.diagnostico || "";


    document.getElementById(
        "editarValor"
    ).value =
        ordem.valor || 0;


    document.getElementById(
        "editarStatus"
    ).value =
        ordem.status;


    document.getElementById(
        "editarObservacoes"
    ).value =
        ordem.observacoes || "";


    document.getElementById(
        "mensagemDetalhes"
    ).textContent =
        "";


    document.getElementById(
        "modalDetalhes"
    ).classList.add(
        "ativo"
    );

}


// ================================
// FECHAR DETALHES
// ================================

function fecharDetalhes() {

    document.getElementById(
        "modalDetalhes"
    ).classList.remove(
        "ativo"
    );

    ordemSelecionada =
        null;

}


// ================================
// SALVAR ALTERAÇÕES
// ================================

async function salvarDetalhesOS() {

    if (!ordemSelecionada) {

        return;

    }


    const diagnostico =
        document.getElementById(
            "editarDiagnostico"
        ).value;


    const valor =
        Number(
            document.getElementById(
                "editarValor"
            ).value
        ) || 0;


    const status =
        document.getElementById(
            "editarStatus"
        ).value;


    const observacoes =
        document.getElementById(
            "editarObservacoes"
        ).value;


    const mensagem =
        document.getElementById(
            "mensagemDetalhes"
        );


    mensagem.style.color =
        "#2563eb";

    mensagem.textContent =
        "Salvando alterações...";


    try {

        const resposta =
            await fetch(
                `/api/ordens/${ordemSelecionada.id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            diagnostico:
                                diagnostico,

                            valor:
                                valor,

                            status:
                                status,

                            observacoes:
                                observacoes

                        })

                }
            );


        const ordemAtualizada =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                ordemAtualizada.mensagem ||
                "Erro ao atualizar."
            );

        }


        const indice =
            ordens.findIndex(
                ordem =>
                    Number(ordem.id) ===
                    Number(ordemAtualizada.id)
            );


        if (indice !== -1) {

            ordens[indice] =
                ordemAtualizada;

        }


        atualizarResumo();

        renderizarOrdens();


        mensagem.style.color =
            "#16a34a";

        mensagem.textContent =
            "Alterações salvas!";


        setTimeout(
            fecharDetalhes,
            700
        );


    } catch (erro) {

        console.error(
            erro
        );

        mensagem.style.color =
            "#dc2626";

        mensagem.textContent =
            "Não foi possível salvar.";

    }

}