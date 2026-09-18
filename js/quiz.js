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
  var cpNumberValue = null;
  var cpDateValue = null;
  function round1000(v) { return Math.round(v / 1000) * 1000; }
  function fmtMoney(v) { return Math.round(v).toLocaleString('ru-RU'); }
  function trimMult(v) { return Number(v).toFixed(2).replace(/\.?0+$/, ''); }
  function titleCase(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function calcEstimate() {
    var base = volPrices[state.volume] || 0;
    if (base === 0) return { ok: false, base: 0, from: 0, total: 0, shapeMult: 1, indMult: 1, heatPct: 0 };
    var shapeMult = shapeMultiplier[state.shape] || 1;
    var indMult = indMultiplier[state.industry] || 1;
    var heatPct = heatPercent[state.heating] || 0;
    var from = round1000(base * indMult);
    var total = round1000(base * shapeMult * indMult * (1 + heatPct));
    return {
      ok: true,
      base: base,
      from: from,
      total: total,
      shapeMult: shapeMult,
      indMult: indMult,
      heatPct: heatPct
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
  function cpParam(info, valueHtml) {
    return '<div class="cp-param"><span class="cp-param-label"><span class="cp-param-ico">' + info.ico + '</span>' + info.label + '</span><span class="cp-param-value">' + valueHtml + '</span></div>';
  }
  function updateCp() {
    var priceEl = document.getElementById('quizEstPrice');
    var paramsEl = document.getElementById('cpParams');
    var inclEl = document.getElementById('cpIncluded');
    var inclBlock = document.getElementById('cpIncludedBlock');
    var cpNumEl = document.getElementById('cpNumber');
    var cpDateEl = document.getElementById('cpDate');
    var noteEl = document.getElementById('cpPriceNote');
    if (!priceEl || !paramsEl) return;
    if (!cpNumberValue) cpNumberValue = String(1000 + Math.floor(Math.random() * 9000));
    if (!cpDateValue) cpDateValue = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (cpNumEl) cpNumEl.textContent = cpNumberValue;
    if (cpDateEl) cpDateEl.textContent = cpDateValue;
    var est = calcEstimate();
    animatePrice(priceEl, est.ok ? est.total : 0);
    if (noteEl) {
      noteEl.textContent = (est.ok && est.total > est.from)
        ? 'от ' + fmtMoney(est.from) + ' ₽ · точная цена после утверждения ТЗ'
        : 'Точная цена после утверждения ТЗ';
    }
    var html = '';
    if (state.volume > 0) {
      html += cpParam(paramLabels.volume, state.volume + ' л');
    }
    if (state.shape) {
      html += cpParam(paramLabels.shape, titleCase(state.shape) + ' (×' + trimMult(est.shapeMult) + ')');
    }
    if (state.industry) {
      html += cpParam(paramLabels.industry, titleCase(state.industry) + ' (×' + trimMult(est.indMult) + ')');
    }
    if (state.heating) {
      var hTxt = heatingLabels[state.heating] || state.heating;
      if (est.heatPct) hTxt += ' (+' + Math.round(est.heatPct * 100) + '%)';
      html += cpParam(paramLabels.heating, hTxt);
    }
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
  function animatePrice(el, targetNum) {
    if (priceAnimFrame) { cancelAnimationFrame(priceAnimFrame); priceAnimFrame = null; }
    if (!targetNum) { el.textContent = '—'; return; }
    var duration = 700;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(targetNum * eased);
      el.textContent = fmtMoney(current);
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
    var token = '8770079921:AAEMVacVtMSou6UJRsQp0DgUwm3v44jPmsM';
    var chatId = '811211256';
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
      '\uD83D\uDCB0 Ориентировочно: ' + data.price,
      '\uD83D\uDD01 Диапазон: ' + (data.range || '—'),
      '\uD83E\uDDFE КП №: ' + (data.kp || '—'),
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
      var lsKey = 'pt_quiz_ts';
      var last = localStorage.getItem(lsKey);
      var now = Date.now();
      if (last && (now - parseInt(last)) < 5000) return;
      localStorage.setItem(lsKey, String(now));
      var count = parseInt(localStorage.getItem('pt_quiz_count') || '0');
      var countTs = parseInt(localStorage.getItem('pt_quiz_count_ts') || '0');
      if (now - countTs > 300000) { count = 0; countTs = now; }
      if (count >= 5) return;
      localStorage.setItem('pt_quiz_count', String(count + 1));
      localStorage.setItem('pt_quiz_count_ts', String(countTs));
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
      var priceText = est.ok ? fmtMoney(est.total) + ' ₽' : '—';
      var rangeText = est.ok ? 'от ' + fmtMoney(est.from) + ' ₽' : '—';
      var shapeText = state.shape ? titleCase(state.shape) + ' (×' + trimMult(est.shapeMult) + ')' : '—';
      var indText = state.industry ? titleCase(state.industry) + ' (×' + trimMult(est.indMult) + ')' : '—';
      var heatText = state.heating ? (heatingLabels[state.heating] || state.heating) + (est.heatPct ? ' (+' + Math.round(est.heatPct * 100) + '%)' : '') : '—';
      sendTelegramLead({
        name: state.name,
        phone: state.phone,
        email: state.email,
        company: state.company,
        volume: state.volume > 0 ? state.volume + ' л' : '—',
        shape: shapeText,
        industry: indText,
        heating: heatText,
        price: priceText,
        range: rangeText,
        kp: cpNumberValue || '—'
      }).then(function() {
        if (typeof ym === 'function') ym(109737712, 'reachGoal', '567264219');
        submitBtn.style.display = 'none';
        quizEl.querySelector('.quiz-steps').style.display = 'none';
        if (successEl) {
          var tagsHtml = '';
          var tagData = [
            state.volume > 0 ? state.volume + ' л' : '',
            state.shape ? titleCase(state.shape) : '',
            state.industry ? titleCase(state.industry) : '',
            state.heating ? (heatingLabels[state.heating] || state.heating) : '',
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