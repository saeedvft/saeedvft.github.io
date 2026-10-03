(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Reveal headings, code blocks, tables, quotes and images as they scroll into view
  var targets = document.querySelectorAll(
    "article h2, article h3, article pre, article table, article blockquote, article img, article figure"
  );
  if ("IntersectionObserver" in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // Thin reading-progress bar at the top of posts
  var article = document.querySelector("article");
  if (article) {
    var bar = document.createElement("div");
    bar.className = "read-progress";
    document.body.appendChild(bar);
    var ticking = false;
    var update = function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var done = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
      bar.style.transform = "scaleX(" + done + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
})();