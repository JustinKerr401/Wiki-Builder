async function askOllama(question, context) {
    const prompt = `
You are a helpful assistant for a wiki.

Answer the user's question using only the provided wiki information.
If the answer is not contained in the wiki, say that you could not find the information.

When providing an answer, please seperate distinct parts of your answer into paragraphs (via newlines!!) and bulletin points if neceesary to aid in reading.

Wiki information:

${context}

User question:
${question}
`;

    const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama3.1:8b",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    return data.message.content;
}


function buildContext(pages) {
    return pages.map(page => {
        return `
PAGE TITLE:
${page.title}

BIO:
${page.bio}

CONTENT:
${page.searchText}
`;
    }).join("\n-----------------\n");
}


module.exports = {
    askOllama,
    buildContext
};