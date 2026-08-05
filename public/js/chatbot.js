async function ask() {

    const input = document.getElementById("question");
    const chat = document.getElementById("chat");

    const question = input.value.trim();

    if (!question) return;

    chat.innerHTML += `
        <p><b>You:</b> ${question}</p>
    `;

    input.value = "";

    // Add loading indicator
    const loadingId = "loading-" + Date.now();

    chat.innerHTML += `
        <p id="${loadingId}">
            <b>AI:</b> 
            <span class="loading">
                Thinking<span class="dots"></span>
            </span>
        </p>
    `;

    chat.scrollTop = chat.scrollHeight;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question
            })
        });

        const data = await response.json();

        // Replace loading message
        document.getElementById(loadingId).innerHTML = `
            <b>AI:</b>
            <div class="ai-response">${marked.parse(data.answer)}</div>
            <hr>
        `;

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });

    } catch (err) {

        document.getElementById(loadingId).innerHTML = `
            <b>AI:</b> Error getting response.
        `;

        console.error(err);
    }

    chat.scrollTop = chat.scrollHeight;
}

document.getElementById("question").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        ask();
    }
});