import Domodule from 'domodule';
import ScrollBus from 'scroll-bus';
import { on, addClass, removeClass } from 'domassist';
import tinybounce from 'tinybounce';

const CLASSES = {
  FIXED: 'fixed',
  TRANSITION: 'in-transition'
};

const transformProp = (function() {
  const testEl = document.createElement('div');

  if (testEl.style.transform === null) {
    const vendors = ['Webkit', 'Moz', 'ms'];
    let property = null;

    for (let i = 0, len = vendors.length; i < len && !property; i++) {
      const tProperty = `${vendors[i]}Transform`;
      if (typeof testEl.style[tProperty] !== 'undefined') {
        property = tProperty;
      }
    }
  }

  return 'transform';
}());


class FixedHeader extends Domodule {
  postInit() {
    this.parent = this.el.parentElement;
    this.enabled = true;
    this.scroll = 0;
    this.scrollUp = false;
    this.isFixed = false;

    ScrollBus.on(this.onScroll.bind(this));
    this.setup();
    const bouncedSetup = tinybounce(this.setup.bind(this), 150);
    on(window, 'resize', bouncedSetup);
  }

  setup() {
    if (window.matchMedia && this.options.match &&
      !window.matchMedia(this.options.match).matches) {
      this.enabled = false;
      if (this.isFixed) {
        this.setFix(false);
      }

      if (this.scrollUp) {
        this.setScrollUp(false);
      }
      this.scroll = -1;
    } else {
      this.enabled = true;
    }

    this.calcBounds();
    this.onScroll();
  }

  calcBounds() {
    this.height = this.el.offsetHeight;
    this.start = this.el.getBoundingClientRect().top + FixedHeader.getScrollPosition();
    this.end = this.start + this.height;
  }

  onScroll() {
    const scroll = FixedHeader.getScrollPosition();

    if (!this.enabled || this.scroll === scroll) {
      return;
    }

    const isScrollingUp = scroll < this.scroll;
    let fixed = scroll > this.end;

    if (!fixed && this.isFixed) {
      fixed = scroll > this.start;
    }

    this.scroll = scroll;

    if (fixed !== this.isFixed) {
      this.setFix(fixed);
      return;
    }

    if (isScrollingUp !== this.scrollUp) {
      this.setScrollUp(isScrollingUp);
    }
  }

  setScrollUp(isScrollingUp) {
    if (this.isFixed) {
      this.scrollUp = isScrollingUp;

      if (isScrollingUp) {
        this.el.removeAttribute('style');
      } else {
        this.transformUp();
      }
    }
  }

  transformUp() {
    this.el.style[transformProp] = `translate3d(0, -${this.height}px, 0)`;
  }

  setFix(fixed) {
    this.isFixed = fixed;
    const method = fixed ? addClass : removeClass;

    if (fixed) {
      this.transformUp();
      this.parent.style.paddingTop = `${this.height}px`;
    } else {
      this.el.removeAttribute('style');
      this.parent.removeAttribute('style');
    }

    method(this.el, CLASSES.FIXED);
    setTimeout(() => {
      method(this.el, CLASSES.TRANSITION);
    });
  }

  static getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}

Domodule.register('FixedHeader', FixedHeader);

export default FixedHeader;