const hideShowTogglePwBtn = document.querySelectorAll('button[type="button"].hide-show-toggle-pw');
hideShowTogglePwBtn?.forEach(button => {
    button.addEventListener('mousedown', (event) => {
        const parentChildren = event.target.parentNode.children;
        // https://medium.com/@larry.sassainsworth/iterating-over-an-html-collection-in-javascript-5071f58fad6b
        Array.prototype.map.call(parentChildren, child => {
            if (child.tagName === 'INPUT' && child.type === 'password') {
                child.type = 'text';
            }
        })
    })
    button.addEventListener('mouseup', (event) => {
        const parentChildren = event.target.parentNode.children;
        Array.prototype.map.call(parentChildren, child => {
            if (child.tagName === 'INPUT' && child.type === 'text') {
                child.type = 'password';
            }
        })
    })
})

const inputElements = document.querySelectorAll('input');
inputElements?.forEach(input => {
    input.addEventListener('input', (event) => {
        if (input.type !== 'radio') {
            const output = document.querySelector(`output[for="${input.id}"]`);
            if (output) {
                output.textContent = '';
            }
        }
    })
})
