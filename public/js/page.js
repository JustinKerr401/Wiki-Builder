// Event listeners for elements pre-loaded
const section_links = document.getElementById("section_links")
const tocIcon = document.querySelector(".fa-solid.fa-list")

tocIcon.addEventListener("click", () => {
    if (section_links.style.display == "none") {
        section_links.style.display = "block"
        tocIcon.classList.toggle("fa-eye")
        tocIcon.classList.toggle("fa-eye-slash")
    } else {
        section_links.style.display = "none"
        tocIcon.classList.toggle("fa-eye-slash")
        tocIcon.classList.toggle("fa-eye")
    }
})

tocIcon.addEventListener("mouseover", () => {
    tocIcon.classList.toggle("fa-list")
    if (section_links.style.display == "none") tocIcon.classList.toggle("fa-eye")
    else tocIcon.classList.toggle("fa-eye-slash")
})

tocIcon.addEventListener("mouseout", () => {
    if (section_links.style.display == "none") tocIcon.classList.toggle("fa-eye")
    else tocIcon.classList.toggle("fa-eye-slash")
    tocIcon.classList.toggle("fa-list")
})

// Generate web page

const title = decodeURIComponent(window.location.pathname.slice(1));
init();

// -------------------- Functions --------------------
async function buildPage(page){
    document.title = title
    const main = document.querySelector("main")

    // Build intro
    const intro = document.getElementById("intro")
    
    const pageTitle = document.createElement("h1")
    const bio = document.createElement("p")

    pageTitle.textContent = title.toUpperCase()
    pageTitle.style.display = "inline"
    bio.textContent = page.bio
    bio.classList.add("textArea")

    intro.insertBefore(pageTitle, document.getElementById("editPageButton"))
    main.insertBefore(bio, document.getElementById("toc"))

    if (page.parent !== "root") {
        const parentLink = document.createElement("h4")
        parentLink.innerHTML = `parent: <a href='/${page.parent}' class='searchLink' style='font-size: 1.2rem;'>${page.parent}</a>`
        parentLink.style.fontStyle = "italic"
        intro.insertBefore(parentLink, document.getElementById("editPageButton"))
    }
    

    // Build cover
        // Reference variables
    const cover = document.getElementById("cover")
    const coverImageSwaps = document.getElementById("coverImageSwaps")
        // Cover's image
    const coverTitle = document.createElement("h2")
    coverTitle.textContent = title
    cover.insertBefore(coverTitle, coverImageSwaps)
    try {
        const imageDisplay = document.createElement("img")
        imageDisplay.id = "coverImage"
        const [key, value] = Object.entries(page.coverImages)[0]
        imageDisplay.src = `../images/${value}`
        cover.appendChild(imageDisplay)
            // Cover's image selector
        Object.entries(page.coverImages).forEach(([key, value]) => {
            const button = document.createElement("button")
            button.textContent = key
            button.onclick = function(){
                imageDisplay.src = `../images/${value}`
            }
            coverImageSwaps.appendChild(button)
        })
        if (coverImageSwaps.children.length < 2) coverImageSwaps.parentElement.removeChild(coverImageSwaps)
    } catch (error){

    }
        // Add each cover section
    for (let section of page.coverInfo){
        const header = document.createElement("h3")
        const table = document.createElement("dl")
        Object.entries(section).forEach(([key, value]) => {
            if (key == "header") {
                header.textContent = value
            } else {
                const dt = document.createElement("dt")
                const dd = document.createElement("dd")
                dt.textContent = key
                dd.textContent = value
                dd.innerHTML = value.replace(/\\n/g, '<br>');
                table.appendChild(dt)
                table.appendChild(dd)
            }
        })
        cover.appendChild(header)
        cover.appendChild(table)
    }
    // Finally, build sections
        // Track index so that I know when to add an "hr" element (after every section BUT the last one)
    let index = 0;
    for (let section of page.sections){
        // Add the section to DOM
        const sectionOb = document.createElement("section")
        main.appendChild(sectionOb)
        // Go through each key-value pair
        for (const [key, value] of Object.entries(section))  {
            // The first character of each key indicates it's datatype
            let element
            switch (key.charAt(0)){
                case "1":
                    element = document.createElement("h1")
                    element.classList.add("section_header")
                    element.textContent = value
                    sectionOb.appendChild(element)
                    break
                case "2":
                    element = document.createElement("h2")
                    element.classList.add("section_header")
                    element.textContent = value
                    sectionOb.appendChild(element)
                    break
                case "3":
                    element = document.createElement("h3")
                    element.classList.add("section_header")
                    element.textContent = value
                    sectionOb.appendChild(element)
                    break
                case "i":
                    element = document.createElement("img")
                    element.src = `../images/${value[1]}`
                    element.style.maxWidth = "45%"
                    element.style.maxHeight = "400px"
                    element.style.margin = "0px 10px"
                    element.title = "Click to see full sized image"
                    element.addEventListener("click", () => {
                        window.open(element.src, '_blank')
                    })
                    sectionOb.appendChild(element)
                    if (value[0].length > 0){
                        const desc = document.createElement("p")
                        desc.textContent = value[0]
                        desc.classList.add("imageDesc")
                        sectionOb.appendChild(desc)
                    }
                    break
                case "u":
                    element = document.createElement("ul")
                    sectionOb.appendChild(element)
                    for (let item of value){
                        const li = document.createElement("li")
                        if (item.startsWith("*")) {
                            li.classList.add("new")
                            item = item.slice(1)
                        }
                        li.textContent = item
                        element.appendChild(li)
                    }
                    break
                case "o":
                    element = document.createElement("ol")
                    sectionOb.appendChild(element)
                    for (let item of value){
                        const li = document.createElement("li")
                        if (item.startsWith("*")) {
                            li.classList.add("new")
                            item = item.slice(1)
                        } 
                        li.textContent = item
                        element.appendChild(li)
                    }
                    break
                case "p":
                    element = document.createElement("a")
                    element.href = `/${value}`
                    element.style.position = "relative"
                    element.style.padding = "10px 10px"

                    const linkPicture = document.createElement("img")
                    const response = await fetch(`/contents/${value}`);
                    const refPage = await response.json()
                    try{
                        linkPicture.src = `../images/${Object.values(refPage.coverImages)[0]}`
                    } catch (er){
                        linkPicture.src = `../images/Question mark.png`
                    }
                    linkPicture.style.width = "200px"
                    linkPicture.style.height = "200px"
                    linkPicture.style.objectFit = "cover"
                    linkPicture.style.margin = "0px 10px"
                    linkPicture.title = `Click to visit page "${value}"`

                    const overlayText = document.createElement("div")
                    overlayText.textContent = "🔗 " + value
                    overlayText.style.position = "absolute"
                    overlayText.style.bottom = "0"
                    overlayText.style.left = "0"
                    overlayText.style.width = "100%"
                    overlayText.style.padding = "8px"
                    overlayText.style.background = "rgba(0, 0, 0, 0.6)"
                    overlayText.style.color = "white"
                    overlayText.style.fontWeight = "bold"
                    overlayText.style.textAlign = "center"
                    overlayText.style.boxSizing = "border-box"

                    element.appendChild(linkPicture)
                    element.appendChild(overlayText)
                    sectionOb.appendChild(element)
                    break
                case "t":
                    element = document.createElement("p")
                    element.textContent = value
                    element.classList.add("textArea")
                    sectionOb.appendChild(element)
                    break
            }
        }
        if (index < page.sections.length - 1){
            const hr = document.createElement("hr")
            hr.style.marginTop = "20px"
            main.appendChild(hr)
        }
        index++
    }

    updateTOC()
}


// Create web page
async function init() {
  try {
    const page = await getJson(); // <-- wait for fetch
    if (page === "Not in database") throw new Error("Page not found in database")
    
    buildPage(page)

  } catch (error) {
    const main = document.querySelector("main")
    main.innerHTML = ""
    const message = document.createElement("h1")
    const details = document.createElement("p")
    message.textContent = `Failed to load web page: ${title}`
    details.textContent = error.message
    console.log(error)
    main.appendChild(message)
    main.appendChild(details)
  }
}

// Get contents of page from database
async function getJson() {
  const response = await fetch(`/contents/${encodeURIComponent(title)}`);

  if (!response.ok) {
    return "Not in database"
  } else {
    const pageData = await response.json()
    return pageData;
  }
}

function updateTOC(){
    let tree = [0, 0, 0]
    let padding = ""
    const destination = document.getElementById("section_links")
    const headers = document.querySelectorAll(".section_header")
    headers.forEach(header => {
        // Create hyperlink element
        const link = document.createElement("a")
        link.style.display = "block"

        // Set link text to the header's text
        link.textContent = header.textContent;

        // Assign ID properly
        let level = Number(header.tagName.charAt(1))
        
        switch (level){
            case 1:
                tree[0]++
                tree[1] = 0
                tree[2] = 0
                header.id = `${tree[0]}.`
                padding = "10px"
                break
            case 2:
                tree[1]++
                tree[2] = 0
                header.id = `${tree[0]}.${tree[1]}.`
                padding = "25px"
                break
            case 3:
                tree[2]++
                header.id = `${tree[0]}.${tree[1]}.${tree[2]}.`
                padding = "40px"
                break
            default:
                break
        }

        // Assign values based off ID
        link.href = header.id
        link.innerHTML = `&nbsp;<span style='color: hsl(0, 0%, 50%)'>${header.id}</span>&nbsp;&nbsp;${header.textContent}`
        lastHeader = header
        link.href = `#${header.id}`
        link.style.paddingLeft = padding

        // Append new element
        destination.appendChild(link)
        
        const all = document.querySelectorAll("main *")
        let count = 0
        all.forEach(element => {
            count++
        })
    })
}

function editPage(){
    window.location.href = `/edit/${encodeURIComponent(title)}`;
}

function deletePage(){
    window.location.href = `/delete/${encodeURIComponent(title)}`;
}