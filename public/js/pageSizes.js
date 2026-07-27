const sortBtn = document.getElementById("sort")
const message = document.getElementById("message")
sortBtn.disabled = true
let results = []

init()

async function init(){
    const p = await fetch('/getPageSizes')
    results = await p.json()
    sortBtn.disabled = false
    sort()
}

sortBtn.addEventListener("click", sort)

function sort(){
    // Store variables
    const div = document.getElementById("middle")
    const main = document.querySelector("main")
    // Clear main to flush with results
    main.innerHTML = ''
    // Bring div back
    main.appendChild(div)
    // Check for the other
    if (sortBtn.textContent == "Descending Order"){
        sortBtn.textContent = "Ascending Order"
        message.textContent = "Click to change the order of results -> Descending"
        results.sort((a, b) => a.size - b.size);
    } else {
        sortBtn.textContent = "Descending Order"
        message.textContent = "Click to change the order of results -> Ascending"
        results.sort((a, b) => b.size - a.size);
    }
    // Create div for the results to rest in
    const sortedPages = document.createElement("div")
    sortedPages.style.display = "flex"
    sortedPages.style.flexDIrection = "row"
    sortedPages.style.flexWrap = "wrap"
    sortedPages.style.columnGap = "20px"
    sortedPages.style.rowGap = "20px"
    sortedPages.style.justifyContent = "center"
    main.appendChild(sortedPages)
    // Iterate over every page
    for (let page of results){
        // Necessary objects
        const a = document.createElement("a")
        const img = document.createElement("img")
        const smallDiv = document.createElement("div")
        // Set up "a"
        a.href = `/${page.title}`
        a.classList.add("pageLink")
        // Set up "img"
        let pictureLink = ""
        if (page.coverImages != null){
            for (const [key, value] of Object.entries(page.coverImages)){
                if (pictureLink == "") pictureLink = value
            }
        }
        img.src = pictureLink != "" ? `../images/${pictureLink}` : `../images/Question mark.png`
        img.classList.add("linkImage")
        // Set up smallDiv
        smallDiv.classList.add("descript")
        let sizeDisplay = 0
        if (page.size / 10000 > 0) sizeDisplay = `${Math.round(page.size/10000)} MB`
        if (page.size / 100 > 0) sizeDisplay = `${Math.round(page.size/100)} KB`
        else sizeDisplay = `${page.size} bytes`
        smallDiv.textContent = `🔗 ${page.title} - ${sizeDisplay}`
        // Add them all
        sortedPages.append(a)
        a.appendChild(img)
        a.appendChild(smallDiv)
    }
}