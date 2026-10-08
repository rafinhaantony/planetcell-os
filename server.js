const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");

// ================================
// BANCO DE DADOS
// ================================

function carregarDados() {

    if (!fs.existsSync(DATA_FILE)) {

        const dadosIniciais = {
            usuarios: [
                {
                    id: 1,
                    nome: "Administrador",
                    email: "admin@planetcell.com.br",
                    senha: "123456"
                }
            ],

            clientes: [],

            aparelhos: [],

            ordens: []
        };

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(dadosIniciais, null, 2),
            "utf8"
        );

        console.log("✅ data.json criado com sucesso!");
    }

    const arquivo = fs.readFileSync(
        DATA_FILE,
        "utf8"
    );

    return JSON.parse(arquivo);
}


function salvarDados(dados) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(dados, null, 2),
        "utf8"
    );

}


function proximoId(lista) {

    if (lista.length === 0) {
        return 1;
    }

    return Math.max(
        ...lista.map(item => item.id)
    ) + 1;
}


// ================================
// INICIALIZAÇÃO
// ================================

carregarDados();

app.use(express.json());


// ================================
// PÁGINAS
// ================================

// Página inicial → Login

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "login.html"
        )
    );

});


// Arquivos públicos

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ================================
// LOGIN
// ================================

app.post("/api/login", (req, res) => {

    const { email, senha } = req.body;

    const dados = carregarDados();

    const usuario = dados.usuarios.find(
        usuario =>
            usuario.email === email &&
            usuario.senha === senha
    );

    if (!usuario) {

        return res.status(401).json({

            sucesso: false,

            mensagem:
                "E-mail ou senha incorretos."

        });

    }

    res.json({

        sucesso: true,

        usuario: {

            id: usuario.id,

            nome: usuario.nome,

            email: usuario.email

        }

    });

});


// ================================
// DASHBOARD
// ================================

app.get("/api/dashboard", (req, res) => {

    const dados = carregarDados();

    res.json({

        clientes:
            dados.clientes.length,

        aparelhos:
            dados.aparelhos.length,

        ordens:
            dados.ordens.length,

        concluidos:
            dados.ordens.filter(
                ordem =>
                    ordem.status === "Finalizado"
            ).length

    });

});


// ================================
// CLIENTES
// ================================

// Listar clientes

app.get("/api/clientes", (req, res) => {

    const dados = carregarDados();

    res.json(dados.clientes);

});


// Criar cliente

app.post("/api/clientes", (req, res) => {

    const dados = carregarDados();

    const novoCliente = {

        id: proximoId(
            dados.clientes
        ),

        nome: req.body.nome,

        telefone: req.body.telefone,

        email:
            req.body.email || "",

        criadoEm:
            new Date().toISOString()

    };

    dados.clientes.push(
        novoCliente
    );

    salvarDados(dados);

    res.json(novoCliente);

});


// ================================
// APARELHOS
// ================================

// Listar aparelhos

app.get("/api/aparelhos", (req, res) => {

    const dados = carregarDados();

    res.json(dados.aparelhos);

});


// Criar aparelho

app.post("/api/aparelhos", (req, res) => {

    const dados = carregarDados();

    const novoAparelho = {

        id: proximoId(
            dados.aparelhos
        ),

        clienteId:
            req.body.clienteId,

        marca:
            req.body.marca,

        modelo:
            req.body.modelo,

        imei:
            req.body.imei || "",

        defeito:
            req.body.defeito || "",

        status:
            "Recebido",

        criadoEm:
            new Date().toISOString()

    };

    dados.aparelhos.push(
        novoAparelho
    );

    salvarDados(dados);

    res.json(novoAparelho);

});


// Atualizar status do aparelho

app.put(
    "/api/aparelhos/:id/status",
    (req, res) => {

        const dados = carregarDados();

        const id =
            Number(req.params.id);

        const aparelho =
            dados.aparelhos.find(
                aparelho =>
                    aparelho.id === id
            );

        if (!aparelho) {

            return res.status(404).json({

                mensagem:
                    "Aparelho não encontrado."

            });

        }

        aparelho.status =
            req.body.status;

        salvarDados(dados);

        res.json(aparelho);

    }
);


// ================================
// ORDENS DE SERVIÇO
// ================================

// Listar ordens

app.get("/api/ordens", (req, res) => {

    const dados = carregarDados();

    res.json(dados.ordens);

});


// Buscar uma ordem específica

app.get("/api/ordens/:id", (req, res) => {

    const dados = carregarDados();

    const id = Number(req.params.id);

    const ordem = dados.ordens.find(
        ordem => ordem.id === id
    );

    if (!ordem) {

        return res.status(404).json({
            sucesso: false,
            mensagem: "Ordem não encontrada."
        });

    }

    res.json(ordem);

});


// Criar ordem

app.post("/api/ordens", (req, res) => {

    const dados = carregarDados();

    const novaOrdem = {

        id: proximoId(
            dados.ordens
        ),

        clienteId:
            Number(req.body.clienteId),

        aparelhoId:
            Number(req.body.aparelhoId),

        descricao:
            req.body.descricao || "",

        diagnostico:
            req.body.diagnostico || "",

        valor:
            Number(req.body.valor) || 0,

        status:
            "Recebido",

        observacoes:
            req.body.observacoes || "",

        criadoEm:
            new Date().toISOString(),

        atualizadoEm:
            new Date().toISOString()

    };

    dados.ordens.push(
        novaOrdem
    );

    salvarDados(dados);

    res.json(novaOrdem);

});


// Atualizar ordem

app.put("/api/ordens/:id", (req, res) => {

    const dados = carregarDados();

    const id =
        Number(req.params.id);

    const ordem =
        dados.ordens.find(
            ordem =>
                ordem.id === id
        );

    if (!ordem) {

        return res.status(404).json({

            sucesso: false,

            mensagem:
                "Ordem não encontrada."

        });

    }


    if (
        req.body.status !== undefined
    ) {

        ordem.status =
            req.body.status;

    }


    if (
        req.body.diagnostico !== undefined
    ) {

        ordem.diagnostico =
            req.body.diagnostico;

    }


    if (
        req.body.valor !== undefined
    ) {

        ordem.valor =
            Number(req.body.valor);

    }


    if (
        req.body.observacoes !== undefined
    ) {

        ordem.observacoes =
            req.body.observacoes;

    }


    ordem.atualizadoEm =
        new Date().toISOString();


    salvarDados(dados);

    res.json(ordem);

});


// ================================
// SERVIDOR
// ================================

app.listen(PORT, () => {

    console.log("");

    console.log(
        "===================================="
    );

    console.log(
        "      PLANETCELL OS - V1"
    );

    console.log(
        "===================================="
    );

    console.log(
        `🚀 Sistema rodando em: http://localhost:${PORT}`
    );

    console.log(
        "📁 Banco local: data.json"
    );

    console.log(
        "===================================="
    );

});