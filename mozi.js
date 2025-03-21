Mozi.elements = [];

function Mozi(options = {}) {
    this.opt = Object.assign(
        {
            destroyOnClose: true,
            closeMethods: ["x", "overlay", "escape"],
            footer: true
        },
        options
    );
    this.template = document.querySelector(`#${this.opt.templateId}`);
    if (!this.template) {
        console.error(`#${this.opt.templateId} does not exists!`);
        return;
    }
    this.closeByX = this.opt.closeMethods.includes("x");
    this.closeByOverlay = this.opt.closeMethods.includes("overlay");
    this.closeByEscape = this.opt.closeMethods.includes("escape");
}

Mozi.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback.bind(this);
    return button;
};

Mozi.prototype._renderFooterButton = function () {
    this.footerButtons.forEach((button) => {
        this.modalFooter.append(button);
    });
};

Mozi.prototype._handleEscapeKey = function (e) {
    const lastModal = Mozi.elements[Mozi.elements.length - 1];
    if (e.key === "Escape" && lastModal === this) this.close();
};

Mozi.prototype.build = function () {
    this.backdrop = document.createElement("div");
    this.backdrop.classList.add("mozi__backdrop");
    const container = document.createElement("div");
    container.classList.add("mozi__container");
    const modalContent = document.createElement("div");
    modalContent.classList.add("mozi__content");
    modalContent.append(this.template.content.cloneNode(true));
    container.append(modalContent);
    this.backdrop.append(container);
    document.body.append(this.backdrop);

    if (this.closeByX) {
        const xClose = this._createButton("&times;", "mozi__close", this.close);
        container.insertBefore(xClose, modalContent);
    }

    if (this.closeByOverlay) {
        this.backdrop.onclick = (e) => {
            if (e.target === this.backdrop) this.close();
        };
    }

    if (this.closeByEscape) {
        this._handleEscapeKey = this._handleEscapeKey.bind(this);
        document.addEventListener("keydown", this._handleEscapeKey);
    }

    if (this.opt.footer) {
        this.modalFooter = document.createElement("div");
        this.modalFooter.classList.add("mozi__footer");
        this.footerButtons = [];
        this._renderFooterButton();
        container.append(this.modalFooter);
    }
};

Mozi.prototype._getScrollbarWidth = function () {
    if (this.scrollbarWidth) return this.scrollbarWidth;

    const div = document.createElement("div");
    document.body.appendChild(div);
    Object.assign(div.style, {
        overflow: "scroll",
        position: "absolute",
        top: "-9999px"
    });

    this.scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return this.scrollbarWidth;
};

Mozi.prototype.open = function () {
    Mozi.elements.push(this);
    if (!this.backdrop) this.build();
    setTimeout(() => this.backdrop.classList.add("mozi--show"), 100);
    document.body.classList.add("mozi--no-scroll");
    document.body.style.paddingRight = this._getScrollbarWidth() + "px";
};

Mozi.prototype.close = function () {
    Mozi.elements.pop();
    this.backdrop.classList.remove("mozi--show");
    if (!Mozi.elements.length) {
        document.body.classList.remove("mozi--no-scroll");
        document.body.style.paddingRight = "";
    }
};

Mozi.prototype.setFooter = function (html) {
    this.modalFooter.innerHTML = html;
    this._renderFooterButton();
};

Mozi.prototype._addFooterButton = function (title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);
    this.footerButtons.push(button);
    this._renderFooterButton();
};
