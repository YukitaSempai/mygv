(function () {
  'use strict';

  /* ─── DOM refs ─── */
  const form = document.getElementById('registrationForm');
  const nameEl = document.getElementById('regName');
  const emailEl = document.getElementById('regEmail');
  const phoneEl = document.getElementById('regPhone');
  const packageEl = document.getElementById('regPackage');
  const partnersEl = document.getElementById('regPartners');
  const partnersGroup = document.getElementById('partnersGroup');
  const mulligansEl = document.getElementById('regMulligans');
  const raffleEl = document.getElementById('regRaffle');
  const dinnerEl = document.getElementById('regDinner');
  const totalDisplay = document.getElementById('totalDisplay');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const alertEl = document.getElementById('formAlert');
  const cardNameEl = document.getElementById('cardName');
  const cardNumberEl = document.getElementById('cardNumber');
  const cardExpiryEl = document.getElementById('cardExpiry');
  const cardCvvEl = document.getElementById('cardCvv');

  const requiredFields = [nameEl, emailEl, phoneEl, packageEl, cardNameEl, cardNumberEl, cardExpiryEl, cardCvvEl];
  const priceMap = { Individual: 150, Foursome: 550, Sponsor: 1000 };

  /* ─── helpers ─── */
  function showAlert(msg, type) {
    alertEl.className = 'alert alert-' + type + ' alert-dismissible fade show';
    alertEl.innerHTML = msg + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
  }

  function hideAlert() {
    alertEl.className = 'alert d-none';
    alertEl.innerHTML = '';
  }

  function getVal(el) {
    return el ? el.value.trim() : '';
  }

  /* ─── validators ─── */
  function validateName(v) { return v.length >= 2; }
  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validatePhone(v) { return /^\d{10}$/.test(v); }
  function validatePackage(v) { return v !== ''; }
  function validatePartners(v) {
    const pkg = getVal(packageEl);
    if (pkg !== 'Foursome') return true;
    return v.length >= 3;
  }
  function validateCardName(v) { return v.length >= 2; }
  function validateCardNumber(v) { return /^\d{16}$/.test(v.replace(/\s/g, '')); }
  function validateExpiry(v) { return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v); }
  function validateCvv(v) { return /^\d{3}$/.test(v); }

  const fieldValidators = {};
  fieldValidators[nameEl.id] = { fn: validateName, msg: 'Please enter your full name.' };
  fieldValidators[emailEl.id] = { fn: validateEmail, msg: 'Please enter a valid email address.' };
  fieldValidators[phoneEl.id] = { fn: validatePhone, msg: 'Please enter a valid 10-digit phone number.' };
  fieldValidators[packageEl.id] = { fn: validatePackage, msg: 'Please select a package.' };
  fieldValidators[cardNameEl.id] = { fn: validateCardName, msg: 'Please enter the name on your card.' };
  fieldValidators[cardNumberEl.id] = { fn: validateCardNumber, msg: 'Please enter a valid 16-digit card number.' };
  fieldValidators[cardExpiryEl.id] = { fn: validateExpiry, msg: 'Please enter a valid expiry (MM/YY).' };
  fieldValidators[cardCvvEl.id] = { fn: validateCvv, msg: 'Please enter a valid 3-digit CVV.' };

  /* ─── single field validation ─── */
  function validateField(el) {
    if (!el) return true;
    const v = getVal(el);
    const rule = fieldValidators[el.id];
    if (!rule) return true;
    const valid = rule.fn(v);
    if (el === packageEl && v === 'Foursome') {
      togglePartners(true);
      const pv = getVal(partnersEl);
      if (!pv || pv.length < 3) {
        partnersEl.classList.add('is-invalid');
        partnersEl.classList.remove('is-valid');
      } else {
        partnersEl.classList.remove('is-invalid');
        partnersEl.classList.add('is-valid');
      }
    } else if (el === packageEl) {
      togglePartners(false);
    }
    if (valid) {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
    } else {
      el.classList.remove('is-valid');
      el.classList.add('is-invalid');
    }
    return valid;
  }

  /* ─── partners visibility ─── */
  function togglePartners(show) {
    partnersGroup.style.display = show ? 'block' : 'none';
    if (show) {
      partnersEl.setAttribute('required', '');
    } else {
      partnersEl.removeAttribute('required');
      partnersEl.classList.remove('is-invalid', 'is-valid');
    }
  }

  /* ─── check form validity ─── */
  function checkForm() {
    let allValid = true;
    requiredFields.forEach(function (el) {
      if (!validateField(el)) allValid = false;
    });
    if (getVal(packageEl) === 'Foursome') {
      if (!validatePartners(getVal(partnersEl))) allValid = false;
    }
    submitBtn.disabled = !allValid;
    return allValid;
  }

  /* ─── total calculation ─── */
  function calcTotal() {
    const pkg = getVal(packageEl);
    const base = priceMap[pkg] || 0;
    const mulligans = parseInt(getVal(mulligansEl)) * 5;
    const raffle = parseInt(getVal(raffleEl)) * 10;
    const dinner = getVal(dinnerEl) === 'Yes' ? 50 : 0;
    const total = base + mulligans + raffle + dinner;
    totalDisplay.textContent = '$' + total;
  }

  /* ─── select package from pricing cards ─── */
  window.selectPackage = function (name) {
    packageEl.value = name;
    validateField(packageEl);
    calcTotal();
    checkForm();
    document.getElementById('register').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ─── events ─── */
  requiredFields.forEach(function (el) {
    el.addEventListener('blur', function () {
      validateField(el);
      checkForm();
    });
    el.addEventListener('input', function () {
      validateField(el);
      checkForm();
      calcTotal();
    });
  });

  var addOns = [mulligansEl, raffleEl, dinnerEl, packageEl];
  addOns.forEach(function (el) {
    if (el) el.addEventListener('change', calcTotal);
  });

  partnersEl.addEventListener('blur', function () {
    if (getVal(packageEl) === 'Foursome') {
      validateField(partnersEl);
      checkForm();
    }
  });
  partnersEl.addEventListener('input', function () {
    if (getVal(packageEl) === 'Foursome') {
      validateField(partnersEl);
      checkForm();
    }
  });

  /* card number formatting */
  cardNumberEl.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 16);
    let formatted = '';
    for (let i = 0; i < v.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += v[i];
    }
    this.value = formatted;
  });

  cardExpiryEl.addEventListener('input', function () {
    let v = this.value.replace(/[^\d]/g, '').slice(0, 4);
    if (v.length >= 3) {
      this.value = v.slice(0, 2) + '/' + v.slice(2);
    } else {
      this.value = v;
    }
  });

  cardCvvEl.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
  });

  /* ─── submit ─── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideAlert();
    if (!checkForm()) return;

    submitBtn.disabled = true;
    submitText.textContent = 'Processing...';
    submitSpinner.classList.remove('d-none');

    setTimeout(function () {
      submitSpinner.classList.add('d-none');
      submitText.textContent = 'Submit Registration';
      submitBtn.disabled = false;

      showAlert(
        '<i class="bi bi-check-circle-fill me-2"></i> <strong>Registration Successful!</strong> ' +
        'You will receive a confirmation email shortly.',
        'success'
      );

      form.reset();
      requiredFields.forEach(function (el) {
        el.classList.remove('is-valid', 'is-invalid');
      });
      partnersGroup.style.display = 'none';
      partnersEl.removeAttribute('required');
      partnersEl.classList.remove('is-valid', 'is-invalid');
      totalDisplay.textContent = '$150';
      submitBtn.disabled = true;

      setTimeout(function () {
        document.getElementById('hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 2000);
    }, 2000);
  });

  /* ─── init ─── */
  togglePartners(false);
  calcTotal();
  checkForm();

})();