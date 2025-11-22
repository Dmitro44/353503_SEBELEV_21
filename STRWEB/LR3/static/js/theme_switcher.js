const themeToggle = document.getElementById('theme-toggle');
const doc = document.documentElement;

themeToggle.addEventListener('click', () => {
    if (doc.getAttribute('data-theme') === 'dark') {
        doc.removeAttribute('data-theme');
        localStorage.removeItem('theme');
    } else {
        doc.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

// On page load, check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    doc.setAttribute('data-theme', savedTheme);
}
