// Navbar Active Script
window.addEventListener('scroll', () => {
  let sections = document.querySelectorAll('section');
  let navLinks = document.querySelectorAll('.nav-link');

  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
});

// Script for Form to GoogleSheets
const scriptURL = 'https://script.google.com/macros/s/AKfycbzWscwvmfPHsrD0PFYmytr3Hr3UHTo46rhpMQ6vB_-aPoSeKnm37EYNEP2OAshRNfM-Dw/exec'
const form = document.forms['contact-form']
const btnSend = document.querySelector('.btn-send');
const btnLoading = document.querySelector('.btn-loading');
const myAlert = document.querySelector('.my-alert');

form.addEventListener('submit', e => {
  e.preventDefault()
  btnSend.classList.toggle('d-none');
  btnLoading.classList.toggle('d-none');
  fetch(scriptURL, { method: 'POST', body: new FormData(form) })
    .then(response => {
      btnSend.classList.toggle('d-none');
      btnLoading.classList.toggle('d-none');
      myAlert.classList.toggle('d-none');

      form.reset();
      console.log('Success!', response);
    })
    .catch(error => console.error('Error!', error.message))
});