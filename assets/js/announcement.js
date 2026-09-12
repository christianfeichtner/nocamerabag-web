document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("site-announcement");
  if (!bar) return;

  const campaignId = bar.dataset.campaignId;
  const cookieDays = parseInt(bar.dataset.cookieDays, 10) || 30;
  const cookieName = `announcement_closed_${campaignId}`;

  // Cookie auslesen
  const isClosed = document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${cookieName}=true`));

  // Falls nicht geschlossen: Nach 1 Sekunde sanft aufklappen
  if (!isClosed) {
    setTimeout(() => {
      bar.classList.add("is-visible");
    }, 1000);
  }

  // Schließen-Button Event
  const closeBtn = document.getElementById("announcement-close");
  closeBtn?.addEventListener("click", () => {
    bar.classList.remove("is-visible");
    const maxAge = cookieDays * 86400;
    document.cookie = `${cookieName}=true; max-age=${maxAge}; path=/; SameSite=Lax`;
  });
});
