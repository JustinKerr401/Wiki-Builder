// ------------------------ States ------------------------
let coverLabel = 0
let fieldindex = 0
let radioGroups = 0
let titles = []
let objectIndex = 0
let allWords = " "
let imagesToDelete = []

// ------------------------ Document elements ------------------------
    // Intro
const titleInput = document.getElementById("titleInput")
const parentInput = document.getElementById("parentInput")
const bioInput = document.getElementById("bioInput")

    // Cover
const coverMaintenance = document.getElementById("coverMaintenance")
const files = document.getElementById("files")
const addCoverSection = document.getElementById("addCoverSection")
const addCoverData = document.getElementById("addCoverData")

    // Maintenance section
const addSection = document.getElementById("addSection")
addSection.onclick = addSectionF

// ------------------------ Event listeners ------------------------

// Add labels for every file that is uploaded
files.addEventListener("change", () => {
    // Purge all previous labels if present
    const toPurge = document.querySelectorAll(".purge")
    toPurge.forEach(item => {
        item.parentElement.removeChild(item)
    })
    // Add a label once for every image added
    let reference = files.nextSibling
    for (let file of files.files){
        const label = document.createElement("label")
        const desc = document.createElement("input")
        const br = document.createElement("br")

        label.classList.add("purge")
        label.textContent = `${file.name} label: `

        desc.classList.add("purge")

        br.classList.add("purge")

        files.parentElement.insertBefore(label, reference)
        reference = label.nextSibling
        files.parentElement.insertBefore(desc, reference)
        reference = desc.nextSibling
        files.parentElement.insertBefore(br, reference)
        reference = br.nextSibling
    }
})

// Function to create removeIcon's, as those are very prevalent in my code
function createRemoveIcon(left, right, isDeletePicture){
    const iconExport = document.createElement("i")
    iconExport.classList.add("fa-solid")
    iconExport.classList.add("fa-circle-minus")
    iconExport.style.color = "red"
    iconExport.style.marginLeft = "10px"
    iconExport.addEventListener("click", () => {
        deleteItem(left, right, iconExport)
    })

    return iconExport
}

// Function to delete an image from storage
async function deleteImage(fileName){
    imagesToDelete.push(fileName)
}

async function deleteImages(){
    for (let imageToDelete of imagesToDelete){
            await fetch('/deleteImage', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageToDelete })
            });
        }
}

// Add cover section
addCoverSection.addEventListener("click", () => {
    const removeIcon = createRemoveIcon(1, 1)

    const sectionTitle = document.createElement("input")
    sectionTitle.classList.add("midInput")
    sectionTitle.classList.add("coverParse")
    sectionTitle.placeholder = "Enter cover section's title"
    sectionTitle.style.display = "inline"
    addCoverSection.parentElement.parentElement.insertBefore(sectionTitle, coverMaintenance)
    addCoverSection.parentElement.parentElement.insertBefore(removeIcon, coverMaintenance)
    addCoverSection.parentElement.parentElement.insertBefore(document.createElement("br"), coverMaintenance)
})

// Add cover data
addCoverData.addEventListener("click", () => {
    const removeIcon = createRemoveIcon(2, 1)
    
    const labelInput = document.createElement("input")
    const infoInput = document.createElement("input")
    const newlineBreak = document.createElement("br")
    labelInput.placeholder = "Enter label"
    infoInput.placeholder = "Enter info"
    labelInput.classList.add("coverParse")
    infoInput.classList.add("coverParse")
    infoInput.style.width = "70%"
    addCoverSection.parentElement.parentElement.insertBefore(labelInput, coverMaintenance)
    addCoverSection.parentElement.parentElement.insertBefore(infoInput, coverMaintenance)
    addCoverSection.parentElement.parentElement.insertBefore(removeIcon, coverMaintenance)
    addCoverSection.parentElement.parentElement.insertBefore(newlineBreak, coverMaintenance)
})

// ------------------------ Load web page with data (if editing) ------------------------
const pathParts = window.location.pathname.split('/');
const isEdit = pathParts[1] === "edit"; // Only /edit/... triggers edit
const title = isEdit ? decodeURIComponent(pathParts[2]) : "Create a page";

/*
    


    Below listed are functions.
    Due to the high number of them, I've sectioned them by their role
    Loading, Updating, and Saving



*/
updateParentDD()

// ------------------------ Loading ------------------------

// Update drop down menu to select a site's parent
async function updateParentDD(){
    const res = await fetch('/titles')
    const titlesArray = await res.json()
    for (let ob of titlesArray){
        titles.push(ob.title)
    }
    titles.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    titles = titles.filter(item => item !== titles)
    const dropdown = document.getElementById("parentInput")
    let option = document.createElement("option")
    option.value = ""
    option.textContent = "--root--"
    dropdown.appendChild(option)
    titles.forEach(opt => {
        if (opt == title || opt == "Home"){
            return;
        }
        option = document.createElement("option")
        option.value = opt
        option.textContent = opt
        dropdown.appendChild(option)
    })
    // Set up page to edit if necessary
        // I had this code line after updateParent(), but it would keep running before updateParent sets up one of the necessary elements 😭
    if (isEdit) {
        init();
    }
    
}

// Try to edit this page
async function init() {
  try {
    const page = await getJson(); // <-- wait for fetch
    if (page === "Not in database") throw new Error("Page not found in database")

    buildPage(page)

  } catch (error) {
    document.body.innerHTML = ""
    const holder = document.createElement("section")
    document.body.appendChild(holder)
    const message = document.createElement("h1")
    const details = document.createElement("p")
    message.textContent = `Failed to load web page: ${title}`
    details.textContent = error.message
    console.log(error)
    holder.appendChild(message)
    holder.appendChild(details)
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

function buildPage(page){
    // First task, set the intro section
        // Setting titles
    document.title = `Editing: ${title}`
    document.getElementById("titleInput").value = title
        // Set parent selector (delete current page, set parent page)
    document.getElementById("parentInput").querySelector(`option[value="${CSS.escape(title)}"]`)
    document.getElementById("parentInput").value = page.parent
        // Bio
    document.getElementById("bioInput").value = page.bio
    
    // Set up the cover
        // Loop through images currently stored in database
    try {
        for (const [key, value] of Object.entries(page.coverImages)) {
            const reference = document.getElementById("files")
            const label = document.createElement("input")
            const subject = document.createElement("p")
            label.value = key
            label.classList.add("presavedCoverImage")
            subject.textContent = value
            subject.style.display = "inline"

            const removeIcon = createRemoveIcon(2, 3, true)
            removeIcon.addEventListener("click", () => {
                deleteImage(subject.textContent)
            }) 

            const preview = document.createElement("img")
            preview.src = `../images/${value}`
            preview.style.maxHeight = "200px"
            preview.style.maxWidth = "200px"

            reference.parentElement.insertBefore(label, reference)
            reference.parentElement.insertBefore(subject, reference)
            reference.parentElement.insertBefore(removeIcon, reference)
            reference.parentElement.insertBefore(preview, reference)
            reference.parentElement.insertBefore(document.createElement("br"), reference)
            reference.parentElement.insertBefore(document.createElement("br"), reference)
        }
    } catch (error) {

    }
    
        // Add cover headers and pairs
    const coverSections = page.coverInfo
        // Iterate over all cover sections
    for (let coverSection of coverSections){
            // Iterate over all key value pairs
        for (const [key, value] of Object.entries(coverSection)){
            if (key == "header") {
                const removeIcon = createRemoveIcon(1, 1)

                const sectionTitle = document.createElement("input")
                sectionTitle.classList.add("midInput")
                sectionTitle.classList.add("coverParse")
                sectionTitle.placeholder = "Enter cover section's title"
                sectionTitle.style.display = "inline"
                sectionTitle.value = value
                addCoverSection.parentElement.parentElement.insertBefore(sectionTitle, coverMaintenance)
                addCoverSection.parentElement.parentElement.insertBefore(removeIcon, coverMaintenance)
                addCoverSection.parentElement.parentElement.insertBefore(document.createElement("br"), coverMaintenance)
            } else {
                const removeIcon = createRemoveIcon(2, 1)
                
                const labelInput = document.createElement("input")
                const infoInput = document.createElement("input")
                const newlineBreak = document.createElement("br")
                labelInput.placeholder = "Enter label"
                infoInput.placeholder = "Enter info"
                labelInput.classList.add("coverParse")
                infoInput.classList.add("coverParse")
                infoInput.style.width = "70%"
                labelInput.value = key
                infoInput.value = value
                addCoverSection.parentElement.parentElement.insertBefore(labelInput, coverMaintenance)
                addCoverSection.parentElement.parentElement.insertBefore(infoInput, coverMaintenance)
                addCoverSection.parentElement.parentElement.insertBefore(removeIcon, coverMaintenance)
                addCoverSection.parentElement.parentElement.insertBefore(newlineBreak, coverMaintenance)
            }
        }
    }
    // Finally, compose each section
    const daSections = page.sections
        // Iterate over each section
    for (let daSection of daSections){
        console.log("---- Creating a section now ----")
            // Add a section, then store a reference to add elements before
        const [heading, reference] = addSectionF()
            // Iterate over every key value pair
        for (const [key, value] of Object.entries(daSection)){
            let valueSetting
            switch (key.charAt(0)){
                case '1':
                    heading.value = value
                    break
                case '2':
                    const hd2 = addToSection('header', reference)
                    hd2.value = value
                    hd2.nextElementSibling.checked = true
                    break
                case '3':
                    const hd3 = addToSection('header', reference)
                    hd3.value = value
                    hd3.nextElementSibling.nextElementSibling.nextElementSibling.checked = true
                    break
                case 'i':
                    const label = document.createElement("input")
                    const subject = document.createElement("p")
                    label.value = value[0]
                    label.classList.add("presavedImage")
                    subject.textContent = value[1]
                    subject.style.display = "inline"

                    const removeIcon = createRemoveIcon(2, 3, true)

                    const preview = document.createElement("img")
                    preview.src = `../images/${value[1]}`
                    preview.style.maxHeight = "200px"
                    preview.style.maxWidth = "200px"

                    reference.parentElement.insertBefore(label, reference)
                    reference.parentElement.insertBefore(subject, reference)
                    reference.parentElement.insertBefore(removeIcon, reference)
                    removeIcon.addEventListener("click", () => {
                        deleteImage(subject.textContent)
                    }) 
                    reference.parentElement.insertBefore(preview, reference)
                    reference.parentElement.insertBefore(document.createElement("br"), reference)
                    reference.parentElement.insertBefore(document.createElement("br"), reference)
                    console.log(reference)
                    break
                case 'u':
                    const listHolder = addToSection('ulist', reference)
                    const newReference = listHolder.firstElementChild
                    for (let listItem of value){
                        addListItem(newReference).value = listItem
                    }
                    break
                case 'o':
                    const listHolder2 = addToSection('olist', reference)
                    const newReference2 = listHolder2.firstElementChild
                    for (let listItem of value){
                        addListItem(newReference2).value = listItem
                    }
                    break
                case 'p':
                    addToSection('page', reference).value = value
                    break
                case 't':
                    addToSection('text', reference).value = value
                    break
            }console.log("Added element! -- ", key.charAt(0))
        }
    }

}

// ------------------------ Updating ------------------------

// Add a section
function addSectionF(){
    // First, the section itself
    const section = document.createElement("section")
    const reference = document.getElementById("maintain")
    reference.parentElement.insertBefore(section, reference)
    // Next, the header for the section
    const header = document.createElement("input")
    header.classList.add("bigInput")
    header.placeholder = "Enter the section title"
    section.appendChild(header)
    // Then, the text cursor 
    const textCursor = document.createElement("hr")
    textCursor.classList.add("textCursor")
    section.appendChild(textCursor)
    console.log("Added hr")
    // Finally, the section maintenance, well, section
    const mainSect = document.createElement("div")
    mainSect.id = "mainSectDiv"
    section.appendChild(mainSect)
    // Finally finally, fill maintenance section with controls
        // Establish variables
    const addHeader = document.createElement("button")
    const addImage = document.createElement("button")
    const addUlist = document.createElement("button")
    const addOlist = document.createElement("button")
    const addPage = document.createElement("button")
    const addText = document.createElement("button")
    const textCursorUp = document.createElement("button")
    const removeSection = document.createElement("button")
    const textCursorDown = document.createElement("button")
        // Set properties
    addHeader.textContent = "Add Header"
    addHeader.style.backgroundColor = "hsl(0, 100%, 79%)"
    addHeader.onclick = function(){
        addToSection("header", mainSect)
    }

    addImage.textContent = "Add Image"
    addImage.style.backgroundColor = "hsl(60, 100%, 79%)"
    addImage.onclick = function(){
        addToSection("image", mainSect)
    }

    addUlist.textContent = "Add List"
    addUlist.style.backgroundColor = "hsl(120, 100%, 79%)"
    addUlist.onclick = function(){
        addToSection("ulist", mainSect)
    }

    addOlist.textContent = "Add Numbered List"
    addOlist.style.backgroundColor = "hsl(180, 100%, 79%)"
    addOlist.onclick = function(){
        addToSection("olist", mainSect)
    }

    addPage.textContent = "Add Page"
    addPage.style.backgroundColor = "hsl(240, 100%, 79%)"
    addPage.onclick = function(){
        addToSection("page", mainSect)
    }

    addText.textContent = "Add Text"
    addText.style.backgroundColor = "hsl(300, 100%, 79%)"
    addText.onclick = function(){
        addToSection("text", mainSect)
    }

    textCursorUp.textContent = "⯅"
    textCursorUp.style.backgroundColor = "hsl(0, 0%, 0%)"
    textCursorUp.style.color = "hsl(0, 0%, 100%)"
    textCursorUp.onclick = function(){
        moveTextCursorUp(mainSect)
    }

    removeSection.textContent = "Remove Section"
    removeSection.onclick = function(){
        document.body.removeChild(removeSection.parentElement.parentElement)
    }

    textCursorDown.textContent = "⯆"
    textCursorDown.style.backgroundColor = "hsl(0, 0%, 0%)"
    textCursorDown.style.color = "hsl(0, 0%, 100%)"
    textCursorDown.onclick = function(){
        moveTextCursorDown(mainSect)
    }

        // Append to div
    mainSect.appendChild(addHeader)
    mainSect.appendChild(addImage)
    mainSect.appendChild(addUlist)
    mainSect.appendChild(addOlist)
    mainSect.appendChild(addPage)
    mainSect.appendChild(addText)
    mainSect.appendChild(textCursorUp)
    mainSect.appendChild(removeSection)
    mainSect.appendChild(textCursorDown)
    return [header, textCursor]
}

// Add a datatype to a section based on the button pressed
function addToSection(datatype, reference){
    // Reference to text corsor
    const textCursor = reference.parentElement.querySelector("hr")
    // Icon to remove the element if desired
    const removeIcon = document.createElement("i")
    removeIcon.classList.add("fa-solid")
    removeIcon.classList.add("fa-circle-minus")
    removeIcon.style.color = "red"
    removeIcon.style.marginLeft = "10px"
    // Properly inserting element based on datatype
    let element
    switch (datatype){
        // For each case, I need to 
            // 1. Set up the variable
            // 2. Properly set the remove icon
            // 3. Apppend everything necessary in order
        case "header":
            element = document.createElement("input")
            element.classList.add("midInput")
            element.placeholder = "Enter the section title here"
            removeIcon.addEventListener("click", () => {
                deleteItem(5, 2, removeIcon)
            })
            removeIcon.classList.add("headerDeleteIcon")
            reference.parentElement.insertBefore(element, textCursor)
            addRadios(textCursor)
            reference.parentElement.insertBefore(removeIcon, textCursor)
            reference.parentElement.insertBefore(document.createElement("br"), textCursor)
            reference.parentElement.insertBefore(document.createElement("br"), textCursor)
            break

        case "image":
            element = document.createElement("input")
            element.type = "file"
            element.style.margin = "5px 0px"
            element.classList.add("sectionImageInput")
            const imageDesc = document.createElement("input")
            imageDesc.type = "text"
            imageDesc.placeholder = "Enter text to describe the image, if desired"
            removeIcon.addEventListener("click", () => {
                deleteItem(2, 2, removeIcon)
            })
            removeIcon.classList.add("imageDeleteIcon")
            reference.parentElement.insertBefore(element, textCursor)
            reference.parentElement.insertBefore(imageDesc, textCursor)
            reference.parentElement.insertBefore(removeIcon, textCursor)
            reference.parentElement.insertBefore(document.createElement("br"), textCursor)
            reference.parentElement.insertBefore(document.createElement("br"), textCursor)
            break

        case "ulist":
            element = document.createElement("div")
            element.classList.add("ulist")
            element.style.border = "1px solid"
            element.style.padding = "10px"
            element.style.marginBottom = "15px"

            const button = document.createElement("button")
            button.textContent = "Add item to list"
            button.style.marginLeft = "20px"
            button.onclick = function(){
                addListItem(button)
            }

            removeIcon.addEventListener("click", () => {
                button.parentElement.parentElement.removeChild(button.parentElement)
            })
            removeIcon.classList.add("ulistDeleteIcon")
            reference.parentElement.insertBefore(element, textCursor)
            element.appendChild(button)
            element.appendChild(removeIcon)
            break
        case "olist":
            element = document.createElement("div")
            element.classList.add("olist")
            element.style.border = "1px solid"
            element.style.padding = "10px"
            element.style.marginBottom = "15px"

            const daButton = document.createElement("button")
            daButton.textContent = "Add item to numbered list"
            daButton.style.marginLeft = "20px"
            daButton.onclick = function(){
                addListItem(daButton)
            }

            removeIcon.addEventListener("click", () => {
                daButton.parentElement.parentElement.removeChild(daButton.parentElement)
            })
            removeIcon.classList.add("olistDeleteIcon")
            reference.parentElement.insertBefore(element, textCursor)
            element.appendChild(daButton)
            element.appendChild(removeIcon)
            break

        case "page":
            element = document.createElement("select")
            element.classList.add("sectionPageInput")
            titles.forEach(opt => {
                if (opt == title){
                    return;
                }
                const option = document.createElement("option")
                option.value = opt
                option.textContent = opt
                element.appendChild(option)
            })
            removeIcon.addEventListener("click", () => {
                deleteItem(1, 2, removeIcon)
            })
            removeIcon.classList.add("pageDeleteIcon")
            reference.parentElement.insertBefore(element, textCursor)
            reference.parentElement.insertBefore(removeIcon, textCursor)
            reference.parentElement.insertBefore(document.createElement("br"), textCursor)
            reference.parentElement.insertBefore(document.createElement("br"), textCursor)
            break

        case "text":
            element = document.createElement("textarea")
            element.placeholder = "Enter some info"
            element.classList.add("sectionTextInput")
            removeIcon.addEventListener("click", () => {
                deleteItem(1, 0, removeIcon)
            })
            removeIcon.classList.add("textDeleteIcon")
            reference.parentElement.insertBefore(element, textCursor)
            reference.parentElement.insertBefore(removeIcon, textCursor)
            break
    }
    return element
}

function addRadios(reference){
    const h2 = document.createElement("input")
    const h2label = document.createElement("label")
    const h3 = document.createElement("input")
    const h3label = document.createElement("label")

    h2.type = "radio"
    h2.name = "radio " + String(radioGroups)
    h2label.textContent = "Heading 2"

    h3.type = "radio"
    h3.name = "radio " + String(radioGroups)
    h3label.textContent = "Heading 3"

    reference.parentElement.insertBefore(h2, reference)
    reference.parentElement.insertBefore(h2label, reference)
    reference.parentElement.insertBefore(h3, reference)
    reference.parentElement.insertBefore(h3label, reference)

    radioGroups++
}

function addListItem(reference){
    const removeIcon = createRemoveIcon(1, 1)
    
    const input = document.createElement("textarea")
    input.style.marginLeft = "20px"
    input.style.width = "50%"
    input.style.height = "40px"
    reference.parentElement.insertBefore(input, reference)
    reference.parentElement.insertBefore(removeIcon, reference)
    reference.parentElement.insertBefore(document.createElement("br"), reference)
    return input
}

function deleteItem(siblings, breaks, reference){
    // IMPORTANT NOTE: Reference refers to the icon calling this function
    const parent = reference.parentElement
    for (let x = 0; x<siblings; x++){
        parent.removeChild(reference.previousElementSibling)
    }
    for (let x = 0; x<breaks; x++){
        parent.removeChild(reference.nextElementSibling)
    }
    parent.removeChild(reference)
}

function getSectionType(element){
    if (element.classList.contains("midInput")) return "header"
    else if (element.classList.contains("sectionImageInput")) return "image"
    else if (element.classList.contains("ulist")) return "ulist"
    else if (element.classList.contains("olist")) return "olist"
    else if (element.classList.contains("sectionPageInput")) return "page"
    else if (element.classList.contains("sectionTextInput")) return "text"
    else if (element.classList.contains("bigInput")) return "title"
    else if (element.classList.contains("presavedImage")) return "oldImage"
}

function moveTextCursorUp(mainSect){
    const textCursor = mainSect.parentElement.querySelector("hr")
    let condition = textCursor.previousElementSibling
    console.log(condition)
    // Identify what percedes the hr to identify how far it should move

    // For all conditions that are <br>
    if (condition.tagName === "BR"){
        condition = condition.previousElementSibling.previousElementSibling
            // Image conditions
        if (condition.classList.contains("imageDeleteIcon")){
            condition.parentElement.insertBefore(textCursor, condition.previousElementSibling.previousElementSibling)
        } else if (condition.tagName === "IMG"){
            condition.parentElement.insertBefore(textCursor, condition.previousElementSibling.previousElementSibling.previousElementSibling)
        }
        // Header conditions
        else if (condition.classList.contains("headerDeleteIcon")){
            condition.parentElement.insertBefore(textCursor, condition.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling)
        }   // Page condition
        else if (condition.classList.contains("pageDeleteIcon")){
            condition.parentElement.insertBefore(textCursor, condition.previousElementSibling)
        }
    }  
    // For conditions that AREN'T BR
        // List conditions
    else if (condition.classList.contains("ulist") || condition.classList.contains("olist")){
        condition.parentElement.insertBefore(textCursor, condition)
    }   // Text condition
    else if (condition.classList.contains("textDeleteIcon")){
        condition.parentElement.insertBefore(textCursor, condition.previousElementSibling)
    }
}

function moveTextCursorDown(mainSect){
    const textCursor = mainSect.parentElement.querySelector("hr")
    let condition = textCursor.nextElementSibling
    console.log(condition)
    // Identify what percedes the hr to identify how far it should move

        // Header condition
    if (condition.classList.contains("midInput")){
        condition.parentElement.insertBefore(textCursor, condition.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling)
    }   // Image conditions
    else if (condition.classList.contains("presavedImage")){
        condition.parentElement.insertBefore(textCursor, condition.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling)
    } else if (condition.tagName === "INPUT"){
        condition.parentElement.insertBefore(textCursor, condition.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling)
    }
       // List conditions
    else if (condition.classList.contains("olist") || condition.classList.contains("ulist")){
        condition.parentElement.insertBefore(textCursor, condition.nextElementSibling)
    }   // Page condition
    else if (condition.classList.contains("sectionPageInput")){
        condition.parentElement.insertBefore(textCursor, condition.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling)
    }   // Text condition
    else if (condition.tagName === "TEXTAREA"){
        condition.parentElement.insertBefore(textCursor, condition.nextElementSibling.nextElementSibling)
    }
    
}

// ------------------------ Saving ------------------------

function addToSearchText(stringToAdd){
    allWords += ` ${stringToAdd}`
}

async function save(){
    try {
        // Delete any images from storage
        deleteImages()
        
        const savedImages = await saveImages(files)
        const fileLocations = savedImages.files
        
        let jsonExport = {
            title: "",
            parent: "",
            bio: "",
            searchText: "",
            coverImages: {},
            coverInfo: [],
            sections: []
        }

        // Firstly, parse main / meta stuff
        if (parentInput.value.length > 0) jsonExport.parent = parentInput.value
        else jsonExport.parent = "root"
        if (titleInput.value.length > 0 && bioInput.value.length > 0){
            jsonExport.title = titleInput.value
            jsonExport.bio = bioInput.value
        } else {
            throw new Error("Missing title and/or bio")
        }
        
        // Secondly, parse cover
            // A. Get cover image details
        // Aa. Existing images
        const existing = document.querySelectorAll(".presavedCoverImage")
        for (let label of existing){
            jsonExport.coverImages[label.value] = label.nextElementSibling.textContent
        }
        // Ab. Inputted images
        const cover = document.querySelectorAll("input.purge")
        let index = 0
        cover.forEach((element) => {
            jsonExport.coverImages[element.value] = fileLocations[index]
            index++
        })
            // B. Get all cover info
        let coverSection = {
            header: ""
        }
        const info = document.querySelectorAll(".coverParse")
        info.forEach((element) => {
            switch (element.placeholder){
                case "Enter cover section's title":
                    if (element.value == "") throw new Error("Cover section header")
                    if (coverSection.header !== ""){
                        jsonExport.coverInfo.push(coverSection)
                        coverSection = {
                            header: ""
                        }
                    }
                    coverSection.header = element.value
                    break
                case "Enter label":
                    if (element.value == "") throw new Error("Cover label")
                    coverSection[element.value] = element.nextElementSibling.value
                    addToSearchText(element.nextElementSibling.value)
                    break
                case "Enter info":
                    if (element.value == "") throw new Error("Cover info")
                    break
            }
            
        })
        if (coverSection.header != "") jsonExport.coverInfo.push(coverSection)

        // Thirdly, go through all of the sections
        const sections = document.querySelectorAll("section")
        for (let section of sections) {
            let sectionInfo = {}
            const components = section.children
            for (let component of components){
                switch (getSectionType(component)){
                    case "title":
                        sectionInfo[`1header${objectIndex}`] = component.value
                        addToSearchText(component.value)
                        break
                    case "header":
                        if (component.nextElementSibling.checked) sectionInfo[`2header${objectIndex}`] = component.value
                        else sectionInfo[`3header${objectIndex}`] = component.value
                        addToSearchText(component.value)
                        break
                    case "image":
                        if (component.files[0]!=undefined){
                            const call = await saveImages(component)
                            let details = [component.nextElementSibling.value, call.files[0]]
                            sectionInfo[`image${objectIndex}`] = details
                        }
                        break
                    case "ulist":
                        sectionInfo[`ulist${objectIndex}`] = []
                        const children = component.children
                        for (let child of children){
                            if (child.tagName === "TEXTAREA"){
                                sectionInfo[`ulist${objectIndex}`].push(child.value)
                                addToSearchText(component.value)
                            }
                        }
                        break
                    case "olist":
                        sectionInfo[`olist${objectIndex}`] = []
                        const children2 = component.children
                        for (let child of children2){
                            if (child.tagName === "TEXTAREA"){
                                sectionInfo[`olist${objectIndex}`].push(child.value)
                                addToSearchText(component.value)
                            }
                        }
                        break
                    case "page":
                        sectionInfo[`page${objectIndex}`] = component.value
                        addToSearchText(component.value)
                        break
                    case "text":
                        sectionInfo[`text${objectIndex}`] = component.value
                        addToSearchText(component.value)
                        break
                    case "oldImage":
                        sectionInfo[`image${objectIndex}`] = [component.value, component.nextElementSibling.textContent]
                        break
                }
                objectIndex++
            }jsonExport.sections.push(sectionInfo)
        }

        //Penultimately, save searchText
        jsonExport.searchText = allWords

        // Finally, save to database
        fetch('/save', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonExport)
        })
        .then(res => res.json())
        .then(data => {
            console.log('Saved:', data);
            window.location.href = `/${jsonExport.title}`;
        })
        .catch(err => {
            console.error('Save failed:', err);
            alert('Failed to save.');
        })

    } catch (error) {
        console.error(`Problem reading one of the following characters: \n${error}`)
        alert("Missing title and/or bio")
    }
}

async function saveImages(fileChooser){
    const formData = new FormData()
    for (let file of fileChooser.files){
        formData.append("files", file)
    }
    const res = await fetch("/uploadImage", {
        method: "POST",
        body: formData
    })
    const data = await res.json()
    // File names
    return data
}