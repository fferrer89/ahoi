const hideShowTogglePwBtn = document.querySelectorAll('button[type="button"].hide-show-toggle-pw');
hideShowTogglePwBtn?.forEach(button => {
    button.addEventListener('click', (event) => {
        const parentChildren = event.target.parentNode.children;
        // https://medium.com/@larry.sassainsworth/iterating-over-an-html-collection-in-javascript-5071f58fad6b
        Array.prototype.map.call(parentChildren, child => {
            if (child.tagName === 'INPUT' && child.type === 'password') {
                child.type = 'text';
            } else if (child.tagName === 'INPUT' && child.type === 'text') {
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
            let emailPasswordOutput = document.querySelector(`output[for="${input.id} password"]`);
            if (!emailPasswordOutput) {
                emailPasswordOutput = document.querySelector(`output[for="email ${input.id}"]`);
            }
            if (output) {
                output.textContent = '';
            }
            if (emailPasswordOutput) {
                emailPasswordOutput.textContent = '';
            }
        }
    })
})
