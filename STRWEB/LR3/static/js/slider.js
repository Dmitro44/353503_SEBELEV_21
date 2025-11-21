// static/js/slider.js

export class Slider {
    constructor(sliderElement) {
        this.slider = sliderElement;
        if (!this.slider) return;

        // --- 1. SELECT ELEMENTS ---
        this.track = this.slider.querySelector(".slider-track");
        this.slides = Array.from(this.track.children);
        this.nextBtn = this.slider.querySelector(".slider-nav-next");
        this.prevBtn = this.slider.querySelector(".slider-nav-prev");
        this.dotsContainer = this.slider.querySelector(
            ".slider-pagination-dots",
        );
        this.counterEl = this.slider.querySelector(
            ".slider-pagination-counter",
        );
        this.captionEl = this.slider.querySelector(".slider-caption");

        // --- 2. CONFIGURATION ---
        const dataset = this.slider.dataset;
        this.loop = dataset.loop === "true";
        this.auto = dataset.auto === "true";
        this.delay = parseInt(dataset.delay, 10) || 5000;
        this.showNavs = dataset.navs === "true";
        this.showPags = dataset.pags === "true";
        this.stopOnHover = dataset.stopMouseHover === "true";

        // --- 3. STATE ---
        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.autoPlayInterval = null;

        this.init();
    }

    init() {
        if (this.slideCount === 0) return;

        this.setupUI();
        this.setupEventListeners();
        this.updateSlider();

        if (this.auto) {
            this.startAutoPlay();
        }
    }

    setupUI() {
        // Hide/show nav buttons
        if (!this.showNavs) {
            if (this.nextBtn) this.nextBtn.style.display = "none";
            if (this.prevBtn) this.prevBtn.style.display = "none";
        }

        // Create pagination dots
        if (this.showPags && this.dotsContainer) {
            this.dotsContainer.innerHTML = "";
            for (let i = 0; i < this.slideCount; i++) {
                const dot = document.createElement("button");
                dot.classList.add("slider-pagination-dot");
                dot.addEventListener("click", () => this.goToSlide(i));
                this.dotsContainer.appendChild(dot);
            }
            this.dots = Array.from(this.dotsContainer.children);
        } else if (this.dotsContainer) {
            this.dotsContainer.style.display = "none";
        }
    }

    setupEventListeners() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => this.nextSlide());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", () => this.prevSlide());
        }

        if (this.auto && this.stopOnHover) {
            this.slider.addEventListener("mouseenter", () =>
                this.stopAutoPlay(),
            );
            this.slider.addEventListener("mouseleave", () =>
                this.startAutoPlay(),
            );
        }
    }

    nextSlide() {
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.slideCount) {
            nextIndex = this.loop ? 0 : this.currentIndex;
        }
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.loop ? this.slideCount - 1 : this.currentIndex;
        }
        this.goToSlide(prevIndex);
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slideCount) return;
        this.currentIndex = index;
        this.updateSlider();
    }

    updateSlider() {
        // Move the track
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        // Update UI elements
        this.updatePagination();
        this.updateCaption();
        this.updateNavs();
    }

    updatePagination() {
        // Update counter
        if (this.counterEl) {
            this.counterEl.textContent = `${this.currentIndex + 1} / ${this.slideCount}`;
        }

        // Update active dot
        if (this.showPags && this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === this.currentIndex);
            });
        }
    }

    updateCaption() {
        if (this.captionEl) {
            const currentSlide = this.slides[this.currentIndex];
            this.captionEl.textContent = currentSlide.dataset.title || "";
        }
    }

    updateNavs() {
        if (!this.loop && this.showNavs) {
            if (this.prevBtn) {
                this.prevBtn.disabled = this.currentIndex === 0;
            }
            if (this.nextBtn) {
                this.nextBtn.disabled =
                    this.currentIndex === this.slideCount - 1;
            }
        }
    }

    startAutoPlay() {
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.delay);
    }

    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
    }
}
