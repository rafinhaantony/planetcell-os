// ================================
// CARREGAR DASHBOARD
// ================================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch("/api/dashboard");

        const dados =
            await resposta.json();


        document.getElementById("clientes")
            .textContent = dados.clientes;


        document.getElementById("aparelhos")
            .textContent = dados.aparelhos;


        document.getElementById("ordens")
            .textContent = dados.ordens;


        document.getElementById("concluidos")
            .textContent = dados.concluidos;


        carregarOrdens();

    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


// ================================
// CARREGAR ORDENS
// ================================

async function carregarOrdens() {

    try {

        const resposta =
            await fetch("/api/ordens");

        const ordens =
            await resposta.json();


        atualizarStatus(ordens);

        mostrarOrdens(ordens);

    } catch (erro) {

        console.error(
            "Erro ao carregar ordens:",
            erro
        );

    }

}


// ================================
// STATUS
// ================================

function atualizarStatus(ordens) {

    let recebido = 0;

    let analise = 0;

    let manutencao = 0;

    let finalizado = 0;


    ordens.forEach(ordem => {

        if (ordem.status === "Recebido") {

            recebido++;

        }

        else if (
            ordem.status === "Em análise"
        ) {

            analise++;

        }

        else if (
            ordem.status === "Em manutenção"
        ) {

            manutencao++;

        }

        else if (
            ordem.status === "Finalizado"
        ) {

            finalizado++;

        }

    });


    document.getElementById(
        "statusRecebido"
    ).textContent = recebido;


    document.getElementById(
        "statusAnalise"
    ).textContent = analise;


    document.getElementById(
        "statusManutencao"
    ).textContent = manutencao;


    document.getElementById(
        "statusFinalizado"
    ).textContent = finalizado;

}


// ================================
// MOSTRAR ORDENS
// ================================

function mostrarOrdens(ordens) {

    const lista =
        document.getElementById(
            "ordensLista"
        );


    if (ordens.length === 0) {

        return;

    }


    const ultimas =
        ordens
            .slice()
            .reverse()
            .slice(0, 5);


    lista.innerHTML = "";


    ultimas.forEach(ordem => {

        const item =
            document.createElement("div");


        item.className =
            "order-item";


        item.innerHTML = `

            <div class="order-icon">
                🔧
            </div>

            <div class="order-info">

                <strong>
                    OS #${ordem.id}
                </strong>

                <span>
                    ${ordem.descricao || "Sem descrição"}
                </span>

            </div>

            <div class="order-status">
                ${ordem.status}
            </div>

        `;


        lista.appendChild(item);

    });

}


// ================================
// MENU MOBILE
// ================================

function abrirMenu() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("overlay");


    sidebar.classList.toggle("open");

    overlay.classList.toggle("show");

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

carregarDashboard();