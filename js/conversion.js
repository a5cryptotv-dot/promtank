(function() {
  'use strict';
  (function() {
    var nav = document.querySelector('.nav');
    if (nav) {
      var firstChild = nav.firstChild;
      while (firstChild && firstChild.nodeType !== 1) firstChild = firstChild.nextSibling;
      if (firstChild) {
        var homeLink = document.createElement('a');
        homeLink.href = '/';
        homeLink.textContent = 'Главная';
        nav.insertBefore(homeLink, firstChild);
      }
    }
    var drawerNav = document.querySelector('.drawer-nav');
    if (drawerNav) {
      var firstDrawerLink = drawerNav.querySelector('a.drawer-link');
      if (firstDrawerLink) {
        var drawerHome = document.createElement('a');
        drawerHome.href = '/';
        drawerHome.className = 'drawer-link';
        drawerHome.textContent = 'Главная';
        drawerHome.onclick = function(e) {
          if (typeof closeDrawer === 'function') closeDrawer();
          window.location.href = '/';
          e.preventDefault();
        };
        drawerNav.insertBefore(drawerHome, firstDrawerLink);
      }
    }
  })();
  var searchTrigger = document.getElementById('searchTrigger');
  var searchDropdown = document.getElementById('searchDropdown');
  var searchBtn = document.getElementById('mobileSearchBtn');
  if (searchTrigger) { searchTrigger.style.display = 'none'; }
  if (searchDropdown) { searchDropdown.style.display = 'none'; }
  if (searchBtn) { searchBtn.style.display = 'none'; }
  window.closeSearch = function(){};
  var floatBtn = document.createElement('button');
  floatBtn.className = 'float-cta';
  floatBtn.id = 'floatCta';
  floatBtn.setAttribute('aria-label', 'Получить расчёт');
  floatBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
    + '<span class="float-cta-tooltip">\u2709\ufe0f Получить расчёт</span>';
  document.body.appendChild(floatBtn);
  var modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modalForm';
  modal.innerHTML = '<div class="modal-box">'
    + '<button class="modal-close" id="modalClose">&times;</button>'
    + '<h3 class="modal-title">\uD83D\uDD0D Не нашли то что искали?</h3>'
    + '<p class="modal-subtitle">Поможем с подбором по вашему Тех. заданию и сделаем скидку до 20%</p>'
    + '<div id="modalFormBody">'
    + '<div class="modal-field"><input type="text" id="modalName" placeholder="Ваше имя *" required></div>'
    + '<div class="modal-field"><input type="tel" id="modalPhone" placeholder="Телефон *" required></div>'
    + '<div class="modal-field"><textarea id="modalComment" placeholder="Что нужно? (оборудование, объём, опции)"></textarea></div>'
    + '<label class="modal-agreement"><input type="checkbox" id="modalAgreement" checked> Я согласен(а) на обработку персональных данных согласно <a href="privacy.html" target="_blank">Политике конфиденциальности</a></label>'
    + '<button class="modal-submit-btn" id="modalSubmitBtn">\uD83D\uDCE8 Получить расчёт</button>'
    + '</div>'
    + '<div class="modal-success" id="modalSuccess">'
    + '<div class="modal-success-icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>'
    + '<h3>Заявка принята!</h3>'
    + '<p>Наш менеджер свяжется с вами в ближайшее время</p>'
    + '</div>'
    + '</div>';
  document.body.appendChild(modal);
  var modalOverlay = modal;
  var modalBody = document.getElementById('modalFormBody');
  var modalSuccess = document.getElementById('modalSuccess');
  var modalClose = document.getElementById('modalClose');
  var modalName = document.getElementById('modalName');
  var modalPhone = document.getElementById('modalPhone');
  var modalComment = document.getElementById('modalComment');
  var modalAgreement = document.getElementById('modalAgreement');
  var modalSubmit = document.getElementById('modalSubmitBtn');
  function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (modalName) setTimeout(function() { modalName.focus(); }, 100);
  }
  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (modalSuccess) modalSuccess.classList.remove('active');
    if (modalBody) modalBody.style.display = 'block';
  }
  floatBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
  if (modalPhone) {
    modalPhone.addEventListener('input', function() {
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
  function clearModalErrors() {
    modalOverlay.querySelectorAll('.field-error').forEach(function(el) { el.classList.remove('field-error'); });
    modalOverlay.querySelectorAll('.field-error-message').forEach(function(el) { el.remove(); });
  }
  function showModalError(input, msg) {
    input.classList.add('field-error');
    var err = document.createElement('span');
    err.className = 'field-error-message';
    err.textContent = msg;
    input.parentElement.appendChild(err);
  }
  function sendTelegramLead(data) {
    var token = '8770079921:AAEMVacVtMSou6UJRsQp0DgUwm3v44jPmsM';
    var chatId = '811211256';
    var text = [
      '\u2709\ufe0f <b>Быстрая заявка</b>',
      '\uD83D\uDC64 Имя: ' + data.name,
      '\uD83D\uDCDE Телефон: ' + data.phone,
      '\uD83D\uDCDD Комментарий: ' + (data.comment || '—'),
      '\uD83D\uDCC5 ' + new Date().toLocaleString('ru-RU'),
      '\uD83D\uDD17 ' + window.location.href
    ].join('\n');
    return fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    }).then(function(r) { return r.json(); });
  }
  function checkRate() {
    var lsKey = 'pt_conv_ts';
    var last = localStorage.getItem(lsKey);
    var now = Date.now();
    if (last && (now - parseInt(last)) < 5000) return false;
    localStorage.setItem(lsKey, String(now));
    var count = parseInt(localStorage.getItem('pt_conv_count') || '0');
    var countTs = parseInt(localStorage.getItem('pt_conv_count_ts') || '0');
    if (now - countTs > 300000) { count = 0; countTs = now; }
    if (count >= 5) return false;
    localStorage.setItem('pt_conv_count', String(count + 1));
    localStorage.setItem('pt_conv_count_ts', String(countTs));
    return true;
  }
  if (modalSubmit) {
    modalSubmit.addEventListener('click', function() {
      if (!checkRate()) return;
      clearModalErrors();
      var hasError = false;
      var name = (modalName && modalName.value.trim()) || '';
      var phone = (modalPhone && modalPhone.value.trim()) || '';
      var comment = (modalComment && modalComment.value.trim()) || '';
      var agreed = !modalAgreement || modalAgreement.checked;
      if (!name) { showModalError(modalName, 'Укажите имя'); hasError = true; }
      if (!phone) { showModalError(modalPhone, 'Укажите телефон'); hasError = true; }
      if (!agreed) { showModalError(modalAgreement, 'Примите соглашение'); hasError = true; }
      if (hasError) return;
      modalSubmit.disabled = true;
      modalSubmit.textContent = 'Отправка...';
      sendTelegramLead({ name: name, phone: phone, comment: comment }).then(function() {
        if (typeof ym === 'function') ym(109737712, 'reachGoal', '567264219');
        if (modalBody) modalBody.style.display = 'none';
        if (modalSuccess) modalSuccess.classList.add('active');
      }).catch(function() {
        modalSubmit.disabled = false;
        modalSubmit.textContent = 'Ошибка. Попробуйте снова';
        setTimeout(function() {
          modalSubmit.textContent = '\uD83D\uDCE8 Получить расчёт';
        }, 3000);
      });
    });
  }
  var msb = document.createElement('div');
  msb.className = 'mobile-sticky-bar';
  msb.id = 'mobileStickyBar';
  msb.innerHTML = '<a href="tel:+79935940107" class="msb-phone">'
    + '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'
    + '8 (993) 594-01-07</a>'
    + '<button class="msb-cta" id="msbCta">\u2709\ufe0f Получить КП</button>';
  document.body.appendChild(msb);
  document.getElementById('msbCta').addEventListener('click', openModal);
  function checkMobile() {
    if (window.innerWidth <= 700) {
      msb.classList.add('active');
    } else {
      msb.classList.remove('active');
    }
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
  setTimeout(function() {
    openModal();
  }, 180000);
  document.querySelectorAll('.consult-btn, .quiz-btn-next:not([disabled])').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      if (this.classList.contains('quiz-btn-next') && this.disabled) return;
    });
  });
  var quizLinks = document.querySelectorAll('a[href*="#quiz-block"]');
  quizLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/#quiz-block';
    });
  });
  var advItems = [
    { icon: '\uD83C\uDF1F', text: '18 лет', desc: 'на рынке' },
    { icon: '\uD83C\uDFED', text: '5 000 м\u00B2', desc: 'собственное производство' },
    { icon: '\uD83D\uDD2C', text: 'Лазерная сварка', desc: 'шов встык' },
    { icon: '\u2699\uFE0F', text: 'Работа по чертежам', desc: 'любая сложность' },
    { icon: '\uD83D\uDCC4', text: 'КП за 24 часа', desc: 'после ТЗ' },
    { icon: '\u2705', text: '12 месяцев', desc: 'гарантии' },
    { icon: '\uD83D\uDCB0', text: 'Цеховые цены', desc: 'без наценок' },
    { icon: '\uD83D\uDE9A', text: 'Доставка по РФ', desc: 'от Калининграда до Камчатки' }
  ];
  var marqueeHtml = '<div class="adv-marquee-wrap"><div class="adv-marquee-track">';
  var allItems = advItems.concat(advItems);
  allItems.forEach(function(item) {
    marqueeHtml += '<div class="adv-marquee-item"><span class="adv-icon">' + item.icon + '</span> <span class="adv-text">' + item.text + '</span>' + (item.desc ? ' <span class="adv-desc">' + item.desc + '</span>' : '') + '</div>';
  });
  marqueeHtml += '</div></div>';
  var mainEl = document.querySelector('main');
  var marqueeRefEl = document.getElementById('volBlock')
    || (mainEl && mainEl.querySelector('.volumes-grid'))
    || (mainEl && mainEl.querySelector('.cat-grid'))
    || (mainEl && mainEl.querySelector('section:first-child'));
  if (marqueeRefEl) {
    marqueeRefEl.insertAdjacentHTML('afterend', marqueeHtml);
  } else {
    (mainEl || document.body).insertAdjacentHTML('afterbegin', marqueeHtml);
  }
  var pathParts = window.location.pathname.replace(/\/$/, '').split('/');
  var isProductPage = pathParts.some(function(part) { return /^\d+l$/i.test(part) || part.indexOf('volume.php') === 0; });
  if (window.location.pathname.indexOf('/catalog/') === 0 && window.location.pathname.indexOf('/catalog/?') !== 0 && !isProductPage) {
    var formSection = document.createElement('div');
    formSection.className = 'catalog-form-section';
    formSection.id = 'catalogQuickForm';
    formSection.innerHTML = '<div class="catalog-form-inner">'
      + '<div class="catalog-form-text">'
      + '<h3>\uD83D\uDCCB Нет нужного объёма?</h3>'
      + '<p>Оставьте заявку \u2014 пришлём КП с вашим объёмом и скидкой до 20%</p>'
      + '</div>'
      + '<div class="catalog-form-fields">'
      + '<input type="text" class="catf-name" placeholder="Ваше имя *">'
      + '<input type="tel" class="catf-phone" placeholder="Телефон *">'
      + '<button class="catalog-form-btn catf-submit">\uD83D\uDCE8 Получить КП</button>'
      + '</div>'
      + '</div>';
    var formRefEl = document.querySelector('.adv-marquee-wrap') || marqueeRefEl;
    if (formRefEl) {
      formRefEl.parentNode.insertBefore(formSection, formRefEl.nextElementSibling || null);
    } else {
      (mainEl || document.body).appendChild(formSection);
    }
    var catPhone = formSection.querySelector('.catf-phone');
    if (catPhone) {
      catPhone.addEventListener('input', function() {
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
    formSection.querySelector('.catf-submit').addEventListener('click', function() {
      var name = formSection.querySelector('.catf-name');
      var phone = formSection.querySelector('.catf-phone');
      formSection.querySelectorAll('.field-error').forEach(function(el) { el.classList.remove('field-error'); });
      formSection.querySelectorAll('.field-error-message').forEach(function(el) { el.remove(); });
      var hasError = false;
      if (!name.value.trim()) {
        name.classList.add('field-error');
        var e = document.createElement('span');
        e.className = 'field-error-message';
        e.textContent = 'Укажите имя';
        name.parentElement.appendChild(e);
        hasError = true;
      }
      if (!phone.value.trim()) {
        phone.classList.add('field-error');
        var e = document.createElement('span');
        e.className = 'field-error-message';
        e.textContent = 'Укажите телефон';
        phone.parentElement.appendChild(e);
        hasError = true;
      }
      if (hasError) return;
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Отправка...';
      var token = '8770079921:AAEMVacVtMSou6UJRsQp0DgUwm3v44jPmsM';
      var chatId = '811211256';
      var text = [
        '\uD83D\uDCE5 <b>Заявка из каталога</b>',
        '\uD83D\uDC64 Имя: ' + name.value.trim(),
        '\uD83D\uDCDE Телефон: ' + phone.value.trim(),
        '\uD83D\uDCCD Страница: ' + window.location.pathname,
        '\uD83D\uDCC5 ' + new Date().toLocaleString('ru-RU'),
        '\uD83D\uDD17 ' + window.location.href
      ].join('\n');
      fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
      }).then(function() {
        btn.textContent = '\u2705 Отправлено!';
        setTimeout(function() {
          btn.textContent = '\uD83D\uDCE8 Получить КП';
          btn.disabled = false;
        }, 3000);
      }).catch(function() {
        btn.textContent = 'Ошибка';
        setTimeout(function() {
          btn.textContent = '\uD83D\uDCE8 Получить КП';
          btn.disabled = false;
        }, 3000);
      });
    });
  }
})();