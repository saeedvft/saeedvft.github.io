function addCopyButtons() {
  document.querySelectorAll("pre > code").forEach((code) => {
    const pre = code.parentElement;
    if (pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "copy";
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(code.innerText);
      btn.textContent = "copied";
      setTimeout(() => (btn.textContent = "copy"), 1500);
    });
    pre.appendChild(btn);
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addCopyButtons);
} else {
  addCopyButtons();
}
