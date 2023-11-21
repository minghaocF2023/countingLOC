(() => {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      const quantityInput = form.querySelector('#medicineQuantity');
      if (quantityInput && parseInt(quantityInput.value, 10) <= 0) {
        quantityInput.setCustomValidity('Invalid');
      } else {
        quantityInput.setCustomValidity('');
      }
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });
})();
