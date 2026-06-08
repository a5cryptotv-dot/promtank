function showFormSuccess(form, messageHtml) {
    var container = form.querySelector('.form-success-message');
    if (!container) {
        container = document.createElement('div');
        container.className = 'form-success-message';
        form.appendChild(container);
    }
    container.innerHTML = messageHtml;
    container.classList.add('visible');
}

function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(function(el) { el.remove(); });
    form.querySelectorAll('.error-input').forEach(function(el) { el.classList.remove('error-input'); });
    var msg = form.querySelector('.form-success-message.visible');
    if (msg) msg.classList.remove('visible', 'error');
}

function showFieldError(input, message) {
    input.classList.add('error-input');
    var err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = message;
    input.parentNode.appendChild(err);
}

function initFormSubmissions() {
    document.querySelectorAll('form[action*="send.php"]').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
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
            if (hasError) return;

            var originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            var name = (f.querySelector('input[name="name"]') || {}).value || '';
            var phone = (f.querySelector('input[name="phone"]') || {}).value || '';
            var email = (f.querySelector('input[name="email"]') || {}).value || '';
            var comment = (f.querySelector('textarea[name="comment"]') || {}).value || '';
            var product = (f.querySelector('input[name="product"]') || {}).value || '';
            var formType = (f.querySelector('input[name="form_type"]') || {}).value || '';
            var quantity = (f.querySelector('input[name="quantity"]') || {}).value || '';

            var msgLines = [];
            msgLines.push('✉️ <b>Заявка с карточки товара</b>');
            if (formType) msgLines.push('🏷 Тип: ' + formType);
            if (product) msgLines.push('📦 Товар: ' + product);
            if (quantity) msgLines.push('№ Количество: ' + quantity);
            if (name) msgLines.push('👤 Имя: ' + name);
            if (phone) msgLines.push('📞 Телефон: ' + phone);
            if (email) msgLines.push('📧 Email: ' + email);
            if (comment) msgLines.push('📝 Комментарий: ' + comment);
            msgLines.push('📅 ' + new Date().toLocaleString('ru-RU'));
            msgLines.push('🔗 ' + window.location.href);
            var text = msgLines.join('\n');

            fetch('https://api.telegram.org/bot8770079921:AAEy8OGlTyN4GCnPqJ1DEAosLA6DYpGqVkU/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: '811211256', text: text, parse_mode: 'HTML' })
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.ok) {
                    f.reset();
                    submitBtn.textContent = '✓ Отправлено';
                    submitBtn.classList.add('sent');
                    if (typeof window.trackerSend === 'function') {
                        var ft = (f.querySelector('input[name="form_type"]') || {}).value || '';
                        window.trackerSend({ action: 'submit', form: ft, page: location.pathname, sid: (localStorage.getItem('tracker_sid_v2') || '') });
                    }
                    setTimeout(function() { window.location.href = '/thanks.html'; }, 800);
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    showFormSuccess(f, '<strong>Ошибка:</strong> Попробуйте позже');
                    var msg = f.querySelector('.form-success-message');
                    if (msg) msg.classList.add('error');
                    setTimeout(function() {
                        var emsg = f.querySelector('.form-success-message.visible');
                        if (emsg) emsg.classList.remove('visible', 'error');
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
                    var emsg = f.querySelector('.form-success-message.visible');
                    if (emsg) emsg.classList.remove('visible', 'error');
                }, 8000);
            });
        });
    });
}

function initCsrfProtection() {
    document.querySelectorAll('form').forEach(function(form) {
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
    initFormSubmissions();
    initCsrfProtection();
});