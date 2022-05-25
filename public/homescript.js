"use strict";

// *****STICKY NAVIGATION CODE****
const header = document.querySelector("header");
const heroSection = document.querySelector(".hero-section");
const section1 = document.querySelector(".firstsection");
const headerHeight = header.getBoundingClientRect();

const stickyNav = function(entries) {
    const [entry] = entries;
    console.log(entry);
    if (!entry.isIntersecting) {
        header.classList.add("nav-sticky");
        header.style.backgroundColor = "rgba(253, 227, 222, 0.7)";
    } else {
        header.classList.remove("nav-sticky");
    }
};
const headerObserver = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${headerHeight.height}px`,
});
headerObserver.observe(heroSection);

//*****REVEALING SECTIONS CODE*****

const revealSection = function(entries, observer) {
    const [entry] = entries;
    console.log(entry);
    if (!entry.isIntersecting) return;
    if (entry.isIntersecting) entry.target.classList.add("section-hidden");
    observer.unobserve(entry.target);
};
const allSections = document.querySelectorAll(".room-set-up");
const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
});
allSections.forEach(function(section) {
    sectionObserver.observe(section);
    section.classList.remove("section-hidden");
});

//*****MOBILE AND TABLET NAVIGATION****
const openButton = document.querySelector(".btn-open");
const closeButton = document.querySelector(".btn-close");

openButton.addEventListener("click", function(e) {
    header.classList.add("nav-open");
});
closeButton.addEventListener("click", function(e) {
    header.classList.remove("nav-open");
});