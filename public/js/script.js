document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const teamCards = document.getElementById("teamCards");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.toLowerCase();
      const cards = teamCards.querySelectorAll(".card");

      cards.forEach(card => {
        const teamName = card.querySelector("h3").textContent.toLowerCase();
        if (teamName.includes(keyword)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
});
