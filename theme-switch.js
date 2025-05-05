// Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
    // Create theme switch element
    const themeSwitch = document.createElement("div")
    themeSwitch.className = "theme-switch"
    themeSwitch.innerHTML = '<i class="fas fa-moon"></i>'
    document.body.appendChild(themeSwitch)
  
    // Check for saved theme
    const currentTheme = localStorage.getItem("theme") || "light"
    if (currentTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
      themeSwitch.innerHTML = '<i class="fas fa-sun"></i>'
    }
  
    // Theme toggle logic
    themeSwitch.addEventListener("click", () => {
      if (document.documentElement.getAttribute("data-theme") === "dark") {
        document.documentElement.setAttribute("data-theme", "light")
        localStorage.setItem("theme", "light")
        themeSwitch.innerHTML = '<i class="fas fa-moon"></i>'
  
        // Animation for theme change
        document.body.style.transition = "background-color 0.5s ease"
        setTimeout(() => {
          document.body.style.transition = ""
        }, 500)
      } else {
        document.documentElement.setAttribute("data-theme", "dark")
        localStorage.setItem("theme", "dark")
        themeSwitch.innerHTML = '<i class="fas fa-sun"></i>'
  
        // Animation for theme change
        document.body.style.transition = "background-color 0.5s ease"
        setTimeout(() => {
          document.body.style.transition = ""
        }, 500)
      }
    })
  })
  