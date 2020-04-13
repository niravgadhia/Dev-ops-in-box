function cookieConsent() {
    return;
    window.addEventListener("load", function(){
        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#252b35"
                },
                "button": {
                    "background": "#F9AD16"
                }
            },
            "position": "bottom-right",
            "content": {
                "message": "This site uses cookies. By continuing to browse the site you are agreeing to our use of cookies. ",
                "link": "Find out more here.",
                "href": "https://www.whitesourcesoftware.com/privacy-policy/"
            }
        })});
 }