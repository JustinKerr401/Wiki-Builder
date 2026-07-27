async function init(){
    const response = await fetch('/getCurrentWiki')
        if (!response.ok){
            throw new Error('Failed to fetch wiki names')
        }
        const currentWiki = await response.json()

        document.getElementById("header").textContent = currentWiki + " Settings"

}

init()

async function submit(){
    try{
        const background = document.getElementById("background-image").files[0];
        const logo = document.getElementById("logo-upload").files[0];

        if (!background || !logo) {
            throw new Error("Both a background image and a logo are required to submit.");
        }

        const formData = new FormData();

        if (background) {
            formData.append("files", background);
        }

        if (logo) {
            formData.append("files", logo);
        }

        const response = await fetch("/uploadImage", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        const filenames = result.files

        await fetch('/saveWikiSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filenames: filenames
            })
        });

        window.location.href='/Home'
    } catch (err){
        alert(err)
    }
    
    
}