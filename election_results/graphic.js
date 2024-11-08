var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

class LocalTime extends HTMLElement {
  connectedCallback() {
    if (window.Intl && this.hasAttribute("value")) {
      var then = new Date(this.getAttribute("value") * 1);
      var formatter = new Intl.DateTimeFormat("en-us", {
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
        day: "numeric",
        month: "long",
      });
      var output = formatter.format(then);
      this.innerHTML = output;
    }
  }
}

window.customElements.define("local-time", LocalTime);