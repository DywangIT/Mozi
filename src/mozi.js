Mozi.elements = [];

function Mozi(options = {}) {
    if (!options.content && !options.templateId) {
        console.error("You must provide one of 'content' of 'templateId'.");
        return;
    }
    if (options.content && options.templateId) {
        options.templateId = null;
        console.warn(
            "Both 'content' and 'templateId' are specified. 'content' will take precedence, and 'templateId' will be ignored."
        );
    }
    if (options.templateId) {
        this._template = document.querySelector(`#${options.templateId}`);
        if (!this._template)
            return console.error(`#${options.templateId} does not exist!`);
    }
    this.opt = Object.assign(
        {
            enableScrollLock: true,
            destroyOnClose: true,
            footer: false,
            cssClass: [],
            closeMethods: ["x", "overlay", "escape"],
            scrollLockTarget: () => document.body
        },
        options
    );
    this._content = this.opt.content;
    this._closeByX = this.opt.closeMethods.includes("x");
    this._closeByOverlay = this.opt.closeMethods.includes("overlay");
    this._closeByEscape = this.opt.closeMethods.includes("escape");

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
    if (this._modalFooter) {
        this._footerButtons.forEach((button) => {
            this._modalFooter.append(button);
        });
    }
};

Mozi.prototype._handleEscapeKey = function (e) {
    const lastModal = Mozi.elements[Mozi.elements.length - 1];
    if (e.key === "Escape" && lastModal === this) this.close();
};

Mozi.prototype._hasScrollbar = (target) => {
    if ([document.documentElement, document.body].includes(target)) {
        return (
            document.documentElement.scrollHeight >
                document.documentElement.clientHeight ||
            document.body.scrollHeight > document.body.clientHeight
        );
    }
    return target.scrollHeight > target.clientHeight;
};

Mozi.prototype._build = function () {
    // Create modal elements
    this._backdrop = document.createElement("div");
    this._backdrop.classList.add("mozi__backdrop");
    const container = document.createElement("div");
    container.classList.add("mozi__container");
    this.opt.cssClass.forEach((className) => {
        if (typeof className === "string") {
            container.classList.add(className);
        }
    });
    this._modalContent = document.createElement("div");
    this._modalContent.classList.add("mozi__content");
    const contentNode = this._content
        ? document.createElement("div")
        : this._template.content.cloneNode(true);
    // Append content and elements
    if (this._content) contentNode.innerHTML = this._content;
    this._modalContent.append(contentNode);
    container.append(this._modalContent);
    this._backdrop.append(container);
    document.body.append(this._backdrop);

    if (this._closeByX) {
        const xClose = this._createButton("&times;", "mozi__close", this.close);
        container.insertBefore(xClose, this._modalContent);
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
        this._modalFooter = document.createElement("div");
        this._modalFooter.classList.add("mozi__footer");
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

Mozi.prototype._onTransitionEnd = function (callback) {
    this._backdrop.ontransitionend = (e) => {
        if (e.propertyName === "transform" && typeof callback === "function")
            callback();
    };
};

Mozi.prototype.open = function () {
    Mozi.elements.push(this);
    if (!this._backdrop) this._build();
    setTimeout(() => this._backdrop.classList.add("mozi--show"), 100);

    // Disable scrolling
    if (Mozi.elements.length === 1 && this.opt.enableScrollLock) {
        const target = this.opt.scrollLockTarget();
        if (this._hasScrollbar(target)) {
            target.classList.add("mozi--no-scroll");
            const targetInitialPadding = parseFloat(
                getComputedStyle(target).paddingRight
            );
            target.style.paddingRight =
                targetInitialPadding + this._getScrollbarWidth() + "px";
        }
    }
    return this._backdrop;
};

Mozi.prototype.close = function (destroy = this.opt.destroyOnClose) {
    Mozi.elements.pop();
    this._backdrop.classList.remove("mozi--show");
    if (this._closeByEscape)
        document.removeEventListener("keydown", this._handleEscapeKey);
    this._onTransitionEnd(() => {
        if (this._backdrop && destroy) {
            this._backdrop.remove();
            this._backdrop = null;
            this._modalContent = null;
            this._modalFooter = null;
        }
        // Enable scrolling
        if (!Mozi.elements.length && this.opt.enableScrollLock) {
            const target = this.opt.scrollLockTarget();
            if (this._hasScrollbar(target)) {
                target.classList.remove("mozi--no-scroll");
                target.style.paddingRight =
                    parseFloat(getComputedStyle(target).paddingRight) -
                    this._getScrollbarWidth() +
                    "px";
            }
        }
    });
};

Mozi.prototype.destroy = function () {
    this.close(true);
};

Mozi.prototype.setContent = function (content) {
    this._content = content;
    if (this._modalContent) {
        this._modalContent.innerHTML = this._content;
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
