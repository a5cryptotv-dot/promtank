(function() {
  'use strict';
  var quizEl = document.getElementById('quiz-block');
  if (!quizEl) return;
  var state = {
    volume: 0,
    shape: '',
    industry: '',
    heating: '',
    name: '',
    phone: '',
    email: '',
    company: ''
  };
  var currentStep = 0;
  var TOTAL_STEPS = 5;
  var stepEls = quizEl.querySelectorAll('.quiz-step');
  var progressDots = quizEl.querySelectorAll('.quiz-progress-step');
  var stepLabel = document.getElementById('quizStepLabel');
  var stepTitle = document.getElementById('quizStepTitle');
  var prevBtn = document.getElementById('quizPrevBtn');
  var nextBtn = document.getElementById('quizNextBtn');
  var submitBtn = document.getElementById('quizSubmitBtn');
  var successEl = document.getElementById('quizSuccess');
  var stepLabels = ['Объём', 'Форма', 'Отрасль', 'Нагрев', 'Контакты'];
  var stepTitles = [
    'Какой объём ёмкости вам нужен?',
    'Форма ёмкости',
    'Для какой отрасли?',
    'Нужна термообработка?',
    'Куда отправить расчёт?'
  ];
  var volPrices = {
    1000: 650000,
    3000: 1400000,
    15000: 4200000,
    60000: 10000000
  };
  var heatPercent = {
    'без термообработки': 0,
    'рубашка охлаждения': 0.35,
    'паровой нагрев': 0.55,
    'трёхстенная': 0.75
  };
  var shapeMultiplier = {
    'цилиндрическая': 1,
    'прямоугольная': 1.30
  };
  var indMultiplier = {
    'пивоварение': 1,
    'молочная': 1.15,
    'виноделие': 1.08,
    'промышленное': 1.30
  };
  function calcEstimate() {
    var base = volPrices[state.volume] || 0;
    if (base === 0) return { price: 0, priceFrom: 0, label: '—', labelFrom: '—' };
    var s = shapeMultiplier[state.shape] || 1;
    var ind = indMultiplier[state.industry] || 1;
    var shapedBase = Math.round(base * s * ind / 1000) * 1000;
    var hPct = heatPercent[state.heating] || 0;
    var total = Math.round(shapedBase * (1 + hPct) / 1000) * 1000;
    var priceFrom = Math.round(base * ind / 1000) * 1000;
    function formatPrice(val) {
      if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + ' млн';
      if (val >= 1000) return (val / 1000).toFixed(0) + ' тыс';
      return String(val);
    }
    return {
      price: total,
      priceFrom: priceFrom,
      label: formatPrice(total),
      labelFrom: formatPrice(priceFrom)
    };
  }
  var paramLabels = {
    volume: { ico: '\uD83D\uDCCA', label: 'Объём' },
    shape: { ico: '\uD83D\uDD32', label: 'Форма' },
    industry: { ico: '\uD83C\uDFED', label: 'Отрасль' },
    heating: { ico: '\uD83D\uDD25', label: 'Нагрев' }
  };
  var heatingLabels = { 'без термообработки': 'Без нагрева', 'рубашка охлаждения': 'Охлаждение', 'паровой нагрев': 'Паровой', 'трёхстенная': 'Трёхстенная' };
  var includedMap = {
    'пивоварение': ['Емкость AISI 304', 'Лазерная сварка', 'Пищевой шлиф'],
    'молочная': ['Емкость AISI 304', 'Зеркальная полировка', 'Душ/Tройник'],
    'виноделие': ['Емкость AISI 304', 'Крыша с замком', 'Кран сливной'],
    'промышленное': ['Емкость AISI 304/316', 'Усиленные швы', 'Паспорт сосуда']
  };
  var heatIncluded = {
    'рубашка охлаждения': ['Рубашка охлаждения'],
    'паровой нагрев': ['Паровой нагрев', 'Клапан предохранительный'],
    'трёхстенная': ['Трёхстенная рубашка', 'Терморегулятор']
  };
  function updateCp() {
    var priceEl = document.getElementById('quizEstPrice');
    var paramsEl = document.getElementById('cpParams');
    var inclEl = document.getElementById('cpIncluded');
    var inclBlock = document.getElementById('cpIncludedBlock');
    var cpNumEl = document.getElementById('cpNumber');
    var cpDateEl = document.getElementById('cpDate');
    if (!priceEl || !paramsEl) return;
    if (cpNumEl) cpNumEl.textContent = String(1000 + Math.floor(Math.random() * 9000));
    if (cpDateEl) {
      var d = new Date();
      cpDateEl.textContent = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    var est = calcEstimate();
    var displayLabel = est.labelFrom !== '—' ? 'от ' + est.labelFrom : '—';
    animatePrice(priceEl, displayLabel);
    var fields = ['volume', 'shape', 'industry', 'heating'];
    var html = '';
    fields.forEach(function(f) {
      var val = state[f];
      var info = paramLabels[f];
      if (!info) return;
      if (f === 'volume' && val > 0) {
        html += '<div class="cp-param"><span class="cp-param-label"><span class="cp-param-ico">' + info.ico + '</span>' + info.label + '</span><span class="cp-param-value">' + val + ' л</span></div>';
      } else if (f === 'heating' && val) {
        html += '<div class="cp-param"><span class="cp-param-label"><span class="cp-param-ico">' + info.ico + '</span>' + info.label + '</span><span class="cp-param-value">' + (heatingLabels[val] || val) + '</span></div>';
      } else if (val) {
        html += '<div class="cp-param"><span class="cp-param-label"><span class="cp-param-ico">' + info.ico + '</span>' + info.label + '</span><span class="cp-param-value">' + val.charAt(0).toUpperCase() + val.slice(1) + '</span></div>';
      }
    });
    paramsEl.innerHTML = html;
    var items = [];
    if (state.industry && includedMap[state.industry]) {
      items = items.concat(includedMap[state.industry]);
    }
    if (state.heating && heatIncluded[state.heating]) {
      items = items.concat(heatIncluded[state.heating]);
    }
    if (state.volume > 0) {
      items.push('Гидроиспытания ' + state.volume + ' л');
    }
    items.push('Доставка по РФ');
    if (items.length > 0 && inclBlock && inclEl) {
      inclBlock.style.display = 'block';
      inclEl.innerHTML = items.map(function(i) { return '<span class="cp-included-item">' + i + '</span>'; }).join('');
    }
  }
  var priceAnimFrame;
  function animatePrice(el, target) {
    if (priceAnimFrame) { cancelAnimationFrame(priceAnimFrame); priceAnimFrame = null; }
    if (target === '—') { el.textContent = '—'; return; }
    var prefix = '';
    if (target.indexOf('от ') === 0) { prefix = 'от '; target = target.substring(3); }
    var suffix = '';
    if (target.indexOf('млн') !== -1) { suffix = ' млн'; target = target.replace(' млн', ''); }
    else if (target.indexOf('тыс') !== -1) { suffix = ' тыс'; target = target.replace(' тыс', ''); }
    var targetNum = parseFloat(target.replace(/,/g, '.'));
    if (isNaN(targetNum)) { el.textContent = prefix + target + suffix; return; }
    var startVal = 0;
    var duration = 600;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(startVal + (targetNum - startVal) * eased);
      var txt = prefix;
      if (suffix === ' млн') txt += current.toFixed(1).replace('.0', '') + ' млн';
      else txt += current + suffix;
      el.textContent = txt;
      if (progress < 1) priceAnimFrame = requestAnimationFrame(step);
    }
    priceAnimFrame = requestAnimationFrame(step);
  }
  function updateUI() {
    stepEls.forEach(function(el, i) {
      el.classList.toggle('active', i === currentStep);
    });
    progressDots.forEach(function(dot, i) {
      dot.classList.remove('active', 'done');
      if (i < currentStep) dot.classList.add('done');
      else if (i === currentStep) dot.classList.add('active');
    });
    if (stepLabel) stepLabel.textContent = 'Шаг ' + (currentStep + 1) + ' из ' + TOTAL_STEPS + ' · ' + stepLabels[currentStep];
    if (stepTitle) stepTitle.textContent = stepTitles[currentStep];
    if (prevBtn) prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
    if (nextBtn) {
      if (currentStep < TOTAL_STEPS - 1) {
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = !isStepValid(currentStep);
      } else {
        nextBtn.style.display = 'none';
      }
    }
    if (submitBtn) submitBtn.style.display = currentStep === TOTAL_STEPS - 1 ? 'block' : 'none';
    if (currentStep === TOTAL_STEPS - 1) updateCp();
  }
  function isStepValid(step) {
    switch (step) {
      case 0: return state.volume > 0;
      case 1: return state.shape !== '';
      case 2: return state.industry !== '';
      case 3: return state.heating !== '';
      case 4: return state.name.trim() !== '' && state.phone.trim() !== '';
      default: return false;
    }
  }
  function goToStep(idx) {
    currentStep = Math.max(0, Math.min(idx, TOTAL_STEPS - 1));
    updateUI();
  }
  function goNext() { goToStep(currentStep + 1); }
  function goPrev() { goToStep(currentStep - 1); }
  function selectOption(field, value) {
    state[field] = value;
    var opts = quizEl.querySelectorAll('.quiz-option[data-field="' + field + '"]');
    opts.forEach(function(el) {
      el.classList.toggle('selected', el.dataset.value === String(value));
    });
    if (field !== 'name' && field !== 'phone' && field !== 'email' && field !== 'company') {
      setTimeout(goNext, 300);
    } else {
      updateUI();
    }
  }
  quizEl.querySelectorAll('.quiz-option').forEach(function(el) {
    el.addEventListener('click', function() {
      var field = this.dataset.field;
      var value = this.dataset.value;
      if (field && value) selectOption(field, value);
    });
  });
  var nameInput = document.getElementById('quizName');
  var phoneInput = document.getElementById('quizPhone');
  var emailInput = document.getElementById('quizEmail');
  var companyInput = document.getElementById('quizCompany');
  function onFormInput() {
    state.name = (nameInput && nameInput.value) || '';
    state.phone = (phoneInput && phoneInput.value) || '';
    state.email = (emailInput && emailInput.value) || '';
    state.company = (companyInput && companyInput.value) || '';
    updateUI();
  }
  if (nameInput) nameInput.addEventListener('input', onFormInput);
  if (phoneInput) phoneInput.addEventListener('input', onFormInput);
  if (emailInput) emailInput.addEventListener('input', onFormInput);
  if (companyInput) companyInput.addEventListener('input', onFormInput);
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      var val = this.value.replace(/\D/g, '');
      var fmt = '';
      if (val.length > 0) {
        var c = val[0];
        if (c === '7' || c === '8') {
          val = val.substring(1);
          fmt = '+' + c;
          if (val.length > 0) fmt += ' (' + val.substring(0, 3);
          if (val.length > 3) fmt += ') ' + val.substring(3, 6);
          if (val.length > 6) fmt += '-' + val.substring(6, 8);
          if (val.length > 8) fmt += '-' + val.substring(8, 10);
        } else {
          fmt = '+' + val;
        }
      }
      this.value = fmt;
    });
  }
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);
  function clearFieldErrors() {
    quizEl.querySelectorAll('.field-error').forEach(function(el) { el.classList.remove('field-error'); });
    quizEl.querySelectorAll('.field-error-message').forEach(function(el) { el.remove(); });
  }
  function showFieldError(input, msg) {
    input.classList.add('field-error');
    var errEl = document.createElement('span');
    errEl.className = 'field-error-message';
    errEl.textContent = msg;
    input.parentElement.appendChild(errEl);
  }
  function sendTelegramLead(data) {
    var token = '8153500092:AAE2kj4pFcLDqgVL-EQ2TH0eTFW7gDR62YQ';
    var chatId = '-1002489626904';
    var text = [
      '\uD83D\uDCE5 <b>Новая заявка (Квиз)</b>',
      '\uD83D\uDC64 Имя: ' + data.name,
      '\uD83D\uDCDE Телефон: ' + data.phone,
      '\uD83D\uDCE7 Email: ' + (data.email || '—'),
      '\uD83C\uDFED Компания: ' + (data.company || '—'),
      '\uD83D\uDCCA Объём: ' + data.volume,
      '\uD83D\uDD32 Форма: ' + data.shape,
      '\uD83C\uDFED Отрасль: ' + data.industry,
      '\uD83D\uDD25 Нагрев: ' + data.heating,
      '\uD83D\uDCB0 Цена: ' + data.price,
      '\uD83D\uDCC5 ' + new Date().toLocaleString('ru-RU'),
      '\uD83D\uDD17 ' + window.location.href
    ].join('\n');
    return fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    }).then(function(r) { return r.json(); });
  }
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      clearFieldErrors();
      var hasError = false;
      if (!state.name.trim()) {
        if (nameInput) { showFieldError(nameInput, 'Укажите имя'); hasError = true; }
      }
      if (!state.phone.trim()) {
        if (phoneInput) { showFieldError(phoneInput, 'Укажите телефон'); hasError = true; }
      }
      if (hasError) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
      var est = calcEstimate();
      var priceText = est.labelFrom !== '—' ? 'от ' + est.labelFrom + ' ₽' : '—';
      sendTelegramLead({
        name: state.name,
        phone: state.phone,
        email: state.email,
        company: state.company,
        volume: state.volume > 0 ? state.volume + ' л' : '—',
        shape: state.shape || '—',
        industry: state.industry || '—',
        heating: state.heating || '—',
        price: priceText
      }).then(function() {
        submitBtn.style.display = 'none';
        quizEl.querySelector('.quiz-steps').style.display = 'none';
        if (successEl) {
          var tagsHtml = '';
          var tagData = [
            state.volume > 0 ? state.volume + ' л' : '',
            state.shape,
            state.industry,
            state.heating,
            priceText
          ].filter(Boolean);
          tagData.forEach(function(t) {
            tagsHtml += '<span class="quiz-success-tag">' + t + '</span>';
          });
          successEl.querySelector('.quiz-success-tags').innerHTML = tagsHtml;
          successEl.classList.add('active');
        }
      }).catch(function() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ошибка. Попробуйте снова';
        setTimeout(function() {
          submitBtn.textContent = '\uD83D\uDE80 Получить расчёт';
        }, 3000);
      });
    });
  }
  updateUI();
})();