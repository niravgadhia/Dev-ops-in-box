function initRecaptcha(elementIds) {
    var recaptchaLoaded = false;

    var reloadRecaptchaFunction = function reloadRecaptcha() {
        if (grecaptcha != null) {
            if (!recaptchaLoaded) {
                recaptchaLoaded = true;
                grecaptcha.render('recaptcha', {
                    sitekey: '6LcIpMwSAAAAAAZrdGOHuMNaaalzk8lQAXYB1pcm',
                    callback: function (response) {
                        console.log(response);
                    }
                });
            }
        }
    };

    for (var i = 0; i < elementIds.length; i++) {
        var elementId = elementIds[i];
        var element = document.getElementById(elementId);
        if (element != null) {
            element.addEventListener("focus", reloadRecaptchaFunction, {once: true});
            element.addEventListener("click", reloadRecaptchaFunction, {once: true});
            element.addEventListener("mouseover", reloadRecaptchaFunction, {once: true});
        }
    }
}

function resetRecaptcha() {
    grecaptcha.reset();
}