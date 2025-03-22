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
    this._template = document.querySelector(`#${this.opt.templateId}`);
    if (!this._template) {
        console.error(`#${this.opt.templateId} does not exists!`);
        return;
    }
    this._closeByX = this.opt.closeMethods.includes("x");
    this._closeByOverlay = this.opt.closeMethods.includes("overlay");
    this._closeByEscape = this.opt.closeMethods.includes("escape");
    
    this._modalFooter = document.createElement("div");
    this._modalFooter.classList.add("mozi__footer");
    this._footerButtons = [];
}

Mozi.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback.bind(this);
    return button;
};

Mozi.prototype._renderFooterButton = function () {
    this._footerButtons.forEach((button) => {
        this._modalFooter.append(button);
    });
};

Mozi.prototype._handleEscapeKey = function (e) {
    const lastModal = Mozi.elements[Mozi.elements.length - 1];
    if (e.key === "Escape" && lastModal === this) this.close();
};

Mozi.prototype._build = function () {
    this._backdrop = document.createElement("div");
    this._backdrop.classList.add("mozi__backdrop");
    const container = document.createElement("div");
    container.classList.add("mozi__container");
    const modalContent = document.createElement("div");
    modalContent.classList.add("mozi__content");
    modalContent.append(this._template.content.cloneNode(true));
    container.append(modalContent);
    this._backdrop.append(container);
    document.body.append(this._backdrop);

    if (this._closeByX) {
        const xClose = this._createButton("&times;", "mozi__close", this.close);
        container.insertBefore(xClose, modalContent);
    }

    if (this._closeByOverlay) {
        this._backdrop.onclick = (e) => {
            if (e.target === this._backdrop) this.close();
        };
    }

    if (this._closeByEscape) {
        this._handleEscapeKey = this._handleEscapeKey.bind(this);
        document.addEventListener("keydown", this._handleEscapeKey);
    }

    if (this.opt.footer) {
        this._renderFooterButton();
        container.append(this._modalFooter);
    }
};

Mozi.prototype._getScrollbarWidth = function () {
    if (this._scrollbarWidth) return this._scrollbarWidth;

    const div = document.createElement("div");
    document.body.appendChild(div);
    Object.assign(div.style, {
        overflow: "scroll",
        position: "absolute",
        top: "-9999px"
    });

    this._scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return this._scrollbarWidth;
};

Mozi.prototype.open = function () {
    Mozi.elements.push(this);
    if (!this._backdrop) this._build();
    setTimeout(() => this._backdrop.classList.add("mozi--show"), 100);
    document.body.classList.add("mozi--no-scroll");
    document.body.style.paddingRight = this._getScrollbarWidth() + "px";
};

Mozi.prototype.close = function () {
    Mozi.elements.pop();
    this._backdrop.classList.remove("mozi--show");
    if (!Mozi.elements.length) {
        document.body.classList.remove("mozi--no-scroll");
        document.body.style.paddingRight = "";
    }
};

Mozi.prototype.setFooter = function (html) {
    this._modalFooter.innerHTML = html;
    this._renderFooterButton();
};

Mozi.prototype.addFooterButton = function (title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);
    this._footerButtons.push(button);
    this._renderFooterButton();
};
