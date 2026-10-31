// Renders the portfolio from CONTENT (content.js).
// Harsh never touches this file — only content.js.
(function () {
  const C = CONTENT;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------- Hero ----------
  document.getElementById("tBefore").textContent = C.taglineBefore;
  document.getElementById("tWord").textContent = C.highlight;

  // ---------- About ----------
  const about = document.getElementById("about");
  if (!C.showAbout) {
    about.style.display = "none";
  } else {
    const bioEl = document.getElementById("bio");
    const h = C.bioHighlight || "";
    if (h && C.bio.indexOf(h) !== -1) {
      const i = C.bio.indexOf(h);
      bioEl.appendChild(document.createTextNode(C.bio.slice(0, i)));
      const sp = document.createElement("span");
      sp.className = "hl";
      sp.textContent = h;
      bioEl.appendChild(sp);
      bioEl.appendChild(document.createTextNode(C.bio.slice(i + h.length)));
    } else {
      bioEl.textContent = C.bio;
    }
    const skillCls = ["y", "g", "p", "b"];
    const skillSym = ["✦", "◐", "♥", "✦"];
    document.getElementById("skills").innerHTML = (C.skills || []).map(function (s, i) {
      return '<span class="skill ' + skillCls[i % 4] + '">' + skillSym[i % 4] + " " + esc(s) + "</span>";
    }).join("");
  }

  // ---------- Projects ----------
  const grads = [
    ["linear-gradient(135deg,#a8e6cf,#ffd23f)", "#333"],
    ["linear-gradient(135deg,#ffb3cd,#2b6cff)", "#fff"],
    ["linear-gradient(135deg,#ffd23f,#a8e6cf)", "#333"],
    ["linear-gradient(135deg,#3ecf6e,#2b6cff)", "#fff"]
  ];
  const work = document.getElementById("work");
  work.innerHTML = (C.projects || []).map(function (p, i) {
    const dark = i % 2 === 0;
    const tab = '<div class="proj-tabs reveal"><span class="proj-tab' + (dark ? " hl" : "") + '">✦ PROJECT 0' + (i + 1) + "</span></div>";
    let media;
    if (p.image) {
      media = '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" />';
    } else {
      const g = grads[i % grads.length];
      media = '<div style="aspect-ratio:16/10;display:grid;place-items:center;background:' + g[0] + ';font-family:\'Caveat\',cursive;font-size:26px;color:' + g[1] + '">' + esc(p.placeholder || "✦ " + p.title) + "</div>";
    }
    const cta = p.link
      ? '<a class="view" href="' + esc(p.link) + '" target="_blank" rel="noreferrer">VIEW PROJECT →</a>'
      : '<span class="soon">FULL BREAKDOWN SOON</span>';
    const card = '<article class="proj-card ' + (dark ? "dark" : "sun") + ' reveal"><div><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p>" + cta + '</div><div class="proj-img">' + media + '<div class="cap">' + esc(p.caption || "") + "</div></div></article>";
    return tab + card + (i < C.projects.length - 1 ? '<div class="proj-spacer"></div>' : "");
  }).join("");

  // ---------- Footer / contact ----------
  document.getElementById("contactRow").innerHTML =
    '<a class="contact-pill mail" href="mailto:' + esc(C.email) + '">✉ ' + esc(C.email) + "</a>" +
    '<a class="contact-pill ig" href="' + esc(C.instagramUrl) + '" target="_blank" rel="noreferrer">◎ @' + esc(C.instagram) + "</a>" +
    '<a class="contact-pill li" href="' + esc(C.linkedinUrl) + '" target="_blank" rel="noreferrer">in LinkedIn ↗</a>';
  document.getElementById("footNote").textContent = C.footerNote;
})();
