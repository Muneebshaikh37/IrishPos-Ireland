import Toastify from "toastify-js";
// import { NotificationElement, NotificationProps } from "./Notification.vue";

const toastifyClass = "_" + Math.random().toString(36).substr(2, 9);

const init = (el, props) => {
  // console.log("props", props)
  el.showToast = () => {
    const clonedEl = el.cloneNode(true);
    clonedEl.classList.remove("hidden-NO");
    clonedEl.classList.add(toastifyClass);
    console.log("offset", props.options?.offset);
    clonedEl.toastify = Toastify({
      duration: -1,
      newWindow: props.options?.newWindow || true,
      close: props.options?.close || true,
      gravity: props.options?.gravity || "top",
      position: props.options?.position || "right",
      stopOnFocus: props.options?.stopOnFocus || true,
      offset: props.options?.offset || { x: 0, y: 0 },
      ...props.options,
      node: clonedEl,
    });
    clonedEl.toastify.showToast();
    clonedEl
      .querySelectorAll("[data-dismiss='notification']")
      .forEach(function (el) {
        el.addEventListener("click", function () {
          clonedEl.toastify.hideToast();
        });
      });

    el.hideToast = () => {
      document.querySelectorAll(`.${toastifyClass}`).forEach(function (el) {
        const toastifyEl = el;
        toastifyEl.toastify.hideToast();
      });
    };
  };
};

const reInit = (el) => {
  const wrapperEl = document.querySelectorAll(`.${toastifyClass}`)[0];
  if (wrapperEl) {
    wrapperEl.innerHTML = el.innerHTML;
  }
};

export { init, reInit }; 
