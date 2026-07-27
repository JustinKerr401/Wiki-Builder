const wikis = document.getElementById("wikis")

async function getNames(){
    try{

        const response = await fetch('/wikiNames')
        if (!response.ok){
            throw new Error('Failed to fetch wiki names')
        }
        const names = await response.json()

        names.forEach(wiki => {
            const option = document.createElement("option")
            option.value = wiki
            option.textContent = wiki
            wikis.appendChild(option)
        })

        const currentWikiAttempt = await fetch('/getCurrentWiki')
        if (!currentWikiAttempt.ok){
            throw new Error('Failed to fetch wiki names')
        }
        const currentWiki = await currentWikiAttempt.json()

        wikis.value = currentWiki

    } catch (error) {
        console.error(error)
    }
}

async function redirect(){
    const selectedWiki = wikis.value
    const addedWiki = document.getElementById("new_wiki").value

    if (addedWiki != ""){
        await fetch('/selectWiki', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wikiName: addedWiki
            })
        });
        window.location.href = "/Home";
    } else if (selectedWiki != ""){
        await fetch('/selectWiki', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wikiName: selectedWiki
            })
        });
        window.location.href = "/Home";
    }
    
}

async function wikiSettings(){
    const selectedWiki = wikis.value
    await fetch('/selectWiki', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wikiName: selectedWiki
            })
        });
    window.location.href = "/wiki%20settings";
}

async function togglePopup(){
    try{
        const response = await fetch('/getCurrentWiki')
        if (!response.ok){
            throw new Error('Failed to fetch wiki names')
        }
        const currentWiki = await response.json()
        document.getElementById("currentWikiInquiry").textContent = currentWiki
    } catch (err){
        console.log(err)
    } finally {
        const popup = document.getElementById("delete-popup")
        popup.style.display = getComputedStyle(popup).display === "none" ? "flex" : "none"
    }
}

async function confirmDelete() {
    try {
        const response = await fetch('/deleteWiki', {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to delete wiki");
        }

        alert(result.message);

        // Close popup
        togglePopup();

        // Refresh the wiki selector/list
        window.location.reload();

    } catch (err) {
        console.error("Delete failed:", err);
        alert(err.message);
    }
}

getNames()