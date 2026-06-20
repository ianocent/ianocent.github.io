/*=============== HEADER SCROLL STATE ===============*/
const header = document.getElementById('header');

function scrollHeader() {
  if (!header) return;
  header.classList.toggle('scroll-header', window.scrollY >= 50);
}

window.addEventListener('scroll', scrollHeader, { passive: true });

/*=============== SERVICES MODAL ===============*/
const modalViews = document.querySelectorAll('.services__modal');
const modalButtons = document.querySelectorAll('.services__button');
const modalCloses = document.querySelectorAll('.services__modal-close');

function openModal(index) {
  modalViews[index]?.classList.add('active-modal');
}

function closeModals() {
  modalViews.forEach((modalView) => {
    modalView.classList.remove('active-modal');
  });
}

modalButtons.forEach((button, index) => {
  button.addEventListener('click', () => openModal(index));
});

modalCloses.forEach((button) => {
  button.addEventListener('click', closeModals);
});

/*=============== MIXITUP FILTER PORTFOLIO ===============*/
if (typeof mixitup !== 'undefined' && document.querySelector('.work__container')) {
  mixitup('.work__container', {
    selectors: {
      target: '.work__card',
    },
    animation: {
      duration: 300,
    },
  });
}

/*=============== ACTIVE WORK FILTER ===============*/
const workLinks = document.querySelectorAll('.work__item');

function activeWork() {
  workLinks.forEach((link) => link.classList.remove('active-work'));
  this.classList.add('active-work');
}

workLinks.forEach((link) => {
  link.addEventListener('click', activeWork);
});

/*=============== SWIPER TESTIMONIAL ===============*/
if (typeof Swiper !== 'undefined' && document.querySelector('.testimonial__container')) {
  new Swiper('.testimonial__container', {
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 48,
      },
    },
  });
}

/*=============== ACTIVE SECTION LINK ===============*/
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 58;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav__menu a[href*="${sectionId}"]`);

    if (!navLink) return;

    const isActive = scrollY > sectionTop && scrollY <= sectionTop + sectionHeight;
    navLink.classList.toggle('active-link', isActive);
  });
}

window.addEventListener('scroll', scrollActive, { passive: true });

/*=============== LIGHT / DARK THEME ===============*/
const themeButton = document.getElementById('theme-button');
const lightTheme = 'light-theme';
const iconTheme = 'bx-sun';

const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');

const getCurrentTheme = () => (
  document.body.classList.contains(lightTheme) ? 'dark' : 'light'
);

const getCurrentIcon = () => (
  themeButton?.classList.contains(iconTheme) ? 'bx bx-moon' : 'bx bx-sun'
);

if (selectedTheme) {
  document.body.classList.toggle(lightTheme, selectedTheme === 'dark');
  themeButton?.classList.toggle(iconTheme, selectedIcon === 'bx bx-moon');
}

themeButton?.addEventListener('click', () => {
  document.body.classList.toggle(lightTheme);
  themeButton.classList.toggle(iconTheme);

  localStorage.setItem('selected-theme', getCurrentTheme());
  localStorage.setItem('selected-icon', getCurrentIcon());
});

/*=============== SCROLL REVEAL ANIMATION ===============*/
if (typeof ScrollReveal !== 'undefined') {
  const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
  });

  sr.reveal('.home__social, .home__scroll', {
    delay: 900,
    origin: 'bottom',
  });
}
