document.addEventListener('DOMContentLoaded', () => {
  fetch('/menu.html')
    .then(response => {
      if(!response.ok) throw new Error('Menu no encontrado');
      return response.text();
    })
    .then(data => {
      document.getElementById('menu-contenedor').innerHTML = data;
      const scripts = document.getElementById('menu-contenedor').querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      });
    })
    .catch(error => console.error('Error al cargar el menú:', error));
});
