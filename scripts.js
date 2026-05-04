// --- CONFIGURAÇÃO GLOBAL DO WEB DENÚNCIA SP ---

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DE ENVIO (formulario.html) ---
    const formDenuncia = document.getElementById('formDenuncia');

    if (formDenuncia) {
        formDenuncia.addEventListener('submit', async function (e) {
            e.preventDefault();

            const protocolo = "2026-SSP-" + Math.floor(1000 + Math.random() * 9000);
            const agora = new Date();
            const dataRegistro = agora.toLocaleDateString('pt-BR');
            const horaRegistro = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const dados = {
                protocolo: protocolo,
                tipo_crime: document.getElementById('tipo-crime').value,
                localizacao: document.getElementById('local').value,
                email_usuario: document.getElementById('email-usuario').value,
                data_fato: document.getElementById('data-fato').value,
                hora_fato: document.getElementById('hora-fato').value,
                descricao: document.getElementById('descricao').value,
                data_registro: dataRegistro,
                hora_registro: horaRegistro,
                status: "Em Análise"
            };

            const btn = formDenuncia.querySelector('.btn-submit');
            btn.disabled = true;
            btn.innerText = "ENVIANDO...";

            try {
                localStorage.setItem(protocolo, JSON.stringify(dados));

                 
                
                const webhookURL = 'https://hook.us2.make.com/ax63vgvrjyoovvvnsdg51h7qmsvbfy46';
                const response = await fetch(webhookURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
                if (!response.ok) throw new Error("Falha no webhook");
                

                alert(`✅ DENÚNCIA REGISTRADA!\n\nProtocolo: ${protocolo}\n\nGuarde este número para consultar o andamento.`);
                window.location.href = "index.html";

            } catch (error) {
                console.error("Erro ao enviar:", error);
                alert(`⚠️ Salvo localmente.\nProtocolo: ${protocolo}`);
            } finally {
                btn.disabled = false;
                btn.innerText = "ENVIAR DENÚNCIA ANÔNIMA";
            }
        });
    }

    // --- 2. LÓGICA DE CONSULTA (acompanhamento.html) ---
    const btnConsultar = document.getElementById('btnConsultar');

    if (btnConsultar) {

        const params = new URLSearchParams(window.location.search);
        const protocoloURL = params.get('protocolo');
        const inputProtocolo = document.getElementById('inputProtocolo');

        if (protocoloURL && inputProtocolo) {
            inputProtocolo.value = protocoloURL;
        }

        btnConsultar.addEventListener('click', () => {
            const protocoloDigitado = inputProtocolo ? inputProtocolo.value.trim() : "";

            if (!protocoloDigitado) {
                alert("Por favor, digite o número do protocolo.");
                return;
            }

            const registroRaw = localStorage.getItem(protocoloDigitado);
            const campoData     = document.getElementById('data-atualizacao');
            const campoSituacao = document.getElementById('texto-situacao');

            if (!campoData || !campoSituacao) {
                console.error("IDs 'data-atualizacao' ou 'texto-situacao' não encontrados no HTML.");
                return;
            }

            if (registroRaw) {
                const info = JSON.parse(registroRaw);

                // Fallback para protocolos antigos que não tinham hora_registro
                const hora = info.hora_registro || info.hora_fato || "horário não registrado";

                campoData.innerText = `${info.data_registro} às ${hora}`;
                campoSituacao.innerText = `A denúncia sobre "${info.tipo_crime}" foi localizada e está em análise técnica.`;

            } else {
                campoData.innerText = "—";
                campoSituacao.innerText = "Protocolo não localizado. Use um protocolo gerado neste navegador.";
            }
        });

        if (protocoloURL) {
            btnConsultar.click();
        }
    }
});