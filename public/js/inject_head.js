// Store pages from database
let pages = []

async function init(){
    const response = await fetch('/wikiSettings')
    const settings = await response.json()
    document.body.style.backgroundImage = `url("/images/${settings.backgroundImage}")`;
    const logoAddress = settings.logo

    // Favicon
    const icon = document.createElement("link")
    icon.rel = "icon"
    icon.href = `../images/Wiki Builder Icon.png`
    document.head.appendChild(icon)

    // Medievel Font
    const font = document.createElement("style")
    font.textContent = "@import url('https://fonts.googleapis.com/css2?family=Macondo&family=MedievalSharp&display=swap')"
    document.head.appendChild(font)

    // Style sheet
    const styles = document.createElement("link")
    styles.rel = "stylesheet"
    styles.href = "../css/style.css"
    document.head.appendChild(styles)

    // Script for header icon
    const iconScript = document.createElement("script")
    iconScript.src = "https://kit.fontawesome.com/8ed424e5ef.js"
    iconScript.crossOrigin = "anonymous"
    document.head.appendChild(iconScript)

    // Build (header)
    const header = document.createElement("header")
    header.id = "header"
    const firstChild = document.body.firstElementChild
    document.body.insertBefore(header, firstChild)

    // Insert the rest of the items
    const logo = document.createElement("a")
    logo.innerHTML = `<img src='/images/${logoAddress}' id='logo'>`
    logo.href = "/Home"
    header.appendChild(logo)

    const res = await fetch('/titles')
    const json = await res.json()
    for (let ob of json){
        if (ob.parent === "root" && ob.title !== "Home" ) pages.push(ob.title)
    }
    pages.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    for (let page of pages){
        const link = document.createElement("a")
        link.href = `/${encodeURIComponent(page)}`
        link.textContent = page.toUpperCase()
        header.appendChild(link)
    }
    // Search bar
    const search = document.createElement("input")
    search.type = "text"
    search.placeholder = "Search"
    search.id = "searchBar"
    header.appendChild(search)

    // Search bar functionality
    search.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            if (search.value != '') window.location.href = `/search/${search.value}`;
        }
    });

    // Create a page
    const create = document.createElement("a")
    create.textContent = "Create a Page"
    create.href = "/create%20page"
    header.appendChild(create)
    // See all pages
    const graph = document.createElement("a")
    graph.textContent = "See All Pages"
    graph.href = "/graph"
    header.appendChild(graph)
    // Wiki selector icon
    const wikiSelector = document.createElement("i")
    wikiSelector.classList.add("fa-solid", "fa-gear", "fa-3x")
    wikiSelector.title = "Wiki Selector"
    wikiSelector.addEventListener("mouseenter", () => {
        wikiSelector.style.color = "hsl(0, 0%, 30%)"
    })
    wikiSelector.addEventListener("mouseleave", () => {
        wikiSelector.style.color = "hsl(0, 0%, 0%)"
    })
    wikiSelector.addEventListener("click", () => {
        window.location.href = "/wiki%20selector";
    })
    header.appendChild(wikiSelector)
    // buttons to move to top and bottom of page
    const upbtn = document.createElement("button")
    upbtn.textContent = "⯅"
    upbtn.onclick = function(){
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    upbtn.style.position = "fixed"
    upbtn.style.bottom = "80px"
    upbtn.style.right = "20px"
    upbtn.style.fontSize = "2rem"
    upbtn.style.borderRadius = "50%"
    upbtn.style.color = "black"
    upbtn.classList.add("moveBtn")
    document.body.appendChild(upbtn)

    const downbtn = document.createElement("button")
    downbtn.textContent = "⯆"
    downbtn.onclick = function(){
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        })
    }
    downbtn.style.position = "fixed"
    downbtn.style.bottom = "20px"
    downbtn.style.right = "20px"
    downbtn.style.fontSize = "2rem"
    downbtn.style.borderRadius = "50%"
    downbtn.style.color = "black"
    downbtn.classList.add("moveBtn")
    document.body.appendChild(downbtn)
}

init()