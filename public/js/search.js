const prompt = document.getElementById("prompt")
const pathParts = window.location.pathname.split('/');
const searchQuery = decodeURIComponent(pathParts[2])

const h1 = document.createElement("h1")
const numOfResults = document.createElement("h3")

h1.innerHTML = `Search Results for: <span id="searchQueryResult">${searchQuery}<span>`
h1.style.marginBottom = "0px"

document.querySelector("main").appendChild(h1)
document.querySelector("main").appendChild(numOfResults)

const spacing = document.createElement("hr")
spacing.style.marginBottom = "30px"
document.querySelector("main").appendChild(spacing)

getSearchResults()

async function getSearchResults(){
    const results = await fetch(`/searchQuery?q=${encodeURIComponent(searchQuery)}`)

    if (!results.ok) {
        return "Not in database"
    } else {
        const resultsJSON = await results.json()
        showResults(resultsJSON)
    }
}

function showResults(results){
    console.log(results.length)
    numOfResults.innerHTML = `Number of results: <span id="searchQueryResult">${results.length}<span>`
    for (let page of results){
            //console.log(page.title, "\n", page.bio)
        // Create hyperlink to page
        const link = document.createElement("a")
        link.textContent = page.title
        link.href = `/${page.title}`
        link.classList.add("searchLink")
        // Create display of bio underneath link
        const description = document.createElement("p")
        let text = page.bio
        description.textContent = text.length > 331 ? text.slice(0, 331) + "..." : text
        // Append
        document.querySelector("main").appendChild(link)
        document.querySelector("main").appendChild(description)
        document.querySelector("main").appendChild(document.createElement("br"))
    }
}