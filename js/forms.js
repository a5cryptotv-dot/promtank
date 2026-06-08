function showFieldError(input, message) {
    var errorEl = input.parentElement.querySelector('.field-error-message');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error-message';
        input.parentElement.appendChild(errorEl);
    }
    input.classList.add('field-error');
    errorEl.textContent = message;
}
function clearFieldError(input) {
    input.classList.remove('field-error');
    var errorEl = input.parentElement.querySelector('.field-error-message');
    if (errorEl) errorEl.textContent = '';
}
function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(function(el) { el.classList.remove('field-error'); });
    form.querySelectorAll('.field-error-message').forEach(function(el) { el.textContent = ''; });
    form.querySelectorAll('.form-success-message').forEach(function(el) { el.classList.remove('visible', 'error'); });
}
function showFormSuccess(form, html) {
    clearFormErrors(form);
    var msg = form.querySelector('.form-success-message');
    if (!msg) {
        msg = document.createElement('div');
        msg.className = 'form-success-message';
        form.insertBefore(msg, form.firstChild);
    }
    msg.innerHTML = html;
    msg.classList.add('visible');
}
function validateBreweryForm() {
    var form = document.querySelector('.brewery-form');
    clearFormErrors(form);
    var name = document.getElementById('brewery-name');
    var phone = document.getElementById('brewery-phone');
    var privacy = document.getElementById('brewery-privacy-checkbox');
    var lotSelect = document.getElementById('brewery-lot-select');
    var hasError = false;
    if (!name || !name.value.trim()) {
        showFieldError(name, 'Укажите имя');
        hasError = true;
    }
    if (!phone || !phone.value.trim()) {
        showFieldError(phone, 'Укажите телефон');
        hasError = true;
    }
    if (!lotSelect || !lotSelect.value) {
        showFieldError(lotSelect, 'Выберите комплектацию');
        hasError = true;
    }
    if (privacy && !privacy.checked) {
        showFieldError(privacy, 'Примите соглашение об обработке данных');
        hasError = true;
    }
    if (hasError) return false;
    var equipmentData = [];
    document.querySelectorAll('#brewing-equipment .equipment-checkbox-input:checked, #fermentation-equipment .equipment-checkbox-input:checked, #auxiliary-equipment .equipment-checkbox-input:checked, #automation-equipment .equipment-checkbox-input:checked, #additional-services .equipment-checkbox-input:checked').forEach(function(cb) {
        var name = cb.getAttribute('data-equipment');
        var price = cb.getAttribute('data-price');
        if (name) equipmentData.push(name + (price ? ' (' + price + ' руб)' : ''));
    });
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'equipment_list';
    hiddenInput.value = equipmentData.join('; ');
    document.querySelector('.brewery-form').appendChild(hiddenInput);
    return true;
}
;(function() {
    'use strict';
    function initPhoneMasks() {
        document.querySelectorAll('input[type="tel"]').forEach(function(input) {
            input.addEventListener('input', function(e) {
                var value = this.value.replace(/\D/g, '');
                var formatted = '';
                if (value.length > 0) {
                    if (value.startsWith('7') || value.startsWith('8')) {
                        var country = value[0];
                        value = value.substring(1);
                        formatted = '+' + country;
                        if (value.length > 0) { formatted += ' (' + value.substring(0, 3); }
                        if (value.length > 3) { formatted += ') ' + value.substring(3, 6); }
                        if (value.length > 6) { formatted += '-' + value.substring(6, 8); }
                        if (value.length > 8) { formatted += '-' + value.substring(8, 10); }
                    } else {
                        formatted = '+' + value.substring(0, 1);
                        if (value.length > 1) { formatted += ' ' + value.substring(1, 4); }
                        if (value.length > 4) { formatted += ' ' + value.substring(4, 7); }
                        if (value.length > 7) { formatted += '-' + value.substring(7, 9); }
                        if (value.length > 9) { formatted += '-' + value.substring(9, 11); }
                    }
                }
                this.value = formatted;
            });
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' || e.key === 'Delete') return;
                var value = this.value.replace(/\D/g, '');
                if (value.length >= 12) e.preventDefault();
            });
        });
    }
    function initFileUploads() {
        document.querySelectorAll('.file-input').forEach(function(input) {
            input.addEventListener('change', function() {
                var fileNameEl = this.parentElement.querySelector('.file-name');
                if (fileNameEl) {
                    fileNameEl.textContent = this.files.length > 0 ? this.files[0].name : 'Файл не выбран';
                }
            });
        });
    }
    function initSubOptions() {
        document.querySelectorAll('.main-option').forEach(function(checkbox) {
            var subOptionsId = checkbox.getAttribute('data-suboptions');
            if (!subOptionsId) return;
            var subOptions = document.getElementById(subOptionsId);
            if (!subOptions) return;
            var toggleSubOptions = function() {
                subOptions.style.display = checkbox.checked ? 'block' : 'none';
                if (!checkbox.checked) {
                    var radios = subOptions.querySelectorAll('input[type="radio"]');
                    radios.forEach(function(r) { r.checked = false; });
                    var checkboxes = subOptions.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(function(c) { c.checked = false; });
                }
            };
            checkbox.addEventListener('change', toggleSubOptions);
            toggleSubOptions();
        });
    }
    function initFormSubmissions() {
        document.querySelectorAll('form[action*="send.php"]').forEach(function(form) {
            form.addEventListener('submit', function(e) {
                var f = this;
                var submitBtn = f.querySelector('.submit-btn');
                if (!submitBtn) return;
                clearFormErrors(f);
                var nameInput = f.querySelector('input[name="name"]');
                var phoneInput = f.querySelector('input[name="phone"]');
                var agreementInput = f.querySelector('input[name="agreement"]');
                var hasError = false;
                if (nameInput && !nameInput.value.trim()) {
                    showFieldError(nameInput, 'Укажите имя');
                    hasError = true;
                }
                if (phoneInput && !phoneInput.value.trim()) {
                    showFieldError(phoneInput, 'Укажите телефон');
                    hasError = true;
                }
                if (agreementInput && !agreementInput.checked) {
                    showFieldError(agreementInput, 'Примите соглашение об обработке данных');
                    hasError = true;
                }
                if (hasError) { e.preventDefault(); return; }
                var csrf = f.querySelector('input[name="_csrf"]');
                if (csrf) csrf.value = btoa(String(Math.floor(Date.now() / 1000)));
                var originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
                var formData = new FormData(f);
                var trackerSid = localStorage.getItem('tracker_sid_v2');
                if (trackerSid) formData.append('_sid', trackerSid);
                fetch(f.action, {
                    method: 'POST',
                    headers: {'X-Requested-With': 'XMLHttpRequest'},
                    body: formData
                })
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    if (data.success) {
                        f.reset();
                        f.querySelectorAll('input[name="equipment_list"]').forEach(function(el) { el.remove(); });
                        if (csrf) csrf.value = btoa(String(Math.floor(Date.now() / 1000)));
                        submitBtn.textContent = '✓ Отправлено';
                        submitBtn.classList.add('sent');
                        if (typeof window.trackerSend === 'function') {
                            var formType = (f.querySelector('input[name="form_type"]') || {}).value || '';
                            window.trackerSend({ action: 'submit', form: formType, page: location.pathname, sid: (localStorage.getItem('tracker_sid_v2') || '') });
                        }
                        setTimeout(function() {
                            window.location.href = '/thanks.html';
                        }, 800);
                    } else {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        var errorMsg = data.error || 'Попробуйте позже';
                        showFormSuccess(f, '<strong>Ошибка:</strong> ' + errorMsg);
                        var msg = f.querySelector('.form-success-message');
                        if (msg) msg.classList.add('error');
                        setTimeout(function() {
                            var msg = f.querySelector('.form-success-message.visible');
                            if (msg) msg.classList.remove('visible', 'error');
                        }, 8000);
                    }
                })
                .catch(function() {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    showFormSuccess(f, '<strong>Ошибка соединения.</strong> Проверьте подключение и попробуйте снова.');
                    var msg = f.querySelector('.form-success-message');
                    if (msg) msg.classList.add('error');
                    setTimeout(function() {
                        var msg = f.querySelector('.form-success-message.visible');
                        if (msg) msg.classList.remove('visible', 'error');
                    }, 8000);
                });
                e.preventDefault();
            });
        });
    }
    function initCsrfProtection() {
        document.querySelectorAll('form[action*="send.php"]').forEach(function(form) {
            if (form.querySelector('input[name="_csrf"]')) return;
            var csrf = document.createElement('input');
            csrf.type = 'hidden';
            csrf.name = '_csrf';
            csrf.value = btoa(String(Math.floor(Date.now() / 1000)));
            form.appendChild(csrf);
            var honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = '_website';
            honeypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            form.appendChild(honeypot);
        });
    }
    document.addEventListener('DOMContentLoaded', function() {
        initPhoneMasks();
        initFileUploads();
        initSubOptions();
        initFormSubmissions();
        initCsrfProtection();
    });
})();