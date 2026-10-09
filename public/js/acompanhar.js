const formBusca =
    document.getElementById("formBusca");


formBusca.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const numero =
            document.getElementById(
                "numeroOS"
            ).value;


        const erro =
            document.getElementById(
                "erroBusca"
            );


        erro.textContent =
            "Consultando OS...";


        try {

            const resposta =
                await fetch(
                    `/api/ordens/${numero}`
                );


            const ordem =
                await resposta.json();


            if (!resposta.ok) {

                erro.textContent =
                    "Ordem de serviço não encontrada.";

                return;

            }


            await mostrarOS(ordem);


        } catch (error) {

            console.error(error);

            erro.textContent =
                "Não foi possível consultar a OS.";

        }

    }
);


// =================================
// MOSTRAR OS
// =================================

async function mostrarOS(ordem) {

    const clientes =
        await fetch(
            "/api/clientes"
        ).then(
            resposta =>
                resposta.json()
        );


    const aparelhos =
        await fetch(
            "/api/aparelhos"
        ).then(
            resposta =>
                resposta.json()
        );


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
        "osNumero"
    ).textContent =
        `OS #${ordem.id}`;


    document.getElementById(
        "statusAtual"
    ).textContent =
        ordem.status;


    document.getElementById(
        "aparelho"
    ).textContent =
        aparelho
            ? `${aparelho.marca} ${aparelho.modelo}`
            : "Aparelho";


    document.getElementById(
        "descricao"
    ).textContent =
        ordem.descricao ||
        "Não informado";


    document.getElementById(
        "diagnostico"
    ).textContent =
        ordem.diagnostico ||
        "Aguardando análise";


    document.getElementById(
        "valor"
    ).textContent =
        `R$ ${formatarValor(ordem.valor)}`;


    document.getElementById(
        "data"
    ).textContent =
        formatarData(
            ordem.criadoEm
        );


    atualizarTimeline(
        ordem.status
    );


    document.getElementById(
        "buscaCard"
    ).style.display =
        "none";


    document.getElementById(
        "resultado"
    ).classList.add(
        "ativo"
    );

}


// =================================
// TIMELINE
// =================================

function atualizarTimeline(statusAtual) {

    const etapas =
        document.querySelectorAll(
            ".etapa"
        );


    const ordemStatus = [

        "Recebido",

        "Em análise",

        "Orçamento enviado",

        "Aguardando aprovação",

        "Em manutenção",

        "Finalizado",

        "Aguardando retirada",

        "Entregue"

    ];


    const indiceAtual =
        ordemStatus.indexOf(
            statusAtual
        );


    etapas.forEach(
        (etapa, index) => {

            etapa.classList.remove(
                "concluida"
            );

            etapa.classList.remove(
                "atual"
            );


            if (
                index <
                indiceAtual
            ) {

                etapa.classList.add(
                    "concluida"
                );

            }


            if (
                index ===
                indiceAtual
            ) {

                etapa.classList.add(
                    "atual"
                );

            }

        }
    );

}


// =================================
// NOVA BUSCA
// =================================

function novaBusca() {

    document.getElementById(
        "resultado"
    ).classList.remove(
        "ativo"
    );


    document.getElementById(
        "buscaCard"
    ).style.display =
        "block";


    document.getElementById(
        "numeroOS"
    ).value =
        "";


    document.getElementById(
        "erroBusca"
    ).textContent =
        "";

}


// =================================
// FORMATAR VALOR
// =================================

function formatarValor(valor) {

    return Number(
        valor || 0
    )
    .toFixed(2)
    .replace(".", ",");

}


// =================================
// FORMATAR DATA
// =================================

function formatarData(data) {

    if (!data) {

        return "-";

    }


    return new Date(
        data
    ).toLocaleDateString(
        "pt-BR"
    );

}