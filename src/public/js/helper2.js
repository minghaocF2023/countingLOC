import { availableMedicine } from './medicine.js';

const standardizeMedicineName = (name) => name
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .split(' ')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

(() => {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      const quantityInput = form.querySelector('#medicineQuantity');
      const medicineNameInput = form.querySelector('#medicineName');
      // eslint-disable-next-line max-len
      // const selectedMedicine = availableMedicine.find((medicine) => medicine.name.trim() === medicineNameInput.value.trim());

      if (quantityInput && parseInt(quantityInput.value, 10) <= 0) {
        quantityInput.setCustomValidity('Invalid');
      } else {
        quantityInput.setCustomValidity('');
      }

      // Validate medicine name
      //   if (medicineNameInput && !availableMedicine.includes(medicineNameInput.value.trim())) {
      const standardizedMedicineName = standardizeMedicineName(medicineNameInput.value);
      if (!standardizedMedicineName || !availableMedicine.includes(standardizedMedicineName)) {
        medicineNameInput.setCustomValidity('Invalid medicine name');
      } else {
        medicineNameInput.setCustomValidity('');
      }

      // Check form validity
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        console.log('hiiii');
        // window.location.href = '/requestConfirmation';
        event.preventDefault();
      }

      form.classList.add('was-validated');
    //   window.location.href = '/requestConfirmation';
    }, false);
  });
})();
