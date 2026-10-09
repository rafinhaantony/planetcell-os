const loginForm =
    document.getElementById("loginForm");

const mensagem =
    document.getElementById("mensagem");

const botaoEntrar =
    document.getElementById("botaoEntrar");


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("email").value;

        const senha =
            document.getElementById("senha").value;


        mensagem.textContent = "";

        botaoEntrar.disabled = true;

        botaoEntrar.textContent =
            "Entrando...";


        try {

            const resposta =
                await fetch("/api/login", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email: email,

                        senha: senha

                    })

                });


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                mensagem.textContent =
                    dados.mensagem;

                return;

            }


            // Login realizado

            localStorage.setItem(
                "usuario",
                JSON.stringify(
                    dados.usuario
                )
            );


            window.location.href =
                "/dashboard.html";


        } catch (erro) {

            console.error(erro);

            mensagem.textContent =
                "Erro ao conectar com o servidor.";

        } finally {

            botaoEntrar.disabled = false;

            botaoEntrar.textContent =
                "Entrar";

        }

    }
);