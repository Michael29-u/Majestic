async function loadComponents() {
  const components = ['header', 'footer', 'birthday-widget'];
  
  for (const name of components) {
    const placeholder = document.querySelector(`[data-component="${name}"]`);
    if (placeholder) {
      try {
        const response = await fetch(`components/${name}.html`);
        const html = await response.text();
        placeholder.innerHTML = html;
      } catch (err) {
        console.error(`Failed to load ${name}:`, err);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', loadComponents);