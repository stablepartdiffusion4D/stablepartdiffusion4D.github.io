window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Clean navbar burger functionality
    $(".navbar-burger").click(function() {
      const target = $(this).data('target');
      $(this).toggleClass("is-active");
      $("#" + target).toggleClass("is-active");
    });

    // Close mobile menu when clicking on external links
    $(".navbar-menu .navbar-item[target='_blank']").click(function() {
      $(".navbar-burger").removeClass("is-active");
      $("#navbarMenu").removeClass("is-active");
    });

    // Close mobile menu when clicking outside
    $(document).click(function(event) {
      if (!$(event.target).closest('.navbar').length) {
        $(".navbar-burger").removeClass("is-active");
        $("#navbarMenu").removeClass("is-active");
      }
    });

    // Enhanced scroll animations for figures
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    // Enhanced fade-in and slide-up for all figures
    document.querySelectorAll('figure.image, .figure-note').forEach((element, index) => {
      // Skip teaser figure to keep it static
      if (element.classList.contains('teaser-figure')) return;
      
      element.style.opacity = '0';
      element.style.transform = 'translateY(40px) scale(0.95)';
      element.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
      observer.observe(element);
    });



    // Custom carousel implementation
    const carouselState = {
      sec1: { currentSlide: 0, totalSlides: 3 },
      sec2: { currentSlide: 0, totalSlides: 3 },
      sec3: { currentSlide: 0, totalSlides: 4 },
      sec4: { currentSlide: 0, totalSlides: 3 }
    };

    function updateCarousel(carouselId) {
      const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
      if (!carousel) return;
      
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      const state = carouselState[carouselId];
      
      // Show current slide, hide others
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === state.currentSlide);
      });
      
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentSlide);
      });
    }

    window.moveSlide = function(carouselId, direction) {
      const state = carouselState[carouselId];
      state.currentSlide = (state.currentSlide + direction + state.totalSlides) % state.totalSlides;
      updateCarousel(carouselId);
    };

    window.currentSlide = function(carouselId, slideIndex) {
      const state = carouselState[carouselId];
      state.currentSlide = slideIndex - 1;
      updateCarousel(carouselId);
    };

    // Initialize all carousels
    Object.keys(carouselState).forEach(carouselId => {
      updateCarousel(carouselId);
      
      // Add wheel scroll and touch functionality
      const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
      if (carousel) {
        let isScrolling = false;
        
        // Mouse wheel navigation
        carousel.addEventListener('wheel', (e) => {
          e.preventDefault();
          
          if (isScrolling) return;
          isScrolling = true;
          
          const direction = e.deltaY > 0 ? 1 : -1;
          moveSlide(carouselId, direction);
          
          // Prevent rapid scrolling
          setTimeout(() => {
            isScrolling = false;
          }, 300);
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let isDragging = false;
        
        carousel.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
          isDragging = true;
        });
        
        carousel.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          e.preventDefault();
        });
        
        carousel.addEventListener('touchend', (e) => {
          if (!isDragging) return;
          isDragging = false;
          
          const endX = e.changedTouches[0].clientX;
          const diffX = startX - endX;
          
          if (Math.abs(diffX) > 50) { // Minimum swipe distance
            const direction = diffX > 0 ? 1 : -1;
            moveSlide(carouselId, direction);
          }
        });

        // Keyboard navigation when carousel is focused
        carousel.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            moveSlide(carouselId, -1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            moveSlide(carouselId, 1);
          }
        });
        
        // Make carousel focusable for keyboard navigation
        carousel.setAttribute('tabindex', '0');
      }
      
      // Add auto-play every 6 seconds (reduced frequency for better UX)
      setInterval(() => {
        const state = carouselState[carouselId];
        if (state.totalSlides > 1) {
          state.currentSlide = (state.currentSlide + 1) % state.totalSlides;
          updateCarousel(carouselId);
        }
      }, 6000);
    });

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    // Image Modal Functionality
    let currentModalCarousel = null;
    let modalImages = [];
    let currentModalIndex = 0;

    window.openImageModal = function(imageSrc, altText, carouselId = null, imageIndex = 0) {
      const modal = document.getElementById('imageModal');
      const modalImage = document.getElementById('modalImage');
      const modalInfo = document.getElementById('modalInfo');
      const prevBtn = modal.querySelector('.modal-nav.prev');
      const nextBtn = modal.querySelector('.modal-nav.next');
      
      modalImage.src = imageSrc;
      modalImage.alt = altText;
      modalInfo.textContent = altText;
      
      currentModalCarousel = carouselId;
      currentModalIndex = imageIndex;
      
      // Setup navigation for carousel images
      if (carouselId) {
        modalImages = [];
        const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
        const slides = carousel.querySelectorAll('.carousel-slide img');
        slides.forEach(img => {
          modalImages.push({
            src: img.src,
            alt: img.alt
          });
        });
        
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }
      
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    window.closeImageModal = function() {
      const modal = document.getElementById('imageModal');
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
      currentModalCarousel = null;
      modalImages = [];
    };

    window.prevModalImage = function() {
      if (!currentModalCarousel || modalImages.length === 0) return;
      
      currentModalIndex = (currentModalIndex - 1 + modalImages.length) % modalImages.length;
      const modalImage = document.getElementById('modalImage');
      const modalInfo = document.getElementById('modalInfo');
      
      modalImage.src = modalImages[currentModalIndex].src;
      modalImage.alt = modalImages[currentModalIndex].alt;
      modalInfo.textContent = modalImages[currentModalIndex].alt;
    };

    window.nextModalImage = function() {
      if (!currentModalCarousel || modalImages.length === 0) return;
      
      currentModalIndex = (currentModalIndex + 1) % modalImages.length;
      const modalImage = document.getElementById('modalImage');
      const modalInfo = document.getElementById('modalInfo');
      
      modalImage.src = modalImages[currentModalIndex].src;
      modalImage.alt = modalImages[currentModalIndex].alt;
      modalInfo.textContent = modalImages[currentModalIndex].alt;
    };

    // Add click handlers to all images
    // Regular figures
    document.querySelectorAll('figure.image img').forEach(img => {
      img.addEventListener('click', function(e) {
        e.stopPropagation();
        openImageModal(this.src, this.alt);
      });
    });
    
    // Carousel images - add after carousel initialization
    Object.keys(carouselState).forEach(carouselId => {
      const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
      if (carousel) {
        const slides = carousel.querySelectorAll('.carousel-slide img');
        slides.forEach((img, index) => {
          img.addEventListener('click', function(e) {
            e.stopPropagation();
            openImageModal(this.src, this.alt, carouselId, index);
          });
        });
      }
    });
    
    // Close modal on background click
    document.getElementById('imageModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeImageModal();
      }
    });
    
    // Keyboard support for modal
    document.addEventListener('keydown', function(e) {
      const modal = document.getElementById('imageModal');
      if (modal.classList.contains('active')) {
        switch(e.key) {
          case 'Escape':
            closeImageModal();
            break;
          case 'ArrowLeft':
            prevModalImage();
            break;
          case 'ArrowRight':
            nextModalImage();
            break;
        }
      }
    });

})
