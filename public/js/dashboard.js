
const menuMobile = document.getElementById("menuMobile");
const sidebar = document.getElementById("sidebar");
const botaoSair = document.getElementById("botaoSair");

menuMobile.addEventListener("click", () => {
    sidebar.classList.toggle("aberta");
});

botaoSair.addEventListener("click", () => {
    window.location.href = "/";
});

async function carregarDashboard() {
    try {
        const resposta = await fetch("/api/dashboard");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os dados.");
        }

        const dados = await resposta.json();

        document.getElementById("totalClientes").textContent =
            dados.totalClientes;

        document.getElementById("totalAparelhos").textContent =
            dados.totalAparelhos;

        document.getElementById("ordensAbertas").textContent =
            dados.ordensAbertas;

        document.getElementById("ordensConcluidas").textContent =
            dados.ordensConcluidas;

        document.getElementById("statusAguardando").textContent =
            dados.aguardando;

        document.getElementById("statusAndamento").textContent =
            dados.andamento;

        document.getElementById("statusPronto").textContent =
            dados.pronto;

        document.getElementById("statusEntregue").textContent =
            dados.entregue;

    } catch (erro) {
        console.error("Erro no Dashboard:", erro);
    }
}

carregarDashboard();