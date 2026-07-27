

const prompt = document.getElementById("prompt")
const pathParts = window.location.pathname.split('/');
const title = decodeURIComponent(pathParts[2])

prompt.textContent = `Are you sure you want to delete the "${title}" page?`

async function deletePage(){
    const encodedTitle = encodeURIComponent(title);

    const res = await fetch(`/delete/page/${encodedTitle}`, {
        method: 'DELETE'
    })

    if (res.ok) {
        console.log('Deleted successfully');
        window.location.href = `/graph`;
    } else {
        console.error('Failed to delete');
    }

}