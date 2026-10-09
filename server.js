
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const arquivoClientes = path.join(
    __dirname,
    "clientes.json"
);

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public"),
    { index: "index.html" }
));

app.get("/teste-aparelhos", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "aparelhos.html")
    );
});

app.get("/aparelhos.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "aparelhos.html")
    );
});

// =================================
// BANCO DE DADOS EM ARQUIVO
// =================================

function lerClientes() {
    if (!fs.existsSync(arquivoClientes)) {
        fs.writeFileSync(
            arquivoClientes,
            JSON.stringify([], null, 2)
        );
    }

    return JSON.parse(
        fs.readFileSync(arquivoClientes, "utf8")
    );
}

function salvarClientes(clientes) {
    fs.writeFileSync(
        arquivoClientes,
        JSON.stringify(clientes, null, 2)
    );
}

// =================================
// LOGIN TEMPORÁRIO
// =================================

app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;

    if (
        email !== "admin@planetcell.com.br" ||
        senha !== "123456"
    ) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "E-mail ou senha incorretos."
        });
    }

    res.json({
        sucesso: true,
        usuario: {
            id: 1,
            nome: "Administrador",
            email
        }
    });
});

// =================================
// LISTAR CLIENTES
// =================================

app.get("/api/clientes", (req, res) => {
    res.json(lerClientes());
});

// =================================
// CADASTRAR CLIENTE
// =================================

app.post("/api/clientes", (req, res) => {
    const { nome, telefone, email, observacoes } = req.body;

    if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof telefone !== "string" ||
        !telefone.trim()
    ) {
        return res.status(400).json({
            mensagem: "Nome e telefone são obrigatórios."
        });
    }

    const clientes = lerClientes();

    const cliente = {
        id: Date.now().toString(),
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: typeof email === "string" ? email.trim() : "",
        observacoes: typeof observacoes === "string"
            ? observacoes.trim()
            : "",
        data: new Date().toLocaleDateString("pt-BR")
    };

    clientes.push(cliente);
    salvarClientes(clientes);

    res.status(201).json(cliente);
});

// =================================
// EDITAR CLIENTE
// =================================

app.put("/api/clientes/:id", (req, res) => {
    const clientes = lerClientes();

    const indice = clientes.findIndex(
        cliente => cliente.id === req.params.id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    const { nome, telefone, email, observacoes } = req.body;

    if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof telefone !== "string" ||
        !telefone.trim()
    ) {
        return res.status(400).json({
            mensagem: "Nome e telefone são obrigatórios."
        });
    }

    clientes[indice] = {
        ...clientes[indice],
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: typeof email === "string" ? email.trim() : "",
        observacoes: typeof observacoes === "string"
            ? observacoes.trim()
            : ""
    };

    salvarClientes(clientes);

    res.json(clientes[indice]);
});

// =================================
// EXCLUIR CLIENTE
// =================================

app.delete("/api/clientes/:id", (req, res) => {
    const clientes = lerClientes();

    const atualizados = clientes.filter(
        cliente => cliente.id !== req.params.id
    );

    if (atualizados.length === clientes.length) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    salvarClientes(atualizados);

    res.json({ sucesso: true });
});


 // =================================
 // LISTAR APARELHOS
 // =================================

const arquivoAparelhos = path.join(
    __dirname,
    "aparelhos.json"
);

function lerAparelhos() {
    if (!fs.existsSync(arquivoAparelhos)) {
        fs.writeFileSync(
            arquivoAparelhos,
            JSON.stringify([], null, 2)
        );
    }

    return JSON.parse(
        fs.readFileSync(arquivoAparelhos, "utf8")
    );
}

function salvarAparelhos(aparelhos) {
    fs.writeFileSync(
        arquivoAparelhos,
        JSON.stringify(aparelhos, null, 2)
    );
}

// =================================
// LISTAR APARELHOS
// =================================

app.get("/api/aparelhos", (req, res) => {
    const aparelhos = lerAparelhos();
    const clientes = lerClientes();

    const resultado = aparelhos.map(aparelho => {
        const cliente = clientes.find(
            item => item.id === aparelho.clienteId
        );

        return {
            ...aparelho,
            clienteNome: cliente
                ? cliente.nome
                : "Cliente não encontrado"
        };
    });

    res.json(resultado);
});

// =================================
// CADASTRAR APARELHO
// =================================

app.post("/api/aparelhos", (req, res) => {
    const {
        clienteId,
        marca,
        modelo,
        defeito
    } = req.body;

    if (
        typeof clienteId !== "string" ||
        !clienteId.trim() ||
        typeof marca !== "string" ||
        !marca.trim() ||
        typeof modelo !== "string" ||
        !modelo.trim() ||
        typeof defeito !== "string" ||
        !defeito.trim()
    ) {
        return res.status(400).json({
            mensagem:
                "Cliente, marca, modelo e defeito são obrigatórios."
        });
    }

    const clientes = lerClientes();

    const clienteExiste = clientes.some(
        cliente => cliente.id === clienteId
    );

    if (!clienteExiste) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    const aparelhos = lerAparelhos();

    const aparelho = {
        id: Date.now().toString(),
        clienteId,
        marca: marca.trim(),
        modelo: modelo.trim(),
        defeito: defeito.trim(),
        dataCadastro: new Date().toISOString()
    };

    aparelhos.push(aparelho);
    salvarAparelhos(aparelhos);

    res.status(201).json({
        mensagem: "Aparelho cadastrado com sucesso!",
        aparelho
    });
});

// =================================
// EDITAR APARELHO
// =================================

app.put("/api/aparelhos/:id", (req, res) => {
    const aparelhos = lerAparelhos();

    const indice = aparelhos.findIndex(
        aparelho => aparelho.id === req.params.id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Aparelho não encontrado."
        });
    }

    const {
        clienteId,
        marca,
        modelo,
        defeito
    } = req.body;

    if (
        typeof clienteId !== "string" ||
        !clienteId.trim() ||
        typeof marca !== "string" ||
        !marca.trim() ||
        typeof modelo !== "string" ||
        !modelo.trim() ||
        typeof defeito !== "string" ||
        !defeito.trim()
    ) {
        return res.status(400).json({
            mensagem:
                "Cliente, marca, modelo e defeito são obrigatórios."
        });
    }

    const clientes = lerClientes();

    if (!clientes.some(cliente => cliente.id === clienteId)) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    aparelhos[indice] = {
        ...aparelhos[indice],
        clienteId,
        marca: marca.trim(),
        modelo: modelo.trim(),
        defeito: defeito.trim()
    };

    salvarAparelhos(aparelhos);

    res.json({
        mensagem: "Aparelho atualizado com sucesso!",
        aparelho: aparelhos[indice]
    });
});

// =================================
// EXCLUIR APARELHO
// =================================

app.delete("/api/aparelhos/:id", (req, res) => {
    const aparelhos = lerAparelhos();

    const atualizados = aparelhos.filter(
        aparelho => aparelho.id !== req.params.id
    );

    if (atualizados.length === aparelhos.length) {
        return res.status(404).json({
            mensagem: "Aparelho não encontrado."
        });
    }

    salvarAparelhos(atualizados);

    res.json({
        sucesso: true,
        mensagem: "Aparelho excluído com sucesso!"
    });
});

app.get("/api/dashboard", (req, res) => {
    const clientes = lerClientes();

    res.json({
        totalClientes: clientes.length,
        totalAparelhos: 0,
        ordensAbertas: 0,
        ordensConcluidas: 0,
        aguardando: 0,
        andamento: 0,
        pronto: 0,
        entregue: 0
    });
});

// =================================
// INICIAR SERVIDOR
// =================================

app.listen(PORT, () => {
    console.log(`PlanetCell OS: http://localhost:${PORT}`);
});